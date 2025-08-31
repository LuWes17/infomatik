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
    } else if (file.fieldname === 'images') {
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
  if (file.fieldname === 'avatar' || file.fieldname === 'images') {
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

module.exports = { upload };