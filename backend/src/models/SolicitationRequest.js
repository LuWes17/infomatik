const mongoose = require('mongoose');

const solicitationRequestSchema = new mongoose.Schema({
  // User who submitted the request
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitted by user is required']
  },
  
  // Organization Information
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true,
    maxlength: [100, 'Contact person name cannot exceed 100 characters']
  },
  
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [150, 'Organization name cannot exceed 150 characters']
  },
  
  organizationType: {
    type: String,
    required: [true, 'Organization type is required'],
    enum: {
      values: ['NGA', 'NGO', 'CSO', 'LGU', 'Barangay', 'SK'],
      message: 'Organization type must be one of: NGA, NGO, CSO, LGU, Barangay, SK'
    }
  },
  
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [/^(09|\+639)\d{9}$/, 'Please enter a valid Philippine mobile number']
  },
  
  // Event Details
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(v) {
        return v >= new Date();
      },
      message: 'Event date must be today or in the future'
    }
  },
  
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [300, 'Address cannot exceed 300 characters']
  },
  
  // Request Information
  requestType: {
    type: String,
    required: [true, 'Request type is required'],
    enum: {
      values: ['Medical', 'Financial', 'Construction Materials', 'Educational Supplies', 'Others'],
      message: 'Request type must be one of: Medical, Financial, Construction Materials, Educational Supplies'
    }
  },
  
  requestedAssistanceDetails: {
    type: String,
    required: [true, 'Requested assistance details are required'],
    trim: true,
    maxlength: [1000, 'Requested assistance details cannot exceed 1000 characters']
  },
  
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true,
    maxlength: [800, 'Purpose cannot exceed 800 characters']
  },
  
  additionalDetails: {
    type: String,
    trim: true,
    maxlength: [1000, 'Additional details cannot exceed 1000 characters']
  },
  
  // Document Upload - Updated for B2
  solicitationLetter: {
    type: String, // File URL
    required: [true, 'Solicitation letter is required']
  },
  
  solicitationLetterFileId: {
    type: String // B2 file ID for deletion
  },
  
  // Supporting documents (optional) - Updated for B2
  supportingDocuments: [{
    fileName: String,
    filePath: String,
    fileId: String, // B2 file ID for deletion
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Request Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  
  // Admin Processing
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  reviewedAt: Date,
  
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  
  // Approval details
  approvedAmount: {
    type: Number,
    min: [0, 'Approved amount cannot be negative']
  },
  
  approvalConditions: {
    type: String,
    maxlength: [500, 'Approval conditions cannot exceed 500 characters']
  },
  
  // SMS Notification Status
  smsNotificationSent: {
    type: Boolean,
    default: false
  },
  
  // Public visibility for approved requests
  isPubliclyVisible: {
    type: Boolean,
    default: false
  },
  
  // Categories for public viewing
  publicCategory: {
    type: String,
    enum: ['Medical', 'Financial', 'Construction Materials', 'Educational Supplies', 'Others']
  },
  
  // Completion tracking
  completedAt: Date,
  
  completionNotes: {
    type: String,
    maxlength: [500, 'Completion notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
solicitationRequestSchema.index({ submittedBy: 1 });
solicitationRequestSchema.index({ status: 1 });
solicitationRequestSchema.index({ organizationType: 1 });
solicitationRequestSchema.index({ requestType: 1 });
solicitationRequestSchema.index({ createdAt: -1 });
solicitationRequestSchema.index({ eventDate: 1 });
solicitationRequestSchema.index({ isPubliclyVisible: 1, status: 1 });
solicitationRequestSchema.index({ publicCategory: 1 });

// Text search index for public viewing
solicitationRequestSchema.index({ 
  organizationName: 'text',
  requestedAssistanceDetails: 'text',
  purpose: 'text'
});

// Pre-save middleware to set public visibility
solicitationRequestSchema.pre('save', function(next) {
  // Auto-set public visibility when approved
  if (this.status === 'approved' && !this.isPubliclyVisible) {
    this.isPubliclyVisible = true;
    this.publicCategory = this.requestType;
  }
  
  // Remove from public view if rejected
  if (this.status === 'rejected') {
    this.isPubliclyVisible = false;
  }
  
  next();
});

// Methods
solicitationRequestSchema.methods.approve = function(adminId, approvedAmount, conditions, notes) {
  this.status = 'approved';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.approvedAmount = approvedAmount;
  this.approvalConditions = conditions;
  this.adminNotes = notes;
  this.isPubliclyVisible = true;
  this.publicCategory = this.requestType;
  
  return this.save();
};

solicitationRequestSchema.methods.reject = function(adminId, notes) {
  this.status = 'rejected';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.adminNotes = notes;
  this.isPubliclyVisible = false;
  
  return this.save();
};

solicitationRequestSchema.methods.complete = function(adminId, notes) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.completionNotes = notes;
  
  return this.save();
};

// Static methods for public viewing
solicitationRequestSchema.statics.getApprovedRequests = function(category = null) {
  const query = { status: 'approved', isPubliclyVisible: true };
  if (category) {
    query.publicCategory = category;
  }
  
  return this.find(query)
    .populate('submittedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
};

solicitationRequestSchema.statics.getRequestsByCategory = function() {
  return this.aggregate([
    { $match: { status: 'approved', isPubliclyVisible: true } },
    { 
      $group: {
        _id: '$publicCategory',
        count: { $sum: 1 },
        totalAmount: { $sum: '$approvedAmount' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

const SolicitationRequest = mongoose.model('SolicitationRequest', solicitationRequestSchema);

module.exports = SolicitationRequest;