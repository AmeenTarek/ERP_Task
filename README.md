# Document Manager

A comprehensive document management system that allows users to upload, organize, view, and collaborate on various document types.

## Features

- **File Upload SDK**: Upload PDF, Word, Excel, and other document formats with metadata
- **File Type Validation**: Validate file types and sizes during upload
- **Folder Management**: Create, edit, and delete folders to organize documents
- **Tagging System**: Add, edit, and remove tags for documents
- **Role-Based Access Control**: Assign view, edit, or download permissions to users
- **Document Viewer**: In-platform viewing for PDF, Word, and other document formats
- **Keyword Search**: Search for keywords inside text-based documents
- **Multi-Page Navigation**: Navigate through multi-page documents
- **Document Annotation**: Add comments and highlights to documents
- **Document Versioning**: Manage multiple versions of the same document

## Installation

```bash
npm install
npm run dev
```

## Usage

1. **Upload Documents**: Drag and drop or select files to upload
2. **Organize**: Create folders and add tags to keep your documents organized
3. **View & Annotate**: Open documents in the built-in viewer to read and annotate
4. **Share & Collaborate**: Set permissions and share documents with team members
5. **Search**: Find documents quickly with full-text search capabilities

## Tech Stack

- React with Vite
- Tailwind CSS for styling
- PDF.js and other libraries for document viewing
- React Router for navigation
- Context API for state management

## Libraries Used

- pdf-lib: PDF manipulation
- react-pdf: PDF viewing
- docx-preview: Word document preview
- xlsx: Excel file handling
- react-dropzone: File upload interface
- file-saver: Download functionality
- uuid: Unique ID generation

## Project Structure

```
src/
├── components/    # Reusable UI components
├── context/       # React context for state management
├── lib/           # Core libraries for document management
│   ├── upload/    # File Upload SDK
│   ├── validation/# File Type Validation Library
│   ├── folders/   # Folder Management SDK
│   ├── tags/      # Tagging Library
│   ├── access/    # Role-Based Access Control Library
│   ├── viewer/    # Document Viewer SDK
│   ├── search/    # Keyword Search Library
│   ├── navigation/# Multi-Page Navigation SDK
│   ├── annotation/# Document Annotation SDK
│   └── versioning/# Document Versioning Library
├── pages/         # Application pages/routes
└── utils/         # Utility functions
```


