// backend/src/config/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const b2Service = require('./b2');

// Memory storage for temporary file handling
const memoryStorage = multer.memoryStorage();

// File filter function (same as before)
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
  if (file.fieldname === 'documents' || file.fieldname === 'fullDocument' || file.fieldname === 'cvFile' || file.fieldname === 'solicitationLetter') {
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

// Updated multer configuration for B2
const upload = () => {
  return multer({
    storage: memoryStorage, // Use memory storage instead of disk storage
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });
};

/**
 * Upload file to B2 and return file info
 * @param {Object} file - Multer file object
 * @param {string} folder - Optional folder path
 * @returns {Promise<Object>} Upload result
 */
const uploadToB2 = async (file, folder = null) => {
  try {
    // Determine folder based on fieldname if not specified
    if (!folder) {
      if (file.fieldname === 'avatar') {
        folder = 'avatars';
      } else if (file.fieldname === 'documents' || file.fieldname === 'fullDocument') {
        folder = 'documents';
      } else if (file.fieldname === 'images' || file.fieldname === 'photos') {
        folder = 'images';
      } else if (file.fieldname === 'cvFile') {
        folder = 'cvs';
      } else if (file.fieldname === 'solicitationLetter') {
        folder = 'solicitations';
      } else {
        folder = 'misc';
      }
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;

    // Upload to B2
    const result = await b2Service.uploadFile(
      file.buffer,
      fileName,
      file.mimetype,
      folder
    );

    return {
      success: true,
      fileId: result.fileId,
      fileName: result.fileName,
      fileUrl: result.fileUrl,
      originalName: file.originalname,
      size: result.size,
      folder: folder
    };
  } catch (error) {
    console.error('Upload to B2 failed:', error);
    throw error;
  }
};

/**
 * Upload multiple files to B2 (sequentially to avoid token conflicts)
 * @param {Array} files - Array of multer file objects
 * @param {string} folder - Optional folder path
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleToB2 = async (files, folder = null) => {
  try {
    const results = [];
    
    // Upload files sequentially to avoid B2 token conflicts
    for (const file of files) {
      const result = await uploadToB2(file, folder);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error('Multiple upload to B2 failed:', error);
    throw error;
  }
};

/**
 * Delete file from B2
 * @param {string} fileId - B2 file ID
 * @param {string} fileName - File name
 * @returns {Promise<Object>} Delete result
 */
const deleteFromB2 = async (fileId, fileName) => {
  try {
    const result = await b2Service.deleteFile(fileId, fileName);
    return result;
  } catch (error) {
    console.error('Delete from B2 failed:', error);
    // Don't throw error - file deletion failure shouldn't stop the main operation
    return { success: false, error: error.message };
  }
};

/**
 * Get file URL from B2 (for backward compatibility)
 * @param {Object} file - File object with B2 info
 * @returns {string} File URL
 */
const getFileUrl = (file) => {
  // If it's already a B2 URL, return as is
  if (typeof file === 'string' && file.includes('backblazeb2.com')) {
    return file;
  }
  
  // If it's a file object with fileUrl, return that
  if (file && file.fileUrl) {
    return file.fileUrl;
  }
  
  // For backward compatibility with old local files
  if (file && file.path) {
    const protocol = 'http'; // You might need to adjust this
    const host = 'localhost:5000'; // You might need to adjust this
    const baseUrl = `${protocol}://${host}`;
    const filePath = file.path.replace(/\\/g, '/');
    return `${baseUrl}/${filePath}`;
  }
  
  return null;
};

/**
 * Clean up local files (for migration purposes)
 * @param {string} filePath - Local file path
 */
const deleteFile = (filePath) => {
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
      console.log(`Local file deleted: ${actualPath}`);
    } else {
      console.log(`Local file not found (already deleted?): ${actualPath}`);
    }
  } catch (error) {
    console.error(`Error deleting local file ${filePath}:`, error.message);
    // Don't throw error - file deletion failure shouldn't stop the main operation
  }
};

/**
 * Function to clean up orphaned files (optional utility)
 * @param {string} uploadsDir - Local uploads directory
 */
const cleanupOrphanedFiles = (uploadsDir = 'uploads') => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      console.log('No local uploads directory found - already cleaned up or using B2 only');
      return;
    }
    
    const stats = fs.statSync(uploadsDir);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        // Delete files older than 30 days that are not referenced
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (stats.isFile() && stats.mtime < thirtyDaysAgo) {
          console.log(`Cleaning up old local file: ${filePath}`);
          fs.unlinkSync(filePath);
        }
      });
    }
  } catch (error) {
    console.error('Error during local cleanup:', error.message);
  }
};

module.exports = { 
  upload, 
  uploadToB2,
  uploadMultipleToB2,
  deleteFromB2,
  getFileUrl, 
  deleteFile, 
  cleanupOrphanedFiles,
  b2Service // Export B2 service for direct access
};