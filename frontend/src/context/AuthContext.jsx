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
      setUser(JSON.parse(userInfo));
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
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  /**
   * Get auth header for API requests
   */
  const getAuthHeader = () => {
    if (user?.token) {
      return {
        Authorization: `Bearer ${user.token}`,
      };
    }
    return {};
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    getAuthHeader,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};