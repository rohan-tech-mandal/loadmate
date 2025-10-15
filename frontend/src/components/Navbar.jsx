import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-primary-foreground font-bold text-xl">L</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:to-primary-700 transition-all duration-300">
              LoadMate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 hover:scale-105">
              Home
            </Link>
            <Link to="/vehicles" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 hover:scale-105">
              Vehicles
            </Link>

            {user && user.name ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 hover:scale-105">
                    Admin Panel
                  </Link>
                )}
                {(user.role === 'owner' || user.role === 'admin') && (
                  <Link to="/owner" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 hover:scale-105">
                    Owner Panel
                  </Link>
                )}
                {user.role === 'customer' && (
                  <>
                    <Link to="/dashboard" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 hover:scale-105">
                      Dashboard
                    </Link>
                    <Button asChild className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl">
                      <Link to="/booking">
                        Book Now
                      </Link>
                    </Button>
                  </>
                )}
                <div className="flex items-center space-x-3 pl-4">
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{user.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role || 'user'}</p>
                  </div>
                  <Avatar className="h-10 w-10">
                    {user.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={user.name || 'User'} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-primary-foreground">
                      {(user.name && user.name.charAt(0)) ? user.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLogout}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 hover:scale-105">
                  Login
                </Link>
                <Button asChild className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl">
                  <Link to="/register">
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-primary"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/95 backdrop-blur-md">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent">
                Home
              </Link>
              <Link to="/vehicles" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent">
                Vehicles
              </Link>

              {user && user.name ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent">
                      Admin Panel
                    </Link>
                  )}
                  {(user.role === 'owner' || user.role === 'admin') && (
                    <Link to="/owner" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent">
                      Owner Panel
                    </Link>
                  )}
                  {user.role === 'customer' && (
                    <>
                      <Link to="/dashboard" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent">
                        Dashboard
                      </Link>
                      <div className="px-4">
                        <Button asChild className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700">
                          <Link to="/booking">
                            Book Now
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}
                  <div className="px-4 py-2">
                    <Separator className="mb-4" />
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-10 w-10">
                        {user.profilePicture ? (
                          <AvatarImage src={user.profilePicture} alt={user.name || 'User'} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600 text-primary-foreground">
                          {(user.name && user.name.charAt(0)) ? user.name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role || 'user'}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleLogout}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start"
                    >
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-accent">
                    Login
                  </Link>
                  <div className="px-4">
                    <Button asChild className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700">
                      <Link to="/register">
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;