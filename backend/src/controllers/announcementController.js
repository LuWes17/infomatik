const Announcement = require('../models/Announcement');
const asyncHandler = require('../middleware/async');

exports.getAllAnnouncements = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  
  const filter = { isPublished: true };
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
  
  announcement.views += 1;
  await announcement.save();
  
  res.status(200).json({
    success: true,
    data: announcement
  });
});

exports.createAnnouncement = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  
  const announcement = await Announcement.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: announcement
  });
});

exports.updateAnnouncement = asyncHandler(async (req, res) => {
  req.body.updatedBy = req.user.id;
  
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    data: announcement
  });
});

exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  
  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});

exports.togglePinAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  
  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }
  
  announcement.isPinned = !announcement.isPinned;
  await announcement.save();
  
  res.status(200).json({
    success: true,
    message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'} successfully`,
    data: announcement
  });
});
