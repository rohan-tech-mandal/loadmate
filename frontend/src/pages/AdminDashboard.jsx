import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, vehiclesRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/users`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/vehicles`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/bookings`, { headers: getAuthHeader() }),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setVehicles(vehiclesRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await axios.put(
        `${API_URL}/admin/users/${userId}/role`,
        { role: newRole },
        { headers: getAuthHeader() }
      );
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleVehicleApproval = async (vehicleId, status) => {
    try {
      await axios.put(
        `${API_URL}/admin/vehicles/${vehicleId}/approval`,
        { approvalStatus: status },
        { headers: getAuthHeader() }
      );
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update approval');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: getAuthHeader(),
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, vehicles, and bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Overview Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <p className="text-sm opacity-90 mb-1">Total Users</p>
              <p className="text-4xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs mt-2">Customers: {stats.totalCustomers} | Owners: {stats.totalOwners}</p>
            </div>
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <p className="text-sm opacity-90 mb-1">Total Vehicles</p>
              <p className="text-4xl font-bold">{stats.totalVehicles}</p>
            </div>
            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <p className="text-sm opacity-90 mb-1">Total Bookings</p>
              <p className="text-4xl font-bold">{stats.totalBookings}</p>
            </div>
            <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <p className="text-sm opacity-90 mb-1">Total Revenue</p>
              <p className="text-4xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex space-x-2 overflow-x-auto">
          {['overview', 'users', 'vehicles', 'bookings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Booking Statistics</h3>
              <div className="grid md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{stats.bookingStats.pending}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.bookingStats.confirmed}</p>
                  <p className="text-sm text-gray-600">Confirmed</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{stats.bookingStats.inTransit}</p>
                  <p className="text-sm text-gray-600">In Transit</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.bookingStats.delivered}</p>
                  <p className="text-sm text-gray-600">Delivered</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{stats.bookingStats.cancelled}</p>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.recentBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-4 py-3 text-sm">{booking.user?.name}</td>
                        <td className="px-4 py-3 text-sm">{booking.vehicle?.type}</td>
                        <td className="px-4 py-3 text-sm font-semibold">₹{booking.fare.totalFare}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            booking.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">User Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-sm">{u.email}</td>
                      <td className="px-4 py-3 text-sm">{u.phone || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={u._id === user._id}
                        >
                          <option value="customer">Customer</option>
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={u._id === user._id}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Vehicle Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vehicles.map((v) => (
                    <tr key={v._id}>
                      <td className="px-4 py-3 text-sm font-medium">{v.type}</td>
                      <td className="px-4 py-3 text-sm">{v.registrationNumber || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{v.owner?.name || 'System'}</td>
                      <td className="px-4 py-3 text-sm">{v.capacity} kg</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          v.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          v.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {v.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        {v.approvalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVehicleApproval(v._id, 'approved')}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVehicleApproval(v._id, 'rejected')}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">All Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="px-4 py-3 text-sm">{booking._id.slice(-6)}</td>
                      <td className="px-4 py-3 text-sm">{booking.user?.name}</td>
                      <td className="px-4 py-3 text-sm">{booking.vehicle?.type}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="max-w-xs truncate">
                          {booking.pickupLocation.city} → {booking.dropLocation.city}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">₹{booking.fare.totalFare}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'in-transit' ? 'bg-purple-100 text-purple-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;