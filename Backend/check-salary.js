require('dotenv').config();
const { Client } = require('pg');

async function checkSalary() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all users
    const users = await client.query(
      'SELECT id, employee_id, email, role FROM users ORDER BY created_at'
    );

    console.log('📋 All Users:');
    users.rows.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.employee_id} (${user.role})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
    });

    // Get all salary structures
    const salaries = await client.query(
      'SELECT user_id, base_salary FROM salary_structure'
    );

    console.log('\n\n💰 Salary Structures:');
    if (salaries.rows.length === 0) {
      console.log('   No salary structures found');
    } else {
      salaries.rows.forEach((salary, index) => {
        console.log(`\n${index + 1}. User ID: ${salary.user_id}`);
        console.log(`   Base Salary: ${salary.base_salary}`);
        
        // Find matching user
        const user = users.rows.find(u => u.id === salary.user_id);
        if (user) {
          console.log(`   Employee: ${user.employee_id} (${user.email})`);
        }
      });
    }

    console.log('\n\n🔍 To fix Step 14:');
    console.log('1. Check Step 4 (Get Current User) response - note the "id" field');
    console.log('2. Make sure Step 15 used the SAME user ID');
    console.log('3. Or use Step 15 again with the correct employee user ID');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSalary();

