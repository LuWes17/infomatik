// backend/src/routes/accomplishments.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/upload');
const {
  getAllAccomplishments,
  getAccomplishmentById,
  createAccomplishment,
  updateAccomplishment,
  deleteAccomplishment,
} = require('../controllers/accomplishmentController');

// Public routes
router.get('/', getAllAccomplishments);
router.get('/:id', getAccomplishmentById);

// Admin routes - Fix: Change 'images' to 'photos' to match frontend form data
router.post('/', protect, adminOnly, upload().array('photos', 4), createAccomplishment);
router.put('/:id', protect, adminOnly, upload().array('photos', 4), updateAccomplishment);
router.delete('/:id', protect, adminOnly, deleteAccomplishment);

module.exports = router;