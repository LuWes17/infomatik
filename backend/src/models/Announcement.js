const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  
  details: {
    type: String,
    required: [true, 'Announcement details are required'],
    trim: true,
    maxlength: [3000, 'Details cannot exceed 3000 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Update', 'Event'],
      message: 'Category must be either Update or Event'
    }
  },
  
  // Event-specific fields
  eventDate: {
    type: Date,
    validate: {
      validator: function(v) {
        // Only require eventDate for Event category
        return this.category !== 'Event' || v != null;
      },
      message: 'Event date is required for Event category'
    }
  },
  
  eventLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Event location cannot exceed 200 characters']
  },
  
  // Media support - Updated for B2
  photos: [{
    fileName: String,
    filePath: String,
    fileId: String, // B2 file ID for deletion
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Publishing status
  isPublished: {
    type: Boolean,
    default: true
  },
  
  // Admin who created the announcement
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Admin who last updated
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // View analytics
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Validation for photos limit (max 4)
announcementSchema.pre('save', function(next) {
  if (this.photos && this.photos.length > 4) {
    return next(new Error('Maximum 4 photos allowed per announcement'));
  }
  next();
});

// Indexes for performance
announcementSchema.index({ category: 1 });
announcementSchema.index({ isPublished: 1 });
announcementSchema.index({ isPinned: -1, createdAt: -1 });
announcementSchema.index({ eventDate: 1 });
announcementSchema.index({ title: 'text', details: 'text' });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;