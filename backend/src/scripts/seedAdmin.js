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
const Announcement = require('../models/Announcement');
const Accomplishment = require('../models/Accomplishment');
const LocalPolicy = require('../models/LocalPolicy');
const Feedback = require('../models/Feedback');
const RiceDistributionRecord = require('../models/RiceDistributionRecord');

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
        contactNumber: '+639123456789',
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
      },
      {
        firstName: 'Roberto',
        lastName: 'Dela Cruz',
        contactNumber: '09221234571',
        password: 'User@123',
        barangay: 'fatima',
        role: 'citizen',
        isVerified: true,
        isActive: true
      },
      {
        firstName: 'Carmen',
        lastName: 'Martinez',
        contactNumber: '09231234572',
        password: 'User@123',
        barangay: 'rawis',
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

    // 4. CREATE SAMPLE ANNOUNCEMENTS
    console.log('📢 Creating sample announcements...');
    
    const announcements = await Announcement.create([
      {
        title: 'Monthly Community Meeting - September 2025',
        details: 'We invite all residents to join our monthly community meeting where we will discuss upcoming projects, budget allocations, and address community concerns. Your participation is valuable to us as we work together to improve our barangay.',
        category: 'Event',
        eventDate: new Date('2025-09-15T09:00:00.000Z'),
        eventLocation: 'Barangay Hall Conference Room',
        isPublished: true,
        isPinned: true,
        createdBy: admin._id,
        photos: [
          {
            fileName: 'community-meeting-announcement.jpg',
            filePath: '/uploads/announcements/community-meeting-sept-2025.jpg'
          }
        ]
      },
      {
        title: 'New Online Services Now Available',
        details: 'We are pleased to announce that residents can now access various barangay services online through our website. You can now apply for job openings, submit solicitation requests, and provide community feedback digitally. Visit our website to create your account and start using these convenient services.',
        category: 'Update',
        isPublished: true,
        isPinned: false,
        createdBy: admin._id
      }
    ]);

    console.log(`✅ Created ${announcements.length} sample announcements`);

    // 5. CREATE SAMPLE ACCOMPLISHMENTS
    console.log('🏆 Creating sample accomplishments...');
    
    const accomplishments = await Accomplishment.create([
      {
        title: 'Community Health Center Renovation Project',
        description: 'Successfully completed the renovation of our main community health center, improving medical facilities and patient comfort. The project included installation of new medical equipment, expansion of patient waiting areas, and improvement of overall facility infrastructure. This enhancement will serve approximately 5,000 residents across multiple barangays.',
        completionDate: new Date('2025-07-15'),
        projectType: 'Health Initiative',
        isPublished: true,
        isFeatured: true,
        createdBy: admin._id,
        photos: [
          {
            fileName: 'health-center-before.jpg',
            filePath: '/uploads/accomplishments/health-center-renovation-before.jpg'
          },
          {
            fileName: 'health-center-after.jpg',
            filePath: '/uploads/accomplishments/health-center-renovation-after.jpg'
          }
        ]
      },
      {
        title: 'Youth Skills Training Program Completion',
        description: 'Successfully concluded our 6-month skills training program for local youth, providing vocational training in computer literacy, basic entrepreneurship, and livelihood skills. A total of 75 young residents completed the program, with 45 participants now employed or running their own small businesses.',
        completionDate: new Date('2025-06-30'),
        projectType: 'Social Program',
        isPublished: true,
        isFeatured: false,
        createdBy: admin._id
      }
    ]);

    console.log(`✅ Created ${accomplishments.length} sample accomplishments`);

    // 6. CREATE SAMPLE LOCAL POLICIES
    console.log('📜 Creating sample local policies...');
    
    const localPolicies = await LocalPolicy.create([
      {
        title: 'Anti-Littering and Proper Waste Management',
        type: 'ordinance',
        policyNumber: 'ORD-2025-001',
        implementationDate: new Date('2025-01-15'),
        summary: 'This ordinance aims to promote cleanliness and proper waste management within the barangay. It establishes penalties for littering, illegal dumping, and improper waste disposal. The ordinance also outlines proper waste segregation procedures and collection schedules for residents.',
        fullDocument: {
          fileName: 'ordinance-2025-001-waste-management.pdf',
          filePath: '/uploads/policies/ordinance-2025-001-waste-management.pdf'
        },
        category: 'Environment',
        isPublished: true,
        isPubliclyVisible: true,
        createdBy: admin._id
      },
      {
        title: 'Community Curfew for Minors Resolution',
        type: 'resolution',
        policyNumber: 'RES-2025-003',
        implementationDate: new Date('2025-03-01'),
        summary: 'This resolution establishes curfew hours for minors (under 18 years old) within the barangay to ensure their safety and prevent juvenile delinquency. Curfew hours are set from 10:00 PM to 4:00 AM on weekdays and 11:00 PM to 4:00 AM on weekends, with exceptions for emergencies and accompanied minors.',
        fullDocument: {
          fileName: 'resolution-2025-003-minor-curfew.pdf',
          filePath: '/uploads/policies/resolution-2025-003-minor-curfew.pdf'
        },
        category: 'Public Safety',
        isPublished: true,
        isPubliclyVisible: true,
        createdBy: admin._id
      },
      {
        title: 'Business Permit and Licensing Procedures',
        type: 'ordinance',
        policyNumber: 'ORD-2025-002',
        implementationDate: new Date('2025-02-01'),
        summary: 'This ordinance streamlines the business permit application process within the barangay and establishes clear requirements for different types of businesses. It aims to promote local entrepreneurship while ensuring compliance with safety and health regulations.',
        fullDocument: {
          fileName: 'ordinance-2025-002-business-permits.pdf',
          filePath: '/uploads/policies/ordinance-2025-002-business-permits.pdf'
        },
        category: 'Business and Commerce',
        isPublished: true,
        isPubliclyVisible: true,
        createdBy: admin._id
      }
    ]);

    console.log(`✅ Created ${localPolicies.length} sample local policies`);

    // 7. CREATE SAMPLE FEEDBACK
    console.log('💬 Creating sample feedback...');
    
    const feedbackEntries = await Feedback.create([
      {
        submittedBy: sampleUsers[0]._id, // Juan Santos
        subject: 'Excellent Job Application Process',
        message: 'I want to commend the barangay for implementing the online job application system. The process was smooth, user-friendly, and I received timely updates via SMS. This digital transformation really helps residents like me access opportunities more easily. Keep up the great work!',
        category: 'Service Commendation',
        isPublic: true,
        status: 'acknowledged',
        adminResponse: {
          message: 'Thank you for your positive feedback, Juan! We\'re glad to hear that our online job application system is working well for our residents. Your input helps us continue improving our digital services.',
          respondedBy: admin._id,
          respondedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          isPublic: true
        }
      },
      {
        submittedBy: sampleUsers[1]._id, // Maria Garcia
        subject: 'Street Lighting Issues in Tayhi Area',
        message: 'I would like to report that several street lights along the main road in Barangay Tayhi have not been working for the past two weeks. This poses safety concerns for residents, especially those who work night shifts or students who come home late from school. Could this be prioritized for repair?',
        category: 'Report Issue',
        isPublic: true,
        status: 'in-progress',
        adminResponse: {
          message: 'Thank you for reporting this concern, Maria. We have forwarded this to our infrastructure maintenance team and they will conduct an inspection this week. We aim to have the street lights repaired within 10 working days.',
          respondedBy: admin._id,
          respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          isPublic: true
        },
        followUpResponses: [
          {
            message: 'UPDATE: Our maintenance team has completed the inspection and ordered the necessary replacement parts. Installation is scheduled for next Monday morning.',
            respondedBy: admin._id,
            respondedAt: new Date()
          }
        ]
      },
      {
        submittedBy: sampleUsers[2]._id, // Pedro Reyes
        subject: 'Suggestion for Mobile Health Services',
        message: 'Given the success of our community health center, I suggest implementing mobile health services that can visit different barangays on specific days. This would be especially helpful for elderly residents and those with mobility issues who find it difficult to travel to the main health center.',
        category: 'Suggestion',
        isPublic: true,
        status: 'pending'
      },
      {
        submittedBy: sampleUsers[3]._id, // Ana Cruz
        subject: 'Request for Additional Garbage Collection Points',
        message: 'The current garbage collection schedule works well, but we need additional collection points in the Matagbac area. Some residents have to walk quite far to reach the nearest collection point, which sometimes results in improper waste disposal. Adding 2-3 more collection points would greatly help.',
        category: 'Suggestion',
        isPublic: true,
        status: 'acknowledged',
        adminResponse: {
          message: 'Thank you for this constructive suggestion, Ana. We will review the current collection points in Matagbac and assess the feasibility of adding more locations. This will be discussed in our next budget planning meeting.',
          respondedBy: admin._id,
          respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          isPublic: true
        }
      },
      {
        submittedBy: sampleUsers[4]._id, // Roberto Dela Cruz
        subject: 'Appreciation for Rice Distribution Program',
        message: 'I want to express my gratitude for the monthly rice distribution program. As a senior citizen living alone, this assistance really helps me manage my monthly expenses. The distribution process is well-organized and the volunteers are always respectful and helpful.',
        category: 'General Feedback',
        isPublic: true,
        status: 'acknowledged',
        adminResponse: {
          message: 'Thank you for sharing your experience, Roberto. We\'re happy to know that our rice distribution program is making a positive impact. Your feedback motivates us to continue serving our community with dedication.',
          respondedBy: admin._id,
          respondedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          isPublic: true
        }
      }
    ]);

    console.log(`✅ Created ${feedbackEntries.length} sample feedback entries`);

    // 8. CREATE SAMPLE RICE DISTRIBUTION RECORDS
    console.log('🌾 Creating sample rice distribution records...');
    
    const riceDistributionRecords = await RiceDistributionRecord.create([
      {
        distributionTitle: 'August 2025 Monthly Rice Distribution',
        distributionMonth: '2025-08',
        selectedBarangays: ['agnas', 'tayhi', 'matagbac', 'fatima', 'rawis'],
        distributionSchedule: [
          {
            barangay: 'agnas',
            date: new Date('2025-08-15T08:00:00.000Z'),
            location: 'Barangay Agnas Community Center',
            contactPerson: {
              name: 'Barangay Captain Santos',
              phone: '09171111111'
            }
          },
          {
            barangay: 'tayhi',
            date: new Date('2025-08-16T08:00:00.000Z'),
            location: 'Tayhi Elementary School Covered Court',
            contactPerson: {
              name: 'Kagawad Maria Gonzalez',
              phone: '09172222222'
            }
          },
          {
            barangay: 'matagbac',
            date: new Date('2025-08-17T08:00:00.000Z'),
            location: 'Matagbac Barangay Hall',
            contactPerson: {
              name: 'SK Chairman Pedro Cruz',
              phone: '09173333333'
            }
          },
          {
            barangay: 'fatima',
            date: new Date('2025-08-18T08:00:00.000Z'),
            location: 'Our Lady of Fatima Chapel Grounds',
            contactPerson: {
              name: 'Kagawad Ana Reyes',
              phone: '09174444444'
            }
          },
          {
            barangay: 'rawis',
            date: new Date('2025-08-19T08:00:00.000Z'),
            location: 'Rawis Barangay Outpost',
            contactPerson: {
              name: 'Barangay Secretary Roberto Santos',
              phone: '09175555555'
            }
          }
        ],
        riceDetails: {
          totalKilos: 2500,
          typeOfRice: 'Premium White Rice',
          kilosPerFamily: 5,
          source: 'Department of Social Welfare and Development (DSWD)'
        },
        smsNotifications: {
          sent: true,
          sentAt: new Date('2025-08-10T10:00:00.000Z'),
          recipientCount: 847,
          failedCount: 12
        },
        status: 'completed',
        createdBy: admin._id,
        completedAt: new Date('2025-08-19T17:00:00.000Z'),
        completionNotes: 'Distribution completed successfully. Total families served: 500. Remaining rice (25 kilos) allocated to emergency assistance fund.'
      },
      {
        distributionTitle: 'September 2025 Monthly Rice Distribution',
        distributionMonth: '2025-09',
        selectedBarangays: ['bacolod', 'bangkilingan', 'bantayan', 'basagan', 'bombon'],
        distributionSchedule: [
          {
            barangay: 'bacolod',
            date: new Date('2025-09-15T08:00:00.000Z'),
            location: 'Bacolod Multi-Purpose Hall',
            contactPerson: {
              name: 'Barangay Captain Lopez',
              phone: '09176666666'
            }
          },
          {
            barangay: 'bangkilingan',
            date: new Date('2025-09-16T08:00:00.000Z'),
            location: 'Bangkilingan Basketball Court',
            contactPerson: {
              name: 'Kagawad Carmen dela Cruz',
              phone: '09177777777'
            }
          },
          {
            barangay: 'bantayan',
            date: new Date('2025-09-17T08:00:00.000Z'),
            location: 'Bantayan Day Care Center',
            contactPerson: {
              name: 'SK Chairman Jose Martinez',
              phone: '09178888888'
            }
          },
          {
            barangay: 'basagan',
            date: new Date('2025-09-18T08:00:00.000Z'),
            location: 'Basagan Covered Court',
            contactPerson: {
              name: 'Kagawad Linda Fernandez',
              phone: '09179999999'
            }
          },
          {
            barangay: 'bombon',
            date: new Date('2025-09-19T08:00:00.000Z'),
            location: 'Bombon Elementary School',
            contactPerson: {
              name: 'Barangay Secretary Miguel Santos',
              phone: '09170000000'
            }
          }
        ],
        riceDetails: {
          totalKilos: 3000,
          typeOfRice: 'Well-Milled Rice',
          kilosPerFamily: 5,
          source: 'National Food Authority (NFA)'
        },
        smsNotifications: {
          sent: true,
          sentAt: new Date('2025-09-10T14:00:00.000Z'),
          recipientCount: 934,
          failedCount: 8
        },
        status: 'ongoing',
        createdBy: admin._id
      }
    ]);

    console.log(`✅ Created ${riceDistributionRecords.length} sample rice distribution records`);

    // Display summary
    console.log('\n📊 ENHANCED SAMPLE DATA SUMMARY:');
    console.log('='.repeat(60));
    console.log(`👤 Admin User: ${admin.fullName} (${admin.contactNumber})`);
    console.log(`👥 Sample Users: ${sampleUsers.length} created`);
    console.log(`📋 Solicitation Request: "${solicitationRequest.organizationName}" - ${solicitationRequest.status}`);
    console.log(`💼 Job Opening: "${jobPosting.title}" - ${jobPosting.status}`);
    console.log(`📄 Job Applications: ${jobApplications.length} total`);
    console.log(`   - Pending: ${jobApplications.filter(app => app.status === 'pending').length}`);
    console.log(`   - Accepted: ${jobApplications.filter(app => app.status === 'accepted').length}`);
    console.log(`   - Rejected: ${jobApplications.filter(app => app.status === 'rejected').length}`);
    console.log(`📢 Announcements: ${announcements.length} total`);
    console.log(`🏆 Accomplishments: ${accomplishments.length} total`);
    console.log(`📜 Local Policies: ${localPolicies.length} total`);
    console.log(`   - Ordinances: ${localPolicies.filter(p => p.type === 'ordinance').length}`);
    console.log(`   - Resolutions: ${localPolicies.filter(p => p.type === 'resolution').length}`);
    console.log(`💬 Feedback Entries: ${feedbackEntries.length} total`);
    console.log(`   - With Admin Response: ${feedbackEntries.filter(f => f.adminResponse && f.adminResponse.message).length}`);
    console.log(`🌾 Rice Distribution Records: ${riceDistributionRecords.length} total`);
    console.log(`   - Completed: ${riceDistributionRecords.filter(r => r.status === 'completed').length}`);
    console.log(`   - Ongoing: ${riceDistributionRecords.filter(r => r.status === 'ongoing').length}`);
    console.log('='.repeat(60));
    
    console.log('\n🎯 TEST CREDENTIALS:');
    console.log('Admin Login:');
    console.log(`  Contact: ${admin.contactNumber}`);
    console.log(`  Password: Admin@123`);
    console.log('\nSample User Logins:');
    sampleUsers.forEach(user => {
      console.log(`  ${user.fullName}: ${user.contactNumber} / User@123`);
    });

    console.log('\n✅ Enhanced sample data seeding completed successfully!');
    console.log('💡 You can now test all features including:');
    console.log('   - Job applications and solicitation requests');
    console.log('   - Community feedback system');
    console.log('   - Local policies management');
    console.log('   - Rice distribution tracking');
    console.log('   - Announcements and accomplishments');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error.message);
    
    if (error.code === 11000) {
      console.log('⚠️  Some data already exists (duplicate key error)');
      console.log('💡 Try running the script with different values or clear existing data first');
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
    await Announcement.deleteMany({});
    await Accomplishment.deleteMany({});
    await LocalPolicy.deleteMany({});
    await Feedback.deleteMany({});
    await RiceDistributionRecord.deleteMany({});
    
    // Delete sample users (keep admin)
    await User.deleteMany({ 
      role: 'citizen',
      contactNumber: { 
        $in: [
          '09171234567', '09181234568', '09191234569', 
          '09201234570', '09221234571', '09231234572'
        ] 
      }
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

4. The script will create comprehensive sample data including:
   - 1 Admin user (if doesn't exist)
   - 6 Sample citizen users
   - 1 Approved solicitation request
   - 1 Open job posting with 4 applications (various statuses)
   - 2 Sample announcements (1 event, 1 update)
   - 2 Sample accomplishments (health & social programs)
   - 3 Sample local policies (2 ordinances, 1 resolution)
   - 5 Sample feedback entries with admin responses
   - 2 Sample rice distribution records (1 completed, 1 ongoing)

5. Features you can test with this data:
   ✅ Job Application System
      - View job openings
      - Apply for jobs
      - Admin job management
      - SMS notifications simulation
   
   ✅ Solicitation Request System
      - Submit solicitation requests
      - Admin approval process
      - Public viewing of approved requests
   
   ✅ Community Feedback System
      - Submit feedback (authenticated users)
      - Public viewing of feedback
      - Admin responses with edit/delete capability
      - Follow-up responses
   
   ✅ Local Policies Management
      - View ordinances and resolutions
      - Download policy documents (simulated paths)
      - Admin policy management
   
   ✅ Rice Distribution System
      - Monthly distribution planning
      - Barangay selection and scheduling
      - SMS notification tracking
      - Distribution completion tracking
   
   ✅ Announcements & Accomplishments
      - Public announcements with events
      - Community accomplishments showcase
      - Admin content management

6. All users have standard passwords: User@123 or Admin@123
   Change these in production!

7. File paths in the sample data are examples - ensure you create 
   proper upload directories and file handling for full functionality

8. SMS integration points are included but require actual SMS service setup

9. The sample data includes realistic scenarios:
   - Different barangays represented
   - Various feedback categories and responses
   - Multiple policy types and categories
   - Detailed rice distribution logistics
   - Mixed application statuses for testing

10. For production deployment:
    - Change default passwords
    - Set up proper file upload directories
    - Configure SMS service integration
    - Adjust barangay lists as needed
    - Review and customize sample content

MODULAR CSS STYLING RECOMMENDATION:
When implementing the frontend components, use modular CSS with the following structure:

/src/styles/
  ├── modules/
  │   ├── JobApplication.module.css
  │   ├── Feedback.module.css
  │   ├── LocalPolicy.module.css
  │   ├── RiceDistribution.module.css
  │   ├── Announcements.module.css
  │   └── Accomplishments.module.css
  ├── components/
  │   ├── Button.module.css
  │   ├── Form.module.css
  │   ├── Modal.module.css
  │   └── Card.module.css
  └── globals/
      ├── variables.css
      ├── mixins.css
      └── reset.css

This approach provides:
- Component isolation
- Reusable utility classes
- Easy maintenance
- No naming conflicts
- Better organization
*/