#!/usr/bin/env node

/**
 * Direct CRS API Test - Tests Experian endpoint directly
 */

require('dotenv').config();
const axios = require('axios');

const username = process.env.CRS_USERNAME;
const password = process.env.CRS_PASSWORD;
const baseUrl = process.env.CRS_BASE_URL || 'https://api-sandbox.stitchcredit.com/api';

console.log('🔧 Testing CRS Experian API Directly...\n');

// Debug: Show what we're reading
console.log('📋 Configuration:');
console.log('  CRS_USERNAME:', username ? `"${username}"` : 'MISSING');
console.log('  CRS_PASSWORD:', password ? `"${password.substring(0, 4)}..."` : 'MISSING');
console.log('  Length:', username ? username.length : 0, 'chars');
console.log('  Base URL:', baseUrl);
console.log('');

if (!username || !password) {
  console.error('❌ Missing credentials!');
  process.exit(1);
}

// Check for hidden characters
console.log('🔍 Checking for hidden characters:');
console.log('  Username hex:', Buffer.from(username).toString('hex'));
console.log('  Username trimmed:', username === username.trim() ? '✅ No extra spaces' : '❌ HAS SPACES');
console.log('');

// Create auth header
const auth = Buffer.from(`${username}:${password}`).toString('base64');
console.log('🔑 Auth Header:');
console.log('  Basic', auth.substring(0, 30) + '...');
console.log('');

// Test data
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

const endpoint = `${baseUrl}/experian/credit-profile/credit-report/standard/exp-prequal-vantage4`;

console.log('📡 Making request to:');
console.log('  ', endpoint);
console.log('');

axios.post(endpoint, testRequest, {
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})
.then(response => {
  console.log('✅ SUCCESS! Status:', response.status);
  console.log('');
  console.log('🎉 Your CRS credentials are working!');
  console.log('');
  console.log('Response preview:');
  console.log(JSON.stringify(response.data, null, 2).substring(0, 500));
  console.log('');
  console.log('✅ Now restart your dev server and try syncing again!');
})
.catch(error => {
  console.error('❌ ERROR:', error.response ? error.response.status : error.message);
  console.error('');
  
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
    console.error('');
  }
  
  if (error.response && error.response.status === 401) {
    console.error('🚨 AUTHENTICATION FAILED!');
    console.error('');
    console.error('Your credentials are not working. Possible issues:');
    console.error('  1. Username is wrong');
    console.error('  2. Password is wrong');
    console.error('  3. Hidden characters in .env file');
    console.error('');
    console.error('Expected credentials from CRS:');
    console.error('  Username: sfhacks_dev24');
    console.error('  Password: 7rELENV#PcgzRjNru4DWkKq6');
    console.error('');
    console.error('Your current values:');
    console.error('  Username: "' + username + '"');
    console.error('  Password: "' + password.substring(0, 4) + '..."');
    console.error('');
    console.error('🆘 Contact CRS: development@crscreditapi.com');
  }
  
  process.exit(1);
});
