const LocalPolicy = require('../models/LocalPolicy');
const asyncHandler = require('../middleware/async');
const { getFileUrl } = require('../config/upload'); 

exports.getAllPolicies = asyncHandler(async (req, res) => {
  const { type, category, page = 1, limit = 10, admin } = req.query;
  
  // FIXED: For admin requests, don't filter by isPublished
  const filter = {};
  
  // Only apply isPublished filter for non-admin requests
  if (!admin || admin !== 'true') {
    filter.isPublished = true;
  }
  
  if (type) filter.type = type;
  if (category) filter.category = category;
  
  const skip = (page - 1) * limit;
  
  const policies = await LocalPolicy.find(filter)
    .populate('createdBy', 'firstName lastName')
    .sort({ implementationDate: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await LocalPolicy.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: policies,
    pagination: {
      current: page * 1,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

exports.getPolicyById = asyncHandler(async (req, res) => {
  const policy = await LocalPolicy.findById(req.params.id)
    .populate('createdBy', 'firstName lastName');
    
  if (!policy) {
    return res.status(404).json({
      success: false,
      message: 'Policy not found'
    });
  }
  
  await policy.incrementView();
  
  res.status(200).json({
    success: true,
    data: policy
  });
});

exports.createPolicy = asyncHandler(async (req, res) => {
  // Set the creator
  req.body.createdBy = req.user.id;
  
  // FIXED: Set isPublished to true by default for admin-created policies
  if (req.body.isPublished === undefined) {
    req.body.isPublished = true;
  }
  
  // Handle file upload
  if (req.file) {
    const fileUrl = getFileUrl(req.file, req);
    req.body.fullDocument = {
      fileName: req.file.originalname,
      filePath: fileUrl,
      uploadedAt: new Date()
    };
  }
  
  const policy = await LocalPolicy.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Policy created successfully',
    data: policy
  });
});

exports.updatePolicy = asyncHandler(async (req, res) => {
  req.body.updatedBy = req.user.id;
  
  // Handle file upload if new file provided
  if (req.file) {
    const fileUrl = getFileUrl(req.file, req);
    req.body.fullDocument = {
      fileName: req.file.originalname,
      filePath: fileUrl,
      uploadedAt: new Date()
    };
  }
  
  const policy = await LocalPolicy.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!policy) {
    return res.status(404).json({
      success: false,
      message: 'Policy not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Policy updated successfully',
    data: policy
  });
});

exports.deletePolicy = asyncHandler(async (req, res) => {
  const policy = await LocalPolicy.findByIdAndDelete(req.params.id);
  
  if (!policy) {
    return res.status(404).json({
      success: false,
      message: 'Policy not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Policy deleted successfully'
  });
});