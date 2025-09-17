const express = require('express');
const router = express.Router();
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/upload'); // Import upload middleware
const {
  getPublicFeedback,
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  getFeedbackById,
  addAdminResponse,
  editAdminResponse,
  deleteAdminResponse,
  updateFeedbackStatus,
  getFeedbackStatistics
} = require('../controllers/feedbackController');

// Public routes
router.get('/public', optionalAuth, getPublicFeedback);

// Protected routes - User
// Updated create feedback route with photo upload middleware (max 4 photos)
router.post('/', protect, upload().array('photos', 4), createFeedback);
router.get('/my', protect, getMyFeedback);

// Admin routes
router.get('/all', protect, adminOnly, getAllFeedback);
router.get('/statistics', protect, adminOnly, getFeedbackStatistics);
router.get('/:id', protect, adminOnly, getFeedbackById);
router.post('/:id/respond', protect, adminOnly, addAdminResponse);
router.put('/:id/response', protect, adminOnly, editAdminResponse);
router.delete('/:id/response', protect, adminOnly, deleteAdminResponse);
router.put('/:id/status', protect, adminOnly, updateFeedbackStatus);

module.exports = router;