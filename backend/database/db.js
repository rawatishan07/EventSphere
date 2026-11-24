const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'eventsphere',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  dateStrings: true
};

let activeEngine = 'mysql'; // 'mysql' | 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

// Helper: Run SQL query returning multiple rows (SELECT)
async function query(sql, params = []) {
  if (activeEngine === 'mysql') {
    const [rows] = await mysqlPool.query(sql, params);
    return rows;
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
}

// Helper: Run SQL query returning a single row (SELECT ... LIMIT 1)
async function get(sql, params = []) {
  if (activeEngine === 'mysql') {
    const [rows] = await mysqlPool.query(sql, params);
    return rows.length > 0 ? rows[0] : null;
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }
}

// Helper: Run INSERT / UPDATE / DELETE query
async function run(sql, params = []) {
  if (activeEngine === 'mysql') {
    const [result] = await mysqlPool.query(sql, params);
    return {
      lastID: result.insertId,
      changes: result.affectedRows
    };
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({
          lastID: this.lastID,
          changes: this.changes
        });
      });
    });
  }
}

// Helper: Run multiple statements in sequence (like executing .sql script)
async function execScript(scriptContent) {
  if (activeEngine === 'mysql') {
    await mysqlPool.query(scriptContent);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.exec(scriptContent, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

// Initialize SQLite fallback
async function initSqliteFallback() {
  activeEngine = 'sqlite';
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'eventsphere.db');

  await new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      sqliteDb.run('PRAGMA foreign_keys = ON;');
      sqliteDb.run('PRAGMA journal_mode = WAL;');
      resolve();
    });
  });

  const schemaFile = fs.existsSync(path.join(__dirname, 'schema_sqlite.sql'))
    ? path.join(__dirname, 'schema_sqlite.sql')
    : path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaFile, 'utf-8');
  await execScript(schemaSql);

  const countCheck = await get('SELECT COUNT(*) as count FROM events');
  const eventCount = countCheck ? Number(countCheck.count) : 0;
  if (eventCount === 0) {
    const seedFile = fs.existsSync(path.join(__dirname, 'seed_sqlite.sql'))
      ? path.join(__dirname, 'seed_sqlite.sql')
      : path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedFile, 'utf-8');
    await execScript(seedSql);
    console.log('🌱 Seed data populated successfully into SQLite (Venues, Categories, Events, Users, Bookings).');
  }

  console.log(`✅ EventSphere is running on SQLite fallback at: ${dbPath}`);
  console.log(`💡 To switch to MySQL: add your MySQL root password to backend/.env (DB_PASSWORD=...)`);
}

// Helper: Initialize schema and seed data
async function initializeDatabase() {
  const mysql = require('mysql2/promise');

  try {
    // 1. Try connecting to MySQL server
    const adminConnection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      connectTimeout: 3000
    });

    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await adminConnection.end();

    // 2. Initialize MySQL connection pool
    mysqlPool = mysql.createPool(DB_CONFIG);
    activeEngine = 'mysql';

    try {
      await mysqlPool.query("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));");
    } catch (_) {}

    // 3. Load & execute MySQL schema
    const schemaFile = fs.existsSync(path.join(__dirname, 'schema_mysql.sql'))
      ? path.join(__dirname, 'schema_mysql.sql')
      : path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaFile, 'utf-8');
    await execScript(schemaSql);

    // 4. Check if seed data exists
    const countCheck = await get('SELECT COUNT(*) as count FROM events');
    const eventCount = countCheck ? Number(countCheck.count) : 0;
    if (eventCount === 0) {
      const seedFile = fs.existsSync(path.join(__dirname, 'seed_mysql.sql'))
        ? path.join(__dirname, 'seed_mysql.sql')
        : path.join(__dirname, 'seed.sql');
      const seedSql = fs.readFileSync(seedFile, 'utf-8');
      await execScript(seedSql);
      console.log('🌱 Seed data populated successfully into MySQL with realistic events and bookings.');
    } else {
      console.log(`ℹ️ MySQL database '${DB_CONFIG.database}' already contains ${eventCount} events.`);
    }

    console.log(`✅ Connected to MySQL 8.0 database '${DB_CONFIG.database}' at ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  } catch (err) {
    console.warn(`⚠️ MySQL Connection unavailable (${err.message}).`);
    console.log(`🔄 Automatically falling back to embedded SQLite so the application works seamlessly...`);
    await initSqliteFallback();
  }
}

// Helper: Run an ACID transaction (Unit 3: Commit / Rollback)
async function withTransaction(fn) {
  if (activeEngine === 'mysql') {
    const conn = await mysqlPool.getConnection();
    try {
      await conn.beginTransaction();
      const tx = {
        query: async (sql, params = []) => {
          const [rows] = await conn.query(sql, params);
          return rows;
        },
        get: async (sql, params = []) => {
          const [rows] = await conn.query(sql, params);
          return rows.length > 0 ? rows[0] : null;
        },
        run: async (sql, params = []) => {
          const [result] = await conn.query(sql, params);
          return { lastID: result.insertId, changes: result.affectedRows };
        }
      };
      const result = await fn(tx);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } else {
    await run('BEGIN IMMEDIATE TRANSACTION');
    try {
      const result = await fn({ query, get, run });
      await run('COMMIT');
      return result;
    } catch (err) {
      try {
        await run('ROLLBACK');
      } catch (_) {}
      throw err;
    }
  }
}

module.exports = {
  query,
  get,
  run,
  execScript,
  withTransaction,
  initializeDatabase,
  getActiveEngine: () => activeEngine,
  DB_CONFIG
};
