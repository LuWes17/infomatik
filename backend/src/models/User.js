const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the 47 barangays from PRD
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

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    unique: true,
    match: [/^(09|\+639)\d{9}$/, 'Please enter a valid Philippine mobile number']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  
  barangay: {
    type: String,
    required: [true, 'Barangay is required'],
    enum: {
      values: BARANGAYS,
      message: 'Please select a valid barangay'
    }
  },
  
  role: {
    type: String,
    enum: ['citizen', 'admin'],
    default: 'citizen'
  },
  
  // Profile information
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  
  birthday: {
    type: Date,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Birthday cannot be in the future'
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Activity tracking
  lastLogin: {
    type: Date
  },
  
  profilePicture: {
    type: String, // URL to uploaded image
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for performance optimization
userSchema.index({ contactNumber: 1 }, { unique: true });
userSchema.index({ barangay: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isVerified: 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find by contact number
userSchema.statics.findByContactNumber = function(contactNumber) {
  return this.findOne({ contactNumber }).select('+password');
};

// Static method to get barangays list
userSchema.statics.getBarangays = function() {
  return BARANGAYS;
};

const User = mongoose.model('User', userSchema);

module.exports = User;