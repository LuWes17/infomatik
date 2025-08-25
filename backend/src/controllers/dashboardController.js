const User = require('../models/User');
const JobApplication = require('../models/JobApplication');
const SolicitationRequest = require('../models/SolicitationRequest');
const Feedback = require('../models/Feedback');
const Announcement = require('../models/Announcement');
const asyncHandler = require('../middleware/async');

exports.getDashboardStatistics = asyncHandler(async (req, res) => {
  // User statistics
  const totalUsers = await User.countDocuments({ role: 'citizen' });
  const activeUsers = await User.countDocuments({ role: 'citizen', isActive: true });
  
  // Job statistics
  const totalJobApplications = await JobApplication.countDocuments();
  const pendingJobApplications = await JobApplication.countDocuments({ status: 'pending' });
  
  // Solicitation statistics
  const totalSolicitations = await SolicitationRequest.countDocuments();
  const pendingSolicitations = await SolicitationRequest.countDocuments({ status: 'pending' });
  
  // Feedback statistics
  const totalFeedback = await Feedback.countDocuments();
  const pendingFeedback = await Feedback.countDocuments({ status: 'pending' });
  
  // Recent activities
  const recentApplications = await JobApplication.find()
    .populate('applicant', 'firstName lastName')
    .populate('jobPosting', 'title')
    .sort({ createdAt: -1 })
    .limit(5);
    
  const recentSolicitations = await SolicitationRequest.find()
    .populate('submittedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);
    
  const recentFeedback = await Feedback.find()
    .populate('submittedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);
  
  res.status(200).json({
    success: true,
    data: {
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        jobApplications: {
          total: totalJobApplications,
          pending: pendingJobApplications
        },
        solicitations: {
          total: totalSolicitations,
          pending: pendingSolicitations
        },
        feedback: {
          total: totalFeedback,
          pending: pendingFeedback
        }
      },
      recentActivities: {
        applications: recentApplications,
        solicitations: recentSolicitations,
        feedback: recentFeedback
      }
    }
  });
});
