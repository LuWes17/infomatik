// backend/src/controllers/accomplishmentController.js
const Accomplishment = require('../models/Accomplishment');
const asyncHandler = require('../middleware/async');
const { uploadMultipleToB2, deleteFromB2, getFileUrl } = require('../config/upload');

exports.getAllAccomplishments = asyncHandler(async (req, res) => {
  const { projectType, page = 1, limit = 10 } = req.query;
  
  const filter = { isPublished: true };
  if (projectType) filter.projectType = projectType;
  
  const skip = (page - 1) * limit;
  
  const accomplishments = await Accomplishment.find(filter)
    .populate('createdBy', 'firstName lastName')
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
    
    // Handle file uploads to B2
    const photos = [];
    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} files to B2...`);
      
      try {
        const uploadResults = await uploadMultipleToB2(req.files, 'images');
        
        uploadResults.forEach(result => {
          if (result.success) {
            photos.push({
              fileName: result.originalName,
              filePath: result.fileUrl,
              fileId: result.fileId, // Store B2 file ID for deletion
              uploadedAt: new Date()
            });
          }
        });
        
        console.log(`Successfully uploaded ${photos.length} files to B2`);
      } catch (uploadError) {
        console.error('Error uploading files to B2:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload files to storage',
          error: uploadError.message
        });
      }
    }
    
    // Add photos to the request body
    req.body.photos = photos;
    
    // Validate required fields
    if (!req.body.title || !req.body.description || !req.body.projectType) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and project type are required'
      });
    }
    
    const accomplishment = await Accomplishment.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Accomplishment created successfully',
      data: accomplishment
    });
  } catch (error) {
    console.error('Error creating accomplishment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create accomplishment',
      error: error.message
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
    
    // Store old photos for potential cleanup
    const oldPhotos = [...accomplishment.photos];
    
    // Handle new file uploads to B2
    let newPhotos = [];
    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} new files to B2...`);
      
      try {
        const uploadResults = await uploadMultipleToB2(req.files, 'images');
        
        uploadResults.forEach(result => {
          if (result.success) {
            newPhotos.push({
              fileName: result.originalName,
              filePath: result.fileUrl,
              fileId: result.fileId, // Store B2 file ID for deletion
              uploadedAt: new Date()
            });
          }
        });
        
        console.log(`Successfully uploaded ${newPhotos.length} new files to B2`);
      } catch (uploadError) {
        console.error('Error uploading new files to B2:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload new files to storage',
          error: uploadError.message
        });
      }
    }
    
    // Handle photo updates (replace existing with new ones if provided)
    if (newPhotos.length > 0) {
      req.body.photos = newPhotos;
      
      // Clean up old photos from B2 (asynchronously, don't block response)
      if (oldPhotos.length > 0) {
        setImmediate(async () => {
          for (const photo of oldPhotos) {
            if (photo.fileId) {
              try {
                await deleteFromB2(photo.fileId, photo.filePath.split('/').pop());
                console.log(`Deleted old photo from B2: ${photo.fileName}`);
              } catch (error) {
                console.error(`Failed to delete old photo from B2: ${photo.fileName}`, error);
              }
            }
          }
        });
      }
    } else {
      // Keep existing photos if no new ones uploaded
      req.body.photos = oldPhotos;
    }
    
    req.body.updatedBy = req.user.id;
    
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
    console.error('Error updating accomplishment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update accomplishment',
      error: error.message
    });
  }
});

exports.deleteAccomplishment = asyncHandler(async (req, res) => {
  try {
    const accomplishment = await Accomplishment.findById(req.params.id);
    
    if (!accomplishment) {
      return res.status(404).json({
        success: false,
        message: 'Accomplishment not found'
      });
    }
    
    // Clean up associated files from B2 (asynchronously, don't block response)
    if (accomplishment.photos && accomplishment.photos.length > 0) {
      setImmediate(async () => {
        for (const photo of accomplishment.photos) {
          if (photo.fileId) {
            try {
              await deleteFromB2(photo.fileId, photo.filePath.split('/').pop());
              console.log(`Deleted photo from B2: ${photo.fileName}`);
            } catch (error) {
              console.error(`Failed to delete photo from B2: ${photo.fileName}`, error);
            }
          }
        }
      });
    }
    
    await Accomplishment.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Accomplishment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting accomplishment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete accomplishment',
      error: error.message
    });
  }
});