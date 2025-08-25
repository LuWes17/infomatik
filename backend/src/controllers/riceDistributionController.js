const RiceDistributionRecord = require('../models/RiceDistributionRecord');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const smsService = require('../services/smsService');

exports.getCurrentDistribution = asyncHandler(async (req, res) => {
  const currentDistribution = await RiceDistributionRecord.getCurrentDistribution();
  
  res.status(200).json({
    success: true,
    data: currentDistribution
  });
});

exports.createDistribution = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  
  const distribution = await RiceDistributionRecord.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Rice distribution record created successfully',
    data: distribution
  });
});

exports.getAllDistributions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  
  const skip = (page - 1) * limit;
  
  const distributions = await RiceDistributionRecord.find(filter)
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await RiceDistributionRecord.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: distributions,
    pagination: {
      current: page * 1,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

exports.getDistributionById = asyncHandler(async (req, res) => {
  const distribution = await RiceDistributionRecord.findById(req.params.id)
    .populate('createdBy', 'firstName lastName');
    
  if (!distribution) {
    return res.status(404).json({
      success: false,
      message: 'Distribution record not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: distribution
  });
});

exports.updateDistribution = asyncHandler(async (req, res) => {
  req.body.updatedBy = req.user.id;
  
  const distribution = await RiceDistributionRecord.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!distribution) {
    return res.status(404).json({
      success: false,
      message: 'Distribution record not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Distribution record updated successfully',
    data: distribution
  });
});

exports.sendDistributionNotifications = asyncHandler(async (req, res) => {
  const distribution = await RiceDistributionRecord.findById(req.params.id);
  
  if (!distribution) {
    return res.status(404).json({
      success: false,
      message: 'Distribution record not found'
    });
  }
  
  // Get users from selected barangays
  const users = await User.find({
    barangay: { $in: distribution.selectedBarangays.map(b => b.toLowerCase()) },
    isActive: true
  });
  
  const distributionInfo = {
    date: distribution.distributionSchedule[0]?.date,
    location: distribution.distributionSchedule[0]?.location,
    barangays: distribution.selectedBarangays
  };
  
  const result = await smsService.sendRiceDistributionSMS(users, distributionInfo);
  
  distribution.smsNotifications.sent = true;
  distribution.smsNotifications.sentAt = new Date();
  distribution.smsNotifications.recipientCount = users.length;
  await distribution.save();
  
  res.status(200).json({
    success: true,
    message: `SMS notifications sent to ${users.length} recipients`,
    data: result
  });
});

exports.markDistributionComplete = asyncHandler(async (req, res) => {
  const { completionNotes } = req.body;
  
  const distribution = await RiceDistributionRecord.findById(req.params.id);
  
  if (!distribution) {
    return res.status(404).json({
      success: false,
      message: 'Distribution record not found'
    });
  }
  
  await distribution.markCompleted(req.user.id, completionNotes);
  
  res.status(200).json({
    success: true,
    message: 'Distribution marked as completed',
    data: distribution
  });
});