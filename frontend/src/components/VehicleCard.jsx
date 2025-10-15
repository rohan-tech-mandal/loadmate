import { useNavigate } from 'react-router-dom';
import { memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Package, Ruler, DollarSign, Tag } from 'lucide-react';

const VehicleCard = memo(({ vehicle, onSelect }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBookNow = () => {
    // Only customers can book vehicles
    if (user && user.role !== 'customer') {
      return;
    }
    
    if (onSelect) {
      onSelect(vehicle);
    } else {
      navigate('/booking', { state: { selectedVehicle: vehicle } });
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/50">
      {/* Vehicle Image Placeholder */}
      <div className="relative overflow-hidden rounded-t-lg">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-blue-100 h-48 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <div className="text-8xl group-hover:scale-110 transition-transform duration-300 animate-float">🚚</div>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-emerald-500 text-white hover:bg-emerald-600">
            Available
          </Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="group-hover:text-primary transition-colors duration-300">
          {vehicle.type}
        </CardTitle>
        {vehicle.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{vehicle.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg group-hover:bg-primary/5 transition-colors duration-200">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Capacity</span>
          </div>
          <span className="text-sm font-bold text-foreground">{vehicle.capacity} kg</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg group-hover:bg-primary/5 transition-colors duration-200">
          <div className="flex items-center space-x-2">
            <Ruler className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Dimensions</span>
          </div>
          <span className="text-sm font-bold text-foreground">
            {vehicle.dimensions.length}' × {vehicle.dimensions.width}' × {vehicle.dimensions.height}'
          </span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/5 to-blue-50 rounded-lg group-hover:from-primary/10 group-hover:to-blue-100 transition-colors duration-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Base Fare</span>
          </div>
          <span className="text-sm font-bold text-primary">₹{vehicle.baseFarePerKm}/km</span>
        </div>
        
        {vehicle.loadingCharge > 0 && (
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg group-hover:bg-primary/5 transition-colors duration-200">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Loading Charge</span>
            </div>
            <span className="text-sm font-bold text-foreground">₹{vehicle.loadingCharge}</span>
          </div>
        )}

        <Button
          onClick={handleBookNow}
          disabled={user && user.role !== 'customer'}
          className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl group-hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {user && user.role !== 'customer' ? 'View Only' : 'Book Now'}
        </Button>
      </CardContent>
    </Card>
  );
});

VehicleCard.displayName = 'VehicleCard';

export default VehicleCard;