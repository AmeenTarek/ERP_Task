const SUPPORTED_FILE_TYPES = {
  'application/pdf': { maxSize: 10 * 1024 * 1024 },
  'application/msword': { maxSize: 5 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxSize: 5 * 1024 * 1024 },
  'application/vnd.ms-excel': { maxSize: 5 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { maxSize: 5 * 1024 * 1024 },
  'application/vnd.ms-powerpoint': { maxSize: 5 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { maxSize: 5 * 1024 * 1024 },
  'text/plain': { maxSize: 1 * 1024 * 1024 },
  'text/csv': { maxSize: 2 * 1024 * 1024 },
  
  'image/jpeg': { maxSize: 5 * 1024 * 1024 },
  'image/png': { maxSize: 5 * 1024 * 1024 },
  'image/gif': { maxSize: 5 * 1024 * 1024 },
  'image/svg+xml': { maxSize: 2 * 1024 * 1024 },
};

const EXTENSION_TO_MIME = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const getFileExtension = (filename) => {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
};

export const validateFile = (file) => {
  if (!file) {
    return { valid: false, message: 'No file provided' };
  }
  
  const fileExtension = getFileExtension(file.name);
  let mimeType = file.type;
  
  if (!mimeType && fileExtension) {
    mimeType = EXTENSION_TO_MIME[fileExtension];
  }
  
  if (!mimeType || !SUPPORTED_FILE_TYPES[mimeType]) {
    return { 
      valid: false, 
      message: `Unsupported file type: ${mimeType || fileExtension}` 
    };
  }
  
  const maxSize = SUPPORTED_FILE_TYPES[mimeType].maxSize;
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return { 
      valid: false, 
      message: `File is too large. Maximum size for ${mimeType} is ${maxSizeMB}MB` 
    };
  }
  
  return { valid: true, message: 'File is valid' };
};

/**
 * Get supported file types as a readable string
 * @returns {string} - Comma-separated list of supported file extensions
 */
export const getSupportedFileTypesString = () => {
  return Object.keys(EXTENSION_TO_MIME).join(', ');
};

/**
 * Get maximum file size for a specific file type
 * @param {string} mimeType - The MIME type
 * @returns {number|null} - Maximum file size in bytes, or null if unsupported
 */
export const getMaxFileSize = (mimeType) => {
  if (SUPPORTED_FILE_TYPES[mimeType]) {
    return SUPPORTED_FILE_TYPES[mimeType].maxSize;
  }
  return null;
}; 