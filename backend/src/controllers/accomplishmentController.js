const Accomplishment = require('../models/Accomplishment');
const asyncHandler = require('../middleware/async');

exports.getAllAccomplishments = asyncHandler(async (req, res) => {
  const { projectType, page = 1, limit = 10 } = req.query;
  
  const filter = { isPublished: true };
  if (projectType) filter.projectType = projectType;
  
  const skip = (page - 1) * limit;
  
  const accomplishments = await Accomplishment.find(filter)
    .populate('createdBy', 'firstName lastName')
    .sort({ isFeatured: -1, completionDate: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await Accomplishment.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: accomplishments,
    pagination: {
      current: page * 1,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

exports.getAccomplishmentById = asyncHandler(async (req, res) => {
  const accomplishment = await Accomplishment.findById(req.params.id)
    .populate('createdBy', 'firstName lastName');
    
  if (!accomplishment) {
    return res.status(404).json({
      success: false,
      message: 'Accomplishment not found'
    });
  }
  
  accomplishment.views += 1;
  await accomplishment.save();
  
  res.status(200).json({
    success: true,
    data: accomplishment
  });
});

exports.createAccomplishment = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  
  const accomplishment = await Accomplishment.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Accomplishment created successfully',
    data: accomplishment
  });
});

exports.updateAccomplishment = asyncHandler(async (req, res) => {
  req.body.updatedBy = req.user.id;
  
  const accomplishment = await Accomplishment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!accomplishment) {
    return res.status(404).json({
      success: false,
      message: 'Accomplishment not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Accomplishment updated successfully',
    data: accomplishment
  });
});

exports.deleteAccomplishment = asyncHandler(async (req, res) => {
  const accomplishment = await Accomplishment.findByIdAndDelete(req.params.id);
  
  if (!accomplishment) {
    return res.status(404).json({
      success: false,
      message: 'Accomplishment not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Accomplishment deleted successfully'
  });
});