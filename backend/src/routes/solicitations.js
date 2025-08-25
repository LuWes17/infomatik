const express = require('express');
const router = express.Router();
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const {
  getApprovedSolicitations,
  createSolicitation,
  getMySolicitations,
  getAllSolicitations,
  getSolicitationById,
  updateSolicitationStatus,
  getSolicitationStatistics
} = require('../controllers/solicitationController');

// Public routes
router.get('/approved', optionalAuth, getApprovedSolicitations);

// Protected routes - User
router.post('/', protect, createSolicitation);
router.get('/my', protect, getMySolicitations);

// Admin routes
router.get('/all', protect, adminOnly, getAllSolicitations);
router.get('/statistics', protect, adminOnly, getSolicitationStatistics);
router.get('/:id', protect, adminOnly, getSolicitationById);
router.put('/:id/status', protect, adminOnly, updateSolicitationStatus);

module.exports = router;
