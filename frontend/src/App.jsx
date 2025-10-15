
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import RegisterCustomer from './pages/RegisterCustomer';
import RegisterOwnerNew from './pages/RegisterOwnerNew';

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Booking = lazy(() => import('./pages/Booking'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const AuthSuccess = lazy(() => import('./pages/AuthSuccess'));
const Payment = lazy(() => import('./pages/Payment'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<RoleSelection />} />
              <Route path="/register-customer" element={<RegisterCustomer />} />
              <Route path="/register-owner" element={<RegisterOwnerNew />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="/auth-success" element={<AuthSuccess />} />
              <Route path="/payment" element={<Payment />} />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;