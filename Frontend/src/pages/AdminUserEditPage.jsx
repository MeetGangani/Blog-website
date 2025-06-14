import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminUserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    isAdmin: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getUser(id);
        const userData = response.data;
        
        setUser(userData);
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          isAdmin: userData.isAdmin || false
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data. Please try again later.');
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await adminAPI.updateUser(id, formData);
      toast.success('User updated successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error(err.response?.data?.error || 'Failed to update user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size="lg" text="Loading user data..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error || 'User not found'}</p>
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xl">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          {/* Admin Status */}
          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input
                id="isAdmin"
                name="isAdmin"
                type="checkbox"
                checked={formData.isAdmin}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-700">
                Admin Access
              </label>
            </div>
          </div>
          
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-2">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Member since</p>
                <p className="font-medium text-gray-800">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last updated</p>
                <p className="font-medium text-gray-800">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Blog posts</p>
                <p className="font-medium text-gray-800">
                  {user.blogCount || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Comments</p>
                <p className="font-medium text-gray-800">
                  {user.commentCount || 0}
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminUserEditPage; 