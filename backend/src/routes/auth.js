// backend/src/routes/auth.js
const express = require('express');
const {
  register,
  sendOTP,
  verifyOTP,
  resendOTP,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  getBarangays,
  verifyAccount,
  deactivateAccount
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register); // Keep old route for fallback
router.post('/send-otp', sendOTP); // New OTP route
router.post('/verify-otp', verifyOTP); // New OTP verification route
router.post('/resend-otp', resendOTP); // New OTP resend route
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);
router.get('/barangays', getBarangays);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/verify', protect, verifyAccount);
router.delete('/deactivate', protect, deactivateAccount);

module.exports = router;