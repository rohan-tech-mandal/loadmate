import { useState, useCallback } from 'react';
import axios from 'axios';
import useApi from './useApi';

const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [groupedVehicles, setGroupedVehicles] = useState({});
  const { loading, error, apiCall, clearError } = useApi();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const groupVehiclesByType = useCallback((vehicles) => {
    return vehicles.reduce((acc, vehicle) => {
      const type = vehicle.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(vehicle);
      return acc;
    }, {});
  }, []);

  const fetchVehicles = useCallback(async (authHeader) => {
    return apiCall(async () => {
      const { data } = await axios.get(`${API_URL}/vehicles`, {
        headers: authHeader
      });
      setVehicles(data);
      setGroupedVehicles(groupVehiclesByType(data));
      return data;
    });
  }, [apiCall, API_URL, groupVehiclesByType]);

  const fetchRecommendedVehicles = useCallback(async (loadData) => {
    return apiCall(async () => {
      const { data } = await axios.post(`${API_URL}/vehicles/suggest`, {
        weight: parseFloat(loadData.loadWeight),
        length: parseFloat(loadData.loadLength) || null,
        width: parseFloat(loadData.loadWidth) || null,
        height: parseFloat(loadData.loadHeight) || null,
      });
      return data;
    });
  }, [apiCall, API_URL]);

  const fetchAllVehicles = useCallback(async (authHeader) => {
    return apiCall(async () => {
      const { data } = await axios.get(`${API_URL}/vehicles`, {
        headers: authHeader
      });
      return data;
    });
  }, [apiCall, API_URL]);

  return {
    vehicles,
    groupedVehicles,
    loading,
    error,
    fetchVehicles,
    fetchRecommendedVehicles,
    fetchAllVehicles,
    groupVehiclesByType,
    clearError,
  };
};

export default useVehicles;
