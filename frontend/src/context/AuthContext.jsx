import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to entire app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get API URL from environment
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Check if user is logged in on mount
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
    }
    
    // Handle Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing user data from URL:', error);
      }
    }
    
    setLoading(false);
  }, []);

  /**
   * Register new user
   */
  const register = async (name, email, password, phone) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        phone,
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  /**
   * Login with Google - Opens OAuth popup
   */
  const loginWithGoogle = () => {
    window.location.href = `${API_URL.replace('/api', '')}/api/auth/google`;
  };

  /**
   * Logout user
   */
  const logout = () => {
    console.log('AuthContext - Logging out user');
    localStorage.removeItem('userInfo');
    setUser(null);
    // Force a page reload to clear any stale state
    window.location.href = '/';
  };

  /**
   * Update user data (useful after role changes)
   */
  const updateUser = (updatedUserData) => {
    // Get current user from localStorage to ensure we have the latest data
    const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    // Ensure we preserve the token and other important fields
    const newUserInfo = { 
      ...currentUserInfo,  // Use localStorage data as base
      ...updatedUserData,
      // Explicitly preserve the token if it exists
      token: currentUserInfo?.token || updatedUserData?.token || user?.token
    };
    
    localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    setUser(newUserInfo);
  };

  /**
   * Get auth header for API requests
   */
  const getAuthHeader = () => {
    // Check user object first
    let token = user?.token;
    
    // If no token in user object, check localStorage
    if (!token) {
      const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
      token = storedUser?.token;
    }
    
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  };

  /**
   * Clear corrupted user data and redirect to login
   */
  const clearCorruptedData = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    updateUser,
    getAuthHeader,
    clearCorruptedData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth must be used within AuthProvider');
    // Return a default context during hot reload to prevent crashes
    return {
      user: null,
      loading: false,
      register: async () => ({ success: false, message: 'Auth not initialized' }),
      login: async () => ({ success: false, message: 'Auth not initialized' }),
      loginWithGoogle: () => {},
      logout: () => {},
      updateUser: () => {},
      getAuthHeader: () => ({}),
    };
  }
  return context;
};