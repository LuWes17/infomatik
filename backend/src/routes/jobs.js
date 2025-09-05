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

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes

// Public routes
router.get('/', optionalAuth, getAllJobPostings);

// Protected routes - User (specific routes first)
router.get('/my/applications', protect, getMyApplications);

// Application management (Admin) - specific routes
router.get('/applications/all', protect, adminOnly, getAllApplications);
router.get('/applications/:id', protect, adminOnly, getApplicationById);
router.put('/applications/:id/status', protect, adminOnly, updateApplicationStatus);
router.get('/statistics/overview', protect, adminOnly, getJobStatistics);

// Admin only routes (specific routes)
router.post('/', protect, adminOnly, createJobPosting);

// Parameterized routes MUST come last
router.get('/:id', optionalAuth, getJobPostingById);
router.put('/:id', protect, adminOnly, updateJobPosting);
router.delete('/:id', protect, adminOnly, deleteJobPosting);
router.put('/:id/toggle-status', protect, adminOnly, toggleJobStatus);

// Add multer middleware for CV file upload
router.post('/:id/apply', protect, upload().single('cvFile'), applyForJob);

module.exports = router;