import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { FiUser, FiMail, FiFileText, FiLock, FiSave, FiChevronLeft, FiCamera, FiLoader } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const EditProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    profilePicture: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('profile');
  const [imagePreview, setImagePreview] = useState(null);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
      }));
      
      if (user.profilePicture) {
        setImagePreview(user.profilePicture);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle file input change
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 1024 * 1024) { // 1MB
      toast.error('Image size should be less than 1MB');
      return;
    }
    
    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload to Cloudinary
    try {
      setUploadingImage(true);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Use the upload endpoint
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }
      
      // Update form data with new image URL
      setFormData(prev => ({
        ...prev,
        profilePicture: data.imageUrl
      }));
      
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation (only if attempting to change password)
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to set a new password';
      }
      
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare update data
      const updateData = {
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        profilePicture: formData.profilePicture
      };
      
      // Only include password fields if user is changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      const response = await authAPI.updateProfile(updateData);
      
      // Update auth context with new user data
      updateProfile(response.data.user);
      
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMessage);
      
      // Handle specific errors returned from API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get user initials for avatar placeholder
  const getUserInitials = () => {
    const name = user?.username || '';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Edit Your Profile</h1>
          <Link 
            to="/profile" 
            className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <FiChevronLeft size={16} className="mr-1" /> Back to Profile
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-soft rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-neutral-100">
            <button
              onClick={() => setActiveSection('profile')}
              className={`px-6 py-4 font-medium text-sm flex items-center ${
                activeSection === 'profile'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <FiUser className="mr-2" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`px-6 py-4 font-medium text-sm flex items-center ${
                activeSection === 'security'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <FiLock className="mr-2" />
              Security
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Profile Information Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                {/* Profile Picture - Now with functionality */}
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b border-neutral-100">
                  <div className="relative">
                    {imagePreview ? (
                      <div className="w-28 h-28 rounded-full overflow-hidden border border-neutral-200">
                        <img
                          src={imagePreview}
                          alt={user?.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600 border border-neutral-200">
                        {getUserInitials()}
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 right-0">
                      <label htmlFor="profile-picture-upload" className={`cursor-pointer block w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md ${uploadingImage ? 'opacity-70' : ''}`}>
                        {uploadingImage ? (
                          <LoadingSpinner size="xs" />
                        ) : (
                          <FiCamera size={14} />
                        )}
                      </label>
                      <input
                        type="file"
                        id="profile-picture-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={uploadingImage}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center sm:text-left sm:flex-1">
                    <h3 className="text-lg font-medium text-neutral-800 mb-1">Profile Picture</h3>
                    <p className="text-neutral-500 text-sm mb-3">Upload a profile picture that will be displayed on your profile and in your posts.</p>
                    <p className="text-xs text-neutral-400">
                      JPG, PNG or GIF. Max 1MB.
                    </p>
                    {uploadingImage && (
                      <div className="text-center text-sm text-neutral-600 mt-2 flex items-center justify-center">
                        <LoadingSpinner size="xs" />
                        <span className="ml-2">Uploading image...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Username */}
                <div className="space-y-1">
                  <label htmlFor="username" className="block text-sm font-medium text-neutral-700 flex items-center">
                    <FiUser size={16} className="mr-2 text-neutral-500" /> Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                    } focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all`}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username}</p>
                  )}
                </div>
                
                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 flex items-center">
                    <FiMail size={16} className="mr-2 text-neutral-500" /> Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                    } focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                {/* Bio */}
                <div className="space-y-1">
                  <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 flex items-center">
                    <FiFileText size={16} className="mr-2 text-neutral-500" /> Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell others about yourself..."
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all"
                  />
                  <p className="text-xs text-neutral-500">
                    Brief description for your profile. URLs are allowed.
                  </p>
                </div>
              </div>
            )}
            
            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-neutral-800 mb-4">Change Password</h3>
                  
                  {/* Current Password */}
                  <div className="space-y-1 mb-4">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 flex items-center">
                      <FiLock size={16} className="mr-2 text-neutral-500" /> Current Password
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                      } focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all`}
                    />
                    {errors.currentPassword && (
                      <p className="text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>
                  
                  {/* New Password */}
                  <div className="space-y-1 mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 flex items-center">
                      <FiLock size={16} className="mr-2 text-neutral-500" /> New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.newPassword ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                      } focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all`}
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-red-600">{errors.newPassword}</p>
                    )}
                    <p className="text-xs text-neutral-500">
                      Must be at least 6 characters long.
                    </p>
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 flex items-center">
                      <FiLock size={16} className="mr-2 text-neutral-500" /> Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-neutral-200'
                      } focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 mt-8 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-5 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className={`px-5 py-2.5 rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors flex items-center ${
                  (loading || uploadingImage) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? <LoadingSpinner size="xs" /> : <FiSave className="mr-2" />}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage; 