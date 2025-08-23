// models/index.js - Centralized model exports and database setup

const User = require('./User');
const JobPosting = require('./JobPosting');
const SolicitationRequest = require('./SolicitationRequest');
const Announcement = require('./Announcement');
const JobApplication = require('./JobApplication');
const Accomplishment = require('./Accomplishment');
const LocalPolicy = require('./LocalPolicy');
const Feedback = require('./Feedback');
const RiceDistributionRecord = require('./RiceDistributionRecord');

// Export all models
module.exports = {
  User,
  JobPosting,
  JobApplication,
  SolicitationRequest,
  Announcement,
  Accomplishment,
  LocalPolicy,
  Feedback,
  RiceDistributionRecord
};

// Database initialization function
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database indexes...');
    
    // Create text indexes for search functionality
    await User.ensureIndexes();
    await JobPosting.ensureIndexes();
    await JobApplication.ensureIndexes();
    await SolicitationRequest.ensureIndexes();
    await Announcement.ensureIndexes();
    await Accomplishment.ensureIndexes();
    await LocalPolicy.ensureIndexes();
    await Feedback.ensureIndexes();
    await RiceDistributionRecord.ensureIndexes();
    
    console.log('✅ Database indexes initialized successfully');
    
    // Create default admin user if none exists
    await createDefaultAdmin();
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const defaultAdmin = new User({
        firstName: 'System',
        lastName: 'Administrator',
        contactNumber: '09000000000', // Change this in production
        password: 'admin123456', // Change this in production
        barangay: 'Agnas',
        role: 'admin',
        isActive: true,
        isVerified: true
      });
      
      await defaultAdmin.save();
      console.log('✅ Default admin user created');
      console.log('⚠️  Please change default admin credentials in production');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

// Database health check function
const checkDatabaseHealth = async () => {
  try {
    // Check collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const expectedCollections = [
      'users', 'jobpostings', 'jobapplications', 'solicitationrequests',
      'announcements', 'accomplishments', 'localpolicies', 'feedbacks', 
      'ricedistributionrecords'
    ];
    
    const health = {
      status: 'healthy',
      collections: {},
      indexes: {},
      timestamp: new Date()
    };
    
    // Check each collection
    for (const collectionName of expectedCollections) {
      const exists = collectionNames.includes(collectionName);
      health.collections[collectionName] = {
        exists,
        count: exists ? await mongoose.connection.db.collection(collectionName).countDocuments() : 0
      };
    }
    
    return health;
    
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date()
    };
  }
};

// Export initialization functions
module.exports.initializeDatabase = initializeDatabase;
module.exports.checkDatabaseHealth = checkDatabaseHealth;