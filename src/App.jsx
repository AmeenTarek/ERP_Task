import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DocumentProvider } from "./context/DocumentContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import DocumentsPage from "./pages/DocumentsPage";
import DocumentViewerPage from "./pages/DocumentViewerPage";
import FoldersPage from "./pages/FoldersPage";
import UploadPage from "./pages/UploadPage";
import SearchPage from "./pages/SearchPage";

function App() {
  return (
    <BrowserRouter>
      <DocumentProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="documents/:documentId" element={<DocumentViewerPage />} />
            <Route path="folders" element={<FoldersPage />} />
            <Route path="folders/:folderId" element={<DocumentsPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="search" element={<SearchPage />} />
          </Route>
        </Routes>
      </DocumentProvider>
    </BrowserRouter>
  );
}

export default App;
