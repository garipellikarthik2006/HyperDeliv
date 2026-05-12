import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Package, 
  Truck, 
  Phone, 
  MapPin, 
  User,
  AlertCircle,
  RefreshCw,
  Star,
  Send,
  Navigation,
  MessageSquare
} from "lucide-react";
import { OrderSync } from "@/lib/orderSync";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { realTimeTrackingService } from "@/services/realTimeTracking";
import { orderStatusUpdateService } from "@/services/orderStatusUpdate";
import { UserTrackingView, VendorTrackingView } from "@/components/TrackingView";
import { DeliveryBoyTracking } from "@/components/DeliveryBoyTracking";

interface Driver {
  name: string;
  phone: string;
  vehicle: string;
  vehicleNumber: string;
  rating: number;
}

const OrderTracking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const orderId = searchParams.get('orderId');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [otp, setOtp] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [showReviewSection, setShowReviewSection] = useState(false);
  
  // Mock driver data
  const driver: Driver = {
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    vehicle: "Honda Activa",
    vehicleNumber: "TS 08 EN 1234",
    rating: 4.8
  };

  // Load order details with error prevention
  useEffect(() => {
    const loadOrder = () => {
      console.log('Loading order with ID:', orderId);
      
      if (!orderId) {
        toast({
          title: "Error",
          description: "Order ID not found",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      // Check active_order first (set by Food.tsx and Print.tsx on order placement)
      const activeOrderRaw = localStorage.getItem('active_order');
      if (activeOrderRaw) {
        try {
          const activeOrder = JSON.parse(activeOrderRaw);
          if (activeOrder.id === orderId) {
            setOrder(activeOrder);
            if (activeOrder.otp) setOtp(activeOrder.otp);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing active_order:', e);
        }
      }

      // Fallback: check hyperdeliv_orders array
      const storedOrders = localStorage.getItem('hyperdeliv_orders');
      if (storedOrders) {
        try {
          const orders = JSON.parse(storedOrders);
          const found = orders.find((o: any) => o.id === orderId);
          if (found) {
            setOrder(found);
            if (found.otp) setOtp(found.otp);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing hyperdeliv_orders:', e);
        }
      }

      setLoading(false);
    };

    loadOrder();
  }, [orderId, navigate, toast]);

  // Auto-refresh order status
  useEffect(() => {
    if (!orderId) return;
    
    const interval = setInterval(() => {
      const activeOrderRaw = localStorage.getItem('active_order');
      if (activeOrderRaw) {
        try {
          const activeOrder = JSON.parse(activeOrderRaw);
          if (activeOrder.id === orderId) {
            setOrder(activeOrder);
            if (activeOrder.status === 'Delivered' && !showReviewSection) {
              setShowReviewSection(true);
            }
          }
        } catch (error) {
          console.error('Error refreshing order:', error);
        }
      }
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [orderId, showReviewSection]);

  // Submit review
  const submitReview = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    // Update order status to reviewed
    const activeOrderRaw = localStorage.getItem('active_order');
    if (activeOrderRaw) {
      const activeOrder = JSON.parse(activeOrderRaw);
      localStorage.setItem('active_order', JSON.stringify({ ...activeOrder, status: 'Reviewed' }));
    }
    
    // Save review
    const reviewData = {
      orderId: orderId,
      rating: rating,
      review: review,
      customer: user?.email || 'Anonymous',
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`review_${orderId}`, JSON.stringify(reviewData));
    
    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });
    
    setReview('');
    setRating(0);
  };

  // Get order status steps (5 stages as requested)
  const getOrderStatusSteps = () => {
    if (!order) return [];

    const steps = [
      {
        step: 'ordered',
        label: 'Ordered',
        icon: Package,
        completed: true,
        timestamp: order.createdAt
      },
      {
        step: 'picking_up',
        label: 'Picking Up',
        icon: Clock,
        completed: order.status === 'Accepted' || order.status === 'Out for Delivery' || order.status === 'Delivered' || order.status === 'Reviewed',
        timestamp: order.acceptedAt
      },
      {
        step: 'out_for_delivery',
        label: 'Out for Delivery',
        icon: Truck,
        completed: order.status === 'Out for Delivery' || order.status === 'Delivered' || order.status === 'Reviewed',
        timestamp: order.outForDeliveryAt
      },
      {
        step: 'delivered',
        label: 'Delivered',
        icon: CheckCircle,
        completed: order.status === 'Delivered' || order.status === 'Reviewed',
        timestamp: order.deliveredAt
      },
      {
        step: 'reviewed',
        label: 'Reviewed',
        icon: Star,
        completed: order.status === 'Reviewed',
        timestamp: order.reviewedAt
      }
    ];

    return steps;
  };

  const statusSteps = getOrderStatusSteps();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Order Found</h2>
          <p className="text-gray-600 mb-4">This order doesn't exist or has been removed</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600">Order ID: {order.id}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 1000);
            }}
            className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Type:</span>
              <span className="font-medium">{order.type}</span>
            </div>
            {(order.details as any)?.items?.[0] && (
              <div className="flex justify-between">
                <span className="text-gray-600">{(order.details as any).items[0].name}:</span>
                <span className="font-medium">₹{order.itemPrice ?? (order.details as any).items[0].price}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Drop Location:</span>
              <span className="font-medium">{(order.details as any)?.deliveryLocation || 'N/A'}</span>
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Item Cost:</span>
                <span>₹{order.itemPrice ?? order.price - (order.deliveryFee ?? 20)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Charges:</span>
                <span>₹{order.deliveryFee ?? order.deliveryCharges ?? 20}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total:</span>
                <span className="text-orange-600">₹{order.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Progress (5 Stages) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Delivery Status</h2>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        step.completed ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`w-0.5 h-12 ml-5 mt-2 ${
                        step.completed ? 'bg-green-200' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      step.completed ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </h3>
                    {step.timestamp && (
                      <p className="text-sm text-gray-500">
                        {new Date(step.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OTP Verification Section */}
        {order.status !== 'Delivered' && order.status !== 'Reviewed' && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Share this OTP with the Delivery Boy</h2>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 tracking-wider">
                {otp}
              </div>
              <p className="text-blue-100 text-sm">
                This OTP will be verified by your delivery partner
              </p>
            </div>
          </div>
        )}

        {/* Driver Details */}
        {order.status === 'Out for Delivery' || order.status === 'Delivered' || order.status === 'Reviewed' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Driver Details</h2>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{driver.name}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    {driver.rating} • {driver.vehicle}
                  </div>
                  <div className="text-sm text-gray-600">
                    Vehicle: {driver.vehicleNumber}
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.open(`tel:${driver.phone}`)}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Driver
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-xl p-6 mb-6 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Driver details will appear once the order is out for delivery</p>
          </div>
        )}

        {/* Live Location (Placeholder) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Location</h2>
          <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Live tracking will be available once the order is out for delivery</p>
            </div>
          </div>
        </div>

        {/* Review Section */}
        {showReviewSection && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h2>
            
            {/* Star Rating */}
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {/* Review Text */}
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={3}
            />
            
            {/* Submit Button */}
            <button
              onClick={submitReview}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
