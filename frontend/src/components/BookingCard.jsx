import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Package, Calendar, DollarSign, Clock } from 'lucide-react';

const BookingCard = memo(({ booking }) => {
  // Status badge variants
  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'confirmed':
        return 'secondary';
      case 'in-transit':
        return 'secondary';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Owner approval status variants
  const getApprovalVariant = (approvalStatus) => {
    switch (approvalStatus) {
      case 'pending':
        return 'outline';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">
              {booking.vehicle.type}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Booking ID: {booking._id.slice(-8)}
            </p>
          </div>
          <div className="flex flex-col space-y-1">
            <Badge variant={getStatusVariant(booking.status)} className="uppercase">
              {booking.status}
            </Badge>
            {booking.ownerApproval && (
              <Badge variant={getApprovalVariant(booking.ownerApproval.status)} className="text-xs">
                {booking.ownerApproval.status === 'pending' ? 'Awaiting Approval' : 
                 booking.ownerApproval.status === 'approved' ? 'Approved' : 'Rejected'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>

        <div className="space-y-3 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Pickup</p>
              <p className="text-sm text-muted-foreground">{booking.pickupLocation.address}</p>
              <p className="text-xs text-muted-foreground">{booking.pickupLocation.city}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <MapPin className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Drop</p>
              <p className="text-sm text-muted-foreground">{booking.dropLocation.address}</p>
              <p className="text-xs text-muted-foreground">{booking.dropLocation.city}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Load Weight</p>
              <p className="text-sm font-semibold text-foreground">{booking.loadWeight} kg</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="text-sm font-semibold text-foreground">{booking.distance} km</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Scheduled Date</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(booking.scheduledDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total Fare</p>
              <p className="text-sm font-semibold text-primary">₹{booking.fare.totalFare}</p>
            </div>
          </div>
        </div>

        {booking.notes && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 mb-1 font-semibold">Notes</p>
            <p className="text-sm text-blue-700">{booking.notes}</p>
          </div>
        )}

        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Booked on {new Date(booking.createdAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
});

BookingCard.displayName = 'BookingCard';

export default BookingCard;