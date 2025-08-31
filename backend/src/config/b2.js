// backend/src/config/b2.js
const B2 = require('backblaze-b2');

class B2Service {
  constructor() {
    this.b2 = new B2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
      applicationKey: process.env.B2_APPLICATION_KEY
    });
    
    this.bucketId = process.env.B2_BUCKET_ID;
    this.bucketName = process.env.B2_BUCKET_NAME;
    this.isInitialized = false;
    this.authorizationToken = null;
    this.downloadUrl = process.env.B2_DOWNLOAD_URL; // e.g., https://f005.backblazeb2.com/file/your-bucket-name
  }

  async initialize() {
    try {
      if (!this.isInitialized) {
        // Authorize the B2 account
        const authResponse = await this.b2.authorize();
        this.authorizationToken = authResponse.data.authorizationToken;
        this.downloadUrl = authResponse.data.downloadUrl;
        
        this.isInitialized = true;
        console.log('B2 Service initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize B2 service:', error);
      throw error;
    }
  }

  /**
   * Get a fresh upload URL and token for each upload
   * @returns {Promise<Object>} Upload URL and token
   */
  async getUploadUrl() {
    await this.initialize();
    
    try {
      const uploadUrlResponse = await this.b2.getUploadUrl({
        bucketId: this.bucketId
      });
      
      return {
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken
      };
    } catch (error) {
      console.error('Failed to get upload URL:', error);
      throw error;
    }
  }

  /**
   * Upload file to B2
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - File name
   * @param {string} mimeType - File MIME type
   * @param {string} folder - Folder path (optional)
   * @returns {Promise<Object>} Upload response
   */
  async uploadFile(fileBuffer, fileName, mimeType, folder = '') {
    try {
      // Get a fresh upload URL and token for each upload
      const { uploadUrl, uploadAuthToken } = await this.getUploadUrl();
      
      // Create full file path with folder
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      
      const response = await this.b2.uploadFile({
        uploadUrl: uploadUrl,
        uploadAuthToken: uploadAuthToken,
        fileName: filePath,
        data: fileBuffer,
        mime: mimeType,
        hash: null, // B2 will calculate SHA1
        onUploadProgress: null
      });

      return {
        success: true,
        fileId: response.data.fileId,
        fileName: response.data.fileName,
        fileUrl: `${this.downloadUrl}/file/${this.bucketName}/${response.data.fileName}`,
        size: response.data.contentLength
      };
    } catch (error) {
      console.error('B2 upload error:', error);
      
      // If auth token limit error, try again with new token
      if (error.response?.data?.code === 'auth_token_limit' || error.response?.status === 400) {
        console.log('Auth token limit reached, retrying with fresh token...');
        // Small delay to avoid rapid retry
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.uploadFile(fileBuffer, fileName, mimeType, folder);
      }
      
      // If upload URL expired, refresh it
      if (error.response?.status === 401) {
        this.isInitialized = false;
        await this.initialize();
        return this.uploadFile(fileBuffer, fileName, mimeType, folder);
      }
      
      throw error;
    }
  }

  /**
   * Delete file from B2
   * @param {string} fileId - B2 file ID
   * @param {string} fileName - File name
   * @returns {Promise<Object>} Delete response
   */
  async deleteFile(fileId, fileName) {
    try {
      await this.initialize();
      
      const response = await this.b2.deleteFileVersion({
        fileId: fileId,
        fileName: fileName
      });

      return {
        success: true,
        fileId: response.data.fileId,
        fileName: response.data.fileName
      };
    } catch (error) {
      console.error('B2 delete error:', error);
      throw error;
    }
  }

  /**
   * Get file info from B2
   * @param {string} fileId - B2 file ID
   * @returns {Promise<Object>} File info
   */
  async getFileInfo(fileId) {
    try {
      await this.initialize();
      
      const response = await this.b2.getFileInfo({
        fileId: fileId
      });

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('B2 get file info error:', error);
      throw error;
    }
  }

  /**
   * List files in bucket
   * @param {string} prefix - File prefix to filter
   * @param {number} maxFileCount - Maximum files to return
   * @returns {Promise<Object>} List of files
   */
  async listFiles(prefix = '', maxFileCount = 100) {
    try {
      await this.initialize();
      
      const response = await this.b2.listFileNames({
        bucketId: this.bucketId,
        startFileName: null,
        maxFileCount: maxFileCount,
        prefix: prefix
      });

      return {
        success: true,
        files: response.data.files,
        nextFileName: response.data.nextFileName
      };
    } catch (error) {
      console.error('B2 list files error:', error);
      throw error;
    }
  }

  /**
   * Generate direct download URL
   * @param {string} fileName - File name
   * @returns {string} Download URL
   */
  getDownloadUrl(fileName) {
    return `${this.downloadUrl}/file/${this.bucketName}/${fileName}`;
  }

  /**
   * Generate authorized download URL (for private files)
   * @param {string} fileId - B2 file ID
   * @param {number} validDurationInSeconds - URL validity duration
   * @returns {Promise<string>} Authorized download URL
   */
  async getDownloadAuthorization(fileId, validDurationInSeconds = 3600) {
    try {
      await this.initialize();
      
      const response = await this.b2.getDownloadAuthorization({
        bucketId: this.bucketId,
        fileNamePrefix: '',
        validDurationInSeconds: validDurationInSeconds
      });

      return response.data.authorizationToken;
    } catch (error) {
      console.error('B2 get download authorization error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const b2Service = new B2Service();
module.exports = b2Service;