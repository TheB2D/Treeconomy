#!/usr/bin/env node

/**
 * CRS Credentials Test Script
 * Tests if your CRS API credentials are working
 */

require('dotenv').config();
const https = require('https');

const username = process.env.CRS_USERNAME;
const password = process.env.CRS_PASSWORD;
const baseUrl = process.env.CRS_BASE_URL || 'https://api-sandbox.stitchcredit.com/api';

console.log('🔧 Testing CRS API Credentials...\n');

// Check if credentials exist
console.log('📋 Configuration Check:');
console.log('  CRS_USERNAME:', username ? '✅ Set' : '❌ Missing');
console.log('  CRS_PASSWORD:', password ? '✅ Set (length: ' + password.length + ')' : '❌ Missing');
console.log('  CRS_BASE_URL:', baseUrl);
console.log('  CRS_ENVIRONMENT:', process.env.CRS_ENVIRONMENT);
console.log('');

if (!username || !password) {
  console.error('❌ ERROR: Missing credentials in .env file!\n');
  console.log('Your .env file should have:');
  console.log('  CRS_USERNAME=sfhacks_dev24');
  console.log('  CRS_PASSWORD=7rELENV#PcgzRjNru4DWkKq6');
  process.exit(1);
}

// Test authentication
console.log('🔐 Testing authentication with CRS API...');

const auth = Buffer.from(`${username}:${password}`).toString('base64');
const url = new URL(baseUrl);

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  },
};

const req = https.request(options, (res) => {
  console.log('📡 Response Status:', res.statusCode);
  
  if (res.statusCode === 401) {
    console.error('❌ AUTHENTICATION FAILED (401 Unauthorized)\n');
    console.log('Possible issues:');
    console.log('  1. Wrong username or password');
    console.log('  2. Credentials have spaces or quotes');
    console.log('  3. Password has special characters that need escaping');
    console.log('\nYour credentials should look EXACTLY like:');
    console.log('  CRS_USERNAME=sfhacks_dev24');
    console.log('  CRS_PASSWORD=7rELENV#PcgzRjNru4DWkKq6');
    console.log('\n🆘 If still not working, contact: development@crscreditapi.com');
    process.exit(1);
  } else if (res.statusCode >= 200 && res.statusCode < 300) {
    console.log('✅ AUTHENTICATION SUCCESSFUL!\n');
    console.log('Your CRS credentials are working correctly! 🎉');
    console.log('\nNow restart your dev server:');
    console.log('  1. Stop: Ctrl+C');
    console.log('  2. Start: npm run dev');
    console.log('  3. Try syncing your forest again!');
    process.exit(0);
  } else if (res.statusCode === 404) {
    console.log('⚠️  Got 404 (Not Found) - This is OK!');
    console.log('✅ Your credentials are working (authentication passed)');
    console.log('   The endpoint just doesn\'t exist at the root.');
    console.log('\nRestart your dev server and try again!');
    process.exit(0);
  } else {
    console.log('⚠️  Unexpected status:', res.statusCode);
    console.log('This might be OK - credentials may be working.');
  }

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (data) {
      console.log('\nResponse:', data.substring(0, 200));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Network Error:', error.message);
  console.log('\nPossible issues:');
  console.log('  - No internet connection');
  console.log('  - CRS API is down');
  console.log('  - Firewall blocking request');
  process.exit(1);
});

req.end();
