#!/usr/bin/env node

// Database connection test script
const { testConnection } = require('../src/lib/database/config');

async function testDatabaseConnection() {
  console.log('🔗 Testing database connection...');
  
  try {
    const success = await testConnection();
    
    if (success) {
      console.log('✅ Database connection successful!');
      process.exit(0);
    } else {
      console.log('❌ Database connection failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
}

testDatabaseConnection();
