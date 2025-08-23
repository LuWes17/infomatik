// backend/src/routes/auth.js
const express = require('express');
const {
  register,
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

const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateRefreshToken
} = require('../middleware/validation');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', validateRefreshToken, refreshToken);
router.get('/barangays', getBarangays);

// Protected routes
router.use(protect); // All routes after this will be protected

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/change-password', validatePasswordChange, changePassword);
router.post('/verify', verifyAccount);
router.delete('/deactivate', deactivateAccount);

module.exports = router;