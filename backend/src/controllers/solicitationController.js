const SolicitationRequest = require('../models/SolicitationRequest');
const asyncHandler = require('../middleware/async');
const smsService = require('../services/smsService');

// Get approved solicitations (Public)
exports.getApprovedSolicitations = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  
  const filter = { status: 'approved', isPubliclyVisible: true };
  if (category) filter.publicCategory = category;
  
  const skip = (page - 1) * limit;
  
  const solicitations = await SolicitationRequest.find(filter)
    .populate('submittedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await SolicitationRequest.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: solicitations,
    pagination: {
      current: page * 1,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// Create solicitation (User)
exports.createSolicitation = asyncHandler(async (req, res) => {
  req.body.submittedBy = req.user.id;
  
  const solicitation = await SolicitationRequest.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Solicitation request submitted successfully',
    data: solicitation
  });
});

// Get my solicitations (User)
exports.getMySolicitations = asyncHandler(async (req, res) => {
  const solicitations = await SolicitationRequest.find({ 
    submittedBy: req.user.id 
  }).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    data: solicitations
  });
});

// Get all solicitations (Admin)
exports.getAllSolicitations = asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 10 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.requestType = type;
  
  const skip = (page - 1) * limit;
  
  const solicitations = await SolicitationRequest.find(filter)
    .populate('submittedBy', 'firstName lastName contactNumber barangay')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await SolicitationRequest.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: solicitations,
    pagination: {
      current: page * 1,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// Get solicitation by ID (Admin)
exports.getSolicitationById = asyncHandler(async (req, res) => {
  const solicitation = await SolicitationRequest.findById(req.params.id)
    .populate('submittedBy', 'firstName lastName contactNumber barangay');
    
  if (!solicitation) {
    return res.status(404).json({
      success: false,
      message: 'Solicitation not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: solicitation
  });
});

// Update solicitation status (Admin)
exports.updateSolicitationStatus = asyncHandler(async (req, res) => {
  const { status, approvedAmount, approvalConditions, adminNotes } = req.body;
  
  const solicitation = await SolicitationRequest.findById(req.params.id)
    .populate('submittedBy');
    
  if (!solicitation) {
    return res.status(404).json({
      success: false,
      message: 'Solicitation not found'
    });
  }
  
  if (status === 'approved') {
    await solicitation.approve(req.user.id, approvedAmount, approvalConditions, adminNotes);
  } else if (status === 'rejected') {
    await solicitation.reject(req.user.id, adminNotes);
  } else if (status === 'completed') {
    await solicitation.complete(req.user.id, adminNotes);
  }
  
  // Send SMS notification
  if (status === 'approved' || status === 'rejected') {
    await smsService.sendSolicitationStatusSMS(solicitation.submittedBy, status);
    solicitation.smsNotificationSent = true;
    await solicitation.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Solicitation status updated successfully',
    data: solicitation
  });
});

// Get solicitation statistics (Admin)
exports.getSolicitationStatistics = asyncHandler(async (req, res) => {
  const total = await SolicitationRequest.countDocuments();
  const pending = await SolicitationRequest.countDocuments({ status: 'pending' });
  const approved = await SolicitationRequest.countDocuments({ status: 'approved' });
  const rejected = await SolicitationRequest.countDocuments({ status: 'rejected' });
  const completed = await SolicitationRequest.countDocuments({ status: 'completed' });
  
  const byCategory = await SolicitationRequest.getRequestsByCategory();
  
  res.status(200).json({
    success: true,
    data: {
      total,
      pending,
      approved,
      rejected,
      completed,
      byCategory
    }
  });
});