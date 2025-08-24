// backend/src/utils/auth.js
const jwt = require('jsonwebtoken');

// Generate JWT token
exports.generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
      issuer: 'city-councilor-app',
      audience: 'city-councilor-users'
    }
  );
};

// Generate refresh token (longer expiry)
exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: '7d',
      issuer: 'city-councilor-app',
      audience: 'city-councilor-users'
    }
  );
};

// Verify refresh token
exports.verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Create and send token response
exports.createTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = this.generateToken(user._id);
  const refreshToken = this.generateRefreshToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Send token in cookie and response
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })
    .json({
      success: true,
      message,
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        contactNumber: user.contactNumber,
        barangay: user.barangay,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile
      }
    });
};

// UPDATED: Simplified password validation - only requires 8 characters
exports.validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return {
      isValid: false,
      errors
    };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number validation for Philippines
exports.validatePhilippinePhone = (phone) => {
  const phoneRegex = /^(09|\+639)\d{9}$/;
  return phoneRegex.test(phone);
};

// Format phone number to standard format
exports.formatPhilippinePhone = (phone) => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('639') && cleaned.length === 12) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('09') && cleaned.length === 11) {
    return cleaned;
  } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
    return '0' + cleaned;
  }
  
  return phone; // Return original if can't format
};

// Generate OTP for verification
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash sensitive data
const crypto = require('crypto');

exports.hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Create verification token
exports.createVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};