import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Plus, LogOut, ChevronLeft, Trash2, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No token found');
      return;
    }

    try {
      console.log('Fetching categories...');
      const response = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Categories received:', data);
        setCategories(data.categories || []);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Adding category:', newCategoryName);
      
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategoryName })
      });

      console.log('Add category response status:', response.status);
      const data = await response.json();
      console.log('Add category response data:', data);

      if (response.ok) {
        console.log('Category added successfully!');
        setNewCategoryName('');
        setShowAddCategory(false);
        // Refresh categories list
        await fetchCategories();
      } else {
        setError(data.error || 'Failed to add category');
        console.error('Failed to add category:', data);
      }
    } catch (error) {
      console.error('Add category error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this category and all its content?')) return;

    const token = localStorage.getItem('access_token');
    try {
      console.log('Deleting category:', categoryId);
      
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        console.log('Category deleted successfully');
        // If we're on the deleted category page, go back to dashboard
        if (location.pathname.includes(categoryId)) {
          navigate('/dashboard');
        }
        await fetchCategories();
      } else {
        const data = await response.json();
        console.error('Delete failed:', data);
      }
    } catch (error) {
      console.error('Delete category error:', error);
    }
  };

  const handleSignOut = async () => {
    const token = localStorage.getItem('access_token');
    
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear all session data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    
    // Redirect to login
    navigate('/login', { replace: true });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isCategoryActive = (categoryId) => {
    return location.pathname.includes(`/category/${categoryId}`);
  };

  return (
    <>
      <div className="w-56 bg-slate-900 text-white h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            </div>
            <span className="font-semibold text-sm">Teacher LMS</span>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-2 transition-colors ${
              isActive('/dashboard') 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </button>

          {/* Sections */}
          <div className="mt-6">
            <div className="flex items-center justify-between px-3 py-2 mb-1">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Sections
              </span>
              <button
                onClick={() => {
                  console.log('Add category button clicked');
                  setShowAddCategory(true);
                  setError('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
                title="Add new category"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {categories.length === 0 ? (
                <p className="text-slate-500 text-xs px-3 py-2">No categories yet</p>
              ) : (
                categories.map((category) => (
                  <div key={category._id} className="relative group">
                    <button
                      onClick={() => navigate(`/category/${category._id}`)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isCategoryActive(category._id)
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span className="flex-1 text-left truncate">{category.name}</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteCategory(category._id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </nav>

        {/* Sign Out */}
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add Category</h2>
              <button 
                onClick={() => {
                  setShowAddCategory(false);
                  setError('');
                  setNewCategoryName('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleAddCategory();
                }
              }}
              placeholder="Category name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              disabled={isLoading}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setError('');
                  setNewCategoryName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  'Add'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;