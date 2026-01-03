require('dotenv').config();
const { Client } = require('pg');

async function verifyAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const result = await client.query(
      'SELECT employee_id, email, role FROM users WHERE employee_id = $1',
      ['ADMIN001']
    );

    if (result.rows.length > 0) {
      console.log('✅ Admin user found:');
      console.log('  Employee ID:', result.rows[0].employee_id);
      console.log('  Email:', result.rows[0].email);
      console.log('  Role:', result.rows[0].role);
      console.log('\n📝 Use these credentials in Postman:');
      console.log('  Email: admin@dayflow.com');
      console.log('  Password: Admin@123');
    } else {
      console.log('❌ Admin user NOT found!');
      console.log('\n🔧 Solution: Run this command:');
      console.log('  npm run seed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyAdmin();