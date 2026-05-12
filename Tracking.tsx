import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Phone, Clock, Star, MessageCircle, Navigation, CheckCircle, Package, Truck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Conditional import to prevent blank screen
let GOOGLE_MAPS_CONFIG: any;
try {
  GOOGLE_MAPS_CONFIG = require("@/config/googleMaps").GOOGLE_MAPS_CONFIG;
} catch (error) {
  GOOGLE_MAPS_CONFIG = {
    API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
    DEFAULT_CENTER: { lat: 17.3850, lng: 78.4867 },
    DEFAULT_ZOOM: 12,
    MAP_STYLES: []
  };
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface OrderData {
  pickupLocation: string;
  dropLocation: string;
  recipientPhone: string;
  orderId: string;
  estimatedTime: string;
  orderType?: 'food' | 'print';
  documentName?: string;
  printQuality?: string;
  deliveryPin?: string;
}

const Tracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const orderData = location.state?.orderData as OrderData;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropMarkerRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);

  const [riderLocation, setRiderLocation] = useState({ lat: 17.3850, lng: 78.4867 });
  const [eta, setEta] = useState(orderData?.estimatedTime || "25-30 minutes");
  const [orderStatus, setOrderStatus] = useState("order_confirmed");
  const [countdown, setCountdown] = useState(0);
  const [freshnessTimer, setFreshnessTimer] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Progress stages
  const progressStages = [
    { id: 'order_confirmed', label: 'Order Confirmed', icon: CheckCircle },
    { id: 'preparing_printing', label: orderData?.orderType === 'print' ? 'Preparing/Printing' : 'Preparing', icon: Package },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { id: 'arrived', label: 'Arrived', icon: MapPin }
  ];

  const getCurrentStageIndex = () => {
    return progressStages.findIndex(stage => stage.id === orderStatus);
  };

  const getUrgentETA = () => {
    const etaMinutes = parseInt(eta.split('-')[0]);
    return etaMinutes <= 5;
  };

  // Load Google Maps script
  const loadGoogleMapsScript = () => {
    // Temporarily disable Google Maps to prevent blank screen
    setMapLoaded(true);
    return;
    
    if (window.google) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    window.initMap = () => {
      setMapLoaded(true);
    };

    document.head.appendChild(script);
  };

  // Initialize map
  const initializeMap = () => {
    // Temporarily disable Google Maps to prevent blank screen
    return;
    
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: GOOGLE_MAPS_CONFIG.DEFAULT_CENTER,
      zoom: GOOGLE_MAPS_CONFIG.DEFAULT_ZOOM,
      styles: GOOGLE_MAPS_CONFIG.MAP_STYLES,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      }
    });

    mapInstanceRef.current = map;
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#f58634',
        strokeOpacity: 0.7,
        strokeWeight: 4,
        icons: [{
          icon: {
            path: 'M 0,-1 0,1',
            repeat: '20px',
            offset: '0%'
          }
        }]
      }
    });

    // Add markers
    addMarkers(map);
    calculateDirections(map);
  };

  // Add custom markers
  const addMarkers = (map: any) => {
    // Pickup marker (Green)
    pickupMarkerRef.current = new window.google.maps.Marker({
      position: { lat: 17.4250, lng: 78.4746 }, // Example pickup location
      map: map,
      icon: {
        path: 'M 0,0 C -2,-2 -2,-9 2,-9 2,-2 C 2,-2 0,0 0,0 z',
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 1.5
      },
      title: 'Pickup Location'
    });

    // Drop marker (Red)
    dropMarkerRef.current = new window.google.maps.Marker({
      position: { lat: 17.3850, lng: 78.4867 }, // Example drop location
      map: map,
      icon: {
        path: 'M 0,0 C -2,-2 -2,-9 2,-9 2,-2 C 2,-2 0,0 0,0 z',
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 1.5
      },
      title: 'Drop Location'
    });

    // Rider marker (Orange scooter)
    riderMarkerRef.current = new window.google.maps.Marker({
      position: riderLocation,
      map: map,
      icon: {
        path: 'M 8 0 C 6.5 0 5 1.5 5 3.5 C 5 5.5 6.5 5 8 5 C 9.5 5 11 5.5 11 3.5 C 11 5.5 11.5 5 13 5 C 14.5 5 16 3.5 16 1.5 C 16 1.5 14.5 0 13 0 L 8 0 z M 8 7 L 8 12',
        fillColor: '#f58634',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 1,
        scale: 1.2
      },
      title: 'Rider',
      animation: window.google.maps.Animation.DROP
    });
  };

  // Calculate and display directions
  const calculateDirections = (map: any) => {
    if (!directionsRendererRef.current) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route({
      origin: { lat: 17.4250, lng: 78.4746 }, // Pickup location
      destination: { lat: 17.3850, lng: 78.4867 }, // Drop location
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result: any, status: any) => {
      if (status === 'OK' && directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(result);
      }
    });
  };

  // Update rider location
  const updateRiderLocation = (lat: number, lng: number) => {
    if (riderMarkerRef.current && mapInstanceRef.current) {
      const newPosition = { lat, lng };
      riderMarkerRef.current.setPosition(newPosition);
      setRiderLocation(newPosition);
      
      // Center map on rider
      mapInstanceRef.current.panTo(newPosition);
    }
  };

  useEffect(() => {
    if (!orderData) {
      toast({
        title: "No Order Found",
        description: "Please schedule a pickup first.",
        variant: "destructive",
      });
      navigate("/food");
      return;
    }

    // Load Google Maps script
    loadGoogleMapsScript();

    // Countdown timer for ETA
    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev + 1);
    }, 1000);

    // Freshness timer for food orders
    if (orderData.orderType === 'food') {
      const freshnessInterval = setInterval(() => {
        setFreshnessTimer(prev => prev + 1);
      }, 1000);
      return () => {
        clearInterval(countdownInterval);
        clearInterval(freshnessInterval);
      };
    }

    // Simulate order status updates
    const statusInterval = setInterval(() => {
      setOrderStatus(prev => {
        if (prev === "order_confirmed") return "preparing_printing";
        if (prev === "preparing_printing") return "out_for_delivery";
        if (prev === "out_for_delivery") return "arrived";
        return prev;
      });
    }, 10000);

    // Simulate rider movement
    const movementInterval = setInterval(() => {
      const newLat = riderLocation.lat + (Math.random() - 0.5) * 0.001;
      const newLng = riderLocation.lng + (Math.random() - 0.5) * 0.001;
      updateRiderLocation(newLat, newLng);
    }, 3000);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(statusInterval);
      clearInterval(movementInterval);
    };
  }, [orderData, navigate, toast]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      initializeMap();
    }
  }, [mapLoaded]);

  const getStatusText = () => {
    switch (orderStatus) {
      case "order_confirmed":
        return "Order has been confirmed and is being prepared";
      case "preparing_printing":
        return orderData?.orderType === 'print' ? "Document is being printed" : "Your order is being prepared";
      case "out_for_delivery":
        return "Rider is on the way with your package";
      case "arrived":
        return "Order has arrived at your location!";
      default:
        return "Processing your request";
    }
  };

  const getStatusColor = () => {
    switch (orderStatus) {
      case "order_confirmed":
        return "text-blue-600";
      case "preparing_printing":
        return "text-orange-600";
      case "out_for_delivery":
        return "text-purple-600";
      case "arrived":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const formatFreshnessTimer = () => {
    const minutes = Math.floor(freshnessTimer / 60);
    const seconds = freshnessTimer % 60;
    return `${minutes}m ${seconds}s`;
  };

  const mockRider = {
    name: "Raj Kumar",
    phone: "+91 98765 43210",
    rating: 4.8,
    vehicle: "Honda Activa",
    plateNumber: "KA-01-AB-1234"
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/food")}
            className="mb-4 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to {orderData?.orderType === 'print' ? 'Print' : 'Food Delivery'}
          </button>
          <h1 className="text-2xl font-bold text-foreground">Live Tracking</h1>
          <p className="text-muted-foreground">Order ID: {orderData?.orderId}</p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-lg">
          <div className="flex items-center justify-between">
            {progressStages.map((stage, index) => {
              const currentIndex = getCurrentStageIndex();
              const isActive = stage.id === orderStatus;
              const isCompleted = index < currentIndex;
              
              return (
                <div key={stage.id} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {index > 0 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        isCompleted ? 'bg-[#f58634]' : 'bg-gray-300'
                      }`} />
                    )}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isActive 
                        ? 'bg-[#f58634] text-white animate-pulse' 
                        : isCompleted 
                          ? 'bg-[#f58634] text-white' 
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      <stage.icon className="h-5 w-5" />
                    </div>
                    {index < progressStages.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        isCompleted ? 'bg-[#f58634]' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    isActive 
                      ? 'text-[#f58634]' 
                      : isCompleted 
                        ? 'text-[#f58634]' 
                        : 'text-gray-500'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card p-4 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  <span className="font-medium text-card-foreground">Live Location</span>
                </div>
                <div className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </div>
              </div>
              
              {/* Google Maps Container */}
              <div 
                ref={mapRef}
                className="relative h-96 rounded-lg bg-muted overflow-hidden"
                style={{ 
                  background: !mapLoaded ? 'linear-gradient(to bottom right, #f0fdf4, #e0f2fe)' : 'transparent'
                }}
              >
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ETA with Countdown */}
              <div className={`mt-4 rounded-lg p-4 ${
                getUrgentETA() ? 'bg-red-50 animate-pulse' : 'bg-primary/10'
              }`}>
                <div className="flex items-center gap-3">
                  <Clock className={`h-5 w-5 ${getUrgentETA() ? 'text-red-600 animate-pulse' : 'text-primary'}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">Estimated Arrival</p>
                    <p className={`text-lg font-bold ${getUrgentETA() ? 'text-red-600 animate-pulse' : 'text-primary'}`}>
                      {eta}
                    </p>
                    {getUrgentETA() && (
                      <p className="text-xs text-red-600 font-medium animate-pulse">Almost there!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rider Info & Actions */}
          <div className="space-y-6">
            {/* Rider Profile */}
            <div className="rounded-lg border bg-card p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">Rider Details</h3>
              
              <div className="mb-4 flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {mockRider.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground">{mockRider.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{mockRider.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{mockRider.vehicle} • {mockRider.plateNumber}</p>
                </div>
              </div>

              {/* Safety Note */}
              <div className="mb-4 rounded-lg bg-green-50 p-3">
                <p className="text-sm font-medium text-green-800">
                  🛡️ {mockRider.name} has completed 500+ safe deliveries
                </p>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => window.location.href = `tel:${mockRider.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call Rider
                </button>
                <button 
                  onClick={() => window.location.href = `sms:${mockRider.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message Rider
                </button>
              </div>
            </div>

            {/* Order Details */}
            <div className="rounded-lg border bg-card p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">Order Details</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Location</p>
                  <p className="text-sm font-medium text-card-foreground">{orderData?.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Drop Location</p>
                  <p className="text-sm font-medium text-card-foreground">{orderData?.dropLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recipient Phone</p>
                  <p className="text-sm font-medium text-card-foreground">{orderData?.recipientPhone}</p>
                </div>
                
                {/* Context-aware Information */}
                {orderData?.orderType === 'food' && (
                  <div className="rounded-lg bg-orange-50 p-3">
                    <p className="text-xs text-orange-600 font-medium">Freshness Timer</p>
                    <p className="text-sm font-bold text-orange-800">{formatFreshnessTimer()}</p>
                    <p className="text-xs text-orange-600">Time since pickup</p>
                  </div>
                )}
                
                {orderData?.orderType === 'print' && (
                  <div className="space-y-2">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-xs text-blue-600 font-medium">Document</p>
                      <p className="text-sm font-bold text-blue-800">{orderData?.documentName || 'Assignment.pdf'}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-600 font-medium">Quality</p>
                      <p className="text-sm font-bold text-gray-800">{orderData?.printQuality || 'High-Res B&W'}</p>
                    </div>
                  </div>
                )}
                
                {/* Security PIN */}
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                  <p className="text-sm font-bold text-yellow-800 mb-2">🔐 Delivery PIN: {orderData?.deliveryPin || '1234'}</p>
                  <p className="text-xs text-yellow-700">
                    Provide this PIN to rider only after receiving your package.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {orderStatus === "arrived" && (
              <div className="rounded-lg border bg-green-50 p-4">
                <h4 className="mb-2 font-semibold text-green-800">
                  {orderData?.orderType === 'print' ? 'Print Job Delivered!' : 'Order Delivered!'}
                </h4>
                <p className="mb-3 text-sm text-green-600">
                  {orderData?.orderType === 'print' 
                    ? 'Your documents have been successfully delivered.' 
                    : 'Your order has been successfully delivered.'
                  }
                </p>
                <button
                  onClick={() => navigate(orderData?.orderType === 'print' ? '/print' : '/food')}
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Schedule Another {orderData?.orderType === 'print' ? 'Print' : 'Delivery'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
