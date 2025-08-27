const Accomplishment = require('../models/Accomplishment');
const asyncHandler = require('../middleware/async');
const { getFileUrl, deleteFile } = require('../config/upload');

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
  try {

    req.body.createdBy = req.user.id;
    
    // Handle file uploads
    const photos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileUrl = getFileUrl(file, req);
        console.log('Generated file URL:', fileUrl); // Debug log
        photos.push({
          fileName: file.originalname,
          filePath: fileUrl,
          uploadedAt: new Date()
        });
      });
    }

    // Add photos to the request body
    req.body.photos = photos;
    
  
    const accomplishment = await Accomplishment.create(req.body);

    // Populate the creator info for response
    await accomplishment.populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Accomplishment created successfully',
      data: accomplishment
    });
  } catch (error) {
    console.error('Create accomplishment error:', error);
    
    // Delete uploaded files if accomplishment creation fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        deleteFile(file.path, file.public_id);
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create accomplishment'
    });
  }
});

exports.updateAccomplishment = asyncHandler(async (req, res) => {
  try {
    const accomplishment = await Accomplishment.findById(req.params.id);
    
    if (!accomplishment) {
      return res.status(404).json({
        success: false,
        message: 'Accomplishment not found'
      });
    }

    // Set the updater
    req.body.updatedBy = req.user.id;

    // Handle new file uploads
    const newPhotos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        newPhotos.push({
          fileName: file.originalname,
          filePath: getFileUrl(file, req),
          uploadedAt: new Date()
        });
      });
      
      // Combine existing photos with new photos (max 4 total)
      const existingPhotos = accomplishment.photos || [];
      const totalPhotos = existingPhotos.length + newPhotos.length;
      
      if (totalPhotos > 4) {
        // Delete uploaded files if they exceed limit
        req.files.forEach(file => {
          deleteFile(file.path, file.public_id);
        });
        
        return res.status(400).json({
          success: false,
          message: 'Maximum 4 photos allowed per accomplishment'
        });
      }
      
      req.body.photos = [...existingPhotos, ...newPhotos];
    }

    const updatedAccomplishment = await Accomplishment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Accomplishment updated successfully',
      data: updatedAccomplishment
    });
  } catch (error) {
    console.error('Update accomplishment error:', error);
    
    // Delete uploaded files if update fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        deleteFile(file.path, file.public_id);
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update accomplishment'
    });
  }
});

exports.deleteAccomplishment = asyncHandler(async (req, res) => {
  const accomplishment = await Accomplishment.findById(req.params.id);
  
  if (!accomplishment) {
    return res.status(404).json({
      success: false,
      message: 'Accomplishment not found'
    });
  }
  
  // Delete associated files
  if (accomplishment.photos && accomplishment.photos.length > 0) {
    accomplishment.photos.forEach(photo => {
      deleteFile(photo.filePath, photo.public_id);
    });
  }

  await Accomplishment.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Accomplishment deleted successfully'
  });
});

exports.toggleFeatureAccomplishment = asyncHandler(async (req, res) => {
  const accomplishment = await Accomplishment.findById(req.params.id);
  
  if (!accomplishment) {
    return res.status(404).json({
      success: false,
      message: 'Accomplishment not found'
    });
  }
  
  accomplishment.isFeatured = !accomplishment.isFeatured;
  await accomplishment.save();
  
  res.status(200).json({
    success: true,
    message: `Accomplishment ${accomplishment.isFeatured ? 'featured' : 'unfeatured'} successfully`,
    data: accomplishment
  });
});