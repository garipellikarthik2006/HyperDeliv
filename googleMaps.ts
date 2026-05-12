// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '', 
  DEFAULT_CENTER: {
    lat: 17.3850, // Hyderabad center
    lng: 78.4867
  },
  DEFAULT_ZOOM: 12,
  HYDERABAD_BOUNDS: {
    north: 17.5500,
    south: 17.2000,
    east: 78.6000,
    west: 78.3000
  },
  AUTOCOMPLETE_OPTIONS: {
    componentRestrictions: { country: 'IN' },
    bounds: {
      north: 17.5500,
      south: 17.2000,
      east: 78.6000,
      west: 78.3000
    },
    strictBounds: true,
    types: ['address', 'establishment'],
    fields: ['address_components', 'formatted_address', 'geometry', 'place_id', 'name', 'icon']
  },
  MAP_STYLES: [
    {
      "featureType": "all",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e0e0e0"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c9c9c9"
        }
      ]
    }
  ]
};

// Real-time tracking configuration
export const TRACKING_CONFIG = {
  // Update interval in milliseconds
  LOCATION_UPDATE_INTERVAL: 5000, // 5 seconds
  
  // Maximum distance threshold for location updates (in meters)
  LOCATION_THRESHOLD: 10, // 10 meters
  
  // ETA calculation settings
  AVERAGE_SPEED: 40, // km/h for urban areas
  SPEED_FACTOR: 0.8, // Factor for real-time traffic
  
  // Route optimization settings
  MAX_WAYPOINTS: 10,
  OPTIMIZE_ROUTE: true,
  
  // WebSocket configuration
  WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080',
  
  // Location accuracy settings
  LOCATION_ACCURACY: {
    HIGH: 10, // 10 meters
    MEDIUM: 50, // 50 meters
    LOW: 100 // 100 meters
  }
};

// Google Maps API URLs for tracking
export const GOOGLE_MAPS_URLS = {
  PLACES_API: 'https://maps.googleapis.com/maps/api/place',
  DIRECTIONS_API: 'https://maps.googleapis.com/maps/api/directions',
  GEOCODING_API: 'https://maps.googleapis.com/maps/api/geocode',
  STATIC_MAPS: 'https://maps.googleapis.com/maps/api/staticmap',
  DISTANCE_MATRIX: 'https://maps.googleapis.com/maps/api/distancematrix'
};

// Map marker configurations for tracking
export const MARKER_CONFIG = {
  DELIVERY_BOY: {
    icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    size: { width: 32, height: 32 },
    anchor: { x: 16, y: 16 },
    zIndex: 1000
  },
  
  CUSTOMER: {
    icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    size: { width: 32, height: 32 },
    anchor: { x: 16, y: 16 },
    zIndex: 999
  },
  
  RESTAURANT: {
    icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    size: { width: 32, height: 32 },
    anchor: { x: 16, y: 16 },
    zIndex: 998
  },
  
  ROUTE: {
    strokeColor: '#FF8C00',
    strokeOpacity: 0.8,
    strokeWeight: 4
  }
};

// Fast tracking algorithms configuration
export const TRACKING_ALGORITHMS = {
  // Dijkstra's algorithm for shortest path
  SHORTEST_PATH: 'dijkstra',
  
  // A* algorithm for fastest route
  FASTEST_ROUTE: 'astar',
  
  // Real-time traffic consideration
  TRAFFIC_AWARE: 'traffic_aware',
  
  // Route optimization for multiple deliveries
  MULTI_STOP_OPTIMIZATION: 'multi_stop',
  
  // Settings for algorithm performance
  PERFORMANCE: {
    MAX_ITERATIONS: 1000,
    CONVERGENCE_THRESHOLD: 0.001,
    PARALLEL_PROCESSING: true
  }
};
