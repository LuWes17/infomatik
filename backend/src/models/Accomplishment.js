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
  
  completionDate: {
    type: Date,
    required: [true, 'Completion date is required'],
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Completion date cannot be in the future'
    }
  },
  
  // Project details
  projectType: {
    type: String,
    enum: ['Infrastructure', 'Social Program', 'Health Initiative', 'Education', 'Environment', 'Economic Development', 'Other'],
    required: true
  },
  
  beneficiaries: {
    count: {
      type: Number,
      min: [0, 'Beneficiary count cannot be negative']
    },
    description: {
      type: String,
      maxlength: [300, 'Beneficiary description cannot exceed 300 characters']
    }
  },
  
  budget: {
    amount: {
      type: Number,
      min: [0, 'Budget amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'PHP'
    },
    source: {
      type: String,
      maxlength: [150, 'Budget source cannot exceed 150 characters']
    }
  },
  
  // Location information
  barangaysAffected: [{
    type: String,
    enum: [
      'Agnas', 'Bacolod', 'Bangkilingan', 'Bantayan', 'Baranghawon', 'Basagan', 
      'Basud', 'Bognabong', 'Bombon', 'Bonot', 'San Isidro', 'Buang', 'Buhian', 
      'Cabagnan', 'Cobo', 'Comon', 'Cormidal', 'Divino Rostro', 'Fatima', 
      'Guinobat', 'Hacienda', 'Magapo', 'Mariroc', 'Matagbac', 'Oras', 'Oson', 
      'Panal', 'Pawa', 'Pinagbobong', 'Quinale Cabasan', 'Quinastillojan', 
      'Rawis', 'Sagurong', 'Salvacion', 'San Antonio', 'San Carlos', 'San Juan', 
      'San Lorenzo', 'San Ramon', 'San Roque', 'San Vicente', 'Santo Cristo', 
      'Sua-igot', 'Tabiguian', 'Tagas', 'Tayhi', 'Visita'
    ]
  }],
  
  // Media documentation
  photos: [{
    fileName: String,
    filePath: String,
    caption: {
      type: String,
      maxlength: [200, 'Photo caption cannot exceed 200 characters']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  documents: [{
    fileName: String,
    filePath: String,
    documentType: {
      type: String,
      enum: ['Report', 'Certificate', 'Contract', 'Proposal', 'Other']
    },
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
  
  isFeatured: {
    type: Boolean,
    default: false
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

// Indexes for performance
accomplishmentSchema.index({ projectType: 1 });
accomplishmentSchema.index({ isPublished: 1 });
accomplishmentSchema.index({ isFeatured: -1, completionDate: -1 });
accomplishmentSchema.index({ barangaysAffected: 1 });
accomplishmentSchema.index({ completionDate: -1 });
accomplishmentSchema.index({ title: 'text', description: 'text' });

const Accomplishment = mongoose.model('Accomplishment', accomplishmentSchema);

module.exports = Accomplishment;