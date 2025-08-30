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

// Admin routes
router.post('/', protect, adminOnly, upload().array('images', 4),createAccomplishment);
router.put('/:id', protect, adminOnly, upload().array('images', 4), updateAccomplishment);
router.delete('/:id', protect, adminOnly, deleteAccomplishment);

module.exports = router;