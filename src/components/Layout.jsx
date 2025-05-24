import { Outlet, Link } from "react-router-dom";
import { useDocuments } from "../context/DocumentContext";

function Layout() {
  const { documents, folders } = useDocuments();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Document Manager</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/" className="block p-2 hover:bg-gray-100 rounded">
                Home
              </Link>
            </li>
            <li>
              <Link to="/documents" className="block p-2 hover:bg-gray-100 rounded">
                All Documents <span className="text-gray-500">({documents.length})</span>
              </Link>
            </li>
            <li>
              <Link to="/folders" className="block p-2 hover:bg-gray-100 rounded">
                Folders <span className="text-gray-500">({folders.length})</span>
              </Link>
            </li>
            <li>
              <Link to="/upload" className="block p-2 hover:bg-gray-100 rounded">
                Upload
              </Link>
            </li>
            <li>
              <Link to="/search" className="block p-2 hover:bg-gray-100 rounded">
                Search
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-xl text-gray-800">
                Document Management System
              </h2>
              <div>
                <Link
                  to="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload New Document
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout; 