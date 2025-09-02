// backend/src/services/otpService.js
const smsService = require('./smsService');

class OTPService {
  constructor() {
    // In-memory storage for OTPs (in production, use Redis or database)
    this.otpStore = new Map();
    this.OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
    this.MAX_ATTEMPTS = 3;
  }

  /**
   * Generate 6-digit OTP
   * @returns {string} - 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP with metadata
   * @param {string} contactNumber - User's contact number
   * @param {string} otp - Generated OTP
   * @param {Object} userData - User registration data
   */
  storeOTP(contactNumber, otp, userData) {
    const otpData = {
      otp,
      userData,
      createdAt: Date.now(),
      attempts: 0,
      verified: false
    };

    this.otpStore.set(contactNumber, otpData);

    // Auto-cleanup after expiry
    setTimeout(() => {
      this.otpStore.delete(contactNumber);
    }, this.OTP_EXPIRY_TIME);
  }

  /**
   * Send OTP via SMS (console log for testing)
   * @param {string} contactNumber - User's contact number
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Result object
   */
  async sendOTP(contactNumber, userData) {
    try {
      const otp = this.generateOTP();
      
      // Store OTP
      this.storeOTP(contactNumber, otp, userData);

      // Format phone number for display
      const formattedNumber = this.formatPhoneForDisplay(contactNumber);

      // For testing - log OTP to console instead of sending SMS
      console.log('=== OTP VERIFICATION ===');
      console.log(`OTP for ${formattedNumber}: ${otp}`);
      console.log(`Valid for 5 minutes`);
      console.log('========================');

      // In production, uncomment this line to actually send SMS:
      // await smsService.sendSMS(formattedNumber, `Your City Councilor verification code is: ${otp}. Valid for 5 minutes.`);

      return {
        success: true,
        message: 'OTP sent successfully',
        maskedNumber: this.maskPhoneNumber(formattedNumber)
      };

    } catch (error) {
      console.error('OTP sending error:', error);
      return {
        success: false,
        error: 'Failed to send OTP'
      };
    }
  }

  /**
   * Verify OTP
   * @param {string} contactNumber - User's contact number
   * @param {string} inputOTP - OTP entered by user
   * @returns {Object} - Verification result
   */
  verifyOTP(contactNumber, inputOTP) {
    const otpData = this.otpStore.get(contactNumber);

    if (!otpData) {
      return {
        success: false,
        error: 'OTP not found or expired. Please request a new one.'
      };
    }

    // Check if expired
    if (Date.now() - otpData.createdAt > this.OTP_EXPIRY_TIME) {
      this.otpStore.delete(contactNumber);
      return {
        success: false,
        error: 'OTP has expired. Please request a new one.'
      };
    }

    // Check attempts
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(contactNumber);
      return {
        success: false,
        error: 'Maximum verification attempts exceeded. Please request a new OTP.'
      };
    }

    // Increment attempts
    otpData.attempts++;

    // Verify OTP
    if (otpData.otp !== inputOTP) {
      const remainingAttempts = this.MAX_ATTEMPTS - otpData.attempts;
      return {
        success: false,
        error: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
      };
    }

    // Mark as verified
    otpData.verified = true;

    return {
      success: true,
      userData: otpData.userData,
      message: 'OTP verified successfully'
    };
  }

  /**
   * Clean up verified OTP
   * @param {string} contactNumber - User's contact number
   */
  cleanupOTP(contactNumber) {
    this.otpStore.delete(contactNumber);
  }

  /**
   * Resend OTP
   * @param {string} contactNumber - User's contact number
   * @returns {Promise<Object>} - Result object
   */
  async resendOTP(contactNumber) {
    const otpData = this.otpStore.get(contactNumber);

    if (!otpData) {
      return {
        success: false,
        error: 'No pending OTP request found'
      };
    }

    // Generate new OTP
    const newOTP = this.generateOTP();
    
    // Update stored data
    otpData.otp = newOTP;
    otpData.createdAt = Date.now();
    otpData.attempts = 0;

    // Format phone number for display
    const formattedNumber = this.formatPhoneForDisplay(contactNumber);

    // For testing - log new OTP to console
    console.log('=== OTP RESENT ===');
    console.log(`New OTP for ${formattedNumber}: ${newOTP}`);
    console.log(`Valid for 5 minutes`);
    console.log('==================');

    // In production, uncomment this line:
    // await smsService.sendSMS(contactNumber, `Your new City Councilor verification code is: ${newOTP}. Valid for 5 minutes.`);

    return {
      success: true,
      message: 'New OTP sent successfully',
      maskedNumber: this.maskPhoneNumber(formattedNumber)
    };
  }

  /**
   * Format phone number for display
   * @param {string} contactNumber - Raw contact number
   * @returns {string} - Formatted number
   */
  formatPhoneForDisplay(contactNumber) {
    // Remove all non-digits
    const cleaned = contactNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('63')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('09')) {
      return `+63${cleaned.substring(1)}`;
    } else if (cleaned.length === 10) {
      return `+639${cleaned}`;
    }
    
    return contactNumber;
  }

  /**
   * Mask phone number for security
   * @param {string} phoneNumber - Phone number to mask
   * @returns {string} - Masked phone number
   */
  maskPhoneNumber(phoneNumber) {
    if (phoneNumber.length > 8) {
      const start = phoneNumber.substring(0, 4);
      const end = phoneNumber.substring(phoneNumber.length - 4);
      const middle = '*'.repeat(phoneNumber.length - 8);
      return `${start}${middle}${end}`;
    }
    return phoneNumber;
  }

  /**
   * Get OTP status (for debugging)
   * @param {string} contactNumber - Contact number
   * @returns {Object} - OTP status
   */
  getOTPStatus(contactNumber) {
    const otpData = this.otpStore.get(contactNumber);
    
    if (!otpData) {
      return { exists: false };
    }

    return {
      exists: true,
      attempts: otpData.attempts,
      timeRemaining: Math.max(0, this.OTP_EXPIRY_TIME - (Date.now() - otpData.createdAt)),
      verified: otpData.verified
    };
  }
}

module.exports = new OTPService();