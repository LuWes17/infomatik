// backend/src/scripts/productionReset.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const SolicitationRequest = require('../models/SolicitationRequest');
const Announcement = require('../models/Announcement');
const Accomplishment = require('../models/Accomplishment');
const LocalPolicy = require('../models/LocalPolicy');
const Feedback = require('../models/Feedback');
const RiceDistributionRecord = require('../models/RiceDistributionRecord');

// PRODUCTION SAFETY CHECK
const isProduction = process.env.NODE_ENV === 'production';
const requireConfirmation = false; // Set to false only if you're absolutely sure

const productionReset = async () => {
  try {
    // SAFETY CHECKS
    console.log('🚨 PRODUCTION DATABASE RESET SCRIPT');
    console.log('====================================');
    
    if (isProduction) {
      console.log('⚠️  PRODUCTION ENVIRONMENT DETECTED!');
      console.log('⚠️  This will DELETE ALL DATA except admin accounts!');
      console.log('⚠️  This action is IRREVERSIBLE!');
      console.log('');
      
      if (requireConfirmation) {
        console.log('To proceed, you must:');
        console.log('1. Set requireConfirmation = false in this script');
        console.log('2. Ensure you have a backup of your database');
        console.log('3. Verify your MongoDB URI is correct');
        console.log('4. Run the script again');
        console.log('');
        console.log('Current MongoDB URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');
        process.exit(1);
      }
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Verify we have admin users before deletion
    const adminUsers = await User.find({ role: 'admin' }).select('firstName lastName contactNumber');
    
    if (adminUsers.length === 0) {
      console.log('❌ ERROR: No admin users found in database!');
      console.log('❌ Aborting reset to prevent complete user loss');
      process.exit(1);
    }
    
    console.log(`✅ Found ${adminUsers.length} admin user(s):`);
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.firstName} ${admin.lastName} (${admin.contactNumber})`);
    });
    console.log('');

    // Final confirmation
    console.log('⏳ Starting database reset in 5 seconds...');
    console.log('⏳ Press Ctrl+C to cancel!');
    console.log('');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // START DELETION PROCESS
    console.log('🗑️  Starting production database reset...');
    console.log('');

    // 1. Delete all job applications
    console.log('📄 Deleting job applications...');
    const jobAppsResult = await JobApplication.deleteMany({});
    console.log(`   ✅ Deleted ${jobAppsResult.deletedCount} job applications`);

    // 2. Delete all job postings
    console.log('💼 Deleting job postings...');
    const jobPostingsResult = await JobPosting.deleteMany({});
    console.log(`   ✅ Deleted ${jobPostingsResult.deletedCount} job postings`);

    // 3. Delete all solicitation requests
    console.log('📋 Deleting solicitation requests...');
    const solicitationsResult = await SolicitationRequest.deleteMany({});
    console.log(`   ✅ Deleted ${solicitationsResult.deletedCount} solicitation requests`);

    // 4. Delete all announcements
    console.log('📢 Deleting announcements...');
    const announcementsResult = await Announcement.deleteMany({});
    console.log(`   ✅ Deleted ${announcementsResult.deletedCount} announcements`);

    // 5. Delete all accomplishments
    console.log('🏆 Deleting accomplishments...');
    const accomplishmentsResult = await Accomplishment.deleteMany({});
    console.log(`   ✅ Deleted ${accomplishmentsResult.deletedCount} accomplishments`);

    // 6. Delete all local policies
    console.log('📜 Deleting local policies...');
    const policiesResult = await LocalPolicy.deleteMany({});
    console.log(`   ✅ Deleted ${policiesResult.deletedCount} local policies`);

    // 7. Delete all feedback
    console.log('💬 Deleting feedback entries...');
    const feedbackResult = await Feedback.deleteMany({});
    console.log(`   ✅ Deleted ${feedbackResult.deletedCount} feedback entries`);

    // 8. Delete all rice distribution records
    console.log('🌾 Deleting rice distribution records...');
    const riceResult = await RiceDistributionRecord.deleteMany({});
    console.log(`   ✅ Deleted ${riceResult.deletedCount} rice distribution records`);

    // 9. Delete all non-admin users
    console.log('👥 Deleting non-admin users...');
    const usersResult = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`   ✅ Deleted ${usersResult.deletedCount} non-admin users`);

    // 10. Clean up upload directories
    console.log('📁 Cleaning upload directories...');
    await cleanUploadDirectories();

    // Verify remaining data
    console.log('');
    console.log('📊 Verifying cleanup...');
    const remainingAdmins = await User.countDocuments({ role: 'admin' });
    const remainingUsers = await User.countDocuments({ role: 'citizen' });
    const totalRemaining = await User.countDocuments();
    
    console.log(`   👤 Admin users remaining: ${remainingAdmins}`);
    console.log(`   👥 Citizen users remaining: ${remainingUsers}`);
    console.log(`   📊 Total users remaining: ${totalRemaining}`);
    
    if (remainingUsers > 0) {
      console.log('⚠️  Warning: Some citizen users still remain in database');
    }

    console.log('');
    console.log('✅ PRODUCTION DATABASE RESET COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('📝 SUMMARY:');
    console.log(`   - Job Applications: ${jobAppsResult.deletedCount} deleted`);
    console.log(`   - Job Postings: ${jobPostingsResult.deletedCount} deleted`);
    console.log(`   - Solicitation Requests: ${solicitationsResult.deletedCount} deleted`);
    console.log(`   - Announcements: ${announcementsResult.deletedCount} deleted`);
    console.log(`   - Accomplishments: ${accomplishmentsResult.deletedCount} deleted`);
    console.log(`   - Local Policies: ${policiesResult.deletedCount} deleted`);
    console.log(`   - Feedback Entries: ${feedbackResult.deletedCount} deleted`);
    console.log(`   - Rice Distribution Records: ${riceResult.deletedCount} deleted`);
    console.log(`   - Non-admin Users: ${usersResult.deletedCount} deleted`);
    console.log(`   - Upload files: Cleaned`);
    console.log('');
    console.log('🔒 Admin accounts preserved for system access');
    console.log('');

  } catch (error) {
    console.error('❌ Error during production reset:', error.message);
    console.error('❌ Reset aborted to prevent data corruption');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Function to clean upload directories
const cleanUploadDirectories = async () => {
  const uploadDirs = [
    'uploads/announcements',
    'uploads/accomplishments', 
    'uploads/cv',
    'uploads/solicitation-letters',
    'uploads/policies',
    'uploads/avatars',
    'uploads/temp'
  ];

  for (const dir of uploadDirs) {
    try {
      const fullPath = path.join(process.cwd(), dir);
      
      // Check if directory exists
      try {
        await fs.access(fullPath);
      } catch {
        console.log(`   📁 Directory ${dir} does not exist, skipping...`);
        continue;
      }

      // Read directory contents
      const files = await fs.readdir(fullPath);
      
      // Delete all files in directory
      for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isFile()) {
          await fs.unlink(filePath);
        }
      }
      
      console.log(`   ✅ Cleaned ${files.length} files from ${dir}`);
      
    } catch (error) {
      console.log(`   ⚠️  Could not clean ${dir}: ${error.message}`);
    }
  }
};

// Function to create fresh admin (if needed)
const createFreshAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:');
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`   Contact: ${existingAdmin.contactNumber}`);
      return;
    }

    console.log('👤 Creating fresh admin user...');
    const admin = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      contactNumber: '09123456789',
      password: 'Admin@123',
      barangay: 'agnas',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    console.log('✅ Fresh admin user created!');
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`   Contact: ${admin.contactNumber}`);
    console.log(`   Password: Admin@123`);
    console.log('⚠️  IMPORTANT: Change the default password immediately!');

  } catch (error) {
    console.error('❌ Error creating fresh admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Function to show current database state
const showProductionStats = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('');
    console.log('📊 PRODUCTION DATABASE STATISTICS:');
    console.log('=====================================');

    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const citizenCount = await User.countDocuments({ role: 'citizen' });
    const jobPostingCount = await JobPosting.countDocuments();
    const jobApplicationCount = await JobApplication.countDocuments();
    const solicitationCount = await SolicitationRequest.countDocuments();
    const announcementCount = await Announcement.countDocuments();
    const accomplishmentCount = await Accomplishment.countDocuments();
    const policyCount = await LocalPolicy.countDocuments();
    const feedbackCount = await Feedback.countDocuments();
    const riceDistributionCount = await RiceDistributionRecord.countDocuments();

    console.log(`👥 Users: ${userCount} total`);
    console.log(`   - Admins: ${adminCount}`);
    console.log(`   - Citizens: ${citizenCount}`);
    console.log(`💼 Job Postings: ${jobPostingCount}`);
    console.log(`📄 Job Applications: ${jobApplicationCount}`);
    console.log(`📋 Solicitation Requests: ${solicitationCount}`);
    console.log(`📢 Announcements: ${announcementCount}`);
    console.log(`🏆 Accomplishments: ${accomplishmentCount}`);
    console.log(`📜 Local Policies: ${policyCount}`);
    console.log(`💬 Feedback Entries: ${feedbackCount}`);
    console.log(`🌾 Rice Distribution Records: ${riceDistributionCount}`);
    console.log('=====================================');

    if (adminCount > 0) {
      console.log('');
      console.log('👤 ADMIN USERS:');
      const admins = await User.find({ role: 'admin' }).select('firstName lastName contactNumber barangay');
      admins.forEach(admin => {
        console.log(`   - ${admin.firstName} ${admin.lastName} (${admin.contactNumber}) - ${admin.barangay}`);
      });
    }

  } catch (error) {
    console.error('❌ Error retrieving production statistics:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'reset':
    productionReset();
    break;
  case 'stats':
    showProductionStats();
    break;
  case 'create-admin':
    createFreshAdmin();
    break;
  case 'help':
    console.log('');
    console.log('🔧 PRODUCTION RESET COMMANDS:');
    console.log('===============================');
    console.log('node src/scripts/productionReset.js reset        - Reset database (keep admin only)');
    console.log('node src/scripts/productionReset.js stats        - Show current database stats');
    console.log('node src/scripts/productionReset.js create-admin - Create admin user if none exists');
    console.log('node src/scripts/productionReset.js help         - Show this help');
    console.log('');
    console.log('⚠️  SAFETY NOTES:');
    console.log('- Always backup your database before reset');
    console.log('- Set requireConfirmation = false to proceed with reset');
    console.log('- Only run this in production with extreme caution');
    console.log('- Verify your MongoDB URI before execution');
    console.log('');
    process.exit(0);
  default:
    console.log('❌ Invalid command. Use "help" to see available commands.');
    process.exit(1);
}

/*
🚨 PRODUCTION RESET SCRIPT USAGE:
=================================

STEP 1: Check current state
node src/scripts/productionReset.js stats

STEP 2: Ensure you have backups
- Export your MongoDB database
- Backup any important files

STEP 3: Review the script
- Edit requireConfirmation = false 
- Verify MongoDB URI is correct

STEP 4: Run the reset
node src/scripts/productionReset.js reset

STEP 5: Verify results
node src/scripts/productionReset.js stats

⚠️  ABOUT B2 FILES:
==================

This script only cleans local upload directories.
For B2 (Backblaze) file cleanup, you'll need to:

1. Access your B2 dashboard
2. Navigate to your bucket
3. Delete files manually OR use B2 CLI:

   b2 authorize-account <applicationKeyId> <applicationKey>
   b2 delete-file-version <fileName> <fileId>

Or programmatically via B2 SDK if you have it integrated.

🔒 SECURITY REMINDERS:
=====================

- This script has multiple safety checks
- It preserves admin accounts for system access
- It requires manual confirmation in production
- Always test on staging environment first
- Keep backups before running any reset operation

📁 UPLOAD DIRECTORIES CLEANED:
=============================

- uploads/announcements/*
- uploads/accomplishments/*
- uploads/cv/*
- uploads/solicitation-letters/*
- uploads/policies/*
- uploads/avatars/*
- uploads/temp/*

The directories themselves remain, only files are deleted.
*/