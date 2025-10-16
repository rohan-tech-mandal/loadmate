import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookingCard from '../components/BookingCard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Package, Clock, Truck, CheckCircle, MapPin, DollarSign, User, Phone, Calendar, FileText, X } from 'lucide-react';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const { user, getAuthHeader } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Only redirect if user has a role and it's not customer
    if (user.role && user.role === 'admin') {
      navigate('/admin');
      return;
    }
    if (user.role && user.role === 'owner') {
      navigate('/owner');
      return;
    }

    // For customers or users without role, fetch bookings
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers: getAuthHeader(),
      });
      setBookings(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await axios.delete(`${API_URL}/bookings/${bookingId}`, {
        headers: getAuthHeader(),
      });
      fetchBookings();
      setShowDetails(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      inTransit: bookings.filter((b) => b.status === 'in-transit').length,
      completed: bookings.filter((b) => b.status === 'delivered').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
      totalSpent: bookings
        .filter((b) => b.status === 'delivered')
        .reduce((sum, b) => sum + b.fare.totalFare, 0),
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}! 👋</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Bookings</p>
                  <p className="text-4xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Pending</p>
                  <p className="text-4xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">In Progress</p>
                  <p className="text-4xl font-bold">{stats.confirmed + stats.inTransit}</p>
                </div>
                <Truck className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Completed</p>
                  <p className="text-4xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
            <CardContent className="p-6">
              <p className="text-sm opacity-90 mb-1">Total Distance Covered</p>
              <p className="text-3xl font-bold">
                {bookings.reduce((sum, b) => sum + (b.distance || 0), 0)} km
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
            <CardContent className="p-6">
              <p className="text-sm opacity-90 mb-1">Total Amount Spent</p>
              <p className="text-3xl font-bold">₹{stats.totalSpent.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <p className="text-sm opacity-90 mb-1">Active Trips</p>
              <p className="text-3xl font-bold">{stats.confirmed + stats.inTransit}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/booking">
              <Card className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1 bg-gradient-to-br from-primary to-primary-600 text-white border-0 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Truck className="h-12 w-12" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">New Booking</h4>
                      <p className="text-sm opacity-90">Book a transport service</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/vehicles">
              <Card className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Package className="h-12 w-12 text-primary" />
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-foreground">View Vehicles</h4>
                      <p className="text-sm text-muted-foreground">Browse our fleet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/register-owner">
              <Card className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border-2 border-primary/20 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <User className="h-12 w-12 text-primary" />
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-foreground">Become an Owner</h4>
                      <p className="text-sm text-muted-foreground">Start earning today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filter Tabs */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground mb-4">My Bookings</h3>
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>All</span>
                <Badge variant="secondary" className="ml-1">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Pending</span>
                <Badge variant="secondary" className="ml-1">{stats.pending}</Badge>
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Confirmed</span>
                <Badge variant="secondary" className="ml-1">{stats.confirmed}</Badge>
              </TabsTrigger>
              <TabsTrigger value="in-transit" className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>In Transit</span>
                <Badge variant="secondary" className="ml-1">{stats.inTransit}</Badge>
              </TabsTrigger>
              <TabsTrigger value="delivered" className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Delivered</span>
                <Badge variant="secondary" className="ml-1">{stats.completed}</Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center space-x-2">
                <X className="h-4 w-4" />
                <span>Cancelled</span>
                <Badge variant="secondary" className="ml-1">{stats.cancelled}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="relative">
                <BookingCard booking={booking} />
                <div className="mt-3 flex space-x-2">
                  <Button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDetails(true);
                    }}
                    className="flex-1"
                    size="sm"
                  >
                    View Details
                  </Button>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button
                      onClick={() => handleCancelBooking(booking._id)}
                      variant="destructive"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-8xl mb-6">
                {filter === 'all' ? '📦' : filter === 'pending' ? '⏳' : filter === 'confirmed' ? '✓' : filter === 'in-transit' ? '🚚' : filter === 'delivered' ? '✅' : '❌'}
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">
                {filter === 'all' ? 'No Bookings Yet' : `No ${filter.replace('-', ' ')} bookings`}
              </h3>
              <p className="text-muted-foreground mb-8 text-lg">
                {filter === 'all'
                  ? 'Start by creating your first booking and experience hassle-free goods transport'
                  : 'Try selecting a different filter or create a new booking'}
              </p>
              {filter === 'all' && (
                <Link to="/booking">
                  <Button size="lg" className="text-lg px-8 py-4">
                    Create Your First Booking
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Booking Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="bg-gradient-to-r from-primary to-primary-600 text-primary-foreground p-6 rounded-t-xl -m-6 mb-6">
              <DialogTitle className="text-2xl font-bold">Booking Details</DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                ID: {selectedBooking?._id?.slice(-8)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Status */}
              <div className="text-center">
                <Badge 
                  variant={selectedBooking?.status === 'pending' ? 'secondary' : 
                          selectedBooking?.status === 'confirmed' ? 'default' :
                          selectedBooking?.status === 'in-transit' ? 'secondary' :
                          selectedBooking?.status === 'delivered' ? 'default' : 'destructive'}
                  className="px-6 py-2 text-sm font-bold uppercase"
                >
                  {selectedBooking?.status}
                </Badge>
              </div>

              {/* Vehicle Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-6 w-6 mr-2" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Type:</span> {selectedBooking?.vehicle?.type}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Capacity:</span> {selectedBooking?.vehicle?.capacity} kg
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Dimensions:</span>{' '}
                    {selectedBooking?.vehicle?.dimensions?.length}' × {selectedBooking?.vehicle?.dimensions?.width}' × {selectedBooking?.vehicle?.dimensions?.height}'
                  </p>
                </CardContent>
              </Card>

              {/* Route */}
              <Card className="bg-gradient-to-r from-green-50 to-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-6 w-6 mr-2" />
                    Route
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-green-800 mb-1">📍 Pickup Location</p>
                    <p className="text-foreground">{selectedBooking?.pickupLocation?.address}</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking?.pickupLocation?.city}, {selectedBooking?.pickupLocation?.pincode}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="bg-border h-px flex-1"></div>
                    <span className="px-4 text-muted-foreground font-semibold">{selectedBooking?.distance} km</span>
                    <div className="bg-border h-px flex-1"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">🏁 Drop Location</p>
                    <p className="text-foreground">{selectedBooking?.dropLocation?.address}</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking?.dropLocation?.city}, {selectedBooking?.dropLocation?.pincode}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Load Details */}
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-6 w-6 mr-2" />
                    Load Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="font-semibold text-foreground">{selectedBooking?.loadWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dimensions</p>
                      <p className="font-semibold text-foreground">
                        {selectedBooking?.loadDimensions?.length}' × {selectedBooking?.loadDimensions?.width}' × {selectedBooking?.loadDimensions?.height}'
                      </p>
                    </div>
                    {selectedBooking?.materialType && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Material Type</p>
                        <p className="font-semibold text-foreground">{selectedBooking.materialType}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card className="bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-6 w-6 mr-2" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold text-foreground">
                        {selectedBooking?.scheduledDate ? new Date(selectedBooking.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : 'N/A'}
                      </p>
                    </div>
                    {selectedBooking?.scheduledTime && (
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-semibold text-foreground">{selectedBooking.scheduledTime}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Driver Details */}
              {selectedBooking?.driverDetails?.name && (
                <Card className="bg-indigo-50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-6 w-6 mr-2" />
                      Driver Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-muted-foreground">
                      <span className="font-semibold">Name:</span> {selectedBooking.driverDetails.name}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-semibold">Phone:</span>{' '}
                      <a href={`tel:${selectedBooking.driverDetails.phone}`} className="text-primary hover:underline">
                        {selectedBooking.driverDetails.phone}
                      </a>
                    </p>
                    {selectedBooking.driverDetails.vehicleNumber && (
                      <p className="text-muted-foreground">
                        <span className="font-semibold">Vehicle Number:</span> {selectedBooking.driverDetails.vehicleNumber}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedBooking?.notes && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-6 w-6 mr-2" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedBooking.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Fare Breakdown */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-6 w-6 mr-2" />
                    Fare Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base Fare</span>
                    <span className="font-semibold">₹{selectedBooking?.fare?.baseFare}</span>
                  </div>
                  {selectedBooking?.fare?.loadingCharges > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Loading Charges</span>
                      <span className="font-semibold">₹{selectedBooking.fare.loadingCharges}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-green-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground text-lg">Total Fare</span>
                      <span className="text-2xl font-bold text-green-600">₹{selectedBooking?.fare?.totalFare}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Date */}
              <div className="text-center text-sm text-muted-foreground">
                Booked on {selectedBooking?.createdAt ? new Date(selectedBooking.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) : 'N/A'}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {(selectedBooking?.status === 'pending' || selectedBooking?.status === 'confirmed') && (
                  <Button
                    onClick={() => handleCancelBooking(selectedBooking._id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    Cancel Booking
                  </Button>
                )}
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;