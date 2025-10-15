import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Zap, Truck, DollarSign, Package, Ruler, CheckCircle, MapPin } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50 to-primary-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-primary-foreground">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-fade-in">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
                Your Trusted Partner in
                <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Goods Transport
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-12 text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">
                Book reliable transport for your cargo with ease. Fast, secure, and affordable logistics solutions for businesses and individuals.
              </p>
            </div>
            
            <div className="animate-slide-up flex flex-col sm:flex-row justify-center items-center gap-6 mb-16">
              {user ? (
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
                  <Link to="/booking" className="flex items-center space-x-3">
                    <Package className="w-6 h-6" />
                    <span>Book Transport Now</span>
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
                    <Link to="/register" className="flex items-center space-x-3">
                      <Zap className="w-6 h-6" />
                      <span>Get Started</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/30 hover:border-white/50 hover:scale-105 transition-all duration-300">
                    <Link to="/vehicles" className="flex items-center space-x-3">
                      <Truck className="w-6 h-6" />
                      <span>View Vehicles</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
            
            {/* Stats */}
            <div className="animate-fade-in grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">10K+</div>
                <div className="text-white/80 text-sm font-medium">Happy Customers</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">50K+</div>
                <div className="text-white/80 text-sm font-medium">Successful Deliveries</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
                <div className="text-white/80 text-sm font-medium">Vehicle Fleet</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">99%</div>
                <div className="text-white/80 text-sm font-medium">On-Time Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Why Choose LoadMate?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience the future of logistics with our cutting-edge platform designed for modern businesses
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/50">
              <CardHeader>
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Truck className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce">
                    🚚
                  </div>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors duration-300">Wide Vehicle Range</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Choose from Tata Ace to Container Trucks. We have the right vehicle for every load size and requirement.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/50">
              <CardHeader>
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce delay-100">
                    ⚡
                  </div>
                </div>
                <CardTitle className="group-hover:text-emerald-600 transition-colors duration-300">Instant Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Book your transport in seconds with our intuitive platform. Schedule now or book for later - it's your choice.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/50">
              <CardHeader>
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <DollarSign className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce delay-200">
                    💰
                  </div>
                </div>
                <CardTitle className="group-hover:text-amber-600 transition-colors duration-300">Transparent Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  No hidden charges. See the exact fare before you book with our simple and transparent pricing model.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get started in minutes with our simple 4-step process
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                step: 1,
                title: "Enter Details",
                description: "Provide pickup, drop location and load details",
                icon: "📝",
                color: "from-blue-500 to-blue-600"
              },
              {
                step: 2,
                title: "Choose Vehicle",
                description: "Select from suggested vehicles based on your load",
                icon: "🚛",
                color: "from-emerald-500 to-emerald-600"
              },
              {
                step: 3,
                title: "Confirm Booking",
                description: "Review details and confirm your booking",
                icon: "✅",
                color: "from-amber-500 to-amber-600"
              },
              {
                step: 4,
                title: "Track Delivery",
                description: "Monitor your shipment in real-time",
                icon: "📍",
                color: "from-purple-500 to-purple-600"
              }
            ].map((item, index) => (
              <div key={item.step} className="text-center group">
                <div className="relative mb-8">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl`}>
                    {item.step}
                  </div>
                  <div className="absolute -top-2 -right-2 text-3xl group-hover:scale-110 transition-transform duration-300 animate-bounce" style={{ animationDelay: `${index * 200}ms` }}>
                    {item.icon}
                  </div>
                  {/* Connection Line */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-slate-300 to-slate-200 transform translate-x-4"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-primary-600 transition-colors duration-300">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-600 to-primary-700 text-primary-foreground">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to Transport Your Goods?
          </h2>
          <p className="text-xl mb-12 text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied customers and experience seamless logistics
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <Link to={user ? '/booking' : '/register'} className="flex items-center space-x-3">
                <Zap className="w-6 h-6" />
                <span>{user ? 'Book Now' : 'Sign Up Free'}</span>
              </Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" size="lg" className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/30 hover:border-white/50 hover:scale-105 transition-all duration-300">
                <Link to="/register-owner" className="flex items-center space-x-3">
                  <Truck className="w-6 h-6" />
                  <span>Become an Owner</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;