// backend/src/controllers/announcementController.js
const Announcement = require('../models/Announcement');
const asyncHandler = require('../middleware/async');
const { uploadMultipleToB2, deleteFromB2, getFileUrl } = require('../config/upload');

exports.getAllAnnouncements = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 50 } = req.query;
  
  // For admin requests, don't filter by isPublished
  const filter = req.user && req.user.role === 'admin' ? {} : { isPublished: true };
  if (category) filter.category = category;
  
  const skip = (page - 1) * limit;
  
  const announcements = await Announcement.find(filter)
    .populate('createdBy', 'firstName lastName')
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await Announcement.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    data: announcements,
    pagination: {
      current: page * 1,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

exports.getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('createdBy', 'firstName lastName');
    
  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }
  
  // Only increment views for non-admin users
  if (!req.user || req.user.role !== 'admin') {
    announcement.views += 1;
    await announcement.save();
  }
  
  res.status(200).json({
    success: true,
    data: announcement
  });
});

exports.createAnnouncement = asyncHandler(async (req, res) => {
  try {
    // Set the creator
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
    if (!req.body.title || !req.body.details || !req.body.category) {
      return res.status(400).json({
        success: false,
        message: 'Title, details, and category are required'
      });
    }
    
    const announcement = await Announcement.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message
    });
  }
});

exports.updateAnnouncement = asyncHandler(async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    // Store old photos for deletion comparison
    const allOldPhotos = [...announcement.photos];
    let remainingExistingPhotos = [];
    
    // Parse remaining existing photos from frontend
    if (req.body.remainingExistingPhotos) {
      try {
        remainingExistingPhotos = JSON.parse(req.body.remainingExistingPhotos);
      } catch (e) {
        console.error('Error parsing remainingExistingPhotos:', e);
        remainingExistingPhotos = [];
      }
    }
    
    // Identify photos to delete (old photos not in remaining list)
    const photosToDelete = allOldPhotos.filter(oldPhoto => 
      !remainingExistingPhotos.find(remaining => remaining.fileId === oldPhoto.fileId)
    );
    
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
              fileId: result.fileId,
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
    
    // Combine remaining existing photos with new photos
    req.body.photos = [...remainingExistingPhotos, ...newPhotos];
    
    // Validate photo limit
    if (req.body.photos.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 photos allowed per announcement'
      });
    }
    
    req.body.updatedBy = req.user.id;
    
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');
    
    // Delete removed photos from B2 (asynchronously, don't block response)
    if (photosToDelete.length > 0) {
      setImmediate(async () => {
        console.log(`Deleting ${photosToDelete.length} removed photos from B2...`);
        for (const photo of photosToDelete) {
          if (photo.fileId) {
            try {
              await deleteFromB2(photo.fileId, photo.filePath.split('/').pop());
              console.log(`Deleted removed photo from B2: ${photo.fileName}`);
            } catch (error) {
              console.error(`Failed to delete removed photo from B2: ${photo.fileName}`, error);
            }
          }
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedAnnouncement
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
      error: error.message
    });
  }
});

exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    // Clean up associated files from B2 (asynchronously, don't block response)
    if (announcement.photos && announcement.photos.length > 0) {
      setImmediate(async () => {
        for (const photo of announcement.photos) {
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
    
    await Announcement.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: error.message
    });
  }
});