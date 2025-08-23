// backend/src/middleware/validation.js
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// Registration validation
exports.validateRegister = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('contactNumber')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^(09|\+639)\d{9}$/)
    .withMessage('Please enter a valid Philippine mobile number (e.g., 09123456789 or +639123456789)')
    .custom(async (value) => {
      const existingUser = await User.findOne({ contactNumber: value });
      if (existingUser) {
        throw new Error('Contact number is already registered');
      }
      return true;
    }),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    
  body('barangay')
    .trim()
    .notEmpty()
    .withMessage('Barangay is required')
    .toLowerCase()
    .isIn(User.getBarangays())
    .withMessage('Please select a valid barangay'),
    
  this.handleValidationErrors
];

// Login validation
exports.validateLogin = [
  body('contactNumber')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^(09|\+639)\d{9}$/)
    .withMessage('Please enter a valid Philippine mobile number'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  this.handleValidationErrors
];

// Profile update validation
exports.validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('barangay')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(User.getBarangays())
    .withMessage('Please select a valid barangay'),
    
  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
    
  body('profile.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
    
  this.handleValidationErrors
];

// Password change validation
exports.validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
    
  this.handleValidationErrors
];

// Admin user creation validation
exports.validateAdminCreate = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
    
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
    
  body('contactNumber')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^(09|\+639)\d{9}$/)
    .withMessage('Please enter a valid Philippine mobile number')
    .custom(async (value) => {
      const existingUser = await User.findOne({ contactNumber: value });
      if (existingUser) {
        throw new Error('Contact number is already registered');
      }
      return true;
    }),
    
  body('barangay')
    .trim()
    .notEmpty()
    .withMessage('Barangay is required')
    .toLowerCase()
    .isIn(User.getBarangays())
    .withMessage('Please select a valid barangay'),
    
  body('role')
    .optional()
    .isIn(['citizen', 'admin'])
    .withMessage('Role must be either citizen or admin'),
    
  this.handleValidationErrors
];

// Refresh token validation
exports.validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
    
  this.handleValidationErrors
];