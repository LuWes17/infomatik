// backend/src/scripts/seedAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      role: 'admin',
      contactNumber: process.env.DEFAULT_ADMIN_CONTACT || '09123456789'
    });

    if (existingAdmin) {
      console.log('Default admin user already exists');
      process.exit(0);
    }

    // Create default admin user
    const adminData = {
      firstName: process.env.DEFAULT_ADMIN_FIRSTNAME || 'System',
      lastName: process.env.DEFAULT_ADMIN_LASTNAME || 'Administrator',
      contactNumber: process.env.DEFAULT_ADMIN_CONTACT || '09123456789',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
      barangay: 'agnas', // First barangay in the list
      role: 'admin',
      isVerified: true,
      isActive: true
    };

    const admin = await User.create(adminData);
    
    console.log('✅ Default admin user created successfully!');
    console.log('📱 Contact Number:', adminData.contactNumber);
    console.log('🔑 Password:', adminData.password);
    console.log('⚠️  Please change the default password after first login');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('Admin with this contact number already exists');
    }
    
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeder
seedAdmin();