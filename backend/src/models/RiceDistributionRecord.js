const mongoose = require('mongoose');

const BARANGAYS = [
  'agnas', 'bacolod', 'bangkilingan', 'bantayan', 'baranghawon', 'basagan', 
  'basud', 'bognabong', 'bombon', 'bonot', 'san isidro', 'buang', 'buhian', 
  'cabagnan', 'cobo', 'comon', 'cormidal', 'divino Rostro', 'fatima', 
  'guinobat', 'hacienda', 'magapo', 'mariroc', 'matagbac', 'oras', 'oson', 
  'panal', 'pawa', 'pinagbobong', 'quinale cabasan', 'quinastillojan', 
  'rawis', 'sagurong', 'salvacion', 'san antonio', 'san carlos', 'san juan', 
  'san lorenzo', 'san ramon', 'san roque', 'san vicente', 'santo cristo', 
  'sua-igot', 'tabiguian', 'tagas', 'tayhi', 'visita'
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
    kilosPerFamily: {
      type: Number,
      required: [true, 'Kilos per family is required'],
      min: [1, 'Kilos per family must be at least 1']
    },
  },
  
  // Distribution status
  status: {
    type: String,
    enum: ['planned', 'completed'],
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
  completedAt: Date
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


riceDistributionRecordSchema.methods.markCompleted = function(adminId, notes) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.updatedBy = adminId;
  return this.save();
};



const RiceDistributionRecord = mongoose.model('RiceDistributionRecord', riceDistributionRecordSchema);

module.exports = RiceDistributionRecord;