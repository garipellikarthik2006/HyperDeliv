import { useState, useCallback, useEffect, useRef } from 'react';
import { Location, OrderTracking } from '@/services/realTimeTracking';
import { GOOGLE_MAPS_CONFIG, MARKER_CONFIG, GOOGLE_MAPS_URLS } from '@/config/googleMaps';

// Google Maps interface declarations
declare global {
  interface Window {
    google: any;
  }
}

// Map interface
export interface MapInstance {
  map: any;
  markers: Map<string, any>;
  directionsRenderer: any;
  infoWindow: any;
}

// Map hook interface
export interface UseGoogleMapsReturn {
  mapInstance: MapInstance | null;
  isLoading: boolean;
  error: string | null;
  initializeMap: (elementId: string, center?: Location) => void;
  addMarker: (id: string, location: Location, type: 'delivery_boy' | 'customer' | 'restaurant') => void;
  updateMarker: (id: string, location: Location) => void;
  removeMarker: (id: string) => void;
  drawRoute: (route: Location[]) => void;
  clearRoute: () => void;
  centerMap: (location: Location, zoom?: number) => void;
  showInfoWindow: (location: Location, content: string) => void;
}

export interface GeolocationState {
  currentLocation: Location | null;
  error: string | null;
  isLoading: boolean;
  getCurrentLocation: () => Promise<Location | null>;
  watchLocation: (callback: (location: Location) => void) => () => void;
}

export interface Maps {
  mapInstance: any;
  isLoading: boolean;
  error: string | null;
  initializeMap: (elementId: string) => void;
}

export interface LiveTrackingState {
  tracking: OrderTracking | null;
  isTracking: boolean;
  updateTracking: (tracking: OrderTracking) => void;
  maps: Maps;
}

export const useGeolocation = (): GeolocationState => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  let watchId: number | null = null;

  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return null;
    }

    setIsLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now(),
          };
          setCurrentLocation(location);
          setError(null);
          setIsLoading(false);
          resolve(location);
        },
        (err) => {
          setError(err.message);
          setIsLoading(false);
          resolve(null);
        }
      );
    });
  }, []);

  const watchLocation = (callback: (location: Location) => void) => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
    
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };
        callback(location);
      },
      (err) => {
        console.error('Geolocation error:', err);
      }
    );
  };

  return {
    currentLocation,
    error,
    isLoading,
    getCurrentLocation,
    watchLocation
  };
};

// Google Maps hook
export const useGoogleMaps = (): UseGoogleMapsReturn => {
  const [mapInstance, setMapInstance] = useState<MapInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapInstance | null>(null);

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      setIsLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.API_KEY}&libraries=places,geometry,maps`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoading(false);
    };
    
    script.onerror = () => {
      setError('Failed to load Google Maps');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
  }, []);

  // Initialize map
  const initializeMap = (elementId: string, center?: Location) => {
    if (!window.google?.maps) {
      setError('Google Maps not loaded');
      return;
    }

    const mapElement = document.getElementById(elementId);
    if (!mapElement) {
      setError('Map element not found');
      return;
    }

    const map = new window.google.maps.Map(mapElement, {
      center: center || GOOGLE_MAPS_CONFIG.DEFAULT_CENTER,
      zoom: GOOGLE_MAPS_CONFIG.DEFAULT_ZOOM,
      styles: GOOGLE_MAPS_CONFIG.MAP_STYLES,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'cooperative'
    });

    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: MARKER_CONFIG.ROUTE.strokeColor,
        strokeOpacity: MARKER_CONFIG.ROUTE.strokeOpacity,
        strokeWeight: MARKER_CONFIG.ROUTE.strokeWeight
      }
    });

    const infoWindow = new window.google.maps.InfoWindow();

    const instance: MapInstance = {
      map,
      markers: new Map(),
      directionsRenderer,
      infoWindow
    };

    directionsRenderer.setMap(map);
    mapRef.current = instance;
    setMapInstance(instance);
  };

  // Add marker
  const addMarker = (id: string, location: Location, type: 'delivery_boy' | 'customer' | 'restaurant') => {
    if (!mapRef.current) return;

    const markerConfig = MARKER_CONFIG[type.toUpperCase() as keyof typeof MARKER_CONFIG];
    if (!markerConfig || 'strokeColor' in markerConfig) return;
    
    const config = markerConfig as typeof MARKER_CONFIG.DELIVERY_BOY;
    
    const marker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: mapRef.current.map,
      icon: config.icon,
      size: config.size,
      anchor: config.anchor,
      zIndex: config.zIndex,
      animation: window.google.maps.Animation.DROP
    });

    mapRef.current.markers.set(id, marker);
  };

  // Update marker position
  const updateMarker = (id: string, location: Location) => {
    if (!mapRef.current) return;

    const marker = mapRef.current.markers.get(id);
    if (marker) {
      marker.setPosition({ lat: location.lat, lng: location.lng });
    }
  };

  // Remove marker
  const removeMarker = (id: string) => {
    if (!mapRef.current) return;

    const marker = mapRef.current.markers.get(id);
    if (marker) {
      marker.setMap(null);
      mapRef.current.markers.delete(id);
    }
  };

  // Draw route
  const drawRoute = (route: Location[]) => {
    if (!mapRef.current || route.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    const waypoints = route.slice(1, -1).map(point => ({
      location: { lat: point.lat, lng: point.lng },
      stopover: false
    }));

    directionsService.route({
      origin: { lat: route[0].lat, lng: route[0].lng },
      destination: { lat: route[route.length - 1].lat, lng: route[route.length - 1].lng },
      waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true
    }, (result: any, status: string) => {
      if (status === 'OK') {
        mapRef.current.directionsRenderer.setDirections(result);
      }
    });
  };

  // Clear route
  const clearRoute = () => {
    if (mapRef.current) {
      mapRef.current.directionsRenderer.setDirections({ routes: [] });
    }
  };

  // Center map
  const centerMap = (location: Location, zoom?: number) => {
    if (mapRef.current) {
      mapRef.current.map.setCenter({ lat: location.lat, lng: location.lng });
      if (zoom) {
        mapRef.current.map.setZoom(zoom);
      }
    }
  };

  // Show info window
  const showInfoWindow = (location: Location, content: string) => {
    if (mapRef.current) {
      mapRef.current.infoWindow.setContent(content);
      mapRef.current.infoWindow.setPosition({ lat: location.lat, lng: location.lng });
      mapRef.current.infoWindow.open(mapRef.current.map);
    }
  };

  return {
    mapInstance,
    isLoading,
    error,
    initializeMap,
    addMarker,
    updateMarker,
    removeMarker,
    drawRoute,
    clearRoute,
    centerMap,
    showInfoWindow
  };
};

// Live tracking hook
export const useLiveTracking = (orderId: string): LiveTrackingState => {
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  return {
    tracking,
    isTracking,
    updateTracking: setTracking,
    maps: {
      mapInstance,
      isLoading: mapsLoading,
      error: mapsError,
      initializeMap: (elementId: string) => {
        // Initialize map for tracking
        const googleMaps = useGoogleMaps();
        googleMaps.initializeMap(elementId);
      }
    }
  };
};
