// backend/src/services/smsService.js
const axios = require('axios');

class SMSService {
  constructor() {
    this.apiUrl = 'https://api.semaphore.co';
    this.apiKey = process.env.SEMAPHORE_API_KEY;
    this.senderName = process.env.SMS_SENDER_NAME || 'Infomatik';
    
    if (!this.apiKey) {
      console.warn('SEMAPHORE_API_KEY not found in environment variables');
    }
  }

  /**
   * Send SMS using Semaphore API
   * @param {string} number - Philippine mobile number
   * @param {string} message - SMS message content
   * @returns {Promise<Object>} - API response
   */
  async sendSMS(number, message) {
    if (!this.apiKey) {
      console.error('SMS service not configured - missing API key');
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      // Format phone number for Semaphore (remove +63, ensure starts with 09)
      const formattedNumber = this.formatPhoneNumber(number);

      // Validate the formatted number
      if (!this.isValidPhilippineNumber(formattedNumber)) {
        console.error(`Invalid Philippine phone number format: ${formattedNumber}`);
        return { 
          success: false, 
          error: `Invalid phone number format: ${number}` 
        };
      }
      
      const response = await axios.post(`${this.apiUrl}/api/v4/messages`, {
        apikey: this.apiKey,
        number: formattedNumber,
        message: message,
        sendername: this.senderName
      });

      console.log(`✅ SMS API Response:`, response.data);

      console.log(`SMS sent to ${formattedNumber}: ${message.substring(0, 50)}...`);
      
      return {
        success: true,
        data: response.data,
        messageId: response.data[0]?.message_id
      };
      
    } catch (error) {
      console.error('SMS sending error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        code: error.response?.status
      };
    }
  }

  /**
 * Updated phone number validation for 09XXXXXXXXX format
 * @param {string} number - Phone number to validate
 * @returns {boolean} - True if valid
 */
isValidPhilippineNumber(number) {
  // Should be 09XXXXXXXXX (11 digits total)
  const phoneRegex = /^09\d{9}$/;
  const isValid = phoneRegex.test(number);
  
  console.log(`Phone validation: ${number} -> ${isValid ? 'VALID' : 'INVALID'}`);
  
  return isValid;
}

  /**
   * Send bulk SMS to multiple recipients
   * @param {Array} recipients - Array of phone numbers
   * @param {string} message - SMS message content
   * @returns {Promise<Object>} - Bulk send results
   */
  async sendBulkSMS(recipients, message) {
    if (!this.apiKey) {
      console.error('SMS service not configured - missing API key');
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      // Format all phone numbers
      const formattedNumbers = recipients.map(num => this.formatPhoneNumber(num));
      
      const response = await axios.post(`${this.apiUrl}/api/v4/messages`, {
        apikey: this.apiKey,
        number: formattedNumbers.join(','),
        message: message,
        sendername: this.senderName
      });

      console.log(`Bulk SMS sent to ${formattedNumbers.length} recipients`);
      
      return {
        success: true,
        data: response.data,
        count: formattedNumbers.length
      };
      
    } catch (error) {
      console.error('Bulk SMS sending error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        code: error.response?.status
      };
    }
  }

  /**
   * Check SMS account balance
   * @returns {Promise<Object>} - Account balance info
   */
  async getBalance() {
    if (!this.apiKey) {
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const response = await axios.post(`${this.apiUrl}/api/v4/account`, {
        apikey: this.apiKey
      });

      return {
        success: true,
        balance: response.data.account_balance,
        currency: 'PHP'
      };
      
    } catch (error) {
      console.error('Balance check error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get SMS delivery status
   * @param {string} messageId - Message ID from send response
   * @returns {Promise<Object>} - Delivery status
   */
  async getMessageStatus(messageId) {
    if (!this.apiKey || !messageId) {
      return { success: false, error: 'Invalid parameters' };
    }

    try {
      const response = await axios.post(`${this.apiUrl}/api/v4/messages/${messageId}`, {
        apikey: this.apiKey
      });

      return {
        success: true,
        status: response.data.status,
        data: response.data
      };
      
    } catch (error) {
      console.error('Status check error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

/**
 * Format Philippine phone number to 09XXXXXXXXX format
 * @param {string} number - Phone number in various formats
 * @returns {string} - Formatted number (09XXXXXXXXX)
 */
formatPhoneNumber(number) {
  // Remove all non-digits
  const cleaned = number.replace(/\D/g, '');
  
  console.log(`Formatting phone number: ${number} -> cleaned: ${cleaned}`);
  
  // Handle different input formats and convert to 09XXXXXXXXX
  if (cleaned.startsWith('639') && cleaned.length === 12) {
    // 639XXXXXXXXX -> 09XXXXXXXXX
    const formatted = '0' + cleaned.substring(2);
    console.log(`Converted 639 format: ${cleaned} -> ${formatted}`);
    return formatted;
  } else if (cleaned.startsWith('09') && cleaned.length === 11) {
    // 09XXXXXXXXX (already correct format)
    console.log(`Already in correct format: ${cleaned}`);
    return cleaned;
  } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
    // 9XXXXXXXXX -> 09XXXXXXXXX
    const formatted = '0' + cleaned;
    console.log(`Converted 9 format: ${cleaned} -> ${formatted}`);
    return formatted;
  } else if (cleaned.startsWith('63') && cleaned.length === 11) {
    // 639XXXXXXXX -> 09XXXXXXXX (handle shorter international format)
    const formatted = '0' + cleaned.substring(2);
    console.log(`Converted short 63 format: ${cleaned} -> ${formatted}`);
    return formatted;
  }
  
  // For any other format, try to make sense of it
  console.log(`Unknown format: ${cleaned}, returning as-is`);
  return cleaned;
}


  /**
   * Send welcome SMS to new user
   * @param {Object} user - User object
   * @returns {Promise<Object>} - SMS result
   */
  async sendWelcomeSMS(user) {
      const message = `Welcome to Infomatik, ${user.firstName}! Your account has been created successfully. You now have full access to our comprehensive services including viewing office announcements, accomplishments, and reviewing local policies. Additionally, you can apply for job openings, submit solicitation requests, and provide valuable feedback to help improve our community services.`;     
      console.log(message);
    return await this.sendSMS(user.contactNumber, message);
  }

  /**
   * Send job application status SMS with different messages for accepted/rejected
   * @param {Object} user - User object
   * @param {string} jobTitle - Job title
   * @param {string} status - Application status (accepted/rejected)
   * @returns {Promise<Object>} - SMS result
   */
  async sendJobApplicationSMS(user, jobTitle, status) {
    let message;
    
    if (status === 'accepted') {
      message = `🎉 Congratulations ${user.firstName}! Your application for "${jobTitle}" has been ACCEPTED. Please visit our office at the Legislative Building, Bangkilingan in front of Ziga Memorial Hospital within 3 business days with a valid ID and required documents to further discuss your application.`;
      console.log(message);
    } else if (status === 'rejected') {
      message = `Hello ${user.firstName}, thank you for your interest in the "${jobTitle}" position. Unfortunately, your application was not selected this time. Please consider applying for other opportunities in the future. Keep checking our website for new openings.`;
      console.log(message);
    } else {
      // Fallback for other statuses
      message = `Hello ${user.firstName}, your application for "${jobTitle}" has been ${status.toUpperCase()}. Please check your account for more details.`;
      console.log(message);
    }
    
    return await this.sendSMS(user.contactNumber, message);
  }

  /**
   * Send solicitation request status SMS with different messages for approved/rejected
   * @param {Object} user - User object
   * @param {string} status - Request status ('APPROVED' or 'REJECTED')
   * @returns {Promise<Object>} - SMS result
   */
  async sendSolicitationStatusSMS(user, status) {
    let message;
    
    if (status === 'APPROVED') {
      message = `Hello ${user.firstName}, GOOD NEWS! Your solicitation request has been APPROVED. Please visit our office at the Legislative Building, Bangkilingan in front of Ziga Memorial Hospital to discuss the details and next steps for your approved request.`;
      console.log(message);
    } else if (status === 'REJECTED') {
      console.log(message);
      message = `Hello ${user.firstName}, we regret to inform you that your solicitation request has been REJECTED. You may visit our office at the Legislative Building, Bangkilingan in front of Ziga Memorial Hospital for more information about the decision.`;
    } else {
      // Fallback for any other status
      message = `Hello ${user.firstName}, your solicitation request has been ${status.toLowerCase()}. Please visit our office at the Legislative Building, Bangkilingan in front of Ziga Memorial Hospital for more details.`;
      console.log(message);
    }
    
    return await this.sendSMS(user.contactNumber, message);
  }
  /**
   * Send rice distribution SMS to barangay residents
   * @param {Array} users - Users in selected barangays
   * @param {Object} distributionInfo - Distribution details
   * @returns {Promise<Object>} - Bulk SMS result
   */
  async sendRiceDistributionSMS(users, distributionInfo) {
    const { date, location, barangays } = distributionInfo;

     // Capitalize the first letter of each barangay
  const capitalizedBarangays = barangays.map(barangay => {
    if (!barangay) return barangay;
    return barangay.charAt(0).toUpperCase() + barangay.slice(1).toLowerCase();
  });
  
  // Get the month from the date
  let monthText = '';
  if (date && date !== 'TBA') {
    const dateObj = new Date(date);
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
    monthText = `this ${monthName}`;
  } else {
    monthText = 'soon';
  }
  
  const message = `RICE DISTRIBUTION ANNOUNCEMENT: Free rice distribution for ${capitalizedBarangays.join(', ')} residents ${monthText}. Please check our website for more specific details (location, date, etc.) about the distribution.`;
  
    console.log(message);
    const phoneNumbers = users.map(user => user.contactNumber);
    return await this.sendBulkSMS(phoneNumbers, message);
  }

  /**
   * Send announcement SMS to all users or specific barangays
   * @param {Array} users - Target users
   * @param {string} announcement - Announcement text
   * @returns {Promise<Object>} - Bulk SMS result
   */
  async sendAnnouncementSMS(users, announcement) {
    const message = `CITY COUNCILOR ANNOUNCEMENT: ${announcement}`;
    
    const phoneNumbers = users.map(user => user.contactNumber);
    return await this.sendBulkSMS(phoneNumbers, message);
  }

  /**
   * Send job closure notification SMS to pending applicants
   * @param {Object} user - User object
   * @param {string} jobTitle - Job title
   * @returns {Promise<Object>} - SMS result
   */
  async sendJobClosureNotificationSMS(user, jobTitle) {
    const message = `Hello ${user.firstName}, the job opening "${jobTitle}" that you applied for has been closed. Please check other available opportunities on our website.`;
    console.log(message);
    return await this.sendSMS(user.contactNumber, message);
  }

  /**
 * Test SMS with specific debugging for your number
 */
async testSMSWithDebugging(testNumber = "09928845990") {
  console.log("🔍 SMS DEBUG TEST STARTING...");
  console.log("Input number:", testNumber);
  
  // Test the formatting
  const formatted = this.formatPhoneNumber(testNumber);
  console.log("Formatted number:", formatted);
  console.log("Expected format: 639928845990");
  console.log("Match:", formatted === "639928845990" ? "✅ CORRECT" : "❌ INCORRECT");
  
  // Test the validation
  const isValid = this.isValidPhilippineNumber(formatted);
  console.log("Validation result:", isValid ? "✅ VALID" : "❌ INVALID");
  
  // Test API call
  try {
    const testMessage = "HELLO: This is a debug message from your SMS service.";
    
    const payload = {
      apikey: this.apiKey,
      number: formatted,
      message: testMessage,
      sendername: this.senderName
    };
    
    console.log("🚀 API Payload:", {
      ...payload,
      apikey: "HIDDEN"
    });
    
    const response = await axios.post(`${this.apiUrl}/api/v4/messages`, payload);
    
    console.log("📡 Semaphore Response:", response.data);
    
    if (response.data[0]?.status) {
      console.log("📊 Message Status:", response.data[0].status);
      console.log("🆔 Message ID:", response.data[0].message_id);
    }
    
    return response.data;
    
  } catch (error) {
    console.error("❌ Debug test failed:", error.response?.data || error.message);
    return error.response?.data || error.message;
  }
}

// Add these test functions to your SMS service

/**
 * Check account balance and status
 */
async checkAccountStatus() {
  try {
    console.log("💰 Checking account status...");
    
    const response = await axios.post(`${this.apiUrl}/api/v4/account`, {
      apikey: this.apiKey
    });
    
    console.log("Account Details:");
    console.log("  - Balance:", response.data.account_balance);
    console.log("  - Currency:", response.data.currency || 'PHP');
    console.log("  - Status:", response.data.status || 'Unknown');
    
    return response.data;
  } catch (error) {
    console.error("❌ Account check failed:", error.response?.data);
    return null;
  }
}

/**
 * Check message delivery status
 */
async checkMessageStatus(messageId) {
  try {
    console.log(`📋 Checking status for message ID: ${messageId}`);
    
    const response = await axios.get(`${this.apiUrl}/api/v4/messages/${messageId}`, {
      params: {
        apikey: this.apiKey
      }
    });
    
    console.log("Message Status Details:");
    console.log("  - Status:", response.data.status);
    console.log("  - Recipient:", response.data.recipient);
    console.log("  - Network:", response.data.network);
    console.log("  - Created:", response.data.created_at);
    console.log("  - Updated:", response.data.updated_at);
    
    return response.data;
  } catch (error) {
    console.error("❌ Status check failed:", error.response?.data);
    return null;
  }
}

/**
 * Comprehensive SMS test
 */
async runComprehensiveTest(testNumber = "09928845990") {
  console.log("🧪 COMPREHENSIVE SMS TEST STARTING...");
  console.log("=====================================");
  
  // Step 1: Check account status
  console.log("\n🔍 Step 1: Account Status");
  await this.checkAccountStatus();
  
  // Step 2: Test different message formats
  console.log("\n🔍 Step 2: Testing Different Messages");
  
  const testMessages = [
    "Hello! This is message #1 from your city councilor system.",
    "Greetings! Message #2 - SMS service is working correctly.",
    "Hi there! Message #3 - This is your OTP verification service."
  ];
  
  const messageIds = [];
  
  for (let i = 0; i < testMessages.length; i++) {
    try {
      console.log(`\n📤 Sending test message ${i + 1}...`);
      
      const result = await this.sendSMS(testNumber, testMessages[i]);
      
      if (result.success && result.messageId) {
        messageIds.push(result.messageId);
        console.log(`✅ Message ${i + 1} sent - ID: ${result.messageId}`);
      } else {
        console.log(`❌ Message ${i + 1} failed:`, result.error);
      }
      
      // Wait 2 seconds between sends to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Message ${i + 1} error:`, error.message);
    }
  }
  
  // Step 3: Check status of sent messages
  console.log("\n🔍 Step 3: Checking Message Statuses");
  
  for (const messageId of messageIds) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.checkMessageStatus(messageId);
  }
  
  console.log("\n✅ Comprehensive test completed!");
  console.log("Check your phone for messages and Semaphore dashboard for delivery status.");
}
}

module.exports = new SMSService();