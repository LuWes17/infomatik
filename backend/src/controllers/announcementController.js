// backend/src/controllers/announcementController.js
const Announcement = require('../models/Announcement');
const asyncHandler = require('../middleware/async');
const { getFileUrl, deleteFile } = require('../config/upload');

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
    
    // Validate required fields
    if (!req.body.title || !req.body.details || !req.body.category) {
      return res.status(400).json({
        success: false,
        message: 'Title, details, and category are required'
      });
    }
    
    // Validate event-specific fields
    if (req.body.category === 'Event' && !req.body.eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Event date is required for Event category'
      });
    }
    
    const announcement = await Announcement.create(req.body);
    
    // Populate the creator info for response
    await announcement.populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    
    // Delete uploaded files if announcement creation fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        deleteFile(file.path, file.public_id);
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create announcement'
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
      const existingPhotos = announcement.photos || [];
      const totalPhotos = existingPhotos.length + newPhotos.length;
      
      if (totalPhotos > 4) {
        // Delete uploaded files if they exceed limit
        req.files.forEach(file => {
          deleteFile(file.path, file.public_id);
        });
        
        return res.status(400).json({
          success: false,
          message: 'Maximum 4 photos allowed per announcement'
        });
      }
      
      req.body.photos = [...existingPhotos, ...newPhotos];
    }
    
    // Validate event-specific fields
    if (req.body.category === 'Event' && !req.body.eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Event date is required for Event category'
      });
    }
    
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedAnnouncement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    
    // Delete uploaded files if update fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        deleteFile(file.path, file.public_id);
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update announcement'
    });
  }
});

exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  
  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }
  
  // Delete associated files
  if (announcement.photos && announcement.photos.length > 0) {
    announcement.photos.forEach(photo => {
      deleteFile(photo.filePath, photo.public_id);
    });
  }
  
  await Announcement.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});
