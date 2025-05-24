

import { getDocumentById } from '../upload/FileUploadSDK';


export const PERMISSION_LEVELS = {
  VIEW: 'view',       
  EDIT: 'edit',      
  DOWNLOAD: 'download', 
  ADMIN: 'admin'   
};

/**
 * Grant permission to a user for a document
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @param {string} permissionLevel - Permission level (from PERMISSION_LEVELS)
 * @returns {Object|null} - Updated document or null if not found
 */
export const grantPermission = (documentId, userId, permissionLevel) => {
 
  if (!Object.values(PERMISSION_LEVELS).includes(permissionLevel)) {
    throw new Error(`Invalid permission level: ${permissionLevel}`);
  }
  

  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return null;
  }
  

  const document = documents[documentIndex];
  const currentPermissions = document.permissions?.access || [];
  

  const existingPermissionIndex = currentPermissions.findIndex(
    permission => permission.userId === userId
  );
  
  let updatedPermissions;
  
  if (existingPermissionIndex !== -1) {
   
    updatedPermissions = [...currentPermissions];
    updatedPermissions[existingPermissionIndex] = {
      ...updatedPermissions[existingPermissionIndex],
      level: permissionLevel
    };
  } else {

    updatedPermissions = [
      ...currentPermissions,
      { userId, level: permissionLevel }
    ];
  }
  

  documents[documentIndex] = {
    ...document,
    permissions: {
      ...document.permissions,
      access: updatedPermissions
    }
  };
  

  localStorage.setItem('documents', JSON.stringify(documents));
  
  return documents[documentIndex];
};

/**
 * Revoke permission for a user
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @returns {Object|null} - Updated document or null if not found
 */
export const revokePermission = (documentId, userId) => {
  
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return null;
  }
  

  const document = documents[documentIndex];
  const currentPermissions = document.permissions?.access || [];
  

  const updatedPermissions = currentPermissions.filter(
    permission => permission.userId !== userId
  );
  

  if (updatedPermissions.length === currentPermissions.length) {
    return document;
  }
  

  documents[documentIndex] = {
    ...document,
    permissions: {
      ...document.permissions,
      access: updatedPermissions
    }
  };
  

  localStorage.setItem('documents', JSON.stringify(documents));
  
  return documents[documentIndex];
};

/**
 * Check if a user has a specific permission level for a document
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @param {string} requiredLevel - Required permission level
 * @returns {boolean} - Whether the user has the required permission
 */
export const checkPermission = (documentId, userId, requiredLevel) => {

  const document = getDocumentById(documentId);
  
  if (!document) {
    return false;
  }
  

  if (document.permissions?.owner === userId) {
    return true;
  }
  

  const userPermission = document.permissions?.access?.find(
    permission => permission.userId === userId
  );
  
  if (!userPermission) {
    return false;
  }
  

  const permissionHierarchy = {
    [PERMISSION_LEVELS.ADMIN]: 4,
    [PERMISSION_LEVELS.EDIT]: 3,
    [PERMISSION_LEVELS.DOWNLOAD]: 2,
    [PERMISSION_LEVELS.VIEW]: 1
  };
  
  const userLevel = permissionHierarchy[userPermission.level] || 0;
  const requiredLevelValue = permissionHierarchy[requiredLevel] || 0;
  
  return userLevel >= requiredLevelValue;
};

/**
 * Get all users with access to a document
 * @param {string} documentId - Document ID
 * @returns {Array<Object>} - Array of { userId, level } objects
 */
export const getDocumentUsers = (documentId) => {
  const document = getDocumentById(documentId);
  
  if (!document || !document.permissions) {
    return [];
  }
  

  const users = document.permissions.access || [];
  
  if (document.permissions.owner) {
    users.push({
      userId: document.permissions.owner,
      level: PERMISSION_LEVELS.ADMIN,
      isOwner: true
    });
  }
  
  return users;
};

/**
 * Transfer document ownership
 * @param {string} documentId - Document ID
 * @param {string} currentOwnerId - Current owner ID
 * @param {string} newOwnerId - New owner ID
 * @returns {Object|null} - Updated document or null if not found or unauthorized
 */
export const transferOwnership = (documentId, currentOwnerId, newOwnerId) => {

  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  const documentIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (documentIndex === -1) {
    return null;
  }
  
  const document = documents[documentIndex];
  

  if (document.permissions?.owner !== currentOwnerId) {
    return null; 
  }
  

  documents[documentIndex] = {
    ...document,
    permissions: {
      ...document.permissions,
      owner: newOwnerId
    }
  };
  

  localStorage.setItem('documents', JSON.stringify(documents));
  
  return documents[documentIndex];
}; 