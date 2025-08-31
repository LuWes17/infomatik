// backend/src/controllers/policyController.js
const LocalPolicy = require('../models/LocalPolicy');
const asyncHandler = require('../middleware/async');
const { uploadToB2, deleteFromB2, getFileUrl } = require('../config/upload');

exports.getAllPolicies = asyncHandler(async (req, res) => {
  const { type, category, page = 1, limit = 10, admin } = req.query;
  
  // For admin requests, don't filter by isPublished
  const filter = {};
  
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
  try {
    // Set the creator
    req.body.createdBy = req.user.id;
    
    // Set isPublished to true by default for admin-created policies
    if (req.body.isPublished === undefined) {
      req.body.isPublished = true;
    }
    
    // Handle file upload to B2
    if (req.file) {
      console.log('Uploading policy document to B2...');
      
      try {
        const uploadResult = await uploadToB2(req.file, 'documents');
        
        if (uploadResult.success) {
          req.body.fullDocument = {
            fileName: uploadResult.originalName,
            filePath: uploadResult.fileUrl,
            fileId: uploadResult.fileId, // Store B2 file ID for deletion
            uploadedAt: new Date()
          };
          
          console.log(`Successfully uploaded policy document to B2: ${uploadResult.fileName}`);
        } else {
          throw new Error('Upload to B2 failed');
        }
      } catch (uploadError) {
        console.error('Error uploading policy document to B2:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload document to storage',
          error: uploadError.message
        });
      }
    }
    
    const policy = await LocalPolicy.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: policy
    });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create policy',
      error: error.message
    });
  }
});

exports.updatePolicy = asyncHandler(async (req, res) => {
  try {
    const policy = await LocalPolicy.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }
    
    // Store old document for potential cleanup
    const oldDocument = policy.fullDocument;
    
    // Handle new file upload to B2
    if (req.file) {
      console.log('Uploading new policy document to B2...');
      
      try {
        const uploadResult = await uploadToB2(req.file, 'documents');
        
        if (uploadResult.success) {
          req.body.fullDocument = {
            fileName: uploadResult.originalName,
            filePath: uploadResult.fileUrl,
            fileId: uploadResult.fileId, // Store B2 file ID for deletion
            uploadedAt: new Date()
          };
          
          console.log(`Successfully uploaded new policy document to B2: ${uploadResult.fileName}`);
          
          // Clean up old document from B2 (asynchronously, don't block response)
          if (oldDocument && oldDocument.fileId) {
            setImmediate(async () => {
              try {
                await deleteFromB2(oldDocument.fileId, oldDocument.filePath.split('/').pop());
                console.log(`Deleted old policy document from B2: ${oldDocument.fileName}`);
              } catch (error) {
                console.error(`Failed to delete old policy document from B2: ${oldDocument.fileName}`, error);
              }
            });
          }
        } else {
          throw new Error('Upload to B2 failed');
        }
      } catch (uploadError) {
        console.error('Error uploading new policy document to B2:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload new document to storage',
          error: uploadError.message
        });
      }
    }
    
    req.body.updatedBy = req.user.id;
    
    const updatedPolicy = await LocalPolicy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      message: 'Policy updated successfully',
      data: updatedPolicy
    });
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update policy',
      error: error.message
    });
  }
});

exports.deletePolicy = asyncHandler(async (req, res) => {
  try {
    const policy = await LocalPolicy.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }
    
    // Clean up associated document from B2 (asynchronously, don't block response)
    if (policy.fullDocument && policy.fullDocument.fileId) {
      setImmediate(async () => {
        try {
          await deleteFromB2(policy.fullDocument.fileId, policy.fullDocument.filePath.split('/').pop());
          console.log(`Deleted policy document from B2: ${policy.fullDocument.fileName}`);
        } catch (error) {
          console.error(`Failed to delete policy document from B2: ${policy.fullDocument.fileName}`, error);
        }
      });
    }
    
    await LocalPolicy.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete policy',
      error: error.message
    });
  }
});