// backend/src/routes/admin.js
const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
  getUserStats,
  resetUserPassword
} = require('../controllers/adminController');

const {
  validateAdminCreate,
  handleValidationErrors
} = require('../middleware/validation');

const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// User management routes
router.route('/users')
  .get(getAllUsers)
  .post(validateAdminCreate, createUser);

router.route('/users/stats')
  .get(getUserStats);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.put('/users/:id/toggle-active', toggleUserActive);
router.put('/users/:id/reset-password', resetUserPassword);

module.exports = router;