// backend/src/controllers/solicitationController.js
const SolicitationRequest = require('../models/SolicitationRequest');
const asyncHandler = require('../middleware/async');
const { uploadToB2, deleteFromB2 } = require('../config/upload');
const smsService = require('../services/smsService');

// Get approved solicitations (public)
exports.getApprovedSolicitations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  const solicitations = await SolicitationRequest.find({ 
    status: 'completed' 
  })
    .populate('submittedBy', 'firstName lastName barangay')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await SolicitationRequest.countDocuments({ status: 'completed' });
  
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

// Create solicitation request
exports.createSolicitation = asyncHandler(async (req, res) => {
  try {
    req.body.submittedBy = req.user.id;
    
    // Handle solicitation letter upload to B2
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Solicitation letter is required'
      });
    }
    
    console.log('Uploading solicitation letter to B2...');
    
    try {
      const uploadResult = await uploadToB2(req.file, 'solicitations');
      
      if (uploadResult.success) {
        req.body.solicitationLetter = uploadResult.fileUrl;
        req.body.solicitationLetterFileId = uploadResult.fileId; // Store for deletion
        
        console.log(`Successfully uploaded solicitation letter to B2: ${uploadResult.fileName}`);
      } else {
        throw new Error('Upload to B2 failed');
      }
    } catch (uploadError) {
      console.error('Error uploading solicitation letter to B2:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload solicitation letter to storage',
        error: uploadError.message
      });
    }
    
    const solicitation = await SolicitationRequest.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Solicitation request submitted successfully',
      data: solicitation
    });
  } catch (error) {
    console.error('Error creating solicitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create solicitation request',
      error: error.message
    });
  }
});

// Get user's own solicitations
exports.getMySolicitations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  const solicitations = await SolicitationRequest.find({ 
    submittedBy: req.user.id 
  })
    .populate('reviewedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip(skip);
    
  const total = await SolicitationRequest.countDocuments({ 
    submittedBy: req.user.id 
  });
  
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

// Get all solicitations (Admin)
exports.getAllSolicitations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  const filter = {};
  if (status) filter.status = status;
  
  const solicitations = await SolicitationRequest.find(filter)
    .populate('submittedBy', 'firstName lastName barangay contactNumber')
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
    .populate('submittedBy', 'firstName lastName barangay contactNumber')
    .populate('reviewedBy', 'firstName lastName');
    
  if (!solicitation) {
    return res.status(404).json({
      success: false,
      message: 'Solicitation request not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: solicitation
  });
});

exports.updateSolicitationStatus = asyncHandler(async (req, res) => {
  try {
    const { status, adminNotes, approvedAmount, approvalConditions } = req.body;
    
    const solicitation = await SolicitationRequest.findById(req.params.id)
      .populate('submittedBy', 'firstName lastName barangay contactNumber'); // ADD .populate() to get user details
    
    if (!solicitation) {
      return res.status(404).json({
        success: false,
        message: 'Solicitation request not found'
      });
    }
    
    // Update solicitation
    solicitation.status = status;
    solicitation.reviewedBy = req.user.id;
    solicitation.reviewedAt = new Date();
    solicitation.adminNotes = adminNotes;
    
    if (status === 'approved' && approvedAmount) {
      solicitation.approvedAmount = approvedAmount;
      solicitation.approvalConditions = approvalConditions;
    }
    
    await solicitation.save();
    
    // 🚨 ADD THIS: Send SMS notification to the user who submitted the request
    try {
      await smsService.sendSolicitationStatusSMS(
        solicitation.submittedBy, 
        status === 'approved' ? 'APPROVED' : 'REJECTED'
      );
      
      console.log(`SMS notification sent to ${solicitation.submittedBy.contactNumber} for solicitation ${status}`);
    } catch (smsError) {
      console.error(`Failed to send SMS notification for solicitation ${status}:`, smsError);
      // Don't fail the entire operation if SMS fails
    }
    
    // Populate for response (re-populate since we saved)
    await solicitation.populate('reviewedBy', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      message: `Solicitation ${status} successfully. SMS notification sent to applicant.`,
      data: solicitation
    });
  } catch (error) {
    console.error('Error updating solicitation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update solicitation status',
      error: error.message
    });
  }
});

// Get solicitation statistics (Admin)
exports.getSolicitationStatistics = asyncHandler(async (req, res) => {
  try {
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      completedRequests,
      monthlyStats
    ] = await Promise.all([
      SolicitationRequest.countDocuments(),
      SolicitationRequest.countDocuments({ status: 'pending' }),
      SolicitationRequest.countDocuments({ status: 'approved' }),
      SolicitationRequest.countDocuments({ status: 'rejected' }),
      SolicitationRequest.countDocuments({ status: 'completed' }),
      SolicitationRequest.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: rejectedRequests,
          completed: completedRequests
        },
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error getting solicitation statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

// Delete solicitation (Admin - for cleanup)
exports.deleteSolicitation = asyncHandler(async (req, res) => {
  try {
    const solicitation = await SolicitationRequest.findById(req.params.id);
    
    if (!solicitation) {
      return res.status(404).json({
        success: false,
        message: 'Solicitation request not found'
      });
    }
    
    // Clean up associated file from B2 (asynchronously, don't block response)
    if (solicitation.solicitationLetterFileId) {
      setImmediate(async () => {
        try {
          await deleteFromB2(
            solicitation.solicitationLetterFileId, 
            solicitation.solicitationLetter.split('/').pop()
          );
          console.log(`Deleted solicitation letter from B2: ${solicitation.solicitationLetter}`);
        } catch (error) {
          console.error(`Failed to delete solicitation letter from B2`, error);
        }
      });
    }
    
    await SolicitationRequest.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Solicitation request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting solicitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete solicitation request',
      error: error.message
    });
  }
});