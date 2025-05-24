

import { getDocumentById } from '../upload/FileUploadSDK';

/**
 * Add tags to a document
 * @param {string} documentId - Document ID
 * @param {Array<string>} tags - Tags to add
 * @returns {Object|null} - Updated document or null if not found
 */
export const addTags = (documentId, tags) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error('Tags must be a non-empty array');
  }
  

  const cleanedTags = tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag !== '');
  
  if (cleanedTags.length === 0) {
    throw new Error('No valid tags provided');
  }
  

  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return null;
  }
  

  const existingTags = documents[documentIndex].metadata.tags || [];
  const updatedTags = [...new Set([...existingTags, ...cleanedTags])];
  

  documents[documentIndex] = {
    ...documents[documentIndex],
    metadata: {
      ...documents[documentIndex].metadata,
      tags: updatedTags,
      updatedAt: new Date().toISOString()
    }
  };
  

  localStorage.setItem('documents', JSON.stringify(documents));
  
  return documents[documentIndex];
};

/**
 * Remove tags from a document
 * @param {string} documentId - Document ID
 * @param {Array<string>} tags - Tags to remove
 * @returns {Object|null} - Updated document or null if not found
 */
export const removeTags = (documentId, tags) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error('Tags must be a non-empty array');
  }
  

  const tagsToRemove = tags.map(tag => tag.trim().toLowerCase());
  
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return null;
  }
  

  const existingTags = documents[documentIndex].metadata.tags || [];
  const updatedTags = existingTags.filter(tag => !tagsToRemove.includes(tag));
  

  documents[documentIndex] = {
    ...documents[documentIndex],
    metadata: {
      ...documents[documentIndex].metadata,
      tags: updatedTags,
      updatedAt: new Date().toISOString()
    }
  };
  

  localStorage.setItem('documents', JSON.stringify(documents));
  
  return documents[documentIndex];
};

/**
 * Replace all tags for a document
 * @param {string} documentId - Document ID
 * @param {Array<string>} tags - New tags
 * @returns {Object|null} - Updated document or null if not found
 */
export const setTags = (documentId, tags) => {
  if (!Array.isArray(tags)) {
    throw new Error('Tags must be an array');
  }
  

  const cleanedTags = tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag !== '');
  

  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return null;
  }
  
  documents[documentIndex] = {
    ...documents[documentIndex],
    metadata: {
      ...documents[documentIndex].metadata,
      tags: cleanedTags,
      updatedAt: new Date().toISOString()
    }
  };
  

  localStorage.setItem('documents', JSON.stringify(documents));
  
  return documents[documentIndex];
};

/**
 * Get all unique tags in the system
 * @returns {Array<string>} - Array of unique tags
 */
export const getAllTags = () => {
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  

  const allTags = documents.reduce((tags, doc) => {
    if (doc.metadata && Array.isArray(doc.metadata.tags)) {
      return [...tags, ...doc.metadata.tags];
    }
    return tags;
  }, []);
  

  return [...new Set(allTags)].sort();
};

/**
 * Find documents by tag
 * @param {string} tag - Tag to search for
 * @returns {Array<Object>} - Array of matching documents
 */
export const findDocumentsByTag = (tag) => {
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const searchTag = tag.trim().toLowerCase();
  
  return documents.filter(doc => 
    doc.metadata && 
    Array.isArray(doc.metadata.tags) && 
    doc.metadata.tags.includes(searchTag)
  );
}; 