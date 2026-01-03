require('dotenv').config();
const { Client } = require('pg');

async function checkAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const result = await client.query(
      `SELECT u.id, u.employee_id, u.email, u.role, u.email_verified, 
              ep.first_name, ep.last_name 
       FROM users u 
       LEFT JOIN employee_profiles ep ON u.id = ep.user_id 
       WHERE u.employee_id = $1`,
      ['ADMIN001']
    );

    if (result.rows.length > 0) {
      const admin = result.rows[0];
      console.log('✅ Admin user exists:');
      console.log('  Employee ID:', admin.employee_id);
      console.log('  Email:', admin.email);
      console.log('  Role:', admin.role);
      console.log('  Name:', admin.first_name || 'N/A', admin.last_name || 'N/A');
      console.log('  Email Verified:', admin.email_verified);
      console.log('');
      console.log('📝 Default credentials:');
      console.log('  Employee ID: ADMIN001');
      console.log('  Email: admin@dayflow.com');
      console.log('  Password: Admin@123');
      console.log('');
      console.log('⚠️  Remember to change the password after first login!');
    } else {
      console.log('⚠️  Admin user not found');
      console.log('Run: npm run seed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAdmin();

