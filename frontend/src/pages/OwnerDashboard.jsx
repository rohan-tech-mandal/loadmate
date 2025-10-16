import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Truck, Package, DollarSign, Users, CheckCircle, X, Plus, MapPin, Calendar, Loader2 } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-IN');

const OwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newVehicleId, setNewVehicleId] = useState(null);

  const [vehicleForm, setVehicleForm] = useState({
    type: 'Tata Ace',
    capacity: '',
    length: '',
    width: '',
    height: '',
    baseFarePerKm: '',
    loadingCharge: '',
    registrationNumber: '',
    driverName: '',
    driverPhone: '',
    description: '',
  });

  const { user, getAuthHeader, clearCorruptedData } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchOwnerData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if token exists in user object, if not try to get it from localStorage
      let token = user?.token;
      if (!token) {
        const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
        token = storedUser?.token;
      }
      
      if (!token) {
        setError('No authentication token found. Please clear your session and login again.');
        setLoading(false);
        return;
      }
      
      const [statsRes, vehiclesRes, bookingsRes, pendingRes] = await Promise.all([
        axios.get(`${API_URL}/owner/stats`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/owner/vehicles`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/owner/bookings`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/owner/bookings/pending`, { headers: getAuthHeader() }),
      ]);

      setStats(statsRes.data || {});
      setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setPendingBookings(Array.isArray(pendingRes.data) ? pendingRes.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [API_URL, getAuthHeader]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'owner' && user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchOwnerData();
  }, [user, navigate, fetchOwnerData]);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/owner/vehicles`,
        {
          type: vehicleForm.type,
          capacity: parseFloat(vehicleForm.capacity),
          dimensions: {
            length: parseFloat(vehicleForm.length),
            width: parseFloat(vehicleForm.width),
            height: parseFloat(vehicleForm.height),
          },
          baseFarePerKm: parseFloat(vehicleForm.baseFarePerKm),
          loadingCharge: vehicleForm.loadingCharge ? parseFloat(vehicleForm.loadingCharge) : 0,
          registrationNumber: vehicleForm.registrationNumber.trim(),
          driverName: vehicleForm.driverName.trim() || undefined,
          driverPhone: vehicleForm.driverPhone.trim() || undefined,
          description: vehicleForm.description.trim() || undefined,
        },
        { headers: getAuthHeader() }
      );

      // Store the new vehicle ID for image upload
      setNewVehicleId(response.data._id);
      
      // Reset form
      setVehicleForm({
        type: 'Tata Ace',
        capacity: '',
        length: '',
        width: '',
        height: '',
        baseFarePerKm: '',
        loadingCharge: '',
        registrationNumber: '',
        driverName: '',
        driverPhone: '',
        description: '',
      });
      
      fetchOwnerData();
      alert('Vehicle added successfully! You can now upload an image.');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      await axios.delete(`${API_URL}/owner/vehicles/${vehicleId}`, {
        headers: getAuthHeader(),
      });
      fetchOwnerData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(
        `${API_URL}/owner/bookings/${bookingId}/status`,
        { status },
        { headers: getAuthHeader() }
      );
      fetchOwnerData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update booking');
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await axios.put(
        `${API_URL}/bookings/${bookingId}/approve`,
        {},
        { headers: getAuthHeader() }
      );
      fetchOwnerData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId, rejectionReason) => {
    try {
      await axios.put(
        `${API_URL}/bookings/${bookingId}/reject`,
        { rejectionReason },
        { headers: getAuthHeader() }
      );
      fetchOwnerData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to reject booking');
    }
  };

  const handleImageUploaded = (imageData) => {
    // Refresh the vehicles data to show the new image
    fetchOwnerData();
    // Clear the new vehicle ID since image is uploaded
    setNewVehicleId(null);
  };

  const completedTripsCount = useMemo(
    () => bookings.filter((b) => b.status === 'delivered').length,
    [bookings]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading owner dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your vehicles and bookings</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCorruptedData}
                className="ml-4"
              >
                Clear Session & Login
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Total Vehicles</p>
                    <p className="text-4xl font-bold">{num.format(stats.totalVehicles || 0)}</p>
                    <p className="text-xs mt-2">Active: {num.format(stats.activeVehicles || 0)}</p>
                  </div>
                  <Truck className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Total Vehicles</p>
                    <p className="text-4xl font-bold">{num.format(stats.totalVehicles || 0)}</p>
                    <p className="text-xs mt-2">All Available</p>
                  </div>
                  <CheckCircle className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Total Bookings</p>
                    <p className="text-4xl font-bold">{num.format(stats.totalBookings || 0)}</p>
                    <p className="text-xs mt-2">Active: {num.format(stats.activeBookings || 0)}</p>
                  </div>
                  <Package className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Total Earnings</p>
                    <p className="text-4xl font-bold">
                      {inr.format(stats.totalEarnings || 0)}
                    </p>
                    <p className="text-xs mt-2">This Month: {inr.format(stats.monthlyEarnings || 0)}</p>
                  </div>
                  <DollarSign className="h-12 w-12 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>Vehicles</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Pending</span>
              {pendingBookings.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingBookings.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Bookings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Total Vehicles</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {num.format(stats?.totalVehicles || 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Completed Trips</p>
                      <p className="text-3xl font-bold text-green-600">
                        {num.format(completedTripsCount)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Active Vehicles</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {num.format(stats?.activeVehicles || 0)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <Card key={booking._id} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-foreground">{booking?.vehicle?.type || '—'}</p>
                              <p className="text-sm text-muted-foreground">
                                {booking?.pickupLocation?.city || '—'} → {booking?.dropLocation?.city || '—'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Customer: {booking?.user?.name || '—'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">
                                {inr.format(booking?.fare?.totalFare || 0)}
                              </p>
                              <Badge 
                                variant={booking.status === 'delivered' ? 'default' : 
                                        booking.status === 'confirmed' ? 'secondary' :
                                        booking.status === 'in-transit' ? 'secondary' :
                                        booking.status === 'cancelled' ? 'destructive' : 'outline'}
                                className="mt-1"
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No bookings yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Booking Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <Card key={booking._id} className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-foreground">
                                Booking #{booking._id.slice(-8)}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Requested on {new Date(booking.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              Awaiting Approval
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6 mb-4">
                            {/* Customer Info */}
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">Customer Details</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Name:</span> {booking.user?.name || '—'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Email:</span> {booking.user?.email || '—'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Phone:</span> {booking.user?.phone || '—'}
                                </p>
                              </CardContent>
                            </Card>

                            {/* Vehicle Info */}
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">Vehicle Details</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Type:</span> {booking.vehicle?.type || '—'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Registration:</span> {booking.vehicle?.registrationNumber || '—'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Capacity:</span> {booking.vehicle?.capacity || '—'} kg
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Route Info */}
                          <Card className="mb-4">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Route Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-green-800">Pickup</p>
                                  <p className="text-sm text-foreground">{booking.pickupLocation?.address}</p>
                                  <p className="text-xs text-muted-foreground">{booking.pickupLocation?.city}</p>
                                </div>
                                <div className="text-center">
                                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{booking.distance} km</p>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-red-800">Drop</p>
                                  <p className="text-sm text-foreground">{booking.dropLocation?.address}</p>
                                  <p className="text-xs text-muted-foreground">{booking.dropLocation?.city}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Load Details */}
                          <Card className="mb-4">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Load Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">Weight</p>
                                  <p className="font-semibold">{booking.loadWeight} kg</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Dimensions</p>
                                  <p className="font-semibold">
                                    {booking.loadDimensions?.length}' × {booking.loadDimensions?.width}' × {booking.loadDimensions?.height}'
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Scheduled Date</p>
                                  <p className="font-semibold">
                                    {new Date(booking.scheduledDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Total Fare</p>
                                  <p className="font-semibold text-primary">
                                    {inr.format(booking.fare?.totalFare || 0)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Notes */}
                          {booking.notes && (
                            <Alert className="mb-4">
                              <AlertDescription>
                                <strong>Special Notes:</strong> {booking.notes}
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <Button
                              onClick={() => handleApproveBooking(booking._id)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Booking
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt('Please provide a reason for rejection (optional):');
                                if (reason !== null) {
                                  handleRejectBooking(booking._id, reason);
                                }
                              }}
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject Booking
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">No Pending Approvals</h3>
                    <p className="text-muted-foreground">All bookings have been processed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles">
            <div className="mb-6">
              <Button onClick={() => setShowAddVehicle((s) => !s)}>
                <Plus className="h-4 w-4 mr-2" />
                {showAddVehicle ? 'Cancel' : 'Add New Vehicle'}
              </Button>
            </div>

            {/* Add Vehicle Form */}
            {showAddVehicle && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddVehicle} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicleType">Vehicle Type *</Label>
                        <Select value={vehicleForm.type} onValueChange={(value) => setVehicleForm({ ...vehicleForm, type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tata Ace">Tata Ace</SelectItem>
                            <SelectItem value="Pickup Truck">Pickup Truck</SelectItem>
                            <SelectItem value="Mini Truck">Mini Truck</SelectItem>
                            <SelectItem value="Container Truck">Container Truck</SelectItem>
                            <SelectItem value="Trailer">Trailer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="registrationNumber">Registration Number *</Label>
                        <Input
                          id="registrationNumber"
                          type="text"
                          value={vehicleForm.registrationNumber}
                          onChange={(e) =>
                            setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })
                          }
                          placeholder="MH-15-AB-1234"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="capacity">Capacity (kg) *</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={vehicleForm.capacity}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                          placeholder="e.g., 750"
                          required
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="baseFare">Base Fare Per KM (₹) *</Label>
                        <Input
                          id="baseFare"
                          type="number"
                          value={vehicleForm.baseFarePerKm}
                          onChange={(e) =>
                            setVehicleForm({ ...vehicleForm, baseFarePerKm: e.target.value })
                          }
                          placeholder="e.g., 12"
                          required
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="loadingCharge">Loading Charge (₹)</Label>
                        <Input
                          id="loadingCharge"
                          type="number"
                          value={vehicleForm.loadingCharge}
                          onChange={(e) =>
                            setVehicleForm({ ...vehicleForm, loadingCharge: e.target.value })
                          }
                          placeholder="e.g., 200"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="driverName">Driver Name</Label>
                        <Input
                          id="driverName"
                          type="text"
                          value={vehicleForm.driverName}
                          onChange={(e) =>
                            setVehicleForm({ ...vehicleForm, driverName: e.target.value })
                          }
                          placeholder="Driver name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="driverPhone">Driver Phone</Label>
                        <Input
                          id="driverPhone"
                          type="tel"
                          value={vehicleForm.driverPhone}
                          onChange={(e) =>
                            setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })
                          }
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Dimensions (feet) *</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={vehicleForm.length}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, length: e.target.value })}
                          placeholder="Length"
                          required
                          min="0"
                        />
                        <Input
                          type="number"
                          step="0.1"
                          value={vehicleForm.width}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, width: e.target.value })}
                          placeholder="Width"
                          required
                          min="0"
                        />
                        <Input
                          type="number"
                          step="0.1"
                          value={vehicleForm.height}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, height: e.target.value })}
                          placeholder="Height"
                          required
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={vehicleForm.description}
                        onChange={(e) =>
                          setVehicleForm({ ...vehicleForm, description: e.target.value })
                        }
                        rows={3}
                        placeholder="Brief description of the vehicle..."
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Truck className="h-4 w-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Image Upload Section - Show after vehicle is created */}
            {newVehicleId && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Upload Vehicle Image</CardTitle>
                  <CardDescription>
                    Add a photo of your vehicle to make it more appealing to customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUpload 
                    vehicleId={newVehicleId}
                    onImageUploaded={handleImageUploaded}
                  />
                </CardContent>
              </Card>
            )}

            {/* Vehicles List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{vehicle.type}</CardTitle>
                      <Badge variant="default">
                        Available
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Registration:</span>{' '}
                        {vehicle.registrationNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Capacity:</span> {num.format(vehicle.capacity)} kg
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Fare:</span> {inr.format(vehicle.baseFarePerKm)}/km
                      </p>
                      {vehicle.driverName && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Driver:</span> {vehicle.driverName}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Trips:</span> {num.format(vehicle.completedTrips || 0)}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        Earnings: {inr.format(vehicle.totalEarnings || 0)}
                      </p>
                    </div>

                    {/* Vehicle Image Display */}
                    {vehicle.images?.primary?.url || vehicle.image ? (
                      <div className="mb-4">
                        <img
                          src={vehicle.images?.primary?.url || vehicle.image}
                          alt={`${vehicle.type} - ${vehicle.registrationNumber}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="mb-4 bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                        <span className="text-gray-500">No image uploaded</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <ImageUpload 
                        vehicleId={vehicle._id}
                        onImageUploaded={handleImageUploaded}
                        existingImages={vehicle.images}
                      />
                      
                      <Button
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        variant="outline"
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Delete Vehicle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {vehicles.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">🚚</div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">No Vehicles Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add your first vehicle to start receiving bookings
                  </p>
                  <Button onClick={() => setShowAddVehicle(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Vehicle
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Vehicle
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Route
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Fare
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {bookings.map((booking) => (
                          <tr key={booking._id}>
                            <td className="px-4 py-3 text-sm">{booking._id?.slice(-6)}</td>
                            <td className="px-4 py-3 text-sm">
                              {booking.user?.name || '—'}
                              <br />
                              <span className="text-xs text-muted-foreground">{booking.user?.phone || ''}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">{booking.vehicle?.type || '—'}</td>
                            <td className="px-4 py-3 text-sm">
                              {booking.pickupLocation?.city || '—'} → {booking.dropLocation?.city || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {inr.format(booking?.fare?.totalFare || 0)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge 
                                variant={booking.status === 'delivered' ? 'default' : 
                                        booking.status === 'confirmed' ? 'secondary' :
                                        booking.status === 'in-transit' ? 'secondary' :
                                        booking.status === 'cancelled' ? 'destructive' : 'outline'}
                              >
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Select
                                value={booking.status}
                                onValueChange={(value) => handleUpdateBookingStatus(booking._id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="in-transit">In Transit</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No bookings yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;
