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
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  // Affected areas
  barangaysAffected: [{
    type: String,
    enum: [
      'All', 'Agnas', 'Bacolod', 'Bangkilingan', 'Bantayan', 'Baranghawon', 'Basagan', 
      'Basud', 'Bognabong', 'Bombon', 'Bonot', 'San Isidro', 'Buang', 'Buhian', 
      'Cabagnan', 'Cobo', 'Comon', 'Cormidal', 'Divino Rostro', 'Fatima', 
      'Guinobat', 'Hacienda', 'Magapo', 'Mariroc', 'Matagbac', 'Oras', 'Oson', 
      'Panal', 'Pawa', 'Pinagbobong', 'Quinale Cabasan', 'Quinastillojan', 
      'Rawis', 'Sagurong', 'Salvacion', 'San Antonio', 'San Carlos', 'San Juan', 
      'San Lorenzo', 'San Ramon', 'San Roque', 'San Vicente', 'Santo Cristo', 
      'Sua-igot', 'Tabiguian', 'Tagas', 'Tayhi', 'Visita'
    ]
  }],
  
  // Status and validity
  status: {
    type: String,
    enum: ['active', 'amended', 'repealed', 'expired'],
    default: 'active'
  },
  
  effectiveUntil: {
    type: Date // null for indefinite
  },
  
  // Relationships
  amendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LocalPolicy'
  },
  
  repealsPolicy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LocalPolicy'
  },
  
  // Publishing and access
  isPublished: {
    type: Boolean,
    default: true
  },
  
  isPubliclyVisible: {
    type: Boolean,
    default: true
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
localPolicySchema.index({ isPublished: 1, isPubliclyVisible: 1 });
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