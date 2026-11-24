const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'eventsphere.db');
let db = null;

// SELECT multiple rows
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// SELECT single row
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// INSERT / UPDATE / DELETE / Transaction commands
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Execute a .sql file
function execScript(sqlText) {
  return new Promise((resolve, reject) => {
    db.exec(sqlText, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Connect to SQLite, create tables/triggers/views, and seed 1 sample event if empty
async function initializeDatabase() {
  await new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err);
      db.run('PRAGMA foreign_keys = ON;');
      resolve();
    });
  });

  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema_sqlite.sql'), 'utf-8');
  await execScript(schemaSql);

  const row = await get('SELECT COUNT(*) AS count FROM events');
  if (!row || row.count === 0) {
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed_sqlite.sql'), 'utf-8');
    await execScript(seedSql);
    console.log('Seeded initial EventSphere data into SQLite.');
  }

  console.log(`Connected to SQLite database: ${DB_PATH}`);
}

module.exports = {
  query,
  get,
  run,
  initializeDatabase,
  getActiveEngine: () => 'sqlite'
};
