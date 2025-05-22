import { jwtDecode } from 'jwt-decode';

// Get token from local storage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set token to local storage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from local storage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Check if token is valid
export const isValidToken = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    removeToken();
    return false;
  }
};

// Get current user from token
export const getCurrentUser = () => {
  try {
    const token = getToken();
    if (!token) return null;

    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    removeToken();
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return getToken() && isValidToken();
};

// Check if user is admin
export const isAdmin = () => {
  try {
    const token = getToken();
    if (!token) return false;

    const decoded = jwtDecode(token);
    return decoded.role === 'admin';
  } catch (error) {
    return false;
  }
}; 