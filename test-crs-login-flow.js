#!/usr/bin/env node

/**
 * Test the proper CRS login flow
 */

require('dotenv').config();
const axios = require('axios');

const username = process.env.CRS_USERNAME;
const password = process.env.CRS_PASSWORD;
const baseUrl = process.env.CRS_BASE_URL || 'https://api-sandbox.stitchcredit.com/api';

console.log('🔧 Testing CRS Login Flow...\n');

console.log('📋 Credentials:');
console.log('  Username:', username);
console.log('  Password:', password ? password.substring(0, 4) + '...' : 'MISSING');
console.log('  Base URL:', baseUrl);
console.log('');

// Step 1: Login
console.log('🔐 STEP 1: Logging in to get token...');
console.log('   POST', baseUrl + '/users/login');
console.log('   Body:', JSON.stringify({ username, password }, null, 2));
console.log('');

axios.post(baseUrl + '/users/login', {
  username: username,
  password: password,
})
.then(loginResponse => {
  console.log('✅ Login successful! Status:', loginResponse.status);
  console.log('');
  console.log('Response headers:', loginResponse.headers);
  console.log('');
  console.log('Response body:', JSON.stringify(loginResponse.data, null, 2));
  console.log('');
  
  // Extract token
  const token = loginResponse.data.token || loginResponse.data.accessToken || loginResponse.headers['authorization'];
  
  if (!token) {
    console.error('❌ No token found in response!');
    console.error('   Keys in response:', Object.keys(loginResponse.data));
    process.exit(1);
  }
  
  console.log('🎫 Token obtained:', token.substring(0, 30) + '...');
  console.log('');
  
  // Step 2: Try to use the token
  console.log('📊 STEP 2: Using token to pull credit report...');
  
  const testRequest = {
    firstName: "Alice",
    lastName: "Excellent",
    ssn: "666001001",
    birthDate: "1990-01-01",
    addresses: [{
      addressLine1: "123 Perfect St",
      city: "New York",
      state: "NY",
      postalCode: "10001"
    }]
  };
  
  return axios.post(
    baseUrl + '/experian/credit-profile/credit-report/standard/exp-prequal-vantage4',
    testRequest,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
})
.then(creditResponse => {
  console.log('✅ Credit report retrieved! Status:', creditResponse.status);
  console.log('');
  console.log('Response preview:');
  console.log(JSON.stringify(creditResponse.data, null, 2).substring(0, 500));
  console.log('');
  console.log('🎉 EVERYTHING WORKS! Your authentication flow is correct!');
  console.log('');
  console.log('✅ Now restart your Next.js dev server and try syncing!');
})
.catch(error => {
  console.error('❌ ERROR:', error.message);
  console.error('');
  
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Response:', JSON.stringify(error.response.data, null, 2));
    console.error('');
    
    if (error.config && error.config.url) {
      console.error('Failed at:', error.config.url);
    }
  }
  
  process.exit(1);
});
