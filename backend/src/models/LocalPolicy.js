const mongoose = require('mongoose');

const localPolicySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Policy title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  type: {
    type: String,
    required: [true, 'Policy type is required'],
    enum: {
      values: ['ordinance', 'resolution'],
      message: 'Policy type must be either ordinance or resolution'
    }
  },
  
  // Policy identification
  policyNumber: {
    type: String,
    required: [true, 'Policy number is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Policy number cannot exceed 50 characters']
  },
  
  implementationDate: {
    type: Date,
    required: [true, 'Implementation date is required']
  },
  
  // Content and documentation
  summary: {
    type: String,
    required: [true, 'Policy summary is required'],
    trim: true,
    maxlength: [1000, 'Summary cannot exceed 1000 characters']
  },
  
  fullDocument: {
    fileName: String,
    filePath: {
      type: String,
      required: [true, 'Full document file is required']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Classification and categorization
  category: {
    type: String,
    required: true,
    enum: [
      'Public Safety', 'Health and Sanitation', 'Environment', 'Transportation',
      'Business and Commerce', 'Education', 'Social Services', 'Infrastructure',
      'Finance and Budget', 'Governance', 'Other'
    ]
  },
  
  // Admin tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Analytics
  downloads: {
    type: Number,
    default: 0
  },
  
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
localPolicySchema.index({ policyNumber: 1 }, { unique: true });
localPolicySchema.index({ type: 1 });
localPolicySchema.index({ category: 1 });
localPolicySchema.index({ status: 1 });
localPolicySchema.index({ implementationDate: -1 });
localPolicySchema.index({ barangaysAffected: 1 });
localPolicySchema.index({ tags: 1 });
localPolicySchema.index({ title: 'text', summary: 'text', tags: 'text' });

// Virtual for policy display name
localPolicySchema.virtual('displayName').get(function() {
  return `${this.type.charAt(0).toUpperCase() + this.type.slice(1)} No. ${this.policyNumber}`;
});

// Methods
localPolicySchema.methods.incrementDownload = function() {
  this.downloads += 1;
  return this.save();
};

localPolicySchema.methods.incrementView = function() {
  this.views += 1;
  return this.save();
};

const LocalPolicy = mongoose.model('LocalPolicy', localPolicySchema);

module.exports = LocalPolicy;