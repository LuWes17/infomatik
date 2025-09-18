const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const setupMiddleware = (app) => {
  // Security middleware
   app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Add this line
  }));
  
  // CORS configuration - UPDATED
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://infomatik.onrender.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition']
  }));
  
  app.use('/uploads', (req, res, next) => {
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
        ? 'https://infomatik.onrender.com/' 
        : 'http://localhost:3000');
      next();
    });  


  app.use('/uploads', express.static('uploads'));

  // Rate limiting
  app.use('/api/', limiter);
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Static files
  app.use('/uploads', express.static('uploads'));
};

module.exports = setupMiddleware;