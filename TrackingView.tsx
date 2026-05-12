import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useLiveTracking } from '@/hooks/useGoogleMaps';
import { OrderTracking } from '@/services/realTimeTracking';
import { MapPin, Clock, Navigation, Phone, MessageCircle } from 'lucide-react';

// User tracking component
export const UserTrackingView: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { tracking, isTracking, updateTracking, maps } = useLiveTracking(orderId);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    // Initialize map
    const mapElement = document.getElementById('tracking-map');
    if (mapElement && maps.mapInstance === null) {
      maps.initializeMap('tracking-map');
    }

    // Start tracking simulation (in real app, this would come from WebSocket)
    const simulateTracking = () => {
      const mockTracking: OrderTracking = {
        orderId,
        deliveryBoyId: 'delivery_001',
        currentLocation: {
          lat: 17.3850 + Math.random() * 0.01,
          lng: 78.4867 + Math.random() * 0.01,
          timestamp: Date.now()
        },
        route: [
          { lat: 17.3850, lng: 78.4867, timestamp: Date.now() },
          { lat: 17.3900, lng: 78.4900, timestamp: Date.now() + 60000 },
          { lat: 17.3950, lng: 78.4950, timestamp: Date.now() + 120000 },
          { lat: 17.4000, lng: 78.5000, timestamp: Date.now() + 180000 }
        ],
        estimatedTime: 15,
        status: 'in_progress',
        lastUpdated: Date.now()
      };

      updateTracking(mockTracking);
    };

    simulateTracking();
    const interval = setInterval(simulateTracking, 5000);

    return () => clearInterval(interval);
  }, [orderId, updateTracking, maps]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'accepted': return 'Order Accepted';
      case 'in_progress': return 'Out for Delivery';
      case 'completed': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const getProgressPercentage = () => {
    if (!tracking) return 0;
    switch (tracking.status) {
      case 'pending': return 25;
      case 'accepted': return 50;
      case 'in_progress': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Live Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {maps.isLoading ? (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : maps.error ? (
            <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
              <div className="text-center">
                <p className="text-red-600">Error loading map: {maps.error}</p>
              </div>
            </div>
          ) : (
            <div 
              id="tracking-map" 
              className="h-96 rounded-lg overflow-hidden"
              style={{ minHeight: '400px' }}
            />
          )}
        </CardContent>
      </Card>

      {/* Order Status */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(tracking?.status || 'pending')}>
              {getStatusText(tracking?.status || 'pending')}
            </Badge>
            {tracking && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{tracking.estimatedTime} mins</span>
              </div>
            )}
          </div>

          <Progress value={getProgressPercentage()} className="h-2" />

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className={`p-2 rounded ${tracking?.status === 'pending' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <div className="text-xs font-medium">Order Placed</div>
            </div>
            <div className={`p-2 rounded ${tracking?.status === 'accepted' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <div className="text-xs font-medium">Order Accepted</div>
            </div>
            <div className={`p-2 rounded ${tracking?.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <div className="text-xs font-medium">Out for Delivery</div>
            </div>
            <div className={`p-2 rounded ${tracking?.status === 'completed' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <div className="text-xs font-medium">Delivered</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tracking ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Navigation className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Delivery Partner</div>
                    <div className="text-sm text-gray-600">John Doe</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">Current Location:</span>
                  <span className="font-medium">
                    {tracking.currentLocation.lat.toFixed(4)}, {tracking.currentLocation.lng.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">Estimated Arrival:</span>
                  <span className="font-medium">{tracking.estimatedTime} minutes</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setShowDetails(!showDetails)}
                className="w-full"
              >
                {showDetails ? 'Hide' : 'Show'} More Details
              </Button>

              {showDetails && (
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium mb-2">Route Information</div>
                    <div className="space-y-1 text-gray-600">
                      <div>Distance: ~{Math.round(tracking.route.length * 0.5)} km</div>
                      <div>Route Points: {tracking.route.length}</div>
                      <div>Last Updated: {new Date(tracking.lastUpdated).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-600">No tracking information available</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};;

// Vendor tracking component
export const VendorTrackingView: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { tracking, isTracking, updateTracking, maps } = useLiveTracking(orderId);
  const [showRouteOptimization, setShowRouteOptimization] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    // Initialize map
    const mapElement = document.getElementById('vendor-tracking-map');
    if (mapElement && maps.mapInstance === null) {
      maps.initializeMap('vendor-tracking-map');
    }

    // Start tracking simulation
    const simulateTracking = () => {
      const mockTracking: OrderTracking = {
        orderId,
        deliveryBoyId: 'delivery_001',
        currentLocation: {
          lat: 17.3850 + Math.random() * 0.01,
          lng: 78.4867 + Math.random() * 0.01,
          timestamp: Date.now()
        },
        route: [
          { lat: 17.3850, lng: 78.4867, timestamp: Date.now() },
          { lat: 17.3900, lng: 78.4900, timestamp: Date.now() + 60000 },
          { lat: 17.3950, lng: 78.4950, timestamp: Date.now() + 120000 },
          { lat: 17.4000, lng: 78.5000, timestamp: Date.now() + 180000 }
        ],
        estimatedTime: 15,
        status: 'in_progress',
        lastUpdated: Date.now()
      };

      updateTracking(mockTracking);
    };

    simulateTracking();
    const interval = setInterval(simulateTracking, 5000);

    return () => clearInterval(interval);
  }, [orderId, updateTracking, maps]);

  return (
    <div className="space-y-6">
      {/* Map Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Delivery Tracking
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowRouteOptimization(!showRouteOptimization)}
            >
              Optimize Route
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {maps.isLoading ? (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : maps.error ? (
            <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
              <div className="text-center">
                <p className="text-red-600">Error loading map: {maps.error}</p>
              </div>
            </div>
          ) : (
            <div 
              id="vendor-tracking-map" 
              className="h-96 rounded-lg overflow-hidden"
              style={{ minHeight: '400px' }}
            />
          )}
        </CardContent>
      </Card>

      {/* Delivery Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">ETA</div>
                <div className="font-semibold">{tracking?.estimatedTime || 0} mins</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="font-semibold capitalize">{tracking?.status || 'Unknown'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-gray-600">Distance</div>
                <div className="font-semibold">~{Math.round((tracking?.route.length || 0) * 0.5)} km</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Optimization */}
      {showRouteOptimization && (
        <Card>
          <CardHeader>
            <CardTitle>Route Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Current Route</div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Distance: ~2.5 km</div>
                  <div className="text-sm text-gray-600">Time: 15 mins</div>
                  <div className="text-sm text-gray-600">Traffic: Moderate</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Optimized Route</div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-sm text-green-600">Distance: ~2.2 km</div>
                  <div className="text-sm text-green-600">Time: 12 mins</div>
                  <div className="text-sm text-green-600">Traffic: Light</div>
                  <div className="text-xs text-green-600 mt-1">Saves 3 mins</div>
                </div>
              </div>
            </div>
            <Button className="w-full">Apply Optimized Route</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
