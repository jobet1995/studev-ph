"use client";

import { useState } from 'react';
import Layout from '../components/Layout';

// Mock data for media files
const mockMediaFiles = [
  { id: '1', name: 'blog-header.jpg', type: 'image', size: '2.4 MB', uploaded: '2023-05-15', url: '#' },
  { id: '2', name: 'event-banner.png', type: 'image', size: '1.8 MB', uploaded: '2023-05-10', url: '#' },
  { id: '3', name: 'presentation.pdf', type: 'document', size: '5.2 MB', uploaded: '2023-05-08', url: '#' },
  { id: '4', name: 'logo.svg', type: 'image', size: '0.3 MB', uploaded: '2023-05-05', url: '#' },
  { id: '5', name: 'tutorial.mp4', type: 'video', size: '45.7 MB', uploaded: '2023-05-01', url: '#' },
  { id: '6', name: 'infographic.jpg', type: 'image', size: '3.1 MB', uploaded: '2023-04-28', url: '#' },
  { id: '7', name: 'report.docx', type: 'document', size: '1.5 MB', uploaded: '2023-04-25', url: '#' },
  { id: '8', name: 'demo.mov', type: 'video', size: '120.4 MB', uploaded: '2023-04-20', url: '#' },
];

const MediaLibraryPage = () => {
  const [files, setFiles] = useState(mockMediaFiles);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'document' | 'video'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = files.filter(file => {
    const matchesFilter = filter === 'all' || file.type === filter;
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSelectFile = (id: string) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter(fileId => fileId !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.length > 0 && confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) {
      setFiles(files.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return (
          <div className="bg-blue-100 rounded-lg w-16 h-16 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'document':
        return (
          <div className="bg-yellow-100 rounded-lg w-16 h-16 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'video':
        return (
          <div className="bg-purple-100 rounded-lg w-16 h-16 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin' },
    { id: 'analytics', label: 'Analytics', href: '/admin/analytics' },
    { id: 'media', label: 'Media Library', href: '/admin/media' },
    { id: 'create', label: 'Create Content', href: '/admin#create' },
    { id: 'manage', label: 'Manage Content', href: '/admin#manage' },
    { id: 'users', label: 'Users', href: '/admin/users' },
    { id: 'settings', label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <Layout 
      title="Admin Dashboard" 
      sidebarTitle="StuDev Admin" 
      sidebarItems={sidebarItems}
      sidebarSelectedItem="media"
      user={{ name: 'Admin User', avatar: undefined }}
      onLogout={() => alert('Logout functionality would go here')}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-800">Manage your uploaded files and media assets</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex space-x-2">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition duration-200">
            Upload File
          </button>
          {selectedFiles.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition duration-200"
            >
              Delete Selected ({selectedFiles.length})
            </button>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'image' | 'document' | 'video')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
          </select>
          
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Files</p>
          <p className="text-2xl font-bold text-gray-900">{files.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Size</p>
          <p className="text-2xl font-bold text-gray-900">
            {files.reduce((acc, file) => acc + parseFloat(file.size), 0).toFixed(1)} MB
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Selected</p>
          <p className="text-2xl font-bold text-gray-900">{selectedFiles.length}</p>
        </div>
      </div>

      {/* File Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map(file => (
            <div 
              key={file.id} 
              className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition duration-200 ${
                selectedFiles.includes(file.id) 
                  ? 'border-indigo-500 ring-2 ring-indigo-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSelectFile(file.id)}
            >
              <div className="flex flex-col items-center text-center">
                {getFileIcon(file.type)}
                <div className="mt-3 w-full">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.size}</p>
                  <p className="text-xs text-gray-400">{file.uploaded}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading a file.</p>
          <div className="mt-6">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition duration-200">
              Upload File
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredFiles.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(filteredFiles.length, 12)}</span> of{' '}
            <span className="font-medium">{filteredFiles.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 rounded-md border border-gray-300 bg-indigo-600 text-white text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MediaLibraryPage;