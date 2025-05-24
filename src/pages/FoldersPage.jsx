import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDocuments } from "../context/DocumentContext";

function FoldersPage() {
  const navigate = useNavigate();
  const { folders, createFolder, loading } = useDocuments();
  const [newFolderName, setNewFolderName] = useState("");
  const [error, setError] = useState(null);

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setError("Please enter a folder name");
      return;
    }

    try {
      createFolder(newFolderName);
      setNewFolderName("");
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading folders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Folders</h1>
            <p className="text-gray-600 mt-1">
              {folders.length} {folders.length === 1 ? "folder" : "folders"}
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateFolder} className="mt-4 flex items-center">
          <input
            type="text"
            className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="New folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <button
            type="submit"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Folder
          </button>
        </form>

        {error && (
          <div className="mt-3 text-sm text-red-600">{error}</div>
        )}
      </div>

      {folders.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No folders</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a folder to organize your documents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div key={folder.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <Link 
                    to={`/folders/${folder.id}`} 
                    className="text-lg font-medium text-blue-600 hover:text-blue-800"
                  >
                    {folder.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    Created on {new Date(folder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FoldersPage; 