const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePinAnnouncement
} = require('../controllers/announcementController');

// Public routes
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);

// Admin routes
router.post('/', protect, adminOnly, createAnnouncement);
router.put('/:id', protect, adminOnly, updateAnnouncement);
router.delete('/:id', protect, adminOnly, deleteAnnouncement);
router.put('/:id/toggle-pin', protect, adminOnly, togglePinAnnouncement);

module.exports = router;