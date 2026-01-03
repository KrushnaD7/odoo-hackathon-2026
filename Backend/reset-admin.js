require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const config = require('./src/config/env');

async function resetAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check if admin exists
    const checkResult = await client.query(
      'SELECT id FROM users WHERE employee_id = $1',
      ['ADMIN001']
    );

    if (checkResult.rows.length > 0) {
      console.log('Found existing admin user. Deleting...');
      
      // Delete admin profile first (due to foreign key)
      await client.query(
        'DELETE FROM employee_profiles WHERE user_id = $1',
        [checkResult.rows[0].id]
      );
      
      // Delete admin user
      await client.query(
        'DELETE FROM users WHERE employee_id = $1',
        ['ADMIN001']
      );
      
      console.log('✅ Admin user deleted\n');
    } else {
      console.log('No existing admin found\n');
    }

    // Create new admin user
    console.log('Creating new admin user...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const passwordHash = await bcrypt.hash(adminPassword, config.bcryptRounds);

    const adminUser = await client.query(
      `INSERT INTO users (employee_id, email, password_hash, role, email_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, employee_id, email, role`,
      ['ADMIN001', 'admin@dayflow.com', passwordHash, 'admin', true]
    );

    console.log('✅ Admin user created:', adminUser.rows[0]);

    // Create admin profile
    await client.query(
      `INSERT INTO employee_profiles 
       (user_id, first_name, last_name, job_title, department, hire_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        adminUser.rows[0].id,
        'Admin',
        'User',
        'System Administrator',
        'IT',
        new Date().toISOString().split('T')[0],
        'active'
      ]
    );

    console.log('✅ Admin profile created');
    console.log('\n📝 Admin Credentials:');
    console.log('  Employee ID: ADMIN001');
    console.log('  Email: admin@dayflow.com');
    console.log('  Password: Admin@123');
    console.log('\n✅ Admin user reset successfully!');
    console.log('You can now use these credentials in Postman Step 12.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await client.end();
  }
}

resetAdmin();

