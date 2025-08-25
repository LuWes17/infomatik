const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
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

// Admin routes
router.post('/', protect, adminOnly, createPolicy);
router.put('/:id', protect, adminOnly, updatePolicy);
router.delete('/:id', protect, adminOnly, deletePolicy);

module.exports = router;