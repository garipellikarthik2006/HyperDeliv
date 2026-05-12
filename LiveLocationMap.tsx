import { useState, useEffect, useRef } from 'react';
import { MapPin, Package, Home, User, Clock } from 'lucide-react';

interface LocationData {
  pickup: { lat: number; lng: number; address: string };
  drop: { lat: number; lng: number; address: string };
  rider: { lat: number; lng: number };
}

interface LiveLocationMapProps {
  pickupLocation: LocationData;
  dropLocation: LocationData;
  riderLocation: { lat: number; lng: number };
}

export const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
  pickupLocation,
  dropLocation,
  riderLocation
}) => {
  return (
    <div className="rounded-lg border bg-card shadow-lg overflow-hidden" style={{ height: '400px' }}>
      {/* Map Header */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">Live Location Tracking</h3>
          <button
            className="p-2 rounded-md bg-[#f58634] text-white hover:bg-[#e07428] transition-colors"
            title="Recenter to Hyderabad"
          >
            <MapPin size={16} />
          </button>
        </div>
        
        {/* Location Status */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-green-600" />
            <div>
              <p className="font-medium text-foreground">Pickup</p>
              <p className="text-muted-foreground">{pickupLocation.pickup.address}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-red-600" />
            <div>
              <p className="font-medium text-foreground">Drop-off</p>
              <p className="text-muted-foreground">{dropLocation.drop.address}</p>
            </div>
          </div>
          
          {riderLocation.lat && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <p className="font-medium text-foreground">Raj Kumar</p>
                <p className="text-muted-foreground">On the way</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Estimated Arrival */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <p className="font-medium text-foreground">Estimated Arrival</p>
              <p className="text-lg font-bold text-orange-600">15-20 mins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container - Static Placeholder */}
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="relative">
            {/* Animated Map Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-8 gap-1 p-4">
                {[...Array(32)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/10"
                    style={{
                      animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Map Icon */}
            <MapPin className="h-16 w-16 text-orange-500 mb-4 relative z-10" />
            
            {/* Content */}
            <div className="relative z-20 bg-white rounded-lg p-6 shadow-lg">
              <h4 className="text-lg font-bold text-gray-800 mb-2">Live Map View</h4>
              <p className="text-sm text-gray-600 mb-4">
                Interactive map showing real-time delivery tracking
              </p>
              <p className="text-xs text-gray-500">
                Map features will be available once Google Maps API is configured
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
