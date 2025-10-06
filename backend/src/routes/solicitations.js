const express = require('express');
const router = express.Router();
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/upload'); // Add this import
const {
  getApprovedSolicitations,
  createSolicitation,
  getMySolicitations,
  getAllSolicitations,
  getSolicitationById,
  updateSolicitationStatus,
  getSolicitationStatistics,
  uploadProofOfTransaction
} = require('../controllers/solicitationController');

// Public routes
router.get('/approved', optionalAuth, getApprovedSolicitations);

// Protected routes - User
router.post('/', protect, upload().single('solicitationLetter'), createSolicitation); // Add upload middleware
router.get('/my', protect, getMySolicitations);

// Admin routes
router.get('/all', protect, adminOnly, getAllSolicitations);
router.get('/statistics', protect, adminOnly, getSolicitationStatistics);
router.get('/:id', protect, adminOnly, getSolicitationById);
router.put('/:id/status', protect, adminOnly, updateSolicitationStatus);

router.post('/:id/upload-proof', protect, adminOnly, upload().single('proofImage'), uploadProofOfTransaction);

module.exports = router;