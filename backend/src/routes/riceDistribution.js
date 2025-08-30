const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  createDistribution,
  getAllDistributions,
  getDistributionById,
  updateDistribution,
  sendDistributionNotifications,
  markDistributionComplete,
  deleteDistribution,
} = require('../controllers/riceDistributionController');

// Public routes
router.get('/', getAllDistributions);

// Admin routes
router.post('/', protect, adminOnly, createDistribution);
router.get('/all', protect, adminOnly, getAllDistributions);
router.get('/:id', protect, adminOnly, getDistributionById);
router.put('/:id', protect, adminOnly, updateDistribution);
router.post('/:id/send-notifications', protect, adminOnly, sendDistributionNotifications);
router.put('/:id/complete', protect, adminOnly, markDistributionComplete);
router.delete('/:id', protect, adminOnly, deleteDistribution);

module.exports = router;