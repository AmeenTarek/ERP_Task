import { createContext, useState, useEffect, useContext } from 'react';
import { uploadDocument, getDocuments, getDocumentById, deleteDocument, updateDocumentMetadata } from '../lib/upload/FileUploadSDK';
import { createFolder, getFolders, getFolderHierarchy, moveDocumentsToFolder } from '../lib/folders/FolderManagementSDK';
import { addTags, removeTags, setTags, getAllTags } from '../lib/tags/TaggingLibrary';
import { grantPermission, revokePermission } from '../lib/access/AccessControlLibrary';
import { createVersion, getVersions, setCurrentVersion } from '../lib/versioning/DocumentVersioningLibrary';

const DocumentContext = createContext();

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [folderHierarchy, setFolderHierarchy] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    const loadInitialData = () => {
      try {
        setLoading(true);
        
        const loadedDocuments = getDocuments();
        setDocuments(loadedDocuments);
        
        const loadedFolders = getFolders();
        setFolders(loadedFolders);
        
        const hierarchy = getFolderHierarchy();
        setFolderHierarchy(hierarchy);
        
        const allTags = getAllTags();
        setTags(allTags);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const handleUploadDocument = async (file, metadata) => {
    try {
      const newDocument = await uploadDocument(file, metadata);
      setDocuments(prev => [...prev, newDocument]);
      return newDocument;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleUpdateDocumentMetadata = (documentId, metadata, userId = 'current-user') => {
    try {
      const updatedDocument = updateDocumentMetadata(documentId, metadata, userId);
      
      if (updatedDocument.error) {
        setError(updatedDocument.error);
        return updatedDocument;
      }
      
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? updatedDocument : doc
      ));
      
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(updatedDocument);
      }
      
      return updatedDocument;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleDeleteDocument = (documentId) => {
    try {
      const success = deleteDocument(documentId);
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(null);
        }
      }
      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleSelectDocument = (documentId) => {
    const document = getDocumentById(documentId);
    setSelectedDocument(document);
    return document;
  };

  const handleCreateFolder = (name, parentId = null) => {
    try {
      const newFolder = createFolder(name, parentId);
      setFolders(prev => [...prev, newFolder]);
      
      const hierarchy = getFolderHierarchy();
      setFolderHierarchy(hierarchy);
      
      return newFolder;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleSelectFolder = (folderId) => {
    const selectedFolder = folderId ? folders.find(f => f.id === folderId) : null;
    setSelectedFolder(selectedFolder);
    return selectedFolder;
  };

  const handleMoveDocumentsToFolder = (documentIds, folderId) => {
    try {
      const success = moveDocumentsToFolder(documentIds, folderId);
      if (success) {
        const updatedDocuments = getDocuments();
        setDocuments(updatedDocuments);
      }
      return success;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleAddTags = (documentId, newTags) => {
    try {
      const updatedDocument = addTags(documentId, newTags);
      if (updatedDocument) {
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId ? updatedDocument : doc
        ));
        
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(updatedDocument);
        }
        
        const allTags = getAllTags();
        setTags(allTags);
      }
      return updatedDocument;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleRemoveTags = (documentId, tagsToRemove) => {
    try {
      const updatedDocument = removeTags(documentId, tagsToRemove);
      if (updatedDocument) {
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId ? updatedDocument : doc
        ));
        
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(updatedDocument);
        }
        
        const allTags = getAllTags();
        setTags(allTags);
      }
      return updatedDocument;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleCreateVersion = async (documentId, file, userId, comment) => {
    try {
      const newVersion = await createVersion(documentId, file, userId, comment);
      if (!newVersion.error) {
        const updatedDocuments = getDocuments();
        setDocuments(updatedDocuments);
        
        if (selectedDocument?.id === documentId) {
          const updatedDoc = getDocumentById(documentId);
          setSelectedDocument(updatedDoc);
        }
      }
      return newVersion;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleSetCurrentVersion = (documentId, versionNumber, userId) => {
    try {
      const result = setCurrentVersion(documentId, versionNumber, userId);
      if (!result.error) {
        const updatedDocuments = getDocuments();
        setDocuments(updatedDocuments);
        
        if (selectedDocument?.id === documentId) {
          const updatedDoc = getDocumentById(documentId);
          setSelectedDocument(updatedDoc);
        }
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleGrantPermission = (documentId, userId, permissionLevel) => {
    try {
      const updatedDocument = grantPermission(documentId, userId, permissionLevel);
      if (updatedDocument) {
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId ? updatedDocument : doc
        ));
        
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(updatedDocument);
        }
      }
      return updatedDocument;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleRevokePermission = (documentId, userId) => {
    try {
      const updatedDocument = revokePermission(documentId, userId);
      if (updatedDocument) {
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId ? updatedDocument : doc
        ));
        
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(updatedDocument);
        }
      }
      return updatedDocument;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const contextValue = {
    documents,
    folders,
    folderHierarchy,
    tags,
    loading,
    error,
    selectedDocument,
    selectedFolder,
    uploadDocument: handleUploadDocument,
    updateDocumentMetadata: handleUpdateDocumentMetadata,
    deleteDocument: handleDeleteDocument,
    selectDocument: handleSelectDocument,
    createFolder: handleCreateFolder,
    selectFolder: handleSelectFolder,
    moveDocumentsToFolder: handleMoveDocumentsToFolder,
    addTags: handleAddTags,
    removeTags: handleRemoveTags,
    createVersion: handleCreateVersion,
    setCurrentVersion: handleSetCurrentVersion,
    grantPermission: handleGrantPermission,
    revokePermission: handleRevokePermission,
  };

  return (
    <DocumentContext.Provider value={contextValue}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}

export default DocumentContext; 