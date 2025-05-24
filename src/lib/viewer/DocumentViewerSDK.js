/**
 * Document Viewer SDK
 * Render documents for in-platform viewing
 */

import { getDocumentById } from '../upload/FileUploadSDK';
import { checkPermission, PERMISSION_LEVELS } from '../access/AccessControlLibrary';

/**
 * Get document view URL
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID requesting the view
 * @returns {Object} - View information or error
 */
export const getDocumentViewUrl = (documentId, userId) => {
  // Check if document exists
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found', status: 404 };
  }
  
  // Check if user has permission to view
  const hasPermission = checkPermission(documentId, userId, PERMISSION_LEVELS.VIEW);
  
  if (!hasPermission) {
    return { error: 'Permission denied', status: 403 };
  }
  
  // Return URL for viewing
  return {
    url: document.url,
    type: document.type,
    name: document.name,
    size: document.size
  };
};

/**
 * Get document download URL
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID requesting the download
 * @returns {Object} - Download information or error
 */
export const getDocumentDownloadUrl = (documentId, userId) => {
  // Check if document exists
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found', status: 404 };
  }
  
  // Check if user has permission to download
  const hasPermission = checkPermission(documentId, userId, PERMISSION_LEVELS.DOWNLOAD);
  
  if (!hasPermission) {
    return { error: 'Permission denied', status: 403 };
  }
  
  // Return URL for download
  return {
    url: document.url,
    type: document.type,
    name: document.name,
    size: document.size
  };
};

/**
 * Get document preview configuration
 * @param {string} documentId - Document ID
 * @returns {Object} - Preview configuration or error
 */
export const getDocumentPreviewConfig = (documentId) => {
  // Check if document exists
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found' };
  }
  
  // Determine viewer type based on file type
  const fileType = document.type;
  let viewerType = 'unknown';
  
  if (fileType === 'application/pdf') {
    viewerType = 'pdf';
  } else if (
    fileType === 'application/msword' || 
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    viewerType = 'docx';
  } else if (
    fileType === 'application/vnd.ms-excel' || 
    fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    viewerType = 'xlsx';
  } else if (
    fileType === 'image/jpeg' || 
    fileType === 'image/png' || 
    fileType === 'image/gif' || 
    fileType === 'image/svg+xml'
  ) {
    viewerType = 'image';
  } else if (fileType === 'text/plain' || fileType === 'text/csv') {
    viewerType = 'text';
  }
  
  return {
    documentId,
    url: document.url,
    type: document.type,
    viewerType,
    name: document.name,
    size: document.size,
    metadata: document.metadata
  };
};

/**
 * Track document view event
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @returns {boolean} - Success status
 */
export const trackDocumentView = (documentId, userId) => {
  // In a real application, this would log the view to a database
  // For this demo, we'll just log to console
  console.log(`Document ${documentId} viewed by user ${userId} at ${new Date().toISOString()}`);
  
  // Get document
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return false;
  }
  
  // Update document last viewed timestamp
  documents[documentIndex] = {
    ...documents[documentIndex],
    lastViewed: new Date().toISOString(),
    viewCount: (documents[documentIndex].viewCount || 0) + 1,
    viewHistory: [
      ...(documents[documentIndex].viewHistory || []),
      { userId, timestamp: new Date().toISOString() }
    ]
  };
  
  // Save updated documents
  localStorage.setItem('documents', JSON.stringify(documents));
  
  return true;
};

/**
 * Get document view history
 * @param {string} documentId - Document ID
 * @returns {Array<Object>} - View history or empty array
 */
export const getDocumentViewHistory = (documentId) => {
  const document = getDocumentById(documentId);
  
  if (!document) {
    return [];
  }
  
  return document.viewHistory || [];
}; 