// Quick test script to verify frontend-backend connection
// Run with: node test-connection.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testConnection() {
  console.log('🔍 Testing Frontend-Backend Connection...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Endpoint...');
  try {
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   ⚠️  Backend server is not running on port 3000');
      return;
    }
  }

  // Test 2: CORS Check
  console.log('\n2. Testing CORS Configuration...');
  try {
    const corsResponse = await axios.options(`${API_BASE_URL}/auth/signup`);
    console.log('✅ CORS headers:', corsResponse.headers['access-control-allow-origin']);
  } catch (error) {
    console.log('⚠️  CORS test (this is normal if backend handles it):', error.message);
  }

  // Test 3: Signup Endpoint Structure
  console.log('\n3. Testing Signup Endpoint Structure...');
  try {
    const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, {
      employee_id: 'TEST' + Date.now(),
      email: `test${Date.now()}@test.com`,
      password: 'Test@123456',
      first_name: 'Test',
      last_name: 'User',
      role: 'employee'
    });
    console.log('✅ Signup response structure:', JSON.stringify(signupResponse.data, null, 2));
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('⚠️  Rate limit hit (429) - this is expected after multiple attempts');
      console.log('   Response:', error.response.data);
    } else {
      console.log('❌ Signup test failed:', error.response?.data || error.message);
    }
  }

  // Test 4: Signin Endpoint Structure
  console.log('\n4. Testing Signin Endpoint Structure...');
  try {
    const signinResponse = await axios.post(`${API_BASE_URL}/auth/signin`, {
      email: 'test@test.com',
      password: 'Test@123'
    });
    console.log('✅ Signin response structure:', JSON.stringify(signinResponse.data, null, 2));
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('⚠️  Invalid credentials (expected if user doesn\'t exist)');
    } else if (error.response?.status === 429) {
      console.log('⚠️  Rate limit hit (429)');
    } else {
      console.log('❌ Signin test failed:', error.response?.data || error.message);
    }
  }

  console.log('\n✅ Connection test complete!');
}

testConnection().catch(console.error);

