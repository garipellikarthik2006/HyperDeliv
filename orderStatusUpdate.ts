import { OrderSync } from '@/lib/orderSync';
import { Location, OrderTracking } from './realTimeTracking';
import { fastTrackingAlgorithms, RouteOptimization } from './fastTrackingAlgorithms';
import { GOOGLE_MAPS_URLS } from '@/config/googleMaps';

// Order status update service
class OrderStatusUpdateService {
  private activeTracking: Map<string, OrderTracking> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Start tracking an order with real-time updates
  public startOrderTracking(orderId: string, deliveryBoyId: string) {
    // Get order details
    const order = this.getOrderById(orderId);
    if (!order) return;

    // Initialize tracking
    const tracking: OrderTracking = {
      orderId,
      deliveryBoyId,
      currentLocation: this.getDeliveryBoyLocation(deliveryBoyId),
      route: [],
      estimatedTime: 15,
      status: 'in_progress',
      lastUpdated: Date.now()
    };

    this.activeTracking.set(orderId, tracking);

    // Calculate initial route
    this.calculateOptimalRoute(orderId);

    // Start real-time updates
    this.startRealTimeUpdates(orderId);

    // Update order status
    this.updateOrderStatus(orderId, 'in_progress');
  }

  // Stop tracking an order
  public stopOrderTracking(orderId: string) {
    const interval = this.updateIntervals.get(orderId);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(orderId);
    }

    this.activeTracking.delete(orderId);
  }

  // Update delivery boy location
  public updateDeliveryBoyLocation(deliveryBoyId: string, location: Location) {
    // Find all active orders for this delivery boy
    this.activeTracking.forEach((tracking, orderId) => {
      if (tracking.deliveryBoyId === deliveryBoyId) {
        tracking.currentLocation = location;
        tracking.lastUpdated = Date.now();

        // Recalculate ETA
        this.calculateETA(orderId);

        // Check if delivery boy is near destination
        this.checkProximityToDestination(orderId);

        // Update order in localStorage
        this.updateOrderInStorage(orderId);
      }
    });
  }

  // Calculate optimal route using fast tracking algorithms
  private async calculateOptimalRoute(orderId: string) {
    const tracking = this.activeTracking.get(orderId);
    const order = this.getOrderById(orderId);
    
    if (!tracking || !order) return;

    try {
      // Get route from Google Maps
      const route = await this.getGoogleMapsRoute(
        tracking.currentLocation,
        this.getOrderDestination(order)
      );

      tracking.route = route;
      this.calculateETA(orderId);
    } catch (error) {
      console.error('Failed to calculate route:', error);
      // Fallback to simple route
      tracking.route = [
        tracking.currentLocation,
        this.getOrderDestination(order)
      ];
    }
  }

  // Get route from Google Maps Directions API
  private async getGoogleMapsRoute(origin: Location, destination: Location): Promise<Location[]> {
    const response = await fetch(
      `${GOOGLE_MAPS_URLS.DIRECTIONS_API}/json?` +
      `origin=${origin.lat},${origin.lng}&` +
      `destination=${destination.lat},${destination.lng}&` +
      `key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&` +
      `avoid=tolls&highway=driving`
    );

    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const allOrders = data.orders || [];
      const path = route.overview_polyline;
      
      // Decode polyline
      return this.decodePolyline(path.points);
    }

    return [origin, destination];
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

  // Calculate ETA based on current location and route
  private calculateETA(orderId: string) {
    const tracking = this.activeTracking.get(orderId);
    if (!tracking || tracking.route.length < 2) return;

    // Find current position on route
    const currentPos = this.findClosestPointOnRoute(tracking.currentLocation, tracking.route);
    
    // Calculate remaining distance
    let remainingDistance = 0;
    for (let i = currentPos; i < tracking.route.length - 1; i++) {
      remainingDistance += this.calculateDistance(
        tracking.route[i],
        tracking.route[i + 1]
      );
    }

    // Estimate time based on average speed
    const averageSpeed = 40; // km/h
    const estimatedMinutes = (remainingDistance / 1000) / averageSpeed * 60;
    
    tracking.estimatedTime = Math.round(estimatedMinutes);
  }

  // Find closest point on route to current location
  private findClosestPointOnRoute(location: Location, route: Location[]): number {
    let closestIndex = 0;
    let minDistance = Infinity;

    route.forEach((point, index) => {
      const distance = this.calculateDistance(location, point);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  // Calculate distance between two points
  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371000; // Earth's radius in meters
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Check if delivery boy is near destination
  private checkProximityToDestination(orderId: string) {
    const tracking = this.activeTracking.get(orderId);
    const order = this.getOrderById(orderId);
    
    if (!tracking || !order) return;

    const destination = this.getOrderDestination(order);
    const distance = this.calculateDistance(tracking.currentLocation, destination);

    // If within 100 meters, mark as delivered
    if (distance < 100) {
      this.updateOrderStatus(orderId, 'completed');
      this.stopOrderTracking(orderId);
    }
  }

  // Start real-time updates
  private startRealTimeUpdates(orderId: string) {
    const interval = setInterval(() => {
      const tracking = this.activeTracking.get(orderId);
      if (!tracking) {
        clearInterval(interval);
        return;
      }

      // Simulate location updates (in real app, this would come from GPS)
      tracking.currentLocation = {
        lat: tracking.currentLocation.lat + (Math.random() - 0.5) * 0.001,
        lng: tracking.currentLocation.lng + (Math.random() - 0.5) * 0.001,
        timestamp: Date.now()
      };

      this.calculateETA(orderId);
      this.updateOrderInStorage(orderId);
    }, 5000); // Update every 5 seconds

    this.updateIntervals.set(orderId, interval);
  }

  // Get order by ID
  private getOrderById(orderId: string) {
    const orders = OrderSync.getOrders();
    return orders.find(order => order.id === orderId);
  }

  // Get order destination
  private getOrderDestination(order: any): Location {
    if (order.type === 'Food') {
      // For food orders, use delivery location
      const location = order.details?.deliveryLocation;
      if (typeof location === 'string') {
        // Parse address to coordinates (simplified)
        return { lat: 17.3850, lng: 78.4867, timestamp: Date.now() };
      }
      return location;
    } else {
      // For print orders, use drop location
      const location = order.details?.dropLocation;
      if (typeof location === 'string') {
        // Parse address to coordinates (simplified)
        return { lat: 17.3850, lng: 78.4867, timestamp: Date.now() };
      }
      return location;
    }
  }

  // Get delivery boy current location
  private getDeliveryBoyLocation(deliveryBoyId: string): Location {
    // In real app, this would come from GPS
    // For now, return a simulated location
    return {
      lat: 17.3850 + Math.random() * 0.01,
      lng: 78.4867 + Math.random() * 0.01,
      timestamp: Date.now()
    };
  }

  // Update order status
  private updateOrderStatus(orderId: string, status: string) {
    OrderSync.updateOrderStatus(orderId, status as any);
    
    // Update tracking
    const tracking = this.activeTracking.get(orderId);
    if (tracking) {
      tracking.status = status as any;
      tracking.lastUpdated = Date.now();
    }
  }

  // Update order in localStorage
  private updateOrderInStorage(orderId: string) {
    const tracking = this.activeTracking.get(orderId);
    if (!tracking) return;

    const orders = OrderSync.getOrders();
    const existingOrders = JSON.parse(localStorage.getItem('hyperdeliv_users') || '[]');
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: tracking.status,
            estimatedTime: tracking.estimatedTime,
            currentLocation: tracking.currentLocation,
            lastUpdated: tracking.lastUpdated
          }
        : order
    );

    localStorage.setItem('hyperdeliv_orders', JSON.stringify(updatedOrders));
  }

  // Get all active tracking
  public getActiveTracking(): Map<string, OrderTracking> {
    return this.activeTracking;
  }

  // Get tracking for specific order
  public getOrderTracking(orderId: string): OrderTracking | null {
    return this.activeTracking.get(orderId) || null;
  }
}

// Export singleton instance
export const orderStatusUpdateService = new OrderStatusUpdateService();
