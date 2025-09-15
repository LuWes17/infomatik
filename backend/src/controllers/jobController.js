const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const smsService = require('../services/smsService');
const { uploadToB2, deleteFromB2 } = require('../config/upload');

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

// Create job posting (Admin) - UPDATED VERSION
exports.createJobPosting = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  
  const jobPosting = await JobPosting.create(req.body);
  
  // Send notification SMS to all users about new job opening
  if (jobPosting.status === 'open') {
    try {
      const users = await User.find({ 
        isActive: true, 
        role: 'citizen' 
      });
      
      // Use the dedicated SMS service method
      await smsService.sendNewJobOpeningNotificationSMS(users, jobPosting.title);
      console.log(`Sent new job opening notification to ${users.length} users`);
    } catch (error) {
      console.error('Failed to send job opening notifications:', error);
    }
  }
  
  res.status(201).json({
    success: true,
    message: 'Job posting created successfully',
    data: jobPosting
  });
});

// Update job posting (Admin) - ENHANCED VERSION
exports.updateJobPosting = asyncHandler(async (req, res) => {
  const previousJob = await JobPosting.findById(req.params.id);
  
  if (!previousJob) {
    return res.status(404).json({
      success: false,
      message: 'Job posting not found'
    });
  }
  
  const jobPosting = await JobPosting.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
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

// Toggle job status (Admin) - FIXED VERSION
exports.toggleJobStatus = asyncHandler(async (req, res) => {
  const jobPosting = await JobPosting.findById(req.params.id);
  
  if (!jobPosting) {
    return res.status(404).json({
      success: false,
      message: 'Job posting not found'
    });
  }
  
  const previousStatus = jobPosting.status;
  jobPosting.status = jobPosting.status === 'open' ? 'closed' : 'open';
  
  await jobPosting.save();
  
  // Handle SMS notifications based on status change
  if (previousStatus === 'open' && jobPosting.status === 'closed') {
    // JOB BEING CLOSED: Notify pending applicants
    try {
      const pendingApplications = await JobApplication.find({
        jobPosting: jobPosting._id,
        status: 'pending'
      }).populate('applicant');
      
      // Send SMS notifications to pending applicants
      for (const application of pendingApplications) {
        try {
          await smsService.sendJobClosureNotificationSMS(
            application.applicant,
            jobPosting.title
          );
          
          // Mark SMS as sent
          application.smsNotificationSent = true;
          await application.save();
        } catch (smsError) {
          console.error(`Failed to send closure SMS to ${application.applicant.firstName}:`, smsError);
        }
      }
      
      console.log(`Sent job closure notifications to ${pendingApplications.length} pending applicants`);
    } catch (error) {
      console.error('Failed to send job closure notifications:', error);
    }
  } 
  else if (previousStatus === 'closed' && jobPosting.status === 'open') {
    // JOB BEING REOPENED: Notify all citizens
    try {
      const users = await User.find({ 
        isActive: true,
        role: 'citizen' 
      });
      
      // Use the dedicated SMS service method
      await smsService.sendJobReopeningNotificationSMS(users, jobPosting.title);
      console.log(`Sent job reopening notification to ${users.length} users`);
    } catch (error) {
      console.error('Failed to send job reopening notifications:', error);
    }
  }
  
  res.status(200).json({
    success: true,
    message: `Job ${jobPosting.status === 'open' ? 'opened' : 'closed'} successfully`,
    data: jobPosting
  });
});

// Apply for job with CV upload
exports.applyForJob = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    
    // Check if job exists and is active
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }
    
    // Check if user already applied
    const existingApplication = await JobApplication.findOne({
      jobPosting: jobId,
      applicant: userId
    });
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }
    
    // Handle CV file upload to B2
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CV file is required'
      });
    }
    
    console.log('Uploading CV to B2...');
    
    let cvFileInfo;
    try {
      const uploadResult = await uploadToB2(req.file, 'cvs');
      
      if (uploadResult.success) {
        cvFileInfo = {
          fileName: uploadResult.originalName,
          filePath: uploadResult.fileUrl,
          fileId: uploadResult.fileId, // Store B2 file ID for deletion
          uploadedAt: new Date()
        };
        
        console.log(`Successfully uploaded CV to B2: ${uploadResult.fileName}`);
      } else {
        throw new Error('Upload to B2 failed');
      }
    } catch (uploadError) {
      console.error('Error uploading CV to B2:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload CV to storage',
        error: uploadError.message
      });
    }
    
    // Create job application
    const applicationData = {
      jobPosting: jobId,
      applicant: userId,
      fullName: req.body.fullName,
      birthday: req.body.birthday,
      phone: req.body.phone,
      address: req.body.address,
      cvFile: cvFileInfo.filePath,
      cvFileId: cvFileInfo.fileId, // Store for deletion
      status: 'pending'
    };
    
    const application = await JobApplication.create(applicationData);

    
    res.status(201).json({
      success: true,
      message: 'Job application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit job application',
      error: error.message
    });
  }
});


// Get user's job applications
exports.getMyApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  const applications = await JobApplication.find({ applicant: req.user.id })
    .populate('jobPosting', 'title description requirements location employmentType positionsAvailable applicationDeadline status')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await JobApplication.countDocuments({ applicant: req.user.id });
  
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

// Get all job applications (Admin)
exports.getAllApplications = asyncHandler(async (req, res) => {
  const { status, jobId, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  const filter = {};
  if (status) filter.status = status;
  if (jobId) filter.jobPosting = jobId;
  
  console.log('Fetching applications with filter:', filter); // Debug log
  
  const applications = await JobApplication.find(filter)
    .populate('jobPosting', 'title company')
    .populate('applicant', 'firstName lastName contactNumber') // Make sure this includes the fields you need
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await JobApplication.countDocuments(filter);
  
  // Debug log to check what fields are being returned
  console.log('Sample application data:', applications[0] ? {
    id: applications[0]._id,
    fullName: applications[0].fullName,
    cvFile: applications[0].cvFile,
    phone: applications[0].phone,
    status: applications[0].status,
    applicant: applications[0].applicant
  } : 'No applications found');
  
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