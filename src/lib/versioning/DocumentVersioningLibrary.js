/**
 * Document Versioning Library
 * Manage multiple versions of the same document
 */

import { v4 as uuidv4 } from 'uuid';
import { getDocumentById } from '../upload/FileUploadSDK';
import { validateFile } from '../validation/FileTypeValidation';
import { checkPermission, PERMISSION_LEVELS } from '../access/AccessControlLibrary';

/**
 * Create a new version of a document
 * @param {string} documentId - Document ID
 * @param {File} file - New version file
 * @param {string} userId - User creating the version
 * @param {string} comment - Version comment
 * @returns {Object} - New version info or error
 */
export const createVersion = (documentId, file, userId, comment = '') => {
  // Check if document exists
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found' };
  }
  
  // Check if user has permission to edit
  const hasPermission = checkPermission(documentId, userId, PERMISSION_LEVELS.EDIT);
  
  if (!hasPermission) {
    return { error: 'Permission denied' };
  }
  
  // Validate file
  const validationResult = validateFile(file);
  
  if (!validationResult.valid) {
    return { error: validationResult.message };
  }
  
  // Check if file type matches original document
  if (file.type !== document.type) {
    return { error: 'New version must be the same file type as the original document' };
  }
  
  // Create version object
  const newVersion = {
    id: uuidv4(),
    number: (document.versions?.length || 0) + 1,
    file: file,
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
    comment: comment,
    createdBy: userId,
    createdAt: new Date().toISOString()
  };
  
  // Get documents from storage
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return { error: 'Document not found' };
  }
  
  // Initialize versions array if it doesn't exist
  if (!documents[documentIndex].versions) {
    documents[documentIndex].versions = [];
  }
  
  // Add new version
  documents[documentIndex].versions.push(newVersion);
  
  // Update document metadata
  documents[documentIndex].currentVersion = newVersion.number;
  documents[documentIndex].url = newVersion.url; // Update main URL to latest version
  documents[documentIndex].size = newVersion.size;
  documents[documentIndex].metadata.updatedAt = new Date().toISOString();
  
  // Save updated documents
  localStorage.setItem('documents', JSON.stringify(documents));
  
  return newVersion;
};

/**
 * Get all versions of a document
 * @param {string} documentId - Document ID
 * @returns {Array<Object>} - Array of versions or error
 */
export const getVersions = (documentId) => {
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found', versions: [] };
  }
  
  return document.versions || [];
};

/**
 * Get a specific version of a document
 * @param {string} documentId - Document ID
 * @param {string} versionId - Version ID
 * @returns {Object} - Version info or error
 */
export const getVersion = (documentId, versionId) => {
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found' };
  }
  
  const versions = document.versions || [];
  const version = versions.find(v => v.id === versionId);
  
  if (!version) {
    return { error: 'Version not found' };
  }
  
  return version;
};

/**
 * Get a specific version of a document by version number
 * @param {string} documentId - Document ID
 * @param {number} versionNumber - Version number
 * @returns {Object} - Version info or error
 */
export const getVersionByNumber = (documentId, versionNumber) => {
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found' };
  }
  
  const versions = document.versions || [];
  const version = versions.find(v => v.number === versionNumber);
  
  if (!version) {
    return { error: 'Version not found' };
  }
  
  return version;
};

/**
 * Set the current version of a document
 * @param {string} documentId - Document ID
 * @param {number} versionNumber - Version number to set as current
 * @param {string} userId - User making the change
 * @returns {Object} - Updated document info or error
 */
export const setCurrentVersion = (documentId, versionNumber, userId) => {
  // Check if document exists
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found' };
  }
  
  // Check if user has permission to edit
  const hasPermission = checkPermission(documentId, userId, PERMISSION_LEVELS.EDIT);
  
  if (!hasPermission) {
    return { error: 'Permission denied' };
  }
  
  // Get the version
  const version = getVersionByNumber(documentId, versionNumber);
  
  if (version.error) {
    return version;
  }
  
  // Get documents from storage
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return { error: 'Document not found' };
  }
  
  // Update current version
  documents[documentIndex].currentVersion = versionNumber;
  documents[documentIndex].url = version.url;
  documents[documentIndex].metadata.updatedAt = new Date().toISOString();
  
  // Save updated documents
  localStorage.setItem('documents', JSON.stringify(documents));
  
  return {
    documentId,
    currentVersion: versionNumber,
    url: version.url
  };
};

/**
 * Delete a version of a document
 * @param {string} documentId - Document ID
 * @param {string} versionId - Version ID
 * @param {string} userId - User making the deletion
 * @returns {boolean} - Success status or error
 */
export const deleteVersion = (documentId, versionId, userId) => {
  // Check if document exists
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found' };
  }
  
  // Check if user has permission to edit
  const hasPermission = checkPermission(documentId, userId, PERMISSION_LEVELS.ADMIN);
  
  if (!hasPermission) {
    return { error: 'Permission denied. Only admins can delete versions.' };
  }
  
  // Get versions
  const versions = document.versions || [];
  
  // Cannot delete if there's only one version
  if (versions.length <= 1) {
    return { error: 'Cannot delete the only version of a document' };
  }
  
  // Find the version
  const versionIndex = versions.findIndex(v => v.id === versionId);
  
  if (versionIndex === -1) {
    return { error: 'Version not found' };
  }
  
  // Get documents from storage
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  // Check if this is the current version
  const isCurrentVersion = document.currentVersion === versions[versionIndex].number;
  
  // Remove the version
  const updatedVersions = [...versions];
  updatedVersions.splice(versionIndex, 1);
  
  // Renumber versions
  updatedVersions.forEach((v, i) => {
    v.number = i + 1;
  });
  
  // Update document
  documents[documentIndex].versions = updatedVersions;
  
  // If we deleted the current version, set the latest as current
  if (isCurrentVersion) {
    const latestVersion = updatedVersions[updatedVersions.length - 1];
    documents[documentIndex].currentVersion = latestVersion.number;
    documents[documentIndex].url = latestVersion.url;
  }
  
  // Save updated documents
  localStorage.setItem('documents', JSON.stringify(documents));
  
  return { success: true };
}; 