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
  
  // Feedback categorization
  category: {
    type: String,
    required: true,
    enum: [
      'General Feedback', 'Service Complaint', 'Service Commendation', 
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
    enum: ['pending', 'acknowledged', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  
  // Admin response system
  adminResponse: {
    message: {
      type: String,
      maxlength: [1500, 'Admin response cannot exceed 1500 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  
  // Follow-up responses (for edit/delete capability as per PRD)
  followUpResponses: [{
    message: {
      type: String,
      maxlength: [1000, 'Follow-up response cannot exceed 1000 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  }],
  
  // Analytics and engagement
  views: {
    type: Number,
    default: 0
  },
  
  likes: {
    type: Number,
    default: 0
  },
  
  // User engagement tracking
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Resolution tracking
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  
}, {
  timestamps: true
});

// Indexes for performance optimization
feedbackSchema.index({ submittedBy: 1 });
feedbackSchema.index({ isPublic: 1, status: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ priority: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ subject: 'text', message: 'text' });

// Virtual for response count
feedbackSchema.virtual('responseCount').get(function() {
  let count = 0;
  if (this.adminResponse && this.adminResponse.message) count++;
  if (this.followUpResponses) count += this.followUpResponses.length;
  return count;
});

// Methods for admin response management
feedbackSchema.methods.addResponse = function(message, adminId, isPublic = true) {
  this.adminResponse = {
    message,
    respondedBy: adminId,
    respondedAt: new Date(),
    isPublic
  };
  this.status = 'acknowledged';
  return this.save();
};

feedbackSchema.methods.addFollowUpResponse = function(message, adminId) {
  this.followUpResponses.push({
    message,
    respondedBy: adminId,
    respondedAt: new Date()
  });
  return this.save();
};

feedbackSchema.methods.editFollowUpResponse = function(responseIndex, newMessage) {
  if (this.followUpResponses[responseIndex]) {
    this.followUpResponses[responseIndex].message = newMessage;
    this.followUpResponses[responseIndex].isEdited = true;
    this.followUpResponses[responseIndex].editedAt = new Date();
    return this.save();
  }
  throw new Error('Follow-up response not found');
};

feedbackSchema.methods.deleteFollowUpResponse = function(responseIndex) {
  if (this.followUpResponses[responseIndex]) {
    this.followUpResponses.splice(responseIndex, 1);
    return this.save();
  }
  throw new Error('Follow-up response not found');
};

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
    .populate('adminResponse.respondedBy', 'firstName lastName role')
    .populate('followUpResponses.respondedBy', 'firstName lastName role')
    .sort({ createdAt: -1 });
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;