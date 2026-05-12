import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
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
  Send
} from "lucide-react";

interface Driver {
  name: string;
  phone: string;
  vehicle: string;
  vehicleNumber: string;
}

const OrderTrackingView = ({ orderId }: { orderId: string | null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [showReviewSection, setShowReviewSection] = useState(false);
  
  // Mock driver data
  const driver: Driver = {
    name: "Ramesh",
    phone: "+91 98765 43210",
    vehicle: "Honda Activa",
    vehicleNumber: "TS 08 EN 1234"
  };

  // Load order from localStorage
  useEffect(() => {
    const loadOrder = () => {
      console.log('Loading order with ID:', orderId);
      
      if (!orderId) {
        console.log('No orderId provided, checking active_order');
        // Try to get active_order from localStorage
        const activeOrder = localStorage.getItem('active_order');
        if (activeOrder) {
          const parsedOrder = JSON.parse(activeOrder);
          console.log('Found active_order:', parsedOrder);
          setOrder(parsedOrder);
          setLoading(false);
          return;
        }
      }

      // Check localStorage for active_order or specific order
      const activeOrder = localStorage.getItem('active_order');
      console.log('Active order from localStorage:', activeOrder);
      
      if (activeOrder) {
        try {
          const parsedOrder = JSON.parse(activeOrder);
          console.log('Parsed order:', parsedOrder);
          
          // Check if this is the order we're looking for
          if (!orderId || parsedOrder.id === orderId) {
            setOrder(parsedOrder);
            console.log('Order found and set:', parsedOrder);
          } else {
            console.log('Order ID mismatch');
          }
        } catch (error) {
          console.error('Error parsing active order:', error);
        }
      }
      
      setLoading(false);
    };

    loadOrder();
  }, [orderId]);

  // Auto-refresh order status with cross-portal sync
  useEffect(() => {
    if (!order) return;
    
    const interval = setInterval(() => {
      const activeOrder = localStorage.getItem('active_order');
      if (activeOrder) {
        try {
          const parsedOrder = JSON.parse(activeOrder);
          if (parsedOrder.id === order.id) {
            setOrder(parsedOrder);
            
            // Show review section when delivered
            if (parsedOrder.status === 'Delivered' && !showReviewSection) {
              setShowReviewSection(true);
              toast({
                title: "Order Delivered!",
                description: "Your order has been successfully delivered.",
              });
            }
          }
        } catch (error) {
          console.error('Error refreshing order:', error);
        }
      }
    }, 2000); // Refresh every 2 seconds for real-time sync

    return () => clearInterval(interval);
  }, [order?.id, showReviewSection, toast]);

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
    const updatedOrder = { ...order, status: 'Reviewed', reviewedAt: new Date().toISOString() };
    localStorage.setItem('active_order', JSON.stringify(updatedOrder));
    setOrder(updatedOrder);
    
    // Save review
    const reviewData = {
      orderId: order.id,
      rating: rating,
      review: review,
      customer: user?.email || 'Anonymous',
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`review_${order.id}`, JSON.stringify(reviewData));
    
    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });
    
    setReview('');
    setRating(0);
  };

  // Get order status steps (4 stages as requested)
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
        completed: order.status === 'Picking Up' || order.status === 'Out for Delivery' || order.status === 'Delivered' || order.status === 'Reviewed',
        timestamp: order.pickingUpAt
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
      }
    ];

    return steps;
  };

  const statusSteps = getOrderStatusSteps();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3 text-gray-600">Loading Order...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Order Found</h3>
        <p className="text-gray-600 mb-4">This order doesn't exist or has been removed</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Order ID: {order.id}</h4>
          <p className="text-sm text-gray-600">{order.type} Order</p>
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

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-3">Order Summary</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{order.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pickup:</span>
            <span className="font-medium">{(order.details as any)?.restaurant || (order.details as any)?.fileName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Drop Location:</span>
            <span className="font-medium">{(order.details as any)?.deliveryLocation || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fee:</span>
            <span className="font-semibold text-lg">₹{order.price}</span>
          </div>
        </div>
      </div>

      {/* Status Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h5 className="font-medium text-gray-900 mb-4">Delivery Status</h5>
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    step.completed ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <h6 className={`text-xs font-medium mt-2 text-center ${
                  step.completed ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {step.label}
                </h6>
                {index < statusSteps.length - 1 && (
                  <div className={`w-full h-0.5 mt-2 ${
                    step.completed ? 'bg-green-200' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* OTP Verification Card */}
      {order.status !== 'Delivered' && order.status !== 'Reviewed' && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
          <h5 className="font-semibold mb-3">Share this OTP with Driver</h5>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 tracking-wider">
              {order.otp}
            </div>
            <p className="text-blue-100 text-sm">
              This OTP will be verified by your delivery partner
            </p>
          </div>
        </div>
      )}

      {/* Driver Details */}
      {order.status === 'Out for Delivery' || order.status === 'Delivered' || order.status === 'Reviewed' ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h5 className="font-medium text-gray-900 mb-3">Driver Details</h5>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h6 className="font-medium text-gray-900">{driver.name}</h6>
                <div className="text-sm text-gray-600">
                  {driver.vehicle} • {driver.vehicleNumber}
                </div>
              </div>
            </div>
            <button
              onClick={() => window.open(`tel:${driver.phone}`)}
              className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Truck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Driver details will appear once the order is out for delivery</p>
        </div>
      )}

      {/* Live Location Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h5 className="font-medium text-gray-900 mb-3">Live Location</h5>
        <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-6 w-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Live tracking will be available once the order is out for delivery</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {order.status === 'Delivered' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <h5 className="font-semibold text-green-800 mb-1">Delivered Successfully!</h5>
          <p className="text-sm text-green-700">Your order has been delivered. Please rate your experience.</p>
        </div>
      )}

      {/* Review Section */}
      {showReviewSection && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h5 className="font-medium text-gray-900 mb-3">Rate Your Experience</h5>
          
          {/* Star Rating */}
          <div className="flex justify-center mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`h-6 w-6 ${
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
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            rows={2}
          />
          
          {/* Submit Button */}
          <button
            onClick={submitReview}
            className="w-full flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Review
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingView;
