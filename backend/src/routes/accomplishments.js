const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllAccomplishments,
  getAccomplishmentById,
  createAccomplishment,
  updateAccomplishment,
  deleteAccomplishment
} = require('../controllers/accomplishmentController');

// Public routes
router.get('/', getAllAccomplishments);
router.get('/:id', getAccomplishmentById);

// Admin routes
router.post('/', protect, adminOnly, createAccomplishment);
router.put('/:id', protect, adminOnly, updateAccomplishment);
router.delete('/:id', protect, adminOnly, deleteAccomplishment);

module.exports = router;