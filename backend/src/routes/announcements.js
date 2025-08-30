// backend/src/routes/announcements.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/upload');
const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');

// Public routes
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);

// Admin routes with file upload middleware
router.post('/', 
  protect, 
  adminOnly, 
  upload().array('images', 4), // Handle up to 4 images
  createAnnouncement
);

router.put('/:id', 
  protect, 
  adminOnly, 
  upload().array('images', 4), // Handle up to 4 images for updates
  updateAnnouncement
);

router.delete('/:id', protect, adminOnly, deleteAnnouncement);

module.exports = router;