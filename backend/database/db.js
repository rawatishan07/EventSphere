const mysql = require('mysql2/promise');
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

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
  }
  return pool;
}

// Helper: Run SQL query returning multiple rows (SELECT)
async function query(sql, params = []) {
  const p = getPool();
  const [rows] = await p.query(sql, params);
  return rows;
}

// Helper: Run SQL query returning a single row (SELECT ... LIMIT 1)
async function get(sql, params = []) {
  const p = getPool();
  const [rows] = await p.query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper: Run INSERT / UPDATE / DELETE query
async function run(sql, params = []) {
  const p = getPool();
  const [result] = await p.query(sql, params);
  return {
    lastID: result.insertId,
    changes: result.affectedRows
  };
}

// Helper: Run multiple statements in sequence (like executing .sql script)
async function execScript(scriptContent) {
  const p = getPool();
  await p.query(scriptContent);
}

// Helper: Initialize schema and seed data
async function initializeDatabase() {
  try {
    // 1. Connect without specific DB to ensure database exists
    const adminConnection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });

    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await adminConnection.end();

    console.log(`✅ MySQL database '${DB_CONFIG.database}' verified/created at ${DB_CONFIG.host}:${DB_CONFIG.port}.`);

    // 2. Initialize connection pool and relax ONLY_FULL_GROUP_BY for complex multi-table analytics
    const p = getPool();
    try {
      await p.query("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));");
    } catch (modeErr) {
      // Ignore if session sql_mode adjustment is restricted
    }

    // 3. Load & execute schema
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await execScript(schemaSql);
    console.log('📄 MySQL schema verified / created successfully.');

    // 4. Check if seed data exists
    const countCheck = await get('SELECT COUNT(*) as count FROM events');
    const eventCount = countCheck ? Number(countCheck.count) : 0;

    if (eventCount === 0) {
      const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
      await execScript(seedSql);
      console.log('🌱 Seed data populated successfully into MySQL with realistic events and bookings.');
    } else {
      console.log(`ℹ️ MySQL database already contains ${eventCount} events.`);
    }
  } catch (err) {
    console.error('⚠️ MySQL Database initialization error:');
    console.error('   Message:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`   👉 Please check DB_USER and DB_PASSWORD in backend/.env!`);
    } else if (err.code === 'ECONNREFUSED') {
      console.error(`   👉 Please ensure MySQL Server is running on ${DB_CONFIG.host}:${DB_CONFIG.port}.`);
    }
    throw err;
  }
}

module.exports = {
  db: getPool(),
  getPool,
  query,
  get,
  run,
  execScript,
  initializeDatabase,
  DB_CONFIG
};
