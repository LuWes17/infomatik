const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const asyncHandler = require('../middleware/async');
const smsService = require('../services/smsService');

// Get all job postings
exports.getAllJobPostings = asyncHandler(async (req, res) => {
  const { status = 'all', page = 1, limit = 10 } = req.query;
  
  const filter = {};
  if (status !== 'all') filter.status = status;
  
  const skip = (page - 1) * limit;
  
  const jobPostings = await JobPosting.find(filter)
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await JobPosting.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: jobPostings,
    pagination: {
      current: page * 1,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// Get single job posting
exports.getJobPostingById = asyncHandler(async (req, res) => {
  const jobPosting = await JobPosting.findById(req.params.id)
    .populate('createdBy', 'firstName lastName');
    
  if (!jobPosting) {
    return res.status(404).json({
      success: false,
      message: 'Job posting not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: jobPosting
  });
});

// Create job posting (Admin)
exports.createJobPosting = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  
  const jobPosting = await JobPosting.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Job posting created successfully',
    data: jobPosting
  });
});

// Update job posting (Admin)
exports.updateJobPosting = asyncHandler(async (req, res) => {
  const jobPosting = await JobPosting.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!jobPosting) {
    return res.status(404).json({
      success: false,
      message: 'Job posting not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Job posting updated successfully',
    data: jobPosting
  });
});

// Delete job posting (Admin)
exports.deleteJobPosting = asyncHandler(async (req, res) => {
  const jobPosting = await JobPosting.findByIdAndDelete(req.params.id);
  
  if (!jobPosting) {
    return res.status(404).json({
      success: false,
      message: 'Job posting not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Job posting deleted successfully'
  });
});

// Toggle job status (Admin)
exports.toggleJobStatus = asyncHandler(async (req, res) => {
  const jobPosting = await JobPosting.findById(req.params.id);
  
  if (!jobPosting) {
    return res.status(404).json({
      success: false,
      message: 'Job posting not found'
    });
  }
  
  jobPosting.status = jobPosting.status === 'open' ? 'closed' : 'open';
  await jobPosting.save();
  
  res.status(200).json({
    success: true,
    message: `Job posting ${jobPosting.status === 'open' ? 'opened' : 'closed'} successfully`,
    data: jobPosting
  });
});

// Apply for job (User)
exports.applyForJob = asyncHandler(async (req, res) => {
  try {
    const jobPosting = await JobPosting.findById(req.params.id);
    
    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }
    
    // Check for existing application
    const existingApplication = await JobApplication.findOne({
      applicant: req.user.id,
      jobPosting: req.params.id
    });
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this position'
      });
    }
    
    // Check if CV file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CV file is required'
      });
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF, DOC, and DOCX files are allowed'
      });
    }
    
    // Prepare application data
    const applicationData = {
      applicant: req.user.id,
      jobPosting: req.params.id,
      fullName: req.body.fullName || `${req.user.firstName} ${req.user.lastName}`,
      birthday: req.body.birthday,
      phone: req.body.phone || req.user.contactNumber,
      address: req.body.address,
      cvFile: req.file.path // Store the file path
    };
    
    // Validate required fields
    const requiredFields = ['fullName', 'birthday', 'phone', 'address'];
    for (const field of requiredFields) {
      if (!applicationData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    
    // Validate birthday
    if (new Date(applicationData.birthday) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Birthday cannot be in the future'
      });
    }
    
    // Validate Philippine phone number format
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!phoneRegex.test(applicationData.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Philippine mobile number'
      });
    }
    
    const application = await JobApplication.create(applicationData);
    
    // Populate the created application for response
    await application.populate('jobPosting', 'title');
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
    
  } catch (error) {
    console.error('Error in applyForJob:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Handle duplicate application error (from schema index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this position'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get my applications (User)
exports.getMyApplications = asyncHandler(async (req, res) => {
  const applications = await JobApplication.find({ applicant: req.user.id })
    .populate('jobPosting', 'title status')
    .sort({ createdAt: -1 });
    
  res.status(200).json({
    success: true,
    data: applications
  });
});

// Get all applications (Admin)
exports.getAllApplications = asyncHandler(async (req, res) => {
  const { status, jobId, page = 1, limit = 10 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (jobId) filter.jobPosting = jobId;
  
  const skip = (page - 1) * limit;
  
  const applications = await JobApplication.find(filter)
    .populate('applicant', 'firstName lastName contactNumber')
    .populate('jobPosting', 'title')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await JobApplication.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: applications,
    pagination: {
      current: page * 1,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// Get application by ID (Admin)
exports.getApplicationById = asyncHandler(async (req, res) => {
  const application = await JobApplication.findById(req.params.id)
    .populate('applicant', 'firstName lastName contactNumber barangay')
    .populate('jobPosting');
    
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: application
  });
});

// Update application status (Admin)
exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  
  const application = await JobApplication.findById(req.params.id)
    .populate('applicant')
    .populate('jobPosting');
    
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }
  
  application.status = status;
  application.adminNotes = adminNotes;
  application.reviewedAt = new Date();
  application.reviewedBy = req.user.id;
  
  await application.save();
  
  // Send SMS notification
  if (status === 'accepted' || status === 'rejected') {
    await smsService.sendJobApplicationSMS(
      application.applicant,
      application.jobPosting.title,
      status
    );
    application.smsNotificationSent = true;
    await application.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Application status updated successfully',
    data: application
  });
});

// Get job statistics (Admin)
exports.getJobStatistics = asyncHandler(async (req, res) => {
  const totalPostings = await JobPosting.countDocuments();
  const openPostings = await JobPosting.countDocuments({ status: 'open' });
  const totalApplications = await JobApplication.countDocuments();
  const pendingApplications = await JobApplication.countDocuments({ status: 'pending' });
  const acceptedApplications = await JobApplication.countDocuments({ status: 'accepted' });
  
  res.status(200).json({
    success: true,
    data: {
      totalPostings,
      openPostings,
      totalApplications,
      pendingApplications,
      acceptedApplications
    }
  });
});