const Feedback = require('../models/Feedback');
const asyncHandler = require('../middleware/async');

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

// Create feedback (User)
exports.createFeedback = asyncHandler(async (req, res) => {
  req.body.submittedBy = req.user.id;
  
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
  
  res.status(200).json({
    success: true,
    message: 'Response added successfully',
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
  
  feedback.status = status;
  if (status === 'resolved') {
    await feedback.resolve(req.user.id, resolutionNotes);
  }
  
  await feedback.save();
  
  res.status(200).json({
    success: true,
    message: 'Feedback status updated successfully',
    data: feedback
  });
});

// Get feedback statistics (Admin)
exports.getFeedbackStatistics = asyncHandler(async (req, res) => {
  const total = await Feedback.countDocuments();
  const pending = await Feedback.countDocuments({ status: 'pending' });
  const acknowledged = await Feedback.countDocuments({ status: 'acknowledged' });
  const resolved = await Feedback.countDocuments({ status: 'resolved' });
  
  const byCategory = await Feedback.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      total,
      pending,
      acknowledged,
      resolved,
      byCategory
    }
  });
});
