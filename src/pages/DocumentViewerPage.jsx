import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDocuments } from "../context/DocumentContext";
import { getDocumentPreviewConfig } from "../lib/viewer/DocumentViewerSDK";
import { getVersions, setCurrentVersion } from "../lib/versioning/DocumentVersioningLibrary";

function DocumentViewerPage() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { documents, selectDocument, loading, updateDocumentMetadata } = useDocuments();
  const [document, setDocument] = useState(null);
  const [previewConfig, setPreviewConfig] = useState(null);
  const [versions, setVersions] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState({});

  useEffect(() => {
    if (!documentId || loading) return;

    const doc = documents.find(d => d.id === documentId);
    if (!doc) {
      setError("Document not found");
      return;
    }

    selectDocument(documentId);
    setDocument(doc);

    const config = getDocumentPreviewConfig(documentId);
    setPreviewConfig(config);

    const docVersions = getVersions(documentId);
    if (Array.isArray(docVersions)) {
      setVersions(docVersions);
    }
  }, [documentId, documents, loading, selectDocument]);

  const handleVersionChange = async (versionNumber) => {
    try {
      const userId = "current-user";
      const result = await setCurrentVersion(documentId, versionNumber, userId);
      
      if (result.error) {
        setError(result.error);
      } else {
        const updatedDoc = documents.find(d => d.id === documentId);
        setDocument(updatedDoc);
        
        const config = getDocumentPreviewConfig(documentId);
        setPreviewConfig(config);
      }
    } catch (err) {
      setError(err.message || "Failed to change version");
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedMetadata({
        title: document.metadata.title || "",
        description: document.metadata.description || "",
        tags: document.metadata.tags || []
      });
    }
    setIsEditing(!isEditing);
  };
  
  const handleMetadataChange = (field, value) => {
    setEditedMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleTagsChange = (tagsString) => {
    const tagsArray = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    setEditedMetadata(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };
  
  const handleSaveMetadata = () => {
    const result = updateDocumentMetadata(document.id, editedMetadata);
    if (!result.error) {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!document || !previewConfig) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Document not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The document you're looking for doesn't exist or has been deleted.
        </p>
        <div className="mt-6">
          <Link
            to="/documents"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View all documents
          </Link>
        </div>
      </div>
    );
  }

  const renderPreview = () => {
    const { viewerType, url } = previewConfig;

    switch (viewerType) {
      case 'pdf':
        return (
          <div className="w-full h-[70vh] border border-gray-200 rounded">
            <iframe
              src={url}
              title={document.metadata.title || document.name}
              className="w-full h-full"
            />
          </div>
        );
      case 'image':
        return (
          <div className="w-full flex justify-center">
            <img
              src={url}
              alt={document.metadata.title || document.name}
              className="max-h-[70vh] max-w-full object-contain"
            />
          </div>
        );
      case 'text':
        return (
          <div className="w-full h-[70vh] border border-gray-200 rounded p-4 overflow-auto bg-gray-50">
            <pre className="whitespace-pre-wrap"></pre>
          </div>
        );
      default:
        return (
          <div className="w-full text-center py-12 bg-gray-50 border border-gray-200 rounded">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Preview not available</h3>
            <p className="mt-1 text-sm text-gray-500">
              This file type ({document.type}) cannot be previewed in the browser.
            </p>
            <div className="mt-6">
              <a
                href={url}
                download={document.name}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Download File
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {document.metadata.title || document.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {document.type} • {(document.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <a
              href={document.url}
              download={document.name}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-6 py-3 border-b-2 text-sm font-medium ${
              activeTab === "preview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-6 py-3 border-b-2 text-sm font-medium ${
              activeTab === "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("versions")}
            className={`px-6 py-3 border-b-2 text-sm font-medium ${
              activeTab === "versions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Versions <span className="ml-1 text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">{versions.length}</span>
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "preview" && renderPreview()}

        {activeTab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Document Information</h3>
                <button 
                  onClick={handleEditToggle}
                  className={`px-3 py-1 rounded text-sm ${isEditing ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-1 w-full text-sm border border-gray-300 rounded p-2"
                      value={editedMetadata.title || ''}
                      onChange={(e) => handleMetadataChange('title', e.target.value)}
                    />
                  ) : (
                    <dd className="mt-1 text-sm text-gray-900">{document.metadata.title || "-"}</dd>
                  )}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  {isEditing ? (
                    <textarea
                      className="mt-1 w-full text-sm border border-gray-300 rounded p-2"
                      value={editedMetadata.description || ''}
                      onChange={(e) => handleMetadataChange('description', e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <dd className="mt-1 text-sm text-gray-900">{document.metadata.description || "-"}</dd>
                  )}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">{(document.size / 1024 / 1024).toFixed(2)} MB</dd>
                </div>
              </dl>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Metadata</h3>
                {isEditing && (
                  <button
                    onClick={handleSaveMetadata}
                    className="px-3 py-1 rounded text-sm bg-green-100 text-green-700"
                  >
                    Save Changes
                  </button>
                )}
              </div>
              
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(document.metadata.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(document.metadata.updatedAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Current Version</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {document.currentVersion || 1}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="mt-1">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full text-sm border border-gray-300 rounded p-2"
                        placeholder="Enter tags separated by commas"
                        value={editedMetadata.tags ? editedMetadata.tags.join(', ') : ''}
                        onChange={(e) => handleTagsChange(e.target.value)}
                      />
                    ) : document.metadata.tags && document.metadata.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {document.metadata.tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No tags</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === "versions" && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Version History</h3>
            
            {versions.length === 0 ? (
              <p className="text-gray-500">No version history available.</p>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Version</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Size</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Comment</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {versions.map((version) => (
                      <tr key={version.id} className={version.number === document.currentVersion ? "bg-blue-50" : ""}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {version.number}
                          {version.number === document.currentVersion && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Current
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(version.createdAt).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {(version.size / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {version.comment || "-"}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {version.number !== document.currentVersion ? (
                            <button
                              onClick={() => handleVersionChange(version.number)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Set as Current
                            </button>
                          ) : (
                            <span className="text-gray-400">Current Version</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentViewerPage; 