/**
 * File Upload SDK
 * Handles document uploads with metadata
 */

import { v4 as uuidv4 } from 'uuid';
import { validateFile } from '../validation/FileTypeValidation';

/**
 * Upload a document with metadata
 * @param {File} file - The file to upload
 * @param {Object} metadata - Document metadata
 * @param {string} metadata.title - Document title
 * @param {string} metadata.description - Document description
 * @param {Array<string>} metadata.tags - Document tags
 * @returns {Promise<Object>} - Uploaded document object
 */
export const uploadDocument = async (file, metadata = {}) => {
  const validationResult = validateFile(file);
  
  if (!validationResult.valid) {
    throw new Error(validationResult.message);
  }
  
  const documentId = uuidv4();
  
  const document = {
    id: documentId,
    file: file,
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    url: URL.createObjectURL(file),
    metadata: {
      title: metadata.title || file.name,
      description: metadata.description || '',
      tags: metadata.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    versions: [
      {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        file: file,
        url: URL.createObjectURL(file),
      }
    ],
    permissions: {
      owner: 'current-user',
      access: []
    }
  };
  
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  documents.push(document);
  localStorage.setItem('documents', JSON.stringify(documents));
  
  return document;
};

/**
 * Get all uploaded documents
 * @returns {Array<Object>} - Array of document objects
 */
export const getDocuments = () => {
  return JSON.parse(localStorage.getItem('documents') || '[]');
};

/**
 * Get a document by ID
 * @param {string} documentId - Document ID
 * @returns {Object|null} - Document object or null if not found
 */
export const getDocumentById = (documentId) => {
  const documents = getDocuments();
  return documents.find(doc => doc.id === documentId) || null;
};

/**
 * Update document metadata
 * @param {string} documentId - Document ID
 * @param {Object} metadata - Updated metadata
 * @param {string} [metadata.title] - Document title
 * @param {string} [metadata.description] - Document description
 * @param {Array<string>} [metadata.tags] - Document tags
 * @param {string} [userId] - User ID making the update (for permission checking)
 * @returns {Object} - Updated document or error
 */
export const updateDocumentMetadata = (documentId, metadata = {}, userId = 'current-user') => {
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return { error: 'Document not found' };
  }
  
  const document = documents[documentIndex];
  const isOwner = document.permissions.owner === userId;
  const hasEditAccess = document.permissions.access?.some(
    access => access.userId === userId && ['edit', 'admin'].includes(access.level)
  );
  
  if (!isOwner && !hasEditAccess) {
    return { error: 'Permission denied. You do not have edit access to this document.' };
  }
  
  const updatedMetadata = { 
    ...document.metadata,
    updatedAt: new Date().toISOString()
  };
  
  if (metadata.title !== undefined) {
    updatedMetadata.title = metadata.title;
  }
  
  if (metadata.description !== undefined) {
    updatedMetadata.description = metadata.description;
  }
  
  if (metadata.tags !== undefined) {
    updatedMetadata.tags = metadata.tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag !== '');
  }
  
  documents[documentIndex] = {
    ...document,
    metadata: updatedMetadata
  };
  
  localStorage.setItem('documents', JSON.stringify(documents));
  
  return documents[documentIndex];
};

/**
 * Delete a document
 * @param {string} documentId - Document ID to delete
 * @returns {boolean} - Success status
 */
export const deleteDocument = (documentId) => {
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const updatedDocuments = documents.filter(doc => doc.id !== documentId);
  
  if (updatedDocuments.length === documents.length) {
    return false;
  }
  
  localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  return true;
}; 