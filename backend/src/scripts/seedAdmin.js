// backend/src/scripts/seedSampleData.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const SolicitationRequest = require('../models/SolicitationRequest');

const seedSampleData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('📝 Creating admin user...');
      admin = await User.create({
        firstName: 'System',
        lastName: 'Administrator',
        contactNumber: '09123456789',
        password: 'Admin@123',
        barangay: 'agnas',
        role: 'admin',
        isVerified: true,
        isActive: true
      });
    }

    // Create sample regular users for applications
    console.log('👥 Creating sample users...');
    
    const sampleUsers = await User.create([
      {
        firstName: 'Juan',
        lastName: 'Santos',
        contactNumber: '09171234567',
        password: 'User@123',
        barangay: 'agnas',
        role: 'citizen',
        isVerified: true,
        isActive: true
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        contactNumber: '09181234568',
        password: 'User@123',
        barangay: 'tayhi',
        role: 'citizen',
        isVerified: true,
        isActive: true
      },
      {
        firstName: 'Pedro',
        lastName: 'Reyes',
        contactNumber: '09191234569',
        password: 'User@123',
        barangay: 'agnas',
        role: 'citizen',
        isVerified: true,
        isActive: true
      },
      {
        firstName: 'Ana',
        lastName: 'Cruz',
        contactNumber: '09201234570',
        password: 'User@123',
        barangay: 'matagbac',
        role: 'citizen',
        isVerified: true,
        isActive: true
      }
    ]);

    console.log(`✅ Created ${sampleUsers.length} sample users`);

    // 1. CREATE SAMPLE SOLICITATION REQUEST
    console.log('📋 Creating sample solicitation request...');
    
    const solicitationRequest = await SolicitationRequest.create({
      submittedBy: sampleUsers[0]._id, // Juan Santos
      contactPerson: 'Juan Santos',
      organizationName: 'Barangay Agnas Youth Council',
      organizationType: 'Barangay',
      contactNumber: '09171234567',
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      address: 'Barangay Agnas Community Center, Fairview, Quezon City',
      requestType: 'Educational Supplies',
      requestedAssistanceDetails: 'School supplies for 50 elementary students including notebooks, pencils, erasers, rulers, and art materials for the upcoming school year.',
      purpose: 'To provide educational support to underprivileged students in Barangay Agnas as part of our Back-to-School Program 2025.',
      additionalDetails: 'This program aims to help students who cannot afford basic school supplies. We have identified 50 students from grades 1-6 who need assistance.',
      solicitationLetter: '/uploads/solicitation-letters/barangay-agnas-youth-council-2025.pdf',
      status: 'approved',
      reviewedBy: admin._id,
      reviewedAt: new Date(),
      approvedAmount: 25000,
      approvalConditions: 'Subject to availability of budget and submission of liquidation report within 30 days after the event.',
      adminNotes: 'Approved for educational supplies. Good initiative for the community.',
      isPubliclyVisible: true,
      publicCategory: 'Educational Supplies'
    });

    console.log('✅ Created sample solicitation request');

    // 2. CREATE SAMPLE JOB OPENING
    console.log('💼 Creating sample job opening...');
    
    const jobPosting = await JobPosting.create({
      title: 'Community Health Worker',
      description: `We are looking for a dedicated Community Health Worker to join our team in providing essential healthcare services to the residents of Fairview, Quezon City. 

The successful candidate will work closely with our local healthcare team to promote health and wellness in the community, conduct health education programs, and assist in various health initiatives.

This is an excellent opportunity for someone passionate about public health and community service to make a meaningful impact in improving the health and well-being of our constituents.`,
      requirements: `• Bachelor's degree in Nursing, Public Health, or related field
• At least 1-2 years of experience in community health or healthcare
• Valid Professional License (preferred but not required)
• Strong communication and interpersonal skills
• Ability to work with diverse community members
• Basic computer skills for record keeping
• Willingness to work flexible hours including weekends
• Physically fit to conduct home visits and outreach programs
• Resident of Fairview, Quezon City or nearby areas (preferred)`,
      positionsAvailable: 3,
      status: 'open',
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      salary: {
        min: 18000,
        max: 25000,
        currency: 'PHP'
      },
      employmentType: 'full-time',
      location: 'Fairview, Quezon City',
      createdBy: admin._id,
      totalApplications: 0,
      approvedApplications: 0
    });

    console.log('✅ Created sample job opening');

    // 3. CREATE SAMPLE JOB APPLICATIONS
    console.log('📄 Creating sample job applications...');
    
    const jobApplications = await JobApplication.create([
      {
        applicant: sampleUsers[0]._id, // Juan Santos
        jobPosting: jobPosting._id,
        fullName: 'Juan Santos',
        birthday: new Date('1995-03-15'),
        phone: '09171234567',
        address: 'Block 12 Lot 5, Barangay Agnas, Fairview, Quezon City',
        cvFile: '/uploads/cv/juan-santos-cv.pdf',
        status: 'pending'
      },
      {
        applicant: sampleUsers[1]._id, // Maria Garcia
        jobPosting: jobPosting._id,
        fullName: 'Maria Garcia',
        birthday: new Date('1992-07-22'),
        phone: '09181234568',
        address: '123 Main Street, Bagong Silang, Fairview, Quezon City',
        cvFile: '/uploads/cv/maria-garcia-cv.pdf',
        status: 'accepted',
        adminNotes: 'Excellent qualifications and experience. Perfect fit for the role.',
        reviewedAt: new Date(),
        reviewedBy: admin._id,
        smsNotificationSent: true
      },
      {
        applicant: sampleUsers[2]._id, // Pedro Reyes
        jobPosting: jobPosting._id,
        fullName: 'Pedro Reyes',
        birthday: new Date('1988-11-08'),
        phone: '09191234569',
        address: '456 Oak Avenue, Balangkas, Fairview, Quezon City',
        cvFile: '/uploads/cv/pedro-reyes-cv.pdf',
        status: 'pending'
      },
      {
        applicant: sampleUsers[3]._id, // Ana Cruz
        jobPosting: jobPosting._id,
        fullName: 'Ana Cruz',
        birthday: new Date('1990-05-12'),
        phone: '09201234570',
        address: '789 Pine Street, Bangkulasi, Fairview, Quezon City',
        cvFile: '/uploads/cv/ana-cruz-cv.pdf',
        status: 'rejected',
        adminNotes: 'Does not meet the minimum experience requirement.',
        reviewedAt: new Date(),
        reviewedBy: admin._id,
        smsNotificationSent: true
      }
    ]);

    // Update job posting statistics
    await JobPosting.findByIdAndUpdate(jobPosting._id, {
      totalApplications: jobApplications.length,
      approvedApplications: jobApplications.filter(app => app.status === 'accepted').length
    });

    console.log(`✅ Created ${jobApplications.length} sample job applications`);

    // Display summary
    console.log('\n📊 SAMPLE DATA SUMMARY:');
    console.log('='.repeat(50));
    console.log(`👤 Admin User: ${admin.fullName} (${admin.contactNumber})`);
    console.log(`👥 Sample Users: ${sampleUsers.length} created`);
    console.log(`📋 Solicitation Request: "${solicitationRequest.organizationName}" - ${solicitationRequest.status}`);
    console.log(`💼 Job Opening: "${jobPosting.title}" - ${jobPosting.status}`);
    console.log(`📄 Job Applications: ${jobApplications.length} total`);
    console.log(`   - Pending: ${jobApplications.filter(app => app.status === 'pending').length}`);
    console.log(`   - Accepted: ${jobApplications.filter(app => app.status === 'accepted').length}`);
    console.log(`   - Rejected: ${jobApplications.filter(app => app.status === 'rejected').length}`);
    console.log('='.repeat(50));
    
    console.log('\n🎯 TEST CREDENTIALS:');
    console.log('Admin Login:');
    console.log(`  Contact: ${admin.contactNumber}`);
    console.log(`  Password: Admin@123`);
    console.log('\nSample User Logins:');
    sampleUsers.forEach(user => {
      console.log(`  ${user.fullName}: ${user.contactNumber} / User@123`);
    });

    console.log('\n✅ Sample data seeding completed successfully!');
    console.log('💡 You can now test the job application and solicitation request features.');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error.message);
    
    if (error.code === 11000) {
      console.log('⚠️  Some data already exists (duplicate key error)');
      console.log('💡 Try running the script with different contact numbers or delete existing data first');
    }
    
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Alternative function to clear all sample data
const clearSampleData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing sample data...');
    
    // Delete sample data (keep admin)
    await JobApplication.deleteMany({});
    await JobPosting.deleteMany({});
    await SolicitationRequest.deleteMany({});
    
    // Delete sample users (keep admin)
    await User.deleteMany({ 
      role: 'user',
      contactNumber: { $in: ['09171234567', '09181234568', '09191234569', '09201234570'] }
    });

    console.log('✅ Sample data cleared successfully!');

  } catch (error) {
    console.error('❌ Error clearing sample data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run based on command line argument
const command = process.argv[2];

if (command === 'clear') {
  clearSampleData();
} else {
  seedSampleData();
}

/* 
USAGE INSTRUCTIONS:

1. To add sample data:
   node src/scripts/seedSampleData.js

2. To clear sample data:
   node src/scripts/seedSampleData.js clear

3. Make sure your .env file has MONGODB_URI set properly

4. The script will create:
   - 1 Admin user (if doesn't exist)
   - 4 Sample users
   - 1 Approved solicitation request
   - 1 Open job posting
   - 4 Job applications (1 accepted, 1 rejected, 2 pending)

5. All users will have the password: User@123 or Admin@123
   Change these in production!

6. File paths in the sample data point to example locations
   Make sure to create actual upload directories and files for full functionality
*/