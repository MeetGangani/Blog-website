import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { setToken, removeToken, isAuthenticated, getCurrentUser } from '../utils/auth';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if user is authenticated
        if (isAuthenticated()) {
          // Get user profile
          const response = await authAPI.getProfile();
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Failed to load user', error);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = useCallback(async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      toast.success('Registration successful!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  }, []);

  // Login user
  const login = useCallback(async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  }, []);

  // Logout user
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  // Update profile
  const updateProfile = useCallback(async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile';
      toast.error(message);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        register, 
        login, 
        logout, 
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 