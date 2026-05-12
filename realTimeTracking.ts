import { TRACKING_CONFIG, GOOGLE_MAPS_URLS, MARKER_CONFIG } from '@/config/googleMaps';

// Location tracking interface
export interface Location {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

// Order tracking interface
export interface OrderTracking {
  orderId: string;
  deliveryBoyId?: string;
  currentLocation: Location;
  route: Location[];
  estimatedTime: number; // in minutes
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  lastUpdated: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'location_update' | 'order_status' | 'route_update' | 'eta_update';
  data: any;
  timestamp: number;
}

// Real-time tracking service
class RealTimeTrackingService {
  private ws: WebSocket | null = null;
  private locationWatchId: number | null = null;
  private trackingCallbacks: Map<string, (data: any) => void> = new Map();
  private currentTracking: Map<string, OrderTracking> = new Map();
private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor() {
    this.initializeWebSocket();
  }

  // Initialize WebSocket connection
  private initializeWebSocket() {
    try {
      this.ws = new WebSocket(TRACKING_CONFIG.WEBSOCKET_URL);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected for real-time tracking');
      };

      this.ws.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.initializeWebSocket(), 5000);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  // Handle incoming WebSocket messages
  private handleWebSocketMessage(message: WebSocketMessage) {
    const callback = this.trackingCallbacks.get(message.type);
    if (callback) {
      callback(message.data);
    }

    // Update internal tracking state
    switch (message.type) {
      case 'location_update':
        this.updateOrderLocation(message.data);
        break;
      case 'order_status':
        this.updateOrderStatus(message.data);
        break;
      case 'route_update':
        this.updateOrderRoute(message.data);
        break;
      case 'eta_update':
        this.updateOrderETA(message.data);
        break;
    }
  }

  // Start tracking a delivery boy's location
  public startLocationTracking(deliveryBoyId: string, callback: (location: Location) => void) {
    this.trackingCallbacks.set(`location_${deliveryBoyId}`, callback);

    // Get current location
    if (navigator.geolocation) {
      this.locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now(),
            accuracy: position.coords.accuracy
          };

          // Send location update via WebSocket
          this.sendWebSocketMessage({
            type: 'location_update',
            data: {
              deliveryBoyId,
              location
            },
            timestamp: Date.now()
          });

          callback(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }

  // Stop tracking location
  public stopLocationTracking() {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  // Start tracking an order
  public startOrderTracking(orderId: string, callback: (tracking: OrderTracking) => void) {
    this.trackingCallbacks.set(`order_${orderId}`, callback);
    
    // Request initial tracking data
    this.sendWebSocketMessage({
      type: 'order_status',
      data: { orderId },
      timestamp: Date.now()
    });
  }

  // Stop tracking an order
  public stopOrderTracking(orderId: string) {
    this.trackingCallbacks.delete(`order_${orderId}`);
    this.currentTracking.delete(orderId);
  }

  // Update order location
  private updateOrderLocation(data: { orderId: string; location: Location }) {
    const tracking = this.currentTracking.get(data.orderId);
    if (tracking) {
      tracking.currentLocation = data.location;
      tracking.lastUpdated = Date.now();
      
      // Calculate new ETA
      this.calculateETA(data.orderId);
    }
  }

  // Update order status
  private updateOrderStatus(data: { orderId: string; status: string }) {
    const tracking = this.currentTracking.get(data.orderId);
    if (tracking) {
      tracking.status = data.status as any;
      tracking.lastUpdated = Date.now();
    }
  }

  // Update order route
  private updateOrderRoute(data: { orderId: string; route: Location[] }) {
    const tracking = this.currentTracking.get(data.orderId);
    if (tracking) {
      tracking.route = data.route;
      tracking.lastUpdated = Date.now();
    }
  }

  // Update order ETA
  private updateOrderETA(data: { orderId: string; eta: number }) {
    const tracking = this.currentTracking.get(data.orderId);
    if (tracking) {
      tracking.estimatedTime = data.eta;
      tracking.lastUpdated = Date.now();
    }
  }

  // Calculate ETA using Google Maps Distance Matrix API
  private async calculateETA(orderId: string) {
    const tracking = this.currentTracking.get(orderId);
    if (!tracking) return;

    try {
      const response = await fetch(
        `${GOOGLE_MAPS_URLS.DISTANCE_MATRIX}/json?` +
        `origins=${tracking.currentLocation.lat},${tracking.currentLocation.lng}&` +
        `destinations=${tracking.route[tracking.route.length - 1]?.lat},${tracking.route[tracking.route.length - 1]?.lng}&` +
        `key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      
      if (data.rows[0]?.elements[0]?.duration) {
        const duration = data.rows[0].elements[0].duration.value; // in seconds
        tracking.estimatedTime = Math.round(duration / 60); // convert to minutes
        
        // Send ETA update
        this.sendWebSocketMessage({
          type: 'eta_update',
          data: {
            orderId,
            eta: tracking.estimatedTime
          },
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Failed to calculate ETA:', error);
    }
  }

  // Get route from Google Maps Directions API
  public async getRoute(origin: Location, destination: Location, waypoints?: Location[]): Promise<Location[]> {
    try {
      let url = `${GOOGLE_MAPS_URLS.DIRECTIONS_API}/json?` +
        `origin=${origin.lat},${origin.lng}&` +
        `destination=${destination.lat},${destination.lng}&` +
        `key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;

      if (waypoints && waypoints.length > 0) {
        const waypointParams = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|');
        url += `&waypoints=${waypointParams}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const path = route.overview_polyline;
        
        // Decode polyline (simplified version)
        return this.decodePolyline(path.points);
      }
    } catch (error) {
      console.error('Failed to get route:', error);
    }

    return [];
  }

  // Decode Google Maps polyline
  private decodePolyline(encoded: string): Location[] {
    const points: Location[] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let shift = 0;
      let result = 0;
      let b;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        lat: lat / 1e5,
        lng: lng / 1e5,
        timestamp: Date.now()
      });
    }

    return points;
  }

  // ... inside RealTimeTrackingService class ...

  // Send WebSocket message
  public sendWebSocketMessage(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  } // <--- This brace closes sendWebSocketMessage

  // Clean up resources
  public cleanup() {
    this.stopLocationTracking();
    this.trackingCallbacks.clear();
    this.currentTracking.clear();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  } // <--- No semicolon here, just a brace
} // <--- This brace closes the RealTimeTrackingService class

// Export singleton instance
export const realTimeTrackingService = new RealTimeTrackingService();