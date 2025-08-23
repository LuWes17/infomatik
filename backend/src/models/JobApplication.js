const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant is required']
  },
  
  jobPosting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: [true, 'Job posting is required']
  },
  
  // Application form fields as per PRD
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  
  birthday: {
    type: Date,
    required: [true, 'Birthday is required'],
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Birthday cannot be in the future'
    }
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^(09|\+639)\d{9}$/, 'Please enter a valid Philippine mobile number']
  },
  
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [300, 'Address cannot exceed 300 characters']
  },
  
  // CV upload
  cvFile: {
    type: String, // File path or URL
    required: [true, 'CV file is required']
  },
  
  // Application status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'auto-rejected'],
    default: 'pending'
  },
  
  // SMS notification status
  smsNotificationSent: {
    type: Boolean,
    default: false
  },
  
  // Admin notes
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  
  // Processing timestamps
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Auto-rejection for closed positions
  autoRejected: {
    type: Boolean,
    default: false
  },
  
  autoRejectionReason: {
    type: String,
    enum: ['position-closed', 'deadline-passed', 'positions-filled']
  }
}, {
  timestamps: true
});

// Indexes for performance
jobApplicationSchema.index({ applicant: 1, jobPosting: 1 }, { unique: true }); // Prevent duplicates
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ createdAt: -1 });
jobApplicationSchema.index({ jobPosting: 1 });
jobApplicationSchema.index({ applicant: 1 });

// Pre-save middleware to check for duplicates and auto-reject closed positions
jobApplicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Check if job posting is still open
      const JobPosting = mongoose.model('JobPosting');
      const jobPosting = await JobPosting.findById(this.jobPosting);
      
      if (!jobPosting) {
        const error = new Error('Job posting not found');
        error.status = 404;
        return next(error);
      }
      
      // Auto-reject if position is closed
      if (!jobPosting.isAcceptingApplications()) {
        this.status = 'auto-rejected';
        this.autoRejected = true;
        this.autoRejectionReason = jobPosting.status === 'closed' ? 'position-closed' : 'deadline-passed';
      }
      
      // Update job posting application count
      await JobPosting.findByIdAndUpdate(
        this.jobPosting,
        { $inc: { totalApplications: 1 } }
      );
      
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Post-save middleware to update job posting stats
jobApplicationSchema.post('save', async function() {
  if (this.status === 'accepted') {
    await mongoose.model('JobPosting').findByIdAndUpdate(
      this.jobPosting,
      { $inc: { approvedApplications: 1 } }
    );
  }
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;