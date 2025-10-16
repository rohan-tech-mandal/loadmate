import { useState, useEffect } from 'react';
import axios from 'axios';
import VehicleCard from '../components/VehicleCard';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/vehicles`);
      
      // Group vehicles by type and get one vehicle per type for fleet showcase
      // This ensures we show one example of each vehicle type instead of all vehicles
      const vehiclesByType = {};
      data.forEach(vehicle => {
        if (!vehiclesByType[vehicle.type]) {
          vehiclesByType[vehicle.type] = vehicle;
        }
      });
      
      // Convert to array of unique vehicles (one per type)
      const uniqueVehicles = Object.values(vehiclesByType);
      setVehicles(uniqueVehicles);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Fleet</h1>
          <p className="text-gray-600">Explore our different vehicle types to find the perfect transport solution</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Vehicles Grid */}
        {vehicles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🚚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Vehicles Available</h3>
            <p className="text-gray-600">Please check back later</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;