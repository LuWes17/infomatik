// backend/src/config/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Local storage configuration
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Create directories based on file type
    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'documents' || file.fieldname === 'fullDocument') {
      uploadPath += 'documents/';
    } else if (file.fieldname === 'images' || file.fieldname === 'photos') {
      uploadPath += 'images/';
    } else if (file.fieldname === 'cvFile') {
      uploadPath += 'cvs/';
    } else {
      uploadPath += 'misc/';
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx|txt/;
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();
  
  // Check for images
  if (file.fieldname === 'avatar' || file.fieldname === 'images' || file.fieldname === 'photos') {
    const isValidImage = allowedImageTypes.test(fileExtension.substring(1)) &&
                        mimeType.startsWith('image/');
    
    if (isValidImage) {
      return cb(null, true);
    } else {
      return cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed for images'), false);
    }
  }
  
  // Check for documents (including CV files)
  if (file.fieldname === 'documents' || file.fieldname === 'fullDocument' || file.fieldname === 'cvFile') {
    const isValidDoc = allowedDocTypes.test(fileExtension.substring(1)) ||
                      ['application/pdf', 'application/msword', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                       'text/plain'].includes(mimeType);
    
    if (isValidDoc) {
      return cb(null, true);
    } else {
      return cb(new Error('Only document files (PDF, DOC, DOCX, TXT) are allowed'), false);
    }
  }
  
  // Default: allow common file types
  cb(null, true);
};

// Multer configuration for local storage
const upload = () => {
  return multer({
    storage: localStorage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });
};

// Helper function to generate file URL
const getFileUrl = (file, req) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  
  // Remove 'uploads/' from the path if it exists since we'll add it in the URL
  const filePath = file.path.replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes
  
  return `${baseUrl}/${filePath}`;
};

// Helper function to delete files
const deleteFile = (filePath, public_id = null) => {
  try {
    // Handle different path formats
    let actualPath = filePath;
    
    // If filePath is a full URL, extract just the file path
    if (filePath.includes('http')) {
      const urlParts = filePath.split('/');
      const uploadsIndex = urlParts.indexOf('uploads');
      if (uploadsIndex !== -1) {
        actualPath = urlParts.slice(uploadsIndex).join('/');
      }
    }
    
    // Ensure path is relative to project root
    if (!actualPath.startsWith('uploads/')) {
      actualPath = `uploads/${actualPath}`;
    }
    
    // Check if file exists and delete it
    if (fs.existsSync(actualPath)) {
      fs.unlinkSync(actualPath);
      console.log(`File deleted: ${actualPath}`);
    } else {
      console.log(`File not found (already deleted?): ${actualPath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error.message);
    // Don't throw error - file deletion failure shouldn't stop the main operation
  }
};

// Function to clean up orphaned files (optional utility)
const cleanupOrphanedFiles = (uploadsDir = 'uploads') => {
  try {
    const stats = fs.statSync(uploadsDir);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        // Delete files older than 30 days that are not referenced
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (stats.isFile() && stats.mtime < thirtyDaysAgo) {
          console.log(`Cleaning up old file: ${filePath}`);
          fs.unlinkSync(filePath);
        }
      });
    }
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  }
};

module.exports = { 
  upload, 
  getFileUrl, 
  deleteFile, 
  cleanupOrphanedFiles 
};