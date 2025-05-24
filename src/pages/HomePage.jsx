import { Link } from "react-router-dom";
import { useDocuments } from "../context/DocumentContext";

function HomePage() {
  const { documents, folders, tags, loading } = useDocuments();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading document management system...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to Document Manager</h1>
        <p className="text-gray-600 mb-6">
          A comprehensive document management system that allows you to upload, organize, view, and collaborate on various document types.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/upload"
            className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg border border-blue-200 flex flex-col items-center text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h3 className="font-semibold text-lg mb-1">Upload Documents</h3>
            <p className="text-gray-600 text-sm">Upload PDF, Word, Excel, and other document formats</p>
          </Link>
          <Link
            to="/documents"
            className="bg-green-50 hover:bg-green-100 p-6 rounded-lg border border-green-200 flex flex-col items-center text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="font-semibold text-lg mb-1">View Documents</h3>
            <p className="text-gray-600 text-sm">Browse and view your document collection</p>
          </Link>
          <Link
            to="/folders"
            className="bg-purple-50 hover:bg-purple-100 p-6 rounded-lg border border-purple-200 flex flex-col items-center text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h3 className="font-semibold text-lg mb-1">Manage Folders</h3>
            <p className="text-gray-600 text-sm">Organize your documents into folders</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Documents Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="text-3xl font-bold text-blue-600 mb-2">{documents.length}</div>
          <p className="text-gray-600 mb-4">Total documents in your system</p>
          <Link to="/documents" className="text-blue-600 hover:text-blue-800 font-medium">
            View all documents &rarr;
          </Link>
        </div>

        {/* Folders Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Folders</h2>
          <div className="text-3xl font-bold text-purple-600 mb-2">{folders.length}</div>
          <p className="text-gray-600 mb-4">Organizational folders</p>
          <Link to="/folders" className="text-blue-600 hover:text-blue-800 font-medium">
            Manage folders &rarr;
          </Link>
        </div>

        {/* Tags Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tags</h2>
          <div className="text-3xl font-bold text-green-600 mb-2">{tags.length}</div>
          <p className="text-gray-600 mb-4">Document classification tags</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {tags.length > 5 && (
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                +{tags.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 