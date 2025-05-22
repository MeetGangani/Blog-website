import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX } from 'react-icons/fi';
import { blogsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import TiptapEditor from '../components/TiptapEditor';

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    coverImage: null
  });
  
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Available categories
  const categories = [
    'Technology', 'Lifestyle', 'Business', 'Travel', 
    'Health', 'Food', 'Sports', 'Other'
  ];

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle rich text editor change
  const handleEditorChange = (content) => {
    setFormData({ ...formData, content });
    
    // Clear error when user types
    if (errors.content) {
      setErrors({ ...errors, content: '' });
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setFormData({ ...formData, coverImage: file });
    
    // Clear error when user uploads file
    if (errors.coverImage) {
      setErrors({ ...errors, coverImage: '' });
    }
  };

  // Remove cover image
  const handleRemoveImage = () => {
    setPreview('');
    setFormData({ ...formData, coverImage: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.replace(/<[^>]*>/g, '').trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    
    try {
      // Create form data for file upload
      const blogFormData = new FormData();
      blogFormData.append('title', formData.title);
      blogFormData.append('content', formData.content);
      blogFormData.append('category', formData.category);
      
      // Handle tags - split by comma and trim
      if (formData.tags) {
        const tagsArray = formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag);
        blogFormData.append('tags', tagsArray.join(','));
      }

      if (formData.coverImage) {
        console.log('Attaching cover image to form data:', formData.coverImage.name);
        blogFormData.append('coverImage', formData.coverImage);
      }

      console.log('Submitting blog with data:', {
        title: formData.title,
        category: formData.category,
        hasCoverImage: !!formData.coverImage,
        coverImageName: formData.coverImage ? formData.coverImage.name : 'No image'
      });

      const response = await blogsAPI.createBlog(blogFormData);
      console.log('Blog created successfully:', response.data);
      toast.success('Blog created successfully!');
      navigate(`/blogs/${response.data.blog._id}`);
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error(error.response?.data?.error || 'Failed to create blog');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Create New Blog</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title"
            className={`block w-full px-3 py-2 border ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${
              errors.category ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. coding, web development, react"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
          <div className="mt-1 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <label className="flex items-center justify-center w-full md:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <FiUpload className="mr-2" />
              <span>Choose Image</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="sr-only"
              />
            </label>
            <span className="text-xs text-gray-500">
              JPEG, PNG, GIF, WEBP up to 5MB
            </span>
          </div>

          {/* Image preview */}
          {preview && (
            <div className="mt-4 relative">
              <img src={preview} alt="Cover preview" className="w-full max-h-80 object-cover rounded-md" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-gray-700 hover:text-red-500"
              >
                <FiX size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <div className={errors.content ? 'border border-red-300 rounded-md' : ''}>
            <TiptapEditor
              value={formData.content}
              onChange={handleEditorChange}
              placeholder="Write your blog content here..."
              className="min-h-[300px]"
            />
          </div>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 bg-indigo-700 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-800 ${
              submitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Publishing...' : 'Publish Blog'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogPage; 