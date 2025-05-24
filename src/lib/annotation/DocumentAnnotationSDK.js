

import { v4 as uuidv4 } from 'uuid';
import { getDocumentById } from '../upload/FileUploadSDK';
import { checkPermission, PERMISSION_LEVELS } from '../access/AccessControlLibrary';


export const ANNOTATION_TYPES = {
  HIGHLIGHT: 'highlight',
  COMMENT: 'comment',
  DRAWING: 'drawing',
  STICKY_NOTE: 'sticky_note',
  UNDERLINE: 'underline',
  STRIKETHROUGH: 'strikethrough'
};

/**
 * Add annotation to a document
 * @param {string} documentId - Document ID
 * @param {Object} annotation - Annotation data
 * @param {string} annotation.type - Annotation type from ANNOTATION_TYPES
 * @param {number} annotation.pageNumber - Page number (1-based)
 * @param {Object} annotation.position - Position { x, y } coordinates
 * @param {string} annotation.content - Annotation content/text
 * @param {Object} annotation.style - Visual style properties
 * @param {string} userId - User creating the annotation
 * @returns {Object} - Created annotation or error
 */
export const addAnnotation = (documentId, annotation, userId) => {
  // Check if document exists
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found' };
  }
  

  const hasPermission = checkPermission(documentId, userId, PERMISSION_LEVELS.EDIT);
  
  if (!hasPermission) {
    return { error: 'Permission denied' };
  }
  

  if (!Object.values(ANNOTATION_TYPES).includes(annotation.type)) {
    return { error: 'Invalid annotation type' };
  }
  
  const newAnnotation = {
    id: uuidv4(),
    documentId,
    pageNumber: annotation.pageNumber || 1,
    type: annotation.type,
    position: annotation.position || { x: 0, y: 0 },
    content: annotation.content || '',
    style: annotation.style || {},
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  

  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return { error: 'Document not found' };
  }
  

  if (!documents[documentIndex].annotations) {
    documents[documentIndex].annotations = [];
  }
  

  documents[documentIndex].annotations.push(newAnnotation);
  

  localStorage.setItem('documents', JSON.stringify(documents));
  
  return newAnnotation;
};

/**
 * Get all annotations for a document
 * @param {string} documentId - Document ID
 * @returns {Array<Object>} - Array of annotations or error
 */
export const getAnnotations = (documentId) => {
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found', annotations: [] };
  }
  
  return document.annotations || [];
};

/**
 * Get annotations for a specific page
 * @param {string} documentId - Document ID
 * @param {number} pageNumber - Page number (1-based)
 * @returns {Array<Object>} - Array of annotations for the page
 */
export const getPageAnnotations = (documentId, pageNumber) => {
  const annotations = getAnnotations(documentId);
  
  if (annotations.error) {
    return [];
  }
  
  return annotations.filter(annotation => annotation.pageNumber === pageNumber);
};

/**
 * Update an annotation
 * @param {string} documentId - Document ID
 * @param {string} annotationId - Annotation ID
 * @param {Object} updates - Updates to apply
 * @param {string} userId - User making the update
 * @returns {Object} - Updated annotation or error
 */
export const updateAnnotation = (documentId, annotationId, updates, userId) => {

  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found' };
  }
  
 
  const hasPermission = checkPermission(documentId, userId, PERMISSION_LEVELS.EDIT);
  
  if (!hasPermission) {
    return { error: 'Permission denied' };
  }
  

  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return { error: 'Document not found' };
  }
  

  const annotations = documents[documentIndex].annotations || [];
  const annotationIndex = annotations.findIndex(ann => ann.id === annotationId);
  
  if (annotationIndex === -1) {
    return { error: 'Annotation not found' };
  }
  

  if (annotations[annotationIndex].createdBy !== userId) {
    return { error: 'You can only edit your own annotations' };
  }
  

  const updatedAnnotation = {
    ...annotations[annotationIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  

  updatedAnnotation.id = annotationId;
  updatedAnnotation.documentId = documentId;
  updatedAnnotation.createdBy = annotations[annotationIndex].createdBy;
  updatedAnnotation.createdAt = annotations[annotationIndex].createdAt;
  

  documents[documentIndex].annotations[annotationIndex] = updatedAnnotation;
  

  localStorage.setItem('documents', JSON.stringify(documents));
  
  return updatedAnnotation;
};

/**
 * Delete an annotation
 * @param {string} documentId - Document ID
 * @param {string} annotationId - Annotation ID
 * @param {string} userId - User making the deletion
 * @returns {boolean} - Success status or error
 */
export const deleteAnnotation = (documentId, annotationId, userId) => {
 
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found' };
  }
  

  const hasPermission = checkPermission(documentId, userId, PERMISSION_LEVELS.EDIT);
  
  if (!hasPermission) {
    return { error: 'Permission denied' };
  }
  

  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return { error: 'Document not found' };
  }
  

  const annotations = documents[documentIndex].annotations || [];
  const annotationIndex = annotations.findIndex(ann => ann.id === annotationId);
  
  if (annotationIndex === -1) {
    return { error: 'Annotation not found' };
  }
  

  if (annotations[annotationIndex].createdBy !== userId && document.permissions?.owner !== userId) {
    return { error: 'You can only delete your own annotations' };
  }
  

  documents[documentIndex].annotations.splice(annotationIndex, 1);
  

  localStorage.setItem('documents', JSON.stringify(documents));
  
  return { success: true };
}; 