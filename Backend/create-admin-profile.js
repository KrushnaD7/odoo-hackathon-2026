require('dotenv').config();
const { Client } = require('pg');

async function createAdminProfile() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get admin user
    const userRes = await client.query(
      'SELECT id FROM users WHERE employee_id = $1',
      ['ADMIN001']
    );

    if (userRes.rows.length === 0) {
      console.log('❌ Admin user not found. Run: npm run seed');
      return;
    }

    const userId = userRes.rows[0].id;

    // Check if profile exists
    const profileCheck = await client.query(
      'SELECT id FROM employee_profiles WHERE user_id = $1',
      [userId]
    );

    if (profileCheck.rows.length > 0) {
      console.log('✅ Admin profile already exists');
    } else {
      // Create profile
      await client.query(
        `INSERT INTO employee_profiles 
         (user_id, first_name, last_name, job_title, department, hire_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          'Admin',
          'User',
          'System Administrator',
          'IT',
          new Date().toISOString().split('T')[0],
          'active'
        ]
      );
      console.log('✅ Admin profile created successfully');
    }

    // Verify
    const result = await client.query(
      `SELECT u.employee_id, u.email, u.role, 
              ep.first_name, ep.last_name, ep.job_title, ep.department
       FROM users u 
       LEFT JOIN employee_profiles ep ON u.id = ep.user_id 
       WHERE u.employee_id = $1`,
      ['ADMIN001']
    );

    if (result.rows.length > 0) {
      const admin = result.rows[0];
      console.log('\n📋 Admin User Details:');
      console.log('  Employee ID:', admin.employee_id);
      console.log('  Email:', admin.email);
      console.log('  Role:', admin.role);
      console.log('  Name:', admin.first_name, admin.last_name);
      console.log('  Job Title:', admin.job_title);
      console.log('  Department:', admin.department);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createAdminProfile();

