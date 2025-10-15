import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

const AuthSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already set (from AuthContext), redirect to appropriate dashboard
    if (user) {
      const redirectTimer = setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'owner') {
          navigate('/owner');
        } else {
          navigate('/dashboard');
        }
      }, 2000); // 2 second delay to show success message

      return () => clearTimeout(redirectTimer);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-primary-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {user ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {user ? 'Authentication Successful!' : 'Processing...'}
          </CardTitle>
          <CardDescription>
            {user 
              ? `Welcome back, ${user.name}! Redirecting you to your dashboard...`
              : 'Please wait while we complete your authentication...'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthSuccess;
