// backend/test-sms.js
require('dotenv').config();
const smsService = require('./src/services/smsService');

async function testSMS() {
  console.log('🧪 Starting comprehensive SMS test...');
  
  try {
    // First run the comprehensive test
    await smsService.runComprehensiveTest("09928845990");
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
}

testSMS();