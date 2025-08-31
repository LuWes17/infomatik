const mongoose = require('mongoose');

const accomplishmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Accomplishment title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Accomplishment description is required'],
    trim: true,
    maxlength: [2500, 'Description cannot exceed 2500 characters']
  },
  
  // Project details
  projectType: {
    type: String,
    enum: ['Infrastructure', 'Social Program', 'Health Initiative', 'Education', 'Environment', 'Economic Development', 'Other'],
    required: true
  },
  
  // Media documentation
  photos: [{
    fileName: String,
    filePath: String,
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
  
  
  // Admin who created the accomplishment
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
  
  // Analytics
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Validation for photos limit (max 4)
accomplishmentSchema.pre('save', function(next) {
  if (this.photos && this.photos.length > 4) {
    return next(new Error('Maximum 4 photos allowed per accomplishment'));
  }
  next();
});


// Indexes for performance
accomplishmentSchema.index({ projectType: 1 });
accomplishmentSchema.index({ isPublished: 1 });
accomplishmentSchema.index({ barangaysAffected: 1 });
accomplishmentSchema.index({ completionDate: -1 });
accomplishmentSchema.index({ title: 'text', description: 'text' });

const Accomplishment = mongoose.model('Accomplishment', accomplishmentSchema);

module.exports = Accomplishment;