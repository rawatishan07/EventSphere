const { initializeDatabase } = require('./db');

async function main() {
  console.log('🚀 Running database initialization script...');
  await initializeDatabase();
  console.log('🎉 Done initializing database.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal database setup error:', err.message);
  process.exit(1);
});
