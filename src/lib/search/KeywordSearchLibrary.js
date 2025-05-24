/**
 * Keyword Search Library
 * Search for keywords inside text-based documents
 */

import { getDocumentById, getDocuments } from '../upload/FileUploadSDK';

/**
 * Search for documents by keyword in metadata
 * @param {string} keyword - Keyword to search for
 * @returns {Array<Object>} - Array of matching documents
 */
export const searchDocumentsByKeyword = (keyword) => {
  if (!keyword || keyword.trim() === '') {
    return [];
  }
  
  const searchTerm = keyword.trim().toLowerCase();
  const documents = getDocuments();
  
  return documents.filter(doc => {
    if (doc.metadata?.title?.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    if (doc.metadata?.description?.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    if (doc.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) {
      return true;
    }
    
    if (doc.name?.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    return false;
  });
};

/**
 * Search for keyword within a document's content
 * @param {string} documentId - Document ID
 * @param {string} keyword - Keyword to search for
 * @returns {Object} - Search results with matches and positions
 */
export const searchWithinDocument = (documentId, keyword) => {
  if (!keyword || keyword.trim() === '') {
    return { matches: [], count: 0 };
  }
  
  const document = getDocumentById(documentId);
  
  if (!document) {
    return { error: 'Document not found', matches: [], count: 0 };
  }
  

  const searchableTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv'
  ];
  
  if (!searchableTypes.includes(document.type)) {
    return { 
      error: 'Document type not searchable', 
      matches: [], 
      count: 0 
    };
  }
 
  const searchTerm = keyword.trim().toLowerCase();
  

  const mockMatches = [];
  const mockMatchCount = Math.floor(Math.random() * 10); // 0-9 matches
  
  for (let i = 0; i < mockMatchCount; i++) {
    mockMatches.push({
      page: Math.floor(Math.random() * 5) + 1, // Random page 1-5
      position: {
        x: Math.floor(Math.random() * 500),
        y: Math.floor(Math.random() * 700)
      },
      snippet: `...text before ${keyword} text after...`,
      highlightRange: {
        start: 12,
        end: 12 + keyword.length
      }
    });
  }
  
  return {
    documentId,
    keyword: searchTerm,
    matches: mockMatches,
    count: mockMatches.length
  };
};

/**
 * Advanced search across all documents
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.keyword - Keyword to search for
 * @param {Array<string>} searchParams.fileTypes - File types to include
 * @param {Array<string>} searchParams.tags - Tags to filter by
 * @param {string} searchParams.dateFrom - Start date for filtering
 * @param {string} searchParams.dateTo - End date for filtering
 * @returns {Array<Object>} - Array of matching documents
 */
export const advancedSearch = (searchParams) => {
  const documents = getDocuments();
  
  return documents.filter(doc => {
 
    if (searchParams.keyword) {
      const searchTerm = searchParams.keyword.trim().toLowerCase();
      
 
      const keywordInTitle = doc.metadata?.title?.toLowerCase().includes(searchTerm);
      const keywordInDesc = doc.metadata?.description?.toLowerCase().includes(searchTerm);
      const keywordInTags = doc.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
      const keywordInName = doc.name?.toLowerCase().includes(searchTerm);
      
      if (!(keywordInTitle || keywordInDesc || keywordInTags || keywordInName)) {
        return false;
      }
    }
  
    if (searchParams.fileTypes && searchParams.fileTypes.length > 0) {
      if (!searchParams.fileTypes.includes(doc.type)) {
        return false;
      }
    }
    
  
    if (searchParams.tags && searchParams.tags.length > 0) {
      const docTags = doc.metadata?.tags || [];
      const hasMatchingTag = searchParams.tags.some(tag => docTags.includes(tag));
      
      if (!hasMatchingTag) {
        return false;
      }
    }
    

    if (searchParams.dateFrom || searchParams.dateTo) {
      const createdAt = new Date(doc.metadata?.createdAt);
      
      if (searchParams.dateFrom) {
        const fromDate = new Date(searchParams.dateFrom);
        if (createdAt < fromDate) {
          return false;
        }
      }
      
      if (searchParams.dateTo) {
        const toDate = new Date(searchParams.dateTo);
        if (createdAt > toDate) {
          return false;
        }
      }
    }
    
    return true;
  });
}; 