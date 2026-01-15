import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, FileText, Image, Video, Clock, TrendingUp, File } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [stats, setStats] = useState({
    totalSections: 0,
    totalFiles: 0,
    images: 0,
    videos: 0,
    documents: 0,
    presentations: 0
  });
  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    const email = localStorage.getItem('user_email');
    
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    
    setUserEmail(email || 'User');
    fetchDashboardData(token);

    // Handle browser back button - expire session
    const handlePopState = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_email');
      navigate('/login', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories');
      }

      const categoriesData = await categoriesResponse.json();
      const categories = categoriesData.categories || [];

      // Fetch content for all categories
      let allContent = [];
      for (const category of categories) {
        try {
          const contentResponse = await fetch(`${API_URL}/categories/${category._id}/content`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (contentResponse.ok) {
            const contentData = await contentResponse.json();
            allContent = [...allContent, ...(contentData.content || [])];
          }
        } catch (error) {
          console.error(`Error fetching content for category ${category._id}:`, error);
        }
      }

      // Calculate statistics
      const images = allContent.filter(c => c.type === 'image').length;
      const videos = allContent.filter(c => c.type === 'video').length;
      const documents = allContent.filter(c => c.type === 'document').length;
      const presentations = allContent.filter(c => c.type === 'ppt').length;

      setStats({
        totalSections: categories.length,
        totalFiles: allContent.length,
        images,
        videos,
        documents,
        presentations
      });

      // Sort content by creation date and take the 5 most recent
      const sortedContent = allContent.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 5);

      setRecentUploads(sortedContent);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-green-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-600" />;
      case 'ppt':
        return <FileText className="w-5 h-5 text-orange-600" />;
      default:
        return <File className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {userEmail}! Here's an overview of your learning content.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Sections */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">Total Sections</span>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalSections}</div>
            </div>

            {/* Total Files */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">Total Files</span>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalFiles}</div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">Images</span>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Image className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.images}</div>
            </div>

            {/* Videos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">Videos</span>
                <div className="p-2 bg-red-50 rounded-lg">
                  <Video className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.videos}</div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Uploads */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Recent Uploads</h2>
              </div>
              
              {recentUploads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-gray-50 rounded-full mb-4">
                    <File className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium mb-1">No files uploaded yet</p>
                  <p className="text-gray-500 text-sm">Create a section and start uploading!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentUploads.map((content) => (
                    <div 
                      key={content._id} 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getFileIcon(content.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {content.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(content.created_at)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 uppercase">
                        {content.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Content Breakdown</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Image className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Images</span>
                  </div>
                  <span className="text-gray-900 font-semibold">{stats.images}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Documents</span>
                  </div>
                  <span className="text-gray-900 font-semibold">{stats.documents}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <FileText className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Presentations</span>
                  </div>
                  <span className="text-gray-900 font-semibold">{stats.presentations}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <Video className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Videos</span>
                  </div>
                  <span className="text-gray-900 font-semibold">{stats.videos}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;