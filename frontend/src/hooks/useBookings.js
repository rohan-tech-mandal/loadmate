import { useState, useCallback } from 'react';
import axios from 'axios';
import useApi from './useApi';

const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const { loading, error, apiCall, clearError } = useApi();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchUserBookings = useCallback(async (authHeader) => {
    return apiCall(async () => {
      const { data } = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers: authHeader
      });
      setBookings(data);
      return data;
    });
  }, [apiCall, API_URL]);

  const fetchOwnerBookings = useCallback(async (authHeader) => {
    return apiCall(async () => {
      const { data } = await axios.get(`${API_URL}/owner/bookings`, {
        headers: authHeader
      });
      setBookings(data);
      return data;
    });
  }, [apiCall, API_URL]);

  const fetchPendingBookings = useCallback(async (authHeader) => {
    return apiCall(async () => {
      const { data } = await axios.get(`${API_URL}/owner/bookings/pending`, {
        headers: authHeader
      });
      return data;
    });
  }, [apiCall, API_URL]);

  const createBooking = useCallback(async (bookingData, authHeader) => {
    return apiCall(async () => {
      const { data } = await axios.post(`${API_URL}/bookings`, bookingData, {
        headers: authHeader
      });
      return data;
    });
  }, [apiCall, API_URL]);

  const cancelBooking = useCallback(async (bookingId, authHeader) => {
    return apiCall(async () => {
      const { data } = await axios.patch(`${API_URL}/bookings/${bookingId}/cancel`, {}, {
        headers: authHeader
      });
      return data;
    });
  }, [apiCall, API_URL]);

  const updateBookingStatus = useCallback(async (bookingId, status, authHeader) => {
    return apiCall(async () => {
      const { data } = await axios.patch(`${API_URL}/bookings/${bookingId}/status`, { status }, {
        headers: authHeader
      });
      return data;
    });
  }, [apiCall, API_URL]);

  return {
    bookings,
    loading,
    error,
    fetchUserBookings,
    fetchOwnerBookings,
    fetchPendingBookings,
    createBooking,
    cancelBooking,
    updateBookingStatus,
    clearError,
  };
};

export default useBookings;
