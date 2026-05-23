#!/usr/bin/env node

/**
 * Quick test script to verify Django backend connectivity
 * Run this to check if CORS and API endpoints are working
 */

const axios = require('axios');

const API_BASE = 'http://localhost:8000/api';
const FRONTEND_ORIGIN = 'http://localhost:4028';

async function testBackendConnection() {
  console.log('🔍 Testing Django Backend Connection...\n');
  
  // Test 1: Basic connectivity
  console.log('1. Testing basic connectivity to /api/...');
  try {
    const response = await axios.get(`${API_BASE}/`, {
      headers: {
        'Origin': FRONTEND_ORIGIN
      }
    });
    console.log('✅ Backend is responding');
  } catch (error) {
    if (error.response) {
      console.log(`⚠️  Backend responded with status: ${error.response.status}`);
    } else {
      console.log('❌ Cannot connect to backend. Is Django running on port 8000?');
      console.log('   Run: cd be && python manage.py runserver');
      return false;
    }
  }
  
  // Test 2: Check CORS headers
  console.log('\n2. Testing CORS headers...');
  try {
    const response = await axios.options(`${API_BASE}/users/auth/login/`, {
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers']
    };
    
    if (corsHeaders['access-control-allow-origin']) {
      console.log('✅ CORS is configured');
      console.log('   Allow-Origin:', corsHeaders['access-control-allow-origin']);
    } else {
      console.log('❌ CORS not configured properly');
      console.log('   Please follow the CORS_SETUP_GUIDE.md to configure Django');
    }
  } catch (error) {
    console.log('⚠️  Could not test CORS headers');
  }
  
  // Test 3: Test login endpoint
  console.log('\n3. Testing login endpoint...');
  try {
    const response = await axios.post(`${API_BASE}/users/auth/login/`, {
      email: 'test@test.com',
      password: 'test'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_ORIGIN
      }
    });
    console.log('⚠️  Unexpected success with test credentials');
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 401)) {
      console.log('✅ Login endpoint is working (returned expected error)');
    } else if (error.response && error.response.status === 403) {
      console.log('❌ CORS is blocking the request (403 Forbidden)');
      console.log('   Please configure CORS in Django settings');
    } else {
      console.log('❌ Login endpoint error:', error.message);
    }
  }
  
  // Test 4: Test with real credentials
  console.log('\n4. Testing with demo credentials...');
  try {
    const response = await axios.post(`${API_BASE}/users/auth/login/`, {
      email: 'customer@poolcrest.com',
      password: 'mypassMypass!23'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_ORIGIN
      }
    });
    
    if (response.data.access && response.data.refresh) {
      console.log('✅ Authentication is working!');
      console.log('   Access token received:', response.data.access.substring(0, 20) + '...');
      return true;
    }
  } catch (error) {
    console.log('⚠️  Could not authenticate with demo credentials');
    if (error.response) {
      console.log('   Response:', error.response.status, error.response.data);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 Summary:');
  console.log('- Make sure Django is running: cd be && python manage.py runserver');
  console.log('- Configure CORS if needed: See be/CORS_SETUP_GUIDE.md');
  console.log('- Frontend should be on: http://localhost:4028');
  console.log('- Backend API should be on: http://localhost:8000/api');
  
  return true;
}

// Run the test
testBackendConnection().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
