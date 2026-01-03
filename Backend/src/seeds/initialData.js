/**
 * Seed script to create initial admin user
 * Run this after database migration
 * 
 * Usage: node src/seeds/initialData.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const config = require('../config/env');

async function seedAdmin() {
  try {
    // Hash password for admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const passwordHash = await bcrypt.hash(adminPassword, config.bcryptRounds);

    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE employee_id = $1',
      ['ADMIN001']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = await pool.query(
      `INSERT INTO users (employee_id, email, password_hash, role, email_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, employee_id, email, role`,
      ['ADMIN001', 'admin@dayflow.com', passwordHash, 'admin', true]
    );

    console.log('Admin user created:', adminUser.rows[0]);

    // Create admin profile
    await pool.query(
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

    console.log('Admin profile created');
    console.log('\nDefault Admin Credentials:');
    console.log('Employee ID: ADMIN001');
    console.log('Email: admin@dayflow.com');
    console.log('Password: Admin@123 (or set ADMIN_PASSWORD in .env)');
    console.log('\n⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('Error seeding admin user:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAdmin };

