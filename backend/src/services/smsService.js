// backend/src/services/smsService.js
const axios = require('axios');

class SMSService {
  constructor() {
    this.apiUrl = 'https://api.semaphore.co';
    this.apiKey = process.env.SEMAPHORE_API_KEY;
    this.senderName = process.env.SMS_SENDER_NAME || 'CityCouncilor';
    
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
      
      const response = await axios.post(`${this.apiUrl}/api/v4/messages`, {
        apikey: this.apiKey,
        number: formattedNumber,
        message: message,
        sendername: this.senderName
      });

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
   * Format Philippine phone number for Semaphore API
   * @param {string} number - Phone number in various formats
   * @returns {string} - Formatted number (09XXXXXXXXX)
   */
  formatPhoneNumber(number) {
    // Remove all non-digits
    const cleaned = number.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('639') && cleaned.length === 12) {
      // +639XXXXXXXXX -> 09XXXXXXXXX
      return '0' + cleaned.substring(2);
    } else if (cleaned.startsWith('09') && cleaned.length === 11) {
      // 09XXXXXXXXX (already correct format)
      return cleaned;
    } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
      // 9XXXXXXXXX -> 09XXXXXXXXX
      return '0' + cleaned;
    }
    
    // Return original if can't format
    return number;
  }

  /**
   * Send welcome SMS to new user
   * @param {Object} user - User object
   * @returns {Promise<Object>} - SMS result
   */
  async sendWelcomeSMS(user) {
    const message = `Welcome to City Councilor Portal, ${user.firstName}! Your account has been created successfully. You can now access our services and stay updated with city announcements.`;
    
    return await this.sendSMS(user.contactNumber, message);
  }

  /**
   * Send job application status SMS
   * @param {Object} user - User object
   * @param {string} jobTitle - Job title
   * @param {string} status - Application status (approved/rejected)
   * @returns {Promise<Object>} - SMS result
   */
  async sendJobApplicationSMS(user, jobTitle, status) {
    const statusText = status === 'approved' ? 'APPROVED' : 'UPDATED';
    const message = `Hello ${user.firstName}, your application for "${jobTitle}" has been ${statusText}. Please check your account for more details.`;
    
    return await this.sendSMS(user.contactNumber, message);
  }

  /**
   * Send solicitation request status SMS
   * @param {Object} user - User object
   * @param {string} status - Request status
   * @returns {Promise<Object>} - SMS result
   */
  async sendSolicitationStatusSMS(user, status) {
    const message = `Hello ${user.firstName}, your solicitation request has been ${status}. Please visit our office for more details or check your account.`;
    
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
    const message = `RICE DISTRIBUTION ANNOUNCEMENT: Free rice distribution for ${barangays.join(', ')} residents on ${date} at ${location}. Please bring valid ID and barangay certificate.`;
    
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
    
    return await this.sendSMS(user.contactNumber, message);
  }
}

module.exports = new SMSService();