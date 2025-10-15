import { useState, useCallback } from 'react';
import axios from 'axios';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiCall = useCallback(async (apiFunction) => {
    try {
      setLoading(true);
      setError('');
      const result = await apiFunction();
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    loading,
    error,
    apiCall,
    clearError,
  };
};

export default useApi;
