/**
 * Database Setup Script
 * This script helps create the database and run migrations
 * 
 * Usage: node setup-database.js
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  try {
    console.log('=== Dayflow HRMS Database Setup ===\n');

    // Parse DATABASE_URL or ask for connection details
    let dbConfig = {};
    
    if (process.env.DATABASE_URL) {
      // Parse connection string
      const url = new URL(process.env.DATABASE_URL);
      dbConfig = {
        host: url.hostname,
        port: url.port || 5432,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1) // Remove leading /
      };
      console.log(`Using database: ${dbConfig.database}`);
    } else {
      // Ask for connection details
      console.log('Enter PostgreSQL connection details:');
      dbConfig.host = await question('Host (localhost): ') || 'localhost';
      dbConfig.port = parseInt(await question('Port (5432): ') || '5432', 10);
      dbConfig.user = await question('User (postgres): ') || 'postgres';
      dbConfig.password = await question('Password: ');
      
      const dbName = await question('Database name (dayflow_db): ') || 'dayflow_db';
      dbConfig.database = dbName;
    }

    // Connect to postgres database to create the target database
    const adminClient = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: 'postgres' // Connect to default postgres database
    });

    await adminClient.connect();
    console.log('\nConnected to PostgreSQL server');

    // Check if database exists
    const dbCheck = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbConfig.database]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`Creating database: ${dbConfig.database}`);
      await adminClient.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log('Database created successfully');
    } else {
      console.log(`Database '${dbConfig.database}' already exists`);
    }

    await adminClient.end();

    // Connect to the target database and run migrations
    const client = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    });

    await client.connect();
    console.log(`Connected to database: ${dbConfig.database}`);

    // Read and execute migration file
    const migrationPath = path.join(__dirname, 'src', 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\nRunning migration...');
    await client.query(migrationSQL);
    console.log('Migration completed successfully');

    await client.end();

    console.log('\n✅ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update .env file with correct DATABASE_URL');
    console.log('2. Run: node src/seeds/initialData.js (to create admin user)');
    console.log('3. Start server: npm run dev');

  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    if (error.code === '3D000') {
      console.error('   Database does not exist and could not be created. Check PostgreSQL permissions.');
    } else if (error.code === '28P01') {
      console.error('   Authentication failed. Check username and password in .env file.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Could not connect to PostgreSQL. Make sure PostgreSQL is running.');
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

setupDatabase();

