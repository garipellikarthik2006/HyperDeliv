import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
<<<<<<< HEAD
import { useGeolocation } from '../hooks/useGoogleMaps';
=======
import { useGeolocation } from '@/hooks/useGoogleMaps';
>>>>>>> 10c05f6 ( change the ui)
import { realTimeTrackingService } from '@/services/realTimeTracking';
import { useAuth } from '@/context/AuthContext';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Phone, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Navigation2,
  Battery,
  Signal
} from 'lucide-react';

// Delivery boy tracking interface
export const DeliveryBoyTracking: React.FC = () => {
  const { user } = useAuth();
  const { currentLocation, error, isLoading, getCurrentLocation, watchLocation } = useGeolocation();
  const [isTracking, setIsTracking] = useState(false);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState('strong');
  const [locationWatchId, setLocationWatchId] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Load active orders for delivery boy
    const loadActiveOrders = () => {
      const orders = JSON.parse(localStorage.getItem('dabbaflow_orders') || '[]');
      const deliveryOrders = orders.filter((order: any) => 
        order.status === 'in_progress' && 
        order.vendorId === user?.id
      );
      setActiveOrders(deliveryOrders);
    };

    loadActiveOrders();
    const interval = setInterval(loadActiveOrders, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // Simulate battery level changes
    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => Math.max(20, prev - Math.random() * 2));
    }, 60000); // Update every minute

    return () => clearInterval(batteryInterval);
  }, []);

  const startTracking = async () => {
    try {
      const location = await getCurrentLocation();
      if (!location) return;

      // Start location tracking
<<<<<<< HEAD
      const cleanup = watchLocation((loc) => {
=======
      const cleanup = watchLocation((location) => {
>>>>>>> 10c05f6 ( change the ui)
        // Send location update to server
        realTimeTrackingService.sendWebSocketMessage({
          type: 'location_update',
          data: {
            deliveryBoyId: user?.id,
<<<<<<< HEAD
            location: loc,
=======
            location,
>>>>>>> 10c05f6 ( change the ui)
            batteryLevel,
            signalStrength
          },
          timestamp: Date.now()
        });
      });

<<<<<<< HEAD
      setLocationWatchId(cleanup);
=======
      setLocationWatchId(() => cleanup);
>>>>>>> 10c05f6 ( change the ui)
      setIsTracking(true);

      // Start tracking for each active order
      activeOrders.forEach(order => {
        realTimeTrackingService.startOrderTracking(order.id, (tracking) => {
          console.log('Order tracking update:', tracking);
        });
      });
    } catch (error) {
      console.error('Failed to start tracking:', error);
    }
  };

  const stopTracking = () => {
    if (locationWatchId) {
      locationWatchId();
      setLocationWatchId(null);
    }
    setIsTracking(false);

    // Stop tracking for all active orders
    activeOrders.forEach(order => {
      realTimeTrackingService.stopOrderTracking(order.id);
    });
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    // Update order status
    realTimeTrackingService.sendWebSocketMessage({
      type: 'order_status',
      data: {
        orderId,
        status,
        deliveryBoyId: user?.id
      },
      timestamp: Date.now()
    });

    // Update local storage
    const orders = JSON.parse(localStorage.getItem('dabbaflow_orders') || '[]');
    const updatedOrders = orders.map((order: any) => 
      order.id === orderId ? { ...order, status } : order
    );
    localStorage.setItem('dabbaflow_orders', JSON.stringify(updatedOrders));

    // Update active orders
    setActiveOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const getSignalIcon = () => {
    switch (signalStrength) {
      case 'strong': return <Signal className="h-4 w-4 text-green-600" />;
      case 'medium': return <Signal className="h-4 w-4 text-yellow-600" />;
      case 'weak': return <Signal className="h-4 w-4 text-red-600" />;
      default: return <Signal className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'text-green-600';
    if (batteryLevel > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation2 className="h-5 w-5" />
              Delivery Tracking Status
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isTracking}
                onCheckedChange={(checked) => {
                  if (checked) {
                    startTracking();
                  } else {
                    stopTracking();
                  }
                }}
              />
              <Label>{isTracking ? 'Tracking' : 'Offline'}</Label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium">Current Location</div>
                <div className="text-xs text-gray-600">
                  {currentLocation 
                    ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                    : 'Location not available'
                  }
                </div>
              </div>
            </div>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>

          {/* Device Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Battery className={`h-4 w-4 ${getBatteryColor()}`} />
              <div>
                <div className="text-sm font-medium">Battery</div>
                <div className="text-xs text-gray-600">{batteryLevel}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getSignalIcon()}
              <div>
                <div className="text-sm font-medium">Signal</div>
                <div className="text-xs text-gray-600 capitalize">{signalStrength}</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600">No active deliveries</div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">Order #{order.id}</div>
                      <div className="text-sm text-gray-600">
                        {order.type === 'Food' ? 'Food Delivery' : 'Print Delivery'}
                      </div>
                    </div>
                    <Badge className={
                      order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {order.status === 'in_progress' ? 'In Progress' :
                       order.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">
                        Delivery to: {order.details?.dropLocation || 'Customer Address'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">
                        ETA: {order.estimatedTime || 15} minutes
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {order.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Delivered
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="h-4 w-4 mr-1" />
                      Call Customer
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open(`tel:${user?.phone || '9123456789'}`)}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Support
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              // Navigate to emergency contacts
              console.log('Emergency contacts');
            }}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Emergency Contacts
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              // View earnings
              console.log('View earnings');
            }}
          >
            <Navigation className="h-4 w-4 mr-2" />
            View Earnings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
