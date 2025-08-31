const express = require('express');
const router = express.Router();
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/upload'); // Add upload middleware import
const {
  getAllJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  toggleJobStatus,
  applyForJob,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getJobStatistics
} = require('../controllers/jobController');

// Public routes
router.get('/', optionalAuth, getAllJobPostings);
router.get('/:id', optionalAuth, getJobPostingById);

// Protected routes - User
// Add multer middleware for CV file upload
router.post('/:id/apply', protect, upload().single('cvFile'), applyForJob);
router.get('/my/applications', protect, getMyApplications);

// Admin only routes
router.post('/', protect, adminOnly, createJobPosting);
router.put('/:id', protect, adminOnly, updateJobPosting);
router.delete('/:id', protect, adminOnly, deleteJobPosting);
router.put('/:id/toggle-status', protect, adminOnly, toggleJobStatus);

// Application management (Admin)
router.get('/applications/all', protect, adminOnly, getAllApplications);
router.get('/applications/:id', protect, adminOnly, getApplicationById);
router.put('/applications/:id/status', protect, adminOnly, updateApplicationStatus);
router.get('/statistics/overview', protect, adminOnly, getJobStatistics);

module.exports = router;