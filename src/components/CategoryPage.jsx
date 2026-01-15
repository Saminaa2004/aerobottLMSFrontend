import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Image as ImageIcon, FileText, Video, Trash2, FolderOpen, Download, File, ExternalLink, CheckSquare, Square, X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

const API_URL = 'http://localhost:5000/api';

const CategoryPage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [contents, setContents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    fetchCategoryData();
  }, [categoryId, navigate]);

  const fetchCategoryData = async () => {
    const token = localStorage.getItem('access_token');
    
    try {
      const categoryResponse = await fetch(`${API_URL}/categories/${categoryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!categoryResponse.ok) {
        navigate('/dashboard');
        return;
      }

      const categoryData = await categoryResponse.json();
      setCategory(categoryData.category);

      const contentResponse = await fetch(`${API_URL}/categories/${categoryId}/content`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setContents(contentData.content || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching category data:', error);
      setLoading(false);
    }
  };

  const determineFileType = (file) => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType === 'application/pdf') return 'pdf';
    
    if (fileName.endsWith('.pdf')) return 'pdf';
    if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx') || fileType.includes('presentation')) return 'ppt';
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileType.includes('document')) return 'document';
    
    return 'document';
  };

  const handleFileUpload = async (files) => {
    const token = localStorage.getItem('access_token');
    
    for (const file of files) {
      const fileType = determineFileType(file);
      const fileUrl = URL.createObjectURL(file);
      
      try {
        await fetch(`${API_URL}/categories/${categoryId}/content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: file.name,
            type: fileType,
            url: fileUrl,
            description: `Uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
          })
        });
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    
    fetchCategoryData();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDeleteContent = async (contentId) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_URL}/content/${contentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchCategoryData();
      }
    } catch (error) {
      console.error('Delete content error:', error);
    }
  };

  const handleOpenInNewTab = (content) => {
    window.open(content.url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadContent = async (content) => {
    try {
      const response = await fetch(content.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = content.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. The file may no longer be available.');
    }
  };

  const toggleSelection = (contentId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(contentId)) {
      newSelected.delete(contentId);
    } else {
      newSelected.add(contentId);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    const filtered = getFilteredContents();
    setSelectedItems(new Set(filtered.map(c => c._id)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleBulkDownload = async () => {
    const selected = contents.filter(c => selectedItems.has(c._id));
    
    for (const content of selected) {
      await handleDownloadContent(content);
      // Add delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) return;

    const token = localStorage.getItem('access_token');
    
    for (const contentId of selectedItems) {
      try {
        await fetch(`${API_URL}/content/${contentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
    
    setIsSelectionMode(false);
    setSelectedItems(new Set());
    fetchCategoryData();
  };

  const getFilteredContents = () => {
    if (activeFilter === 'all') return contents;
    return contents.filter(c => c.type === activeFilter);
  };

  const getContentCount = (type) => {
    if (type === 'all') return contents.length;
    return contents.filter(c => c.type === type).length;
  };

  const getContentIcon = (type) => {
    switch(type) {
      case 'video':
        return <Video className="w-8 h-8 text-red-500" />;
      case 'image':
        return <ImageIcon className="w-8 h-8 text-green-500" />;
      case 'ppt':
        return <FileText className="w-8 h-8 text-orange-500" />;
      case 'pdf':
        return <File className="w-8 h-8 text-red-600" />;
      case 'document':
        return <FileText className="w-8 h-8 text-blue-500" />;
      default:
        return <FileText className="w-8 h-8 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header with Selection Mode Toggle */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {category?.name || 'Category'}
            </h1>
            
            {contents.length > 0 && (
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedItems(new Set());
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {isSelectionMode ? (
                  <>
                    <X className="w-4 h-4" />
                    Exit Selection
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    Select Multiple
                  </>
                )}
              </button>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {isSelectionMode && selectedItems.size > 0 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Deselect All
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mb-8 bg-white rounded-xl border-2 border-dashed p-12 text-center transition-all ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Drag & drop files here
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse • Images, PDFs, PPTs, Videos, Documents (max 50MB)
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.ppt,.pptx,.doc,.docx"
                onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Browse Files
              </label>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeFilter === 'all' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {getContentCount('all')}
              </span>
              {activeFilter === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('image')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                activeFilter === 'image' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Images
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {getContentCount('image')}
              </span>
              {activeFilter === 'image' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('pdf')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                activeFilter === 'pdf' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <File className="w-4 h-4" />
              PDFs
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {getContentCount('pdf')}
              </span>
              {activeFilter === 'pdf' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('ppt')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                activeFilter === 'ppt' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              PPT
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {getContentCount('ppt')}
              </span>
              {activeFilter === 'ppt' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('video')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                activeFilter === 'video' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Video className="w-4 h-4" />
              Videos
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {getContentCount('video')}
              </span>
              {activeFilter === 'video' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>

          {/* Content Grid */}
          {getFilteredContents().length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
              <p className="text-gray-500">Upload some content to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getFilteredContents().map((content) => (
                <div
                  key={content._id}
                  onClick={() => isSelectionMode && toggleSelection(content._id)}
                  className={`group relative bg-white rounded-lg border p-3 hover:shadow-md transition-all ${
                    isSelectionMode ? 'cursor-pointer' : ''
                  } ${
                    selectedItems.has(content._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {/* Selection Checkbox */}
                  {isSelectionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      {selectedItems.has(content._id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  )}

                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {getContentIcon(content.type)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-900 truncate" title={content.title}>
                      {content.title}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">{content.type}</p>
                  </div>
                  
                  {/* Action Buttons (only show when not in selection mode) */}
                  {!isSelectionMode && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInNewTab(content);
                        }}
                        className="bg-white rounded-full p-1.5 shadow-md hover:bg-green-50 transition-all"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3 h-3 text-green-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadContent(content);
                        }}
                        className="bg-white rounded-full p-1.5 shadow-md hover:bg-blue-50 transition-all"
                        title="Download"
                      >
                        <Download className="w-3 h-3 text-blue-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContent(content._id);
                        }}
                        className="bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;