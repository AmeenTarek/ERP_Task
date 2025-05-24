import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocuments } from "../context/DocumentContext";
import { searchDocumentsByKeyword, advancedSearch } from "../lib/search/KeywordSearchLibrary";

function SearchPage() {
  const navigate = useNavigate();
  const { tags } = useDocuments();
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    fileTypes: [],
    tags: [],
    dateFrom: "",
    dateTo: ""
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (showAdvanced) {
        // Advanced search with filters
        const results = advancedSearch({
          keyword,
          ...advancedFilters
        });
        setSearchResults(results);
      } else {
        // Simple keyword search
        const results = searchDocumentsByKeyword(keyword);
        setSearchResults(results);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag) => {
    setAdvancedFilters(prev => {
      if (prev.tags.includes(tag)) {
        return {
          ...prev,
          tags: prev.tags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          tags: [...prev.tags, tag]
        };
      }
    });
  };

  const handleFileTypeToggle = (type) => {
    setAdvancedFilters(prev => {
      if (prev.fileTypes.includes(type)) {
        return {
          ...prev,
          fileTypes: prev.fileTypes.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          fileTypes: [...prev.fileTypes, type]
        };
      }
    });
  };

  const handleViewDocument = (documentId) => {
    navigate(`/documents/${documentId}`);
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // File type groups for filtering
  const fileTypeGroups = [
    { label: "PDF", value: "application/pdf" },
    { label: "Word", value: "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { label: "Excel", value: "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    { label: "Images", value: "image/jpeg,image/png,image/gif" },
    { label: "Text", value: "text/plain,text/csv" }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Search Documents</h1>

      <form onSubmit={handleSearch}>
        <div className="flex">
          <input
            type="text"
            className="flex-grow shadow appearance-none border rounded-l py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Search for keywords, titles, or tags..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </div>
            ) : (
              "Search"
            )}
          </button>
        </div>

        <div className="mt-2">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Hide advanced search" : "Show advanced search"}
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">File Types</h3>
                <div className="space-y-2">
                  {fileTypeGroups.map(group => (
                    <label key={group.label} className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={group.value.split(',').some(type => advancedFilters.fileTypes.includes(type))}
                        onChange={() => handleFileTypeToggle(group.value.split(','))}
                      />
                      <span className="ml-2 text-sm text-gray-700">{group.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-700">From</label>
                    <input
                      type="date"
                      className="mt-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={advancedFilters.dateFrom}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">To</label>
                    <input
                      type="date"
                      className="mt-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={advancedFilters.dateTo}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`text-xs px-2 py-1 rounded ${
                      advancedFilters.tags.includes(tag)
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    } hover:bg-blue-50`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Search Results */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Search Results {searchResults.length > 0 && `(${searchResults.length})`}
        </h2>

        {searchResults.length === 0 ? (
          keyword ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-gray-600">No documents found matching your search criteria.</p>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-2 text-gray-600">Enter a search term to find documents.</p>
            </div>
          )
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Document</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Size</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Updated</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {searchResults.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center">
                          {doc.type.includes('pdf') ? (
                            <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                              <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                            </svg>
                          ) : doc.type.includes('image') ? (
                            <svg className="h-8 w-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{doc.metadata.title || doc.name}</div>
                          {doc.metadata.description && (
                            <div className="text-gray-500 truncate max-w-xs">{doc.metadata.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {doc.type.split('/')[1]?.toUpperCase() || doc.type}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {new Date(doc.metadata.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleViewDocument(doc.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage; 