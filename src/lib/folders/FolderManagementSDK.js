/**
 * Folder Management SDK
 * Create, edit, and delete folders for organizing documents
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new folder
 * @param {string} name - Folder name
 * @param {string|null} parentId - Parent folder ID (optional)
 * @returns {Object} - Created folder object
 */
export const createFolder = (name, parentId = null) => {
  if (!name || name.trim() === '') {
    throw new Error('Folder name is required');
  }
  
  // Create folder object
  const folder = {
    id: uuidv4(),
    name: name.trim(),
    parentId: parentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Store folder in localStorage
  const folders = getFolders();
  folders.push(folder);
  localStorage.setItem('folders', JSON.stringify(folders));
  
  return folder;
};

/**
 * Get all folders
 * @returns {Array<Object>} - Array of folder objects
 */
export const getFolders = () => {
  return JSON.parse(localStorage.getItem('folders') || '[]');
};

/**
 * Get folder by ID
 * @param {string} folderId - Folder ID
 * @returns {Object|null} - Folder object or null if not found
 */
export const getFolderById = (folderId) => {
  const folders = getFolders();
  return folders.find(folder => folder.id === folderId) || null;
};

/**
 * Update folder
 * @param {string} folderId - Folder ID
 * @param {Object} updates - Updates to apply
 * @param {string} updates.name - New folder name
 * @param {string|null} updates.parentId - New parent folder ID
 * @returns {Object|null} - Updated folder object or null if not found
 */
export const updateFolder = (folderId, updates) => {
  const folders = getFolders();
  const folderIndex = folders.findIndex(folder => folder.id === folderId);
  
  if (folderIndex === -1) {
    return null;
  }
  
  // Validate updates
  if (updates.name && updates.name.trim() === '') {
    throw new Error('Folder name cannot be empty');
  }
  
  // Check for circular reference
  if (updates.parentId && updates.parentId === folderId) {
    throw new Error('Folder cannot be its own parent');
  }
  
  // Check if new parent exists
  if (updates.parentId && !getFolderById(updates.parentId)) {
    throw new Error('Parent folder does not exist');
  }
  
  // Apply updates
  folders[folderIndex] = {
    ...folders[folderIndex],
    name: updates.name !== undefined ? updates.name.trim() : folders[folderIndex].name,
    parentId: updates.parentId !== undefined ? updates.parentId : folders[folderIndex].parentId,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem('folders', JSON.stringify(folders));
  
  return folders[folderIndex];
};

/**
 * Delete folder
 * @param {string} folderId - Folder ID
 * @returns {boolean} - Success status
 */
export const deleteFolder = (folderId) => {
  const folders = getFolders();
  
  // Check if folder exists
  if (!folders.some(folder => folder.id === folderId)) {
    return false;
  }
  
  // Check if folder has children
  if (folders.some(folder => folder.parentId === folderId)) {
    throw new Error('Cannot delete folder with subfolders');
  }
  
  // Get documents in this folder
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  if (documents.some(doc => doc.folderId === folderId)) {
    throw new Error('Cannot delete folder containing documents');
  }
  
  // Remove folder
  const updatedFolders = folders.filter(folder => folder.id !== folderId);
  localStorage.setItem('folders', JSON.stringify(updatedFolders));
  
  return true;
};

/**
 * Get folder hierarchy
 * @returns {Array<Object>} - Folder tree structure
 */
export const getFolderHierarchy = () => {
  const folders = getFolders();
  
  // Create a map of folders by ID for quick lookup
  const folderMap = {};
  folders.forEach(folder => {
    folderMap[folder.id] = {
      ...folder,
      children: []
    };
  });
  
  // Build the hierarchy
  const rootFolders = [];
  folders.forEach(folder => {
    if (folder.parentId && folderMap[folder.parentId]) {
      // Add as child to parent
      folderMap[folder.parentId].children.push(folderMap[folder.id]);
    } else {
      // Add to root folders
      rootFolders.push(folderMap[folder.id]);
    }
  });
  
  return rootFolders;
};

/**
 * Move documents to folder
 * @param {Array<string>} documentIds - Array of document IDs
 * @param {string|null} folderId - Destination folder ID (null for root)
 * @returns {boolean} - Success status
 */
export const moveDocumentsToFolder = (documentIds, folderId) => {
  // Validate folder exists if not null
  if (folderId && !getFolderById(folderId)) {
    throw new Error('Destination folder does not exist');
  }
  
  const documents = JSON.parse(localStorage.getItem('documents') || '[]');
  let updated = false;
  
  // Update folder ID for each document
  const updatedDocuments = documents.map(doc => {
    if (documentIds.includes(doc.id)) {
      updated = true;
      return {
        ...doc,
        folderId: folderId,
        metadata: {
          ...doc.metadata,
          updatedAt: new Date().toISOString()
        }
      };
    }
    return doc;
  });
  
  if (updated) {
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));
  }
  
  return updated;
}; 