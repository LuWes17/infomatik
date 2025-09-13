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
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  
  // Admin response system with edit tracking
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
    },
    // Edit tracking fields
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
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
  let count = 0;
  if (this.adminResponse && this.adminResponse.message) count++;
  return count;
});


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
    .sort({ createdAt: -1 });
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;