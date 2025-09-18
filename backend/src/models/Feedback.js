const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // User who submitted the feedback (authenticated users only)
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Feedback must be submitted by a registered user']
  },
  
  // Feedback content
  subject: {
    type: String,
    required: [true, 'Feedback subject is required'],
    trim: true,
    maxlength: [150, 'Subject cannot exceed 150 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // Photo attachments (max 4 photos)
  photos: [{
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileId: {
      type: String,
      required: true // B2 file ID for deletion
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Feedback categorization
  category: {
    type: String,
    required: true,
    enum: [
      'General Feedback', 'Service Commendation', 
      'Suggestion', 'Inquiry', 'Report Issue', 'Other'
    ]
  },
  
  // Public visibility settings
  isPublic: {
    type: Boolean,
    default: true,
    required: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  
  // Admin response system with edit tracking
  adminResponses: [{
    message: {
      type: String,
      required: true,
      maxlength: [1500, 'Admin response cannot exceed 1500 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    respondedAt: {
      type: Date,
      default: Date.now
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  
  // Resolution tracking
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  resolutionNotes: {
    type: String,
    maxlength: [500, 'Resolution notes cannot exceed 500 characters']
  }
  
}, {
  timestamps: true
});

// Indexes for performance optimization
feedbackSchema.index({ submittedBy: 1 });
feedbackSchema.index({ isPublic: 1, status: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ subject: 'text', message: 'text' });

// Virtual for response count
feedbackSchema.virtual('responseCount').get(function() {
  return this.adminResponses ? this.adminResponses.length : 0;
});

// Virtual for photo count
feedbackSchema.virtual('photoCount').get(function() {
  return this.photos ? this.photos.length : 0;
});

// Method to add admin response
feedbackSchema.methods.addResponse = function(message, adminId, isPublic = true) {
  this.adminResponses.push({
    message,
    respondedBy: adminId,
    respondedAt: new Date(),
    isPublic,
    isEdited: false
  });
  
  // Update status to in-progress when first response is added
  if (this.status === 'pending') {
    this.status = 'in-progress';
  }
  
  return this.save();
};

// Method to edit admin response
feedbackSchema.methods.editResponse = function(responseId, message, adminId, isPublic = true) {
  const response = this.adminResponses.id(responseId);
  if (!response) {
    throw new Error('Response not found');
  }
  
  response.message = message;
  response.isPublic = isPublic;
  response.isEdited = true;
  response.editedAt = new Date();
  response.editedBy = adminId;
  
  return this.save();
};

// Method to delete admin response
feedbackSchema.methods.deleteResponse = function(responseId) {
  this.adminResponses.pull(responseId);
  
  // If no responses left, update status back to pending
  if (this.adminResponses.length === 0) {
    this.status = 'pending';
  }
  
  return this.save();
};

// Method to resolve feedback
feedbackSchema.methods.resolve = function(adminId, notes) {
  this.status = 'resolved';
  this.resolvedBy = adminId;
  this.resolvedAt = new Date();
  this.resolutionNotes = notes;
  return this.save();
};

// Static methods for public viewing
feedbackSchema.statics.getPublicFeedback = function(category = null) {
  const query = { isPublic: true };
  if (category) query.category = category;
  
  return this.find(query)
    .populate('submittedBy', 'firstName lastName barangay')
    .populate('adminResponses.respondedBy', 'firstName lastName role')
    .populate('adminResponses.editedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;