const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/upload'); // Add this import
const {
  getAllPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy
} = require('../controllers/policyController');

// Public routes
router.get('/', getAllPolicies);
router.get('/:id', getPolicyById);

// Admin routes with file upload middleware
router.post('/', protect, adminOnly, upload().single('fullDocument'), createPolicy);
router.put('/:id', protect, adminOnly, upload().single('fullDocument'), updatePolicy);
router.delete('/:id', protect, adminOnly, deletePolicy);

module.exports = router;