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

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'City Councilor API is running!', 
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});