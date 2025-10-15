import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LocationPicker from '../components/LocationPicker';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { Package, MapPin, Calendar, Clock, User, Phone, Truck, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getAuthHeader } = useAuth();

  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [groupedVehicles, setGroupedVehicles] = useState({});
  const [groupedAllVehicles, setGroupedAllVehicles] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState(
    location.state?.selectedVehicle || null
  );
  const [selectedVehicleWithOwner, setSelectedVehicleWithOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupCity: '',
    pickupPincode: '',
    pickupCoordinates: null,
    dropAddress: '',
    dropCity: '',
    dropPincode: '',
    dropCoordinates: null,
    loadWeight: '',
    loadLength: '',
    loadWidth: '',
    loadHeight: '',
    materialType: '',
    distance: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Only customers can book vehicles
    if (user.role !== 'customer') {
      navigate('/');
      return;
    }
    if (selectedVehicle) {
      setStep(2);
    }
  }, [user, navigate, selectedVehicle]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePickupLocationSelect = (location) => {
    setFormData({
      ...formData,
      pickupAddress: location.address,
      pickupCity: location.city,
      pickupPincode: location.pincode,
      pickupCoordinates: location.coordinates,
    });
    if (formData.dropCoordinates) {
      calculateDistance(location.coordinates, formData.dropCoordinates);
    }
  };

  const handleDropLocationSelect = (location) => {
    setFormData({
      ...formData,
      dropAddress: location.address,
      dropCity: location.city,
      dropPincode: location.pincode,
      dropCoordinates: location.coordinates,
    });
    if (formData.pickupCoordinates) {
      calculateDistance(formData.pickupCoordinates, location.coordinates);
    }
  };

  const calculateDistance = useCallback((pickup, drop) => {
    if (pickup && drop) {
      // Haversine formula to calculate distance between two coordinates
      const R = 6371; // Earth's radius in km
      const dLat = (drop.latitude - pickup.latitude) * Math.PI / 180;
      const dLon = (drop.longitude - pickup.longitude) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pickup.latitude * Math.PI / 180) *
        Math.cos(drop.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = Math.round(R * c);
      setFormData(prev => ({ ...prev, distance: distance.toString() }));
    }
  }, []);

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

  const handleStep1Submit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.loadWeight) {
      setError('Please enter load weight');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch both recommended and all vehicles in parallel
      const [recommendedRes, allVehiclesRes] = await Promise.all([
        axios.post(`${API_URL}/vehicles/suggest`, {
          weight: parseFloat(formData.loadWeight),
          length: parseFloat(formData.loadLength) || null,
          width: parseFloat(formData.loadWidth) || null,
          height: parseFloat(formData.loadHeight) || null,
        }),
        axios.get(`${API_URL}/vehicles`, {
          headers: getAuthHeader()
        })
      ]);
      
      const recommendedVehicles = recommendedRes.data;
      const allVehiclesData = allVehiclesRes.data;
      
      setVehicles(recommendedVehicles);
      setAllVehicles(allVehiclesData);
      
      // Group vehicles by type
      setGroupedVehicles(groupVehiclesByType(recommendedVehicles));
      setGroupedAllVehicles(groupVehiclesByType(allVehiclesData));
      
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, [formData, API_URL, getAuthHeader, groupVehiclesByType]);

  const handleVehicleSelect = useCallback((vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedVehicleWithOwner(vehicle); // Set the vehicle with owner data
    setStep(4); // Skip step 3 (owner selection) and go directly to step 4 (booking details)
  }, []);


  const calculateFare = useMemo(() => {
    if (!selectedVehicleWithOwner || !selectedVehicleWithOwner.baseFarePerKm) return 0;
    const dist = parseFloat(formData.distance) || 50;
    const baseFare = selectedVehicleWithOwner.baseFarePerKm * dist;
    const loadingCharges = selectedVehicleWithOwner.loadingCharge || 0;
    return baseFare + loadingCharges;
  }, [selectedVehicleWithOwner, formData.distance]);

  const handleBookingSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedVehicleWithOwner) {
      setError('Please select a vehicle owner');
      return;
    }

    if (!formData.pickupAddress || !formData.dropAddress || !formData.scheduledDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.pickupCoordinates || !formData.dropCoordinates) {
      setError('Please select locations using the map');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate fare without creating booking
      const estimatedDistance = parseFloat(formData.distance) || 50;
      const baseFare = selectedVehicleWithOwner.baseFarePerKm * estimatedDistance;
      const loadingCharges = selectedVehicleWithOwner.loadingCharge || 0;
      const totalFare = baseFare + loadingCharges;
      
      // Prepare booking data for payment (without creating actual booking)
      const bookingData = {
        vehicleId: selectedVehicleWithOwner._id,
        vehicle: selectedVehicleWithOwner,
        pickupLocation: {
          address: formData.pickupAddress,
          city: formData.pickupCity,
          pincode: formData.pickupPincode,
          coordinates: formData.pickupCoordinates,
        },
        dropLocation: {
          address: formData.dropAddress,
          city: formData.dropCity,
          pincode: formData.dropPincode,
          coordinates: formData.dropCoordinates,
        },
        loadWeight: parseFloat(formData.loadWeight),
        loadDimensions: {
          length: parseFloat(formData.loadLength) || 0,
          width: parseFloat(formData.loadWidth) || 0,
          height: parseFloat(formData.loadHeight) || 0,
        },
        materialType: formData.materialType,
        distance: estimatedDistance,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        notes: formData.notes,
        fare: {
          baseFare,
          loadingCharges,
          totalFare,
        },
        user: user, // Include user data
      };
      
      console.log('Booking data prepared for payment:', bookingData);
      
      // Redirect to payment page with booking data (no actual booking created yet)
      navigate('/payment', { 
        state: { 
          bookingData: bookingData
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }, [selectedVehicleWithOwner, formData, user, navigate]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-4">Your booking has been created successfully</p>
            <Card className="mb-4 p-4 bg-green-50 border-green-200">
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground mb-1">Booking Details</p>
                <p className="text-lg font-semibold text-green-800">
                  {formData.pickupCity} → {formData.dropCity}
                </p>
                <p className="text-sm text-muted-foreground">Distance: {formData.distance} km</p>
                <p className="text-xl font-bold text-primary mt-2">
                  Total Fare: ₹{calculateFare()}
                </p>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2 md:space-x-4 overflow-x-auto">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  1
                </div>
                <span className="ml-2 font-medium hidden md:inline">Load Details</span>
              </div>
              <div className={`w-8 md:w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  2
                </div>
                <span className="ml-2 font-medium hidden md:inline">Select Vehicle</span>
              </div>
              <div className={`w-8 md:w-16 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  3
                </div>
                <span className="ml-2 font-medium hidden md:inline">Select Owner</span>
              </div>
              <div className={`w-8 md:w-16 h-1 ${step >= 4 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  4
                </div>
                <span className="ml-2 font-medium hidden md:inline">Confirm Booking</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Load Details */}
        {step === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Enter Load Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loadWeight">Load Weight (kg) *</Label>
                  <Input
                    type="number"
                    id="loadWeight"
                    name="loadWeight"
                    value={formData.loadWeight}
                    onChange={handleChange}
                    placeholder="e.g., 500"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loadLength">Length (feet)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      id="loadLength"
                      name="loadLength"
                      value={formData.loadLength}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loadWidth">Width (feet)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      id="loadWidth"
                      name="loadWidth"
                      value={formData.loadWidth}
                      onChange={handleChange}
                      placeholder="e.g., 4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loadHeight">Height (feet)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      id="loadHeight"
                      name="loadHeight"
                      value={formData.loadHeight}
                      onChange={handleChange}
                      placeholder="e.g., 4"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="materialType">Material Type</Label>
                  <Input
                    type="text"
                    id="materialType"
                    name="materialType"
                    value={formData.materialType}
                    onChange={handleChange}
                    placeholder="e.g., Furniture, Electronics, Construction Material"
                  />
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Package className="h-4 w-4" />
                  <AlertDescription>
                    <strong className="text-blue-800">💡 Tips for accurate suggestions:</strong>
                    <ul className="text-sm text-blue-700 space-y-1 mt-2">
                      <li>• Enter actual weight for better vehicle matching</li>
                      <li>• Dimensions help in finding vehicles with adequate space</li>
                      <li>• Material type helps drivers prepare appropriately</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finding Vehicles...
                    </>
                  ) : (
                    'Find Suitable Vehicles'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Vehicle */}
        {step === 2 && (
          <div>
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Select a Vehicle</h2>
                    <p className="text-muted-foreground">Choose the best vehicle for your load</p>
                  </div>
                  <Button onClick={() => setStep(1)} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
            {(Object.keys(groupedVehicles).length > 0 || Object.keys(groupedAllVehicles).length > 0) ? (
              <div className="space-y-8">
                {/* Recommended Vehicles Section */}
                {Object.keys(groupedVehicles).length > 0 && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-foreground mb-2">Recommended Vehicles</h3>
                      <p className="text-muted-foreground">
                        These vehicles are best suited for your load requirements
                      </p>
                    </div>
                    <div className="space-y-6">
                      {Object.entries(groupedVehicles).map(([vehicleType, vehiclesOfType]) => (
                  <Card key={vehicleType} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Truck className="h-6 w-6 text-primary" />
                          <span>{vehicleType}</span>
                          <Badge variant="secondary">{vehiclesOfType.length} available</Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Capacity: {vehiclesOfType[0].capacity} kg • Base Fare: ₹{vehiclesOfType[0].baseFarePerKm}/km
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-3">
                          {vehiclesOfType.map((vehicle) => (
                            <div
                              key={vehicle._id}
                              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                selectedVehicle?._id === vehicle._id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => handleVehicleSelect(vehicle)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <span className="font-medium">{vehicle.registrationNumber}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {vehicle.owner.name}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <div className="flex items-center space-x-4">
                                      <span>📦 {vehicle.capacity} kg capacity</span>
                                      <span>💰 ₹{vehicle.baseFarePerKm}/km</span>
                                      {vehicle.loadingCharge && (
                                        <span>⚡ ₹{vehicle.loadingCharge} loading</span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <User className="h-4 w-4" />
                                      <span>{vehicle.owner.name}</span>
                                      <Phone className="h-4 w-4 ml-2" />
                                      <span>{vehicle.owner.phone}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {selectedVehicle?._id === vehicle._id && (
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                  )}
                                  <Button
                                    variant={selectedVehicle?._id === vehicle._id ? "default" : "outline"}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVehicleSelect(vehicle);
                                    }}
                                  >
                                    {selectedVehicle?._id === vehicle._id ? "Selected" : "Select"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                    </div>
                  </div>
                )}

                {/* Other Available Vehicles Section */}
                {Object.keys(groupedAllVehicles).length > 0 && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-foreground mb-2">Other Available Vehicles</h3>
                      <p className="text-muted-foreground">
                        Additional vehicles that might work for your needs
                      </p>
                    </div>
                    <div className="space-y-6">
                      {Object.entries(groupedAllVehicles).map(([vehicleType, vehiclesOfType]) => {
                        // Skip if this type is already shown in recommended
                        if (groupedVehicles[vehicleType]) {
                          return null;
                        }
                        
                        return (
                          <Card key={vehicleType} className="overflow-hidden">
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Truck className="h-6 w-6 text-muted-foreground" />
                                  <span>{vehicleType}</span>
                                  <Badge variant="outline">{vehiclesOfType.length} available</Badge>
                                </div>
                              </CardTitle>
                              <CardDescription>
                                Capacity: {vehiclesOfType[0].capacity} kg • Base Fare: ₹{vehiclesOfType[0].baseFarePerKm}/km
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="grid gap-3">
                                  {vehiclesOfType.map((vehicle) => (
                                    <div
                                      key={vehicle._id}
                                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                        selectedVehicle?._id === vehicle._id
                                          ? 'border-primary bg-primary/5'
                                          : 'border-border hover:border-primary/50'
                                      }`}
                                      onClick={() => handleVehicleSelect(vehicle)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-3 mb-2">
                                            <span className="font-medium">{vehicle.registrationNumber}</span>
                                            <Badge variant="outline" className="text-xs">
                                              {vehicle.owner.name}
                                            </Badge>
                                          </div>
                                          <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="flex items-center space-x-4">
                                              <span>📦 {vehicle.capacity} kg capacity</span>
                                              <span>💰 ₹{vehicle.baseFarePerKm}/km</span>
                                              {vehicle.loadingCharge && (
                                                <span>⚡ ₹{vehicle.loadingCharge} loading</span>
                                              )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <User className="h-4 w-4" />
                                              <span>{vehicle.owner.name}</span>
                                              <Phone className="h-4 w-4 ml-2" />
                                              <span>{vehicle.owner.phone}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {selectedVehicle?._id === vehicle._id && (
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                          )}
                                          <Button
                                            variant={selectedVehicle?._id === vehicle._id ? "default" : "outline"}
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleVehicleSelect(vehicle);
                                            }}
                                          >
                                            {selectedVehicle?._id === vehicle._id ? "Selected" : "Select"}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">No Suitable Vehicles Found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your load requirements or contact support
                  </p>
                  <Button onClick={() => setStep(1)}>
                    Adjust Requirements
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}


        {/* Step 3: Confirm Booking with Google Maps */}
        {step === 4 && selectedVehicle && selectedVehicleWithOwner && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    {/* Pickup Location with Google Maps */}
                    <div>
                      <Label className="text-base font-bold flex items-center mb-3">
                        <MapPin className="h-4 w-4 mr-2" />
                        Pickup Location *
                      </Label>
                      <LocationPicker
                        onLocationSelect={handlePickupLocationSelect}
                        label="Click on map or search to select pickup location"
                      />
                      {formData.pickupAddress && (
                        <Card className="mt-3 bg-green-50 border-green-200">
                          <CardContent className="p-4">
                            <p className="text-sm font-semibold text-green-800 mb-1">Selected Address:</p>
                            <p className="text-sm text-foreground">{formData.pickupAddress}</p>
                            <div className="flex space-x-4 mt-2">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">City:</span> {formData.pickupCity}
                              </p>
                              {formData.pickupPincode && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-semibold">Pincode:</span> {formData.pickupPincode}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Drop Location with Google Maps */}
                    <div>
                      <Label className="text-base font-bold flex items-center mb-3">
                        <MapPin className="h-4 w-4 mr-2" />
                        Drop Location *
                      </Label>
                      <LocationPicker
                        onLocationSelect={handleDropLocationSelect}
                        label="Click on map or search to select drop location"
                      />
                      {formData.dropAddress && (
                        <Card className="mt-3 bg-red-50 border-red-200">
                          <CardContent className="p-4">
                            <p className="text-sm font-semibold text-red-800 mb-1">Selected Address:</p>
                            <p className="text-sm text-foreground">{formData.dropAddress}</p>
                            <div className="flex space-x-4 mt-2">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">City:</span> {formData.dropCity}
                              </p>
                              {formData.dropPincode && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-semibold">Pincode:</span> {formData.dropPincode}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Calculated Distance */}
                    {formData.distance && (
                      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Calculated Distance</p>
                              <p className="text-3xl font-bold text-blue-600">{formData.distance} km</p>
                            </div>
                            <MapPin className="h-12 w-12 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Schedule Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduledDate" className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Scheduled Date *
                        </Label>
                        <Input
                          type="date"
                          id="scheduledDate"
                          name="scheduledDate"
                          value={formData.scheduledDate}
                          onChange={handleChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduledTime" className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Preferred Time
                        </Label>
                        <Input
                          type="time"
                          id="scheduledTime"
                          name="scheduledTime"
                          value={formData.scheduledTime}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Any special instructions for the driver..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <Button type="button" onClick={() => setStep(2)} variant="outline" className="flex-1">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Change Vehicle
                      </Button>
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          'Confirm Booking'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-primary/5 to-background sticky top-8">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                
                  {/* Selected Vehicle & Owner */}
                  <Card className="mb-4 border-2 border-primary/20">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Selected Vehicle</p>
                      <p className="text-lg font-bold text-foreground">{selectedVehicle.type}</p>
                      <p className="text-sm text-muted-foreground">Capacity: {selectedVehicle.capacity} kg</p>
                      
                      {selectedVehicleWithOwner && (
                        <>
                          <Separator className="my-3" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Vehicle Owner</p>
                            <p className="text-sm font-semibold text-foreground">{selectedVehicleWithOwner.owner?.name || 'Vehicle Owner'}</p>
                            <p className="text-xs text-muted-foreground">{selectedVehicleWithOwner.owner?.email}</p>
                            {selectedVehicleWithOwner.owner?.vehicleOwnerDetails?.isVerified && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Verified Owner
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Route Summary */}
                  {formData.pickupCity && formData.dropCity && (
                    <Card className="mb-4">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-2">Route</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-semibold text-green-600">📍 {formData.pickupCity}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-semibold text-red-600">🏁 {formData.dropCity}</span>
                        </div>
                        {formData.distance && (
                          <p className="text-xs text-muted-foreground mt-1">Distance: {formData.distance} km</p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Load Details */}
                  <Card className="mb-4">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-2">Load Details</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-foreground">
                          <span className="font-semibold">Weight:</span> {formData.loadWeight} kg
                        </p>
                        {formData.materialType && (
                          <p className="text-foreground">
                            <span className="font-semibold">Material:</span> {formData.materialType}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fare Breakdown */}
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-3">Fare Breakdown</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Base Fare</span>
                          <span className="font-semibold text-foreground">
                            ₹{selectedVehicleWithOwner?.baseFarePerKm || 0} × {formData.distance || 50} km
                          </span>
                        </div>
                        {selectedVehicleWithOwner?.loadingCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Loading Charges</span>
                            <span className="font-semibold text-foreground">₹{selectedVehicleWithOwner.loadingCharge}</span>
                          </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground">Total Fare</span>
                          <span className="text-2xl font-bold text-green-600">₹{calculateFare()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Important Notes */}
                  <Card className="mt-4 bg-yellow-50 border-yellow-200">
                    <CardContent className="p-3">
                      <p className="text-xs font-semibold text-yellow-800 mb-1 flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        Important
                      </p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Driver will contact you before pickup</li>
                        <li>• Ensure load is ready at scheduled time</li>
                        <li>• Payment on delivery</li>
                      </ul>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;