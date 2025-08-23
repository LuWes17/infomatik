// backend/src/config/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cloudinary configuration (for production)
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  
  console.log('Cloudinary configured for production');
} else {
  console.log('Using local storage for development (Cloudinary not configured)');
}

// Local storage configuration (for development)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Create directories based on file type
    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'documents') {
      uploadPath += 'documents/';
    } else if (file.fieldname === 'images') {
      uploadPath += 'images/';
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
  
  // Check for documents
  if (file.fieldname === 'documents') {
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
const uploadLocal = multer({
  storage: localStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Multer configuration for memory storage (used with Cloudinary)
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Upload to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto',
      folder: 'city-councilor',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...options
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Main upload middleware that chooses between local and cloud storage
const upload = (fieldConfig) => {
  return async (req, res, next) => {
    // Determine storage method based on environment
    const useCloudinary = process.env.NODE_ENV === 'production' && 
                          process.env.CLOUDINARY_CLOUD_NAME;
    
    const uploadMiddleware = useCloudinary ? uploadMemory : uploadLocal;
    
    // Handle the upload
    uploadMiddleware.any()(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err.message);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // If using Cloudinary, upload files to cloud
      if (useCloudinary && req.files && req.files.length > 0) {
        try {
          const uploadPromises = req.files.map(async (file) => {
            const folderMap = {
              'avatar': 'avatars',
              'images': 'images',
              'documents': 'documents'
            };
            
            const folder = `city-councilor/${folderMap[file.fieldname] || 'misc'}`;
            
            const result = await uploadToCloudinary(file.buffer, {
              folder,
              resource_type: file.fieldname === 'documents' ? 'raw' : 'auto'
            });
            
            return {
              ...file,
              cloudinary: result,
              url: result.secure_url,
              public_id: result.public_id
            };
          });
          
          req.files = await Promise.all(uploadPromises);
          console.log(`Uploaded ${req.files.length} files to Cloudinary`);
          
        } catch (cloudError) {
          console.error('Cloudinary upload error:', cloudError);
          return res.status(500).json({
            success: false,
            message: 'File upload to cloud storage failed'
          });
        }
      }
      
      next();
    });
  };
};

// Delete file from storage
const deleteFile = async (filePath, publicId = null) => {
  try {
    // If using Cloudinary and public_id is provided
    if (publicId && process.env.NODE_ENV === 'production') {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Deleted from Cloudinary:', publicId);
      return result;
    }
    
    // Delete from local storage
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Deleted local file:', filePath);
      return { success: true };
    }
    
    return { success: false, message: 'File not found' };
  } catch (error) {
    console.error('Delete file error:', error);
    return { success: false, error: error.message };
  }
};

// Specific upload configurations
const uploadConfigs = {
  avatar: upload().single('avatar'),
  images: upload().array('images', 4), // Max 4 images
  documents: upload().array('documents', 3), // Max 3 documents
  mixed: upload().fields([
    { name: 'images', maxCount: 4 },
    { name: 'documents', maxCount: 3 }
  ])
};

// Helper function to get file URL
const getFileUrl = (file, req) => {
  if (file.url) {
    // Cloudinary URL
    return file.url;
  }
  
  // Local file URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${file.path.replace(/\\/g, '/')}`;
};

// Image optimization for Cloudinary
const getOptimizedImageUrl = (publicId, options = {}) => {
  if (!publicId) return null;
  
  const defaultOptions = {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  };
  
  const transformOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, transformOptions);
};

// Validate file size and type after upload
const validateUploadedFiles = (files, maxSize = 10 * 1024 * 1024) => {
  const errors = [];
  
  if (!files || files.length === 0) {
    return { isValid: true, errors: [] };
  }
  
  files.forEach((file, index) => {
    if (file.size > maxSize) {
      errors.push(`File ${index + 1} (${file.originalname}) exceeds maximum size of ${maxSize / (1024 * 1024)}MB`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  upload,
  uploadConfigs,
  deleteFile,
  getFileUrl,
  getOptimizedImageUrl,
  validateUploadedFiles,
  cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? cloudinary : null
};