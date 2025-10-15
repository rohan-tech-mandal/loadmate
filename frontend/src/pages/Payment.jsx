import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Smartphone, 
  QrCode, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Package, 
  Truck,
  ArrowLeft,
  Loader2
} from 'lucide-react';

const Payment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [error, setError] = useState('');
  
  const { user, getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData;
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    console.log('Payment page - user:', user);
    console.log('Payment page - bookingData:', bookingData);
    console.log('Payment page - location.state:', location.state);
    
    if (!user) {
      console.log('No user, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (!bookingData) {
      console.log('No booking data, redirecting to booking');
      navigate('/booking');
      return;
    }
  }, [user, bookingData, navigate, location.state]);

  const finalBookingData = bookingData;

  const totalAmount = finalBookingData.fare?.totalFare || 0;
  const upiLink = `upi://pay?pa=adityaghorpade81-1@oksbi&pn=Aditya Ghorpade&am=${totalAmount}&cu=INR`;
  
  console.log('Payment page - totalAmount:', totalAmount);
  console.log('Payment page - upiLink:', upiLink);

  // Generate QR code
  useEffect(() => {
    if (upiLink) {
      QRCode.toDataURL(upiLink, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then(url => {
        setQrCodeDataURL(url);
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [upiLink]);


  const handlePaymentConfirmation = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create the actual booking after payment confirmation
      const response = await axios.post(
        `${API_URL}/bookings`,
        {
          vehicleId: finalBookingData.vehicleId,
          pickupLocation: finalBookingData.pickupLocation,
          dropLocation: finalBookingData.dropLocation,
          loadWeight: finalBookingData.loadWeight,
          loadDimensions: finalBookingData.loadDimensions,
          materialType: finalBookingData.materialType,
          distance: finalBookingData.distance,
          scheduledDate: finalBookingData.scheduledDate,
          scheduledTime: finalBookingData.scheduledTime,
          notes: finalBookingData.notes,
        },
        { headers: getAuthHeader() }
      );
      
      console.log('Booking created successfully after payment:', response.data);
      
      setPaymentConfirmed(true);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      setError('Payment confirmation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Your booking has been confirmed. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Amount Paid: {formatCurrency(totalAmount)}</p>
              <p>Booking ID: {finalBookingData._id?.slice(-8) || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Booking
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Payment</h1>
          <p className="text-muted-foreground">Secure payment for your transport booking</p>
          
          {/* Error Display */}
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vehicle Details */}
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Truck className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">{finalBookingData.vehicle?.type}</p>
                  <p className="text-sm text-muted-foreground">
                    Capacity: {finalBookingData.vehicle?.capacity} kg
                  </p>
                </div>
              </div>

              {/* Route Details */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Pickup Location</p>
                    <p className="text-sm text-muted-foreground">
                      {typeof finalBookingData.pickupLocation === 'object' 
                        ? finalBookingData.pickupLocation.address 
                        : finalBookingData.pickupLocation}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Drop Location</p>
                    <p className="text-sm text-muted-foreground">
                      {typeof finalBookingData.dropLocation === 'object' 
                        ? finalBookingData.dropLocation.address 
                        : finalBookingData.dropLocation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Load Details */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Load Weight</p>
                  <p className="font-semibold">{finalBookingData.loadWeight} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-semibold">{finalBookingData.distance} km</p>
                </div>
              </div>

              {/* Schedule */}
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Scheduled Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(finalBookingData.scheduledDate).toLocaleDateString()} at {finalBookingData.scheduledTime}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method */}
              <div className="space-y-3">
                <p className="font-medium">Payment Method</p>
                <div className="flex items-center space-x-2 p-4 border rounded-lg bg-primary/5">
                  <Smartphone className="h-6 w-6 text-primary" />
                  <span className="font-medium">UPI Payment</span>
                </div>
              </div>

              {/* UPI Payment Section */}
              <div className="space-y-4">
                  <Alert>
                    <QrCode className="h-4 w-4" />
                    <AlertDescription>
                      Scan the QR code below to complete payment
                    </AlertDescription>
                  </Alert>

                  {/* QR Code */}
                  <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed border-muted-foreground/25">
                    <div className="text-center">
                      {qrCodeDataURL ? (
                        <div className="mb-4">
                          <img 
                            src={qrCodeDataURL} 
                            alt="UPI Payment QR Code" 
                            className="w-48 h-48 mx-auto rounded-lg shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                          <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        QR Code for {formatCurrency(totalAmount)}
                      </p>
                    </div>
                  </div>


                  {/* Payment Instructions */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Payment Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Scan the QR code with any UPI app</li>
                      <li>Verify the amount: {formatCurrency(totalAmount)}</li>
                      <li>Complete the payment</li>
                      <li>Click "Confirm Payment" below</li>
                    </ol>
                  </div>
                </div>

              {/* Amount Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Fare ({finalBookingData.distance} km)</span>
                    <span>{formatCurrency(finalBookingData.fare?.baseFare || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Loading Charges</span>
                    <span>{formatCurrency(finalBookingData.fare?.loadingCharges || 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Amount</span>
                    <span className="text-primary">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Confirm Payment Button */}
              <Button
                onClick={handlePaymentConfirmation}
                disabled={isProcessing}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By confirming payment, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
