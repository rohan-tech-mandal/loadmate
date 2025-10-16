import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { User, Mail, Phone, Lock, Building2, FileText, CheckCircle, Loader2, ArrowLeft, Truck } from 'lucide-react';

const RegisterOwnerNew = () => {
  const [formData, setFormData] = useState({
    // User details
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Owner details
    businessName: '',
    licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.businessName || !formData.licenseNumber) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Register user first
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone
      );

      if (result.success) {
        // Update user role to owner
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/owner/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${result.data.token}`,
          },
          body: JSON.stringify({
            businessName: formData.businessName,
            licenseNumber: formData.licenseNumber,
          }),
        });

        if (response.ok) {
          const updatedUserData = await response.json();
          
          // Update the user info in context, preserving the original token
          const userUpdateData = {
            _id: updatedUserData._id,
            name: updatedUserData.name,
            email: updatedUserData.email,
            role: updatedUserData.role,
            vehicleOwnerDetails: updatedUserData.vehicleOwnerDetails,
            // Keep the original token from the registration result
            token: result.data.token
          };
          
          updateUser(userUpdateData);
          
          // Wait a bit to ensure the context is updated before navigation
          setTimeout(() => {
            alert('Successfully registered as vehicle owner! You can now start adding vehicles.');
            navigate('/owner');
          }, 100);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to register as owner');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <Card>
          {/* Header */}
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold">Create Owner Account</CardTitle>
            <CardDescription>Join as a vehicle owner and start earning</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Full Name *
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Address *
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Password *
                      </Label>
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="confirmPassword" className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Confirm Password *
                      </Label>
                      <Input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information Section */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        Business Name *
                      </Label>
                      <Input
                        type="text"
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="ABC Transport Services"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber" className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Transport License Number *
                      </Label>
                      <Input
                        type="text"
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="TL-12345678"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Information Box */}
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong className="text-blue-800">What happens next?</strong>
                  <ul className="text-sm text-blue-700 space-y-1 mt-2">
                    <li>✓ Your account will be created as a vehicle owner</li>
                    <li>✓ You can add your vehicles to the platform</li>
                    <li>✓ Your vehicles will be available immediately</li>
                    <li>✓ Start receiving booking requests and earning money</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Owner Account...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-4 w-4" />
                    Sign Up as Owner
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Back to Role Selection */}
            <div className="text-center">
              <Button asChild variant="outline">
                <Link to="/role-selection">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to role selection
                </Link>
              </Button>
            </div>

            {/* Login Link */}
            <p className="mt-4 text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:text-primary/80">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterOwnerNew;
