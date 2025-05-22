import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access - logout user
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Blogs API calls
export const blogsAPI = {
  getAllBlogs: (params) => api.get('/blogs', { params }),
  getBlog: async (id) => {
    const response = await api.get(`/blogs/${id}`);
    console.log('API getBlog response:', response.data);
    return response;
  },
  createBlog: (blogData) => {
    // Use FormData, reset content-type header to let browser set it with boundary
    const config = {
      headers: {
        'Content-Type': undefined // Let axios set the correct content-type with boundary
      }
    };
    return api.post('/blogs', blogData, config);
  },
  updateBlog: (id, blogData) => {
    // Use FormData, reset content-type header to let browser set it with boundary
    const config = {
      headers: {
        'Content-Type': undefined // Let axios set the correct content-type with boundary
      }
    };
    return api.put(`/blogs/${id}`, blogData, config);
  },
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  likeBlog: (id) => api.put(`/blogs/${id}/like`),
  getBlogsByUser: (userId, params) => api.get(`/blogs/user/${userId}`, { params }),
  getLikedBlogs: (params) => api.get('/blogs/liked', { params }),
};

// Comments API calls
export const commentsAPI = {
  getComments: (blogId) => api.get(`/blogs/${blogId}/comments`),
  createComment: (blogId, commentData) => api.post(`/blogs/${blogId}/comments`, commentData),
  updateComment: (id, commentData) => api.put(`/comments/${id}`, commentData),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  addReply: (id, replyData) => api.post(`/comments/${id}/replies`, replyData),
};

// Admin API calls
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllBlogs: (params) => api.get('/admin/blogs', { params }),
  deleteBlog: (id) => api.delete(`/admin/blogs/${id}`),
};

// Helper methods for more direct API usage
export const getUserProfile = async (username) => {
  try {
    const response = await api.get(`/users/${username}/profile`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserBlogs = async (userId) => {
  try {
    const response = await blogsAPI.getBlogsByUser(userId);
    return response.data.blogs;
  } catch (error) {
    throw error;
  }
};

export default api; 