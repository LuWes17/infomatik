const Feedback = require('../models/Feedback');
const asyncHandler = require('../middleware/async');
const { uploadMultipleToB2, deleteFromB2 } = require('../config/upload');

// Get public feedback
exports.getPublicFeedback = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  
  const filter = { isPublic: true };
  if (category) filter.category = category;
  
  const skip = (page - 1) * limit;
  
  const feedback = await Feedback.find(filter)
    .populate('submittedBy', 'firstName lastName')
    .populate('adminResponse.respondedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await Feedback.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: feedback,
    pagination: {
      current: page * 1,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// Create feedback (User) - Updated with photo upload
exports.createFeedback = asyncHandler(async (req, res) => {
  req.body.submittedBy = req.user.id;
  
  let photos = [];
  
  // Handle photo uploads if present
  if (req.files && req.files.length > 0) {
    // Validate photo count (max 4)
    if (req.files.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 photos are allowed per feedback'
      });
    }
    
    console.log(`Uploading ${req.files.length} photos to B2...`);
    
    try {
      const uploadResults = await uploadMultipleToB2(req.files, 'feedback');
      
      uploadResults.forEach(result => {
        if (result.success) {
          photos.push({
            fileName: result.originalName,
            filePath: result.fileUrl,
            fileId: result.fileId,
            uploadedAt: new Date()
          });
        }
      });
      
      console.log(`Successfully uploaded ${photos.length} photos to B2`);
    } catch (uploadError) {
      console.error('Error uploading photos to B2:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload photos',
        error: uploadError.message
      });
    }
  }
  
  // Add photos to feedback data
  req.body.photos = photos;
  
  const feedback = await Feedback.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully',
    data: feedback
  });
});

// Get my feedback (User)
exports.getMyFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ submittedBy: req.user.id })
    .populate('adminResponse.respondedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
    
  res.status(200).json({
    success: true,
    data: feedback
  });
});

// Get all feedback (Admin)
exports.getAllFeedback = asyncHandler(async (req, res) => {
  const { status, category, priority, page = 1, limit = 10 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  
  const skip = (page - 1) * limit;
  
  const feedback = await Feedback.find(filter)
    .populate('submittedBy', 'firstName lastName contactNumber barangay')
    .populate('adminResponse.respondedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await Feedback.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: feedback,
    pagination: {
      current: page * 1,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// Get feedback by ID (Admin)
exports.getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('submittedBy', 'firstName lastName contactNumber barangay')
    .populate('adminResponse.respondedBy', 'firstName lastName');
    
  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: feedback
  });
});

// Add admin response (Admin)
exports.addAdminResponse = asyncHandler(async (req, res) => {
  const { message, isPublic } = req.body;
  
  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }
  
  await feedback.addResponse(message, req.user.id, isPublic);
  
  // Populate the response data before sending back
  await feedback.populate('submittedBy', 'firstName lastName contactNumber barangay');
  await feedback.populate('adminResponse.respondedBy', 'firstName lastName');
  
  res.status(200).json({
    success: true,
    message: 'Response added successfully',
    data: feedback
  });
});

// Edit admin response (Admin)
exports.editAdminResponse = asyncHandler(async (req, res) => {
  const { message, isPublic } = req.body;
  
  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }
  
  try {
    await feedback.editResponse(message, req.user.id, isPublic);
    
    // Populate the response data before sending back
    await feedback.populate('submittedBy', 'firstName lastName contactNumber barangay');
    await feedback.populate('adminResponse.respondedBy', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      message: 'Response updated successfully',
      data: feedback
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete admin response (Admin)
exports.deleteAdminResponse = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }
  
  await feedback.deleteResponse();
  
  // Populate the response data before sending back
  await feedback.populate('submittedBy', 'firstName lastName contactNumber barangay');
  
  res.status(200).json({
    success: true,
    message: 'Response deleted successfully',
    data: feedback
  });
});

// Update feedback status (Admin)
exports.updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { status, resolutionNotes } = req.body;
  
  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }
  
  if (status === 'resolved') {
    await feedback.resolve(req.user.id, resolutionNotes);
  } else {
    feedback.status = status;
    await feedback.save();
  }
  
  // Populate the response data before sending back
  await feedback.populate('submittedBy', 'firstName lastName contactNumber barangay');
  await feedback.populate('adminResponse.respondedBy', 'firstName lastName');
  
  res.status(200).json({
    success: true,
    message: 'Status updated successfully',
    data: feedback
  });
});

// Get feedback statistics (Admin)
exports.getFeedbackStatistics = asyncHandler(async (req, res) => {
  const stats = await Promise.all([
    Feedback.countDocuments({ status: 'pending' }),
    Feedback.countDocuments({ status: 'in-progress' }),
    Feedback.countDocuments({ status: 'resolved' }),
    Feedback.countDocuments({ isPublic: true }),
    Feedback.countDocuments({})
  ]);

  const categoryStats = await Feedback.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      pending: stats[0],
      inProgress: stats[1],
      resolved: stats[2],
      public: stats[3],
      total: stats[4],
      byCategory: categoryStats
    }
  });
});