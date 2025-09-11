// backend/src/controllers/authController.js
const User = require('../models/User');
const { createTokenResponse, verifyRefreshToken, generateToken } = require('../utils/auth');
const asyncHandler = require('../middleware/async');
const otpService = require('../services/otpService');

// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = asyncHandler(async (req, res) => {
  const { firstName, lastName, contactNumber, password, barangay } = req.body;

  try {
    // Validate required fields
    if (!firstName || !lastName || !contactNumber || !password || !barangay) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ contactNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Contact number is already registered'
      });
    }

    // Validate barangay
    const validBarangays = User.getBarangays();
    if (!validBarangays.includes(barangay.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barangay selected'
      });
    }

    // Prepare user data for OTP storage
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      contactNumber: contactNumber.trim(),
      password, // Will be hashed when user is actually created
      barangay: barangay.toLowerCase().trim()
    };

    // Send OTP
    const otpResult = await otpService.sendOTP(contactNumber, userData);

    if (!otpResult.success) {
      return res.status(500).json({
        success: false,
        message: otpResult.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        maskedNumber: otpResult.maskedNumber,
        expiresIn: 300 // 5 minutes in seconds
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// @desc    Verify OTP and register user
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { contactNumber, otp } = req.body;

  try {
    if (!contactNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Contact number and OTP are required'
      });
    }

    // Verify OTP
    const verification = otpService.verifyOTP(contactNumber, otp);

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.error
      });
    }

    // Create user with verified data
    const user = await User.create({
      firstName: verification.userData.firstName,
      lastName: verification.userData.lastName,
      contactNumber: verification.userData.contactNumber,
      password: verification.userData.password,
      barangay: verification.userData.barangay,
      isVerified: true // Mark as verified since they completed OTP
    });

    // Clean up OTP data
    otpService.cleanupOTP(contactNumber);

    // Send welcome SMS (optional, since we're testing)
    // await smsService.sendWelcomeSMS(user);

    // Send token response
    createTokenResponse(user, 201, res, 'Registration completed successfully');
    
    // Log registration
    console.log(`New user registered with OTP verification: ${user.contactNumber} - ${user.fullName}`);
    
  } catch (error) {
    console.error('OTP verification error:', error);
    
    // Handle duplicate key error (in case of race condition)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Contact number is already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = asyncHandler(async (req, res) => {
  const { contactNumber } = req.body;

  try {
    if (!contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Contact number is required'
      });
    }

    const result = await otpService.resendOTP(contactNumber);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        maskedNumber: result.maskedNumber,
        expiresIn: 300 // 5 minutes in seconds
      }
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
});

// @desc    Register user (OLD - keep for fallback)
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, contactNumber, password, barangay } = req.body;

  try {
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      contactNumber,
      password,
      barangay: barangay.toLowerCase()
    });

    // Send token response
    createTokenResponse(user, 201, res, 'Registration successful');
    
    // Log registration
    console.log(`New user registered: ${user.contactNumber} - ${user.fullName}`);
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Contact number is already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { contactNumber, password } = req.body;

  try {
    // Find user and include password for comparison
    const user = await User.findOne({ contactNumber }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Send token response
    createTokenResponse(user, 200, res, 'Login successful');
    
    // Log login
    console.log(`User logged in: ${user.contactNumber} - ${user.fullName}`);
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  // Clear cookies
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });
  
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, barangay, profile } = req.body;

  try {
    const fieldsToUpdate = {};
    
    if (firstName) fieldsToUpdate.firstName = firstName;
    if (lastName) fieldsToUpdate.lastName = lastName;
    if (barangay) fieldsToUpdate.barangay = barangay.toLowerCase();
    if (profile) {
      if (profile.bio) fieldsToUpdate['profile.bio'] = profile.bio;
      if (profile.address) fieldsToUpdate['profile.address'] = profile.address;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Profile update failed'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed'
    });
  }
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        contactNumber: user.contactNumber,
        barangay: user.barangay,
        role: user.role,
        isVerified: user.isVerified
      }
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
});

// @desc    Get all barangays
// @route   GET /api/auth/barangays
// @access  Public
exports.getBarangays = asyncHandler(async (req, res) => {
  const barangays = User.getBarangays();

  res.status(200).json({
    success: true,
    data: barangays,
    count: barangays.length
  });
});

// @desc    Verify user account (for future SMS verification)
// @route   POST /api/auth/verify
// @access  Private
exports.verifyAccount = asyncHandler(async (req, res) => {
  // This would be used with SMS OTP verification
  // For now, we'll just mark user as verified
  
  await User.findByIdAndUpdate(req.user.id, { isVerified: true });

  res.status(200).json({
    success: true,
    message: 'Account verified successfully'
  });
});

// @desc    Deactivate user account
// @route   DELETE /api/auth/deactivate
// @access  Private
exports.deactivateAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  // Clear cookies
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

// @desc    Send forgot password OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { contactNumber } = req.body;

  try {
    // Find user by contact number
    const user = await User.findOne({ contactNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Send OTP for password reset
    const result = await otpService.sendForgotPasswordOTP(contactNumber, user);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          maskedNumber: result.maskedNumber
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request'
    });
  }
});

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { contactNumber, otp, newPassword } = req.body;

  try {
    // Verify OTP
    const verification = otpService.verifyForgotPasswordOTP(contactNumber, otp);
    
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.error
      });
    }

    // Find user
    const user = await User.findOne({ contactNumber });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clean up OTP data
    otpService.cleanupForgotPasswordOTP(contactNumber);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

    console.log(`Password reset successful for user: ${user.contactNumber} - ${user.fullName}`);

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// @desc    Resend forgot password OTP
// @route   POST /api/auth/resend-forgot-password-otp
// @access  Public
exports.resendForgotPasswordOTP = asyncHandler(async (req, res) => {
  const { contactNumber } = req.body;

  try {
    // Find user
    const user = await User.findOne({ contactNumber });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number'
      });
    }

    // Resend OTP
    const result = await otpService.resendForgotPasswordOTP(contactNumber);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          maskedNumber: result.maskedNumber
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error('Resend forgot password OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code'
    });
  }
});