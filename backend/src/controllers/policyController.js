const LocalPolicy = require('../models/LocalPolicy');
const asyncHandler = require('../middleware/async');

exports.getAllPolicies = asyncHandler(async (req, res) => {
  const { type, category, page = 1, limit = 10 } = req.query;
  
  const filter = { isPublished: true };
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
  req.body.createdBy = req.user.id;
  
  const policy = await LocalPolicy.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Policy created successfully',
    data: policy
  });
});

exports.updatePolicy = asyncHandler(async (req, res) => {
  req.body.updatedBy = req.user.id;
  
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
