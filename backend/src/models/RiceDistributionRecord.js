const mongoose = require('mongoose');

const BARANGAYS = [
  'Agnas', 'Bacolod', 'Bangkilingan', 'Bantayan', 'Baranghawon', 'Basagan', 
  'Basud', 'Bognabong', 'Bombon', 'Bonot', 'San Isidro', 'Buang', 'Buhian', 
  'Cabagnan', 'Cobo', 'Comon', 'Cormidal', 'Divino Rostro', 'Fatima', 
  'Guinobat', 'Hacienda', 'Magapo', 'Mariroc', 'Matagbac', 'Oras', 'Oson', 
  'Panal', 'Pawa', 'Pinagbobong', 'Quinale Cabasan', 'Quinastillojan', 
  'Rawis', 'Sagurong', 'Salvacion', 'San Antonio', 'San Carlos', 'San Juan', 
  'San Lorenzo', 'San Ramon', 'San Roque', 'San Vicente', 'Santo Cristo', 
  'Sua-igot', 'Tabiguian', 'Tagas', 'Tayhi', 'Visita'
];

const riceDistributionRecordSchema = new mongoose.Schema({
  // Distribution identification
  distributionTitle: {
    type: String,
    required: [true, 'Distribution title is required'],
    trim: true,
    maxlength: [100, 'Distribution title cannot exceed 100 characters']
  },
  
  distributionMonth: {
    type: String,
    required: [true, 'Distribution month is required'],
    match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Distribution month must be in YYYY-MM format']
  },
  
  // Selected barangays for distribution
  selectedBarangays: [{
    type: String,
    required: true,
    enum: {
      values: BARANGAYS,
      message: 'Invalid barangay selected'
    }
  }],
  
  // Distribution schedule and locations
  distributionSchedule: [{
    barangay: {
      type: String,
      required: true,
      enum: BARANGAYS
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      start: {
        type: String,
        required: true,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
      },
      end: {
        type: String,
        required: true,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
      }
    },
    location: {
      type: String,
      required: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    contactPerson: {
      name: String,
      phone: {
        type: String,
        match: [/^(09|\+639)\d{9}$/, 'Please enter a valid Philippine mobile number']
      }
    }
  }],
  
  // Distribution details
  riceDetails: {
    totalKilos: {
      type: Number,
      required: [true, 'Total kilos is required'],
      min: [1, 'Total kilos must be at least 1']
    },
    typeOfRice: {
      type: String,
      required: [true, 'Type of rice is required'],
      maxlength: [50, 'Type of rice cannot exceed 50 characters']
    },
    kilosPerFamily: {
      type: Number,
      required: [true, 'Kilos per family is required'],
      min: [1, 'Kilos per family must be at least 1']
    },
    source: {
      type: String,
      maxlength: [100, 'Rice source cannot exceed 100 characters']
    }
  },
  
  // Beneficiary information
  estimatedBeneficiaries: {
    totalFamilies: {
      type: Number,
      min: [0, 'Total families cannot be negative']
    },
    totalIndividuals: {
      type: Number,
      min: [0, 'Total individuals cannot be negative']
    }
  },
  
  // Actual distribution tracking
  actualDistribution: [{
    barangay: {
      type: String,
      enum: BARANGAYS
    },
    distributedKilos: {
      type: Number,
      min: [0, 'Distributed kilos cannot be negative']
    },
    familiesServed: {
      type: Number,
      min: [0, 'Families served cannot be negative']
    },
    distributionDate: Date,
    notes: {
      type: String,
      maxlength: [300, 'Distribution notes cannot exceed 300 characters']
    }
  }],
  
  // SMS notification tracking
  smsNotifications: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    recipientCount: {
      type: Number,
      default: 0
    },
    failedCount: {
      type: Number,
      default: 0
    }
  },
  
  // Distribution status
  status: {
    type: String,
    enum: ['planned', 'ongoing', 'completed', 'cancelled'],
    default: 'planned'
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
  
  // Completion tracking
  completedAt: Date,
  completionNotes: {
    type: String,
    maxlength: [500, 'Completion notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for performance
riceDistributionRecordSchema.index({ distributionMonth: 1 });
riceDistributionRecordSchema.index({ selectedBarangays: 1 });
riceDistributionRecordSchema.index({ status: 1 });
riceDistributionRecordSchema.index({ createdAt: -1 });
riceDistributionRecordSchema.index({ 'distributionSchedule.date': 1 });

// Validation for selected barangays
riceDistributionRecordSchema.pre('save', function(next) {
  if (this.selectedBarangays && this.selectedBarangays.length === 0) {
    return next(new Error('At least one barangay must be selected'));
  }
  next();
});

// Methods
riceDistributionRecordSchema.methods.addActualDistribution = function(barangay, distributedKilos, familiesServed, notes) {
  this.actualDistribution.push({
    barangay,
    distributedKilos,
    familiesServed,
    distributionDate: new Date(),
    notes
  });
  return this.save();
};

riceDistributionRecordSchema.methods.markCompleted = function(adminId, notes) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.completionNotes = notes;
  this.updatedBy = adminId;
  return this.save();
};

// Static methods
riceDistributionRecordSchema.statics.getCurrentDistribution = function() {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  return this.findOne({ 
    distributionMonth: currentMonth,
    status: { $in: ['planned', 'ongoing'] }
  });
};

riceDistributionRecordSchema.statics.getDistributionsByBarangay = function(barangay) {
  return this.find({ 
    selectedBarangays: barangay,
    status: { $ne: 'cancelled' }
  }).sort({ createdAt: -1 });
};

const RiceDistributionRecord = mongoose.model('RiceDistributionRecord', riceDistributionRecordSchema);

module.exports = RiceDistributionRecord;