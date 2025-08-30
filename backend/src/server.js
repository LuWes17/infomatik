const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const setupMiddleware = require('./middleware');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Setup middleware
setupMiddleware(app);

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const jobRoutes = require('./routes/jobs');
const solicitationRoutes = require('./routes/solicitations');
const feedbackRoutes = require('./routes/feedback');
const announcementRoutes = require('./routes/announcements');
const accomplishmentRoutes = require('./routes/accomplishments');
const policyRoutes = require('./routes/policies');
const riceDistributionRoutes = require('./routes/riceDistribution');
const dashboardRoutes = require('./routes/dashboard');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/solicitations', solicitationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/accomplishments', accomplishmentRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/rice-distribution', riceDistributionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/uploads', express.static('uploads'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'City Councilor API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // Default error
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found` 
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📱 SMS Service: ${process.env.SEMAPHORE_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`☁️  File Storage: ${process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME ? 'Cloudinary' : 'Local'}`);
});