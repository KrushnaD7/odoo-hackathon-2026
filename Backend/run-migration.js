const pool = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'src/migrations/002_add_document_visibility.sql'),
      'utf8'
    );

    console.log('Running migration: 002_add_document_visibility.sql');
    await pool.query(migrationSQL);
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

