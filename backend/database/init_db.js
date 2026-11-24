const { initializeDatabase, getPool } = require('./db');

async function main() {
  console.log('🚀 Running MySQL database initialization script...');
  await initializeDatabase();
  console.log('🎉 Done initializing MySQL database.');
  const pool = getPool();
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal database setup error:', err.message);
  process.exit(1);
});
