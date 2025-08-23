const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [2000, 'Job description cannot exceed 2000 characters']
  },
  
  requirements: {
    type: String,
    required: [true, 'Job requirements are required'],
    trim: true,
    maxlength: [1500, 'Job requirements cannot exceed 1500 characters']
  },
  
  positionsAvailable: {
    type: Number,
    required: [true, 'Number of positions is required'],
    min: [1, 'At least 1 position must be available'],
    max: [100, 'Cannot exceed 100 positions']
  },
  
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  
  applicationDeadline: {
    type: Date,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Application deadline must be in the future'
    }
  },
  
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'PHP'
    }
  },
  
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'temporary'],
    default: 'full-time'
  },
  
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  
  // Admin who created the job posting
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application statistics
  totalApplications: {
    type: Number,
    default: 0
  },
  
  approvedApplications: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
jobPostingSchema.index({ status: 1 });
jobPostingSchema.index({ createdAt: -1 });
jobPostingSchema.index({ applicationDeadline: 1 });
jobPostingSchema.index({ title: 'text', description: 'text', requirements: 'text' });

// Virtual for applications
jobPostingSchema.virtual('applications', {
  ref: 'JobApplication',
  localField: '_id',
  foreignField: 'jobPosting'
});

// Method to check if job is accepting applications
jobPostingSchema.methods.isAcceptingApplications = function() {
  return this.status === 'open' && 
         (!this.applicationDeadline || this.applicationDeadline > new Date());
};

const JobPosting = mongoose.model('JobPosting', jobPostingSchema);

module.exports = JobPosting;