import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Phone, Clock, CheckCircle, Truck, User, ArrowLeft, Star, Package, RefreshCw } from "lucide-react";

const OrderTracking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrder = () => {
    // Read from active_order (set by Food.tsx and Print.tsx)
    const activeOrderRaw = localStorage.getItem('active_order');
    if (activeOrderRaw) {
      try {
        const activeOrder = JSON.parse(activeOrderRaw);
        if (!orderId || activeOrder.id === orderId) {
          setOrder(activeOrder);
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
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing hyperdeliv_orders:', e);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const activeOrderRaw = localStorage.getItem('active_order');
      if (activeOrderRaw) {
        try {
          const activeOrder = JSON.parse(activeOrderRaw);
          if (!orderId || activeOrder.id === orderId) {
            setOrder(activeOrder);
          }
        } catch (e) {}
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  const getStatusSteps = () => {
    if (!order) return [];
    const status = order.status || 'Pending';
    return [
      {
        label: 'Order Placed',
        icon: Package,
        done: true,
        time: order.createdAt,
      },
      {
        label: 'Picking Up',
        icon: Clock,
        done: ['Picking Up', 'Out for Delivery', 'Delivered', 'Reviewed'].includes(status),
        time: order.pickingUpAt,
      },
      {
        label: 'Out for Delivery',
        icon: Truck,
        done: ['Out for Delivery', 'Delivered', 'Reviewed'].includes(status),
        time: order.outForDeliveryAt,
      },
      {
        label: 'Delivered',
        icon: CheckCircle,
        done: ['Delivered', 'Reviewed'].includes(status),
        time: order.deliveredAt,
      },
    ];
  };

  // Cost breakdown
  const itemPrice = order?.itemPrice ?? (order?.price - (order?.deliveryFee ?? 20));
  const deliveryFee = order?.deliveryFee ?? order?.deliveryCharges ?? 20;
  const total = order?.price ?? (itemPrice + deliveryFee);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f58634] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Truck size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg font-medium mb-1">Order not found</p>
          <p className="text-gray-500 text-sm mb-4">Please place an order first</p>
          <button
            onClick={() => navigate('/food')}
            className="mt-2 px-6 py-2 bg-[#f58634] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Order Food
          </button>
        </div>
      </div>
    );
  }

  const steps = getStatusSteps();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <button
            onClick={() => { setRefreshing(true); loadOrder(); setTimeout(() => setRefreshing(false), 1000); }}
            className="flex items-center gap-2 text-[#f58634] hover:opacity-80 transition-opacity text-sm"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Tracking</h1>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left: Status + Route */}
          <div className="lg:col-span-2 space-y-6">

            {/* Status card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Order {order.id}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  {order.status || 'Pending'}
                </span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Clock size={14} /> Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Delivery progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Delivery Progress</h3>
              <div className="space-y-0">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.label} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Icon size={20} className={step.done ? 'text-green-600' : 'text-gray-400'} />
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`w-0.5 h-12 ${step.done ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className={`font-medium ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                        {step.time && (
                          <p className="text-xs text-gray-500">{new Date(step.time).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Route */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Route</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Pickup Location</p>
                    <p className="text-sm text-gray-600">
                      {order.details?.restaurant || order.details?.pickupLocation || order.pickupLocation || 'Campus Food Court'}
                    </p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-gray-300 ml-4 h-6" />
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Drop Location</p>
                    <p className="text-sm text-gray-600">
                      {order.details?.deliveryLocation || order.dropLocation || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Cost + OTP + Driver */}
          <div className="space-y-6">

            {/* Cost breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Summary</h3>
              <div className="space-y-3 text-sm">
                {order.details?.items?.[0] && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{order.details.items[0].name}</span>
                    <span className="font-medium">₹{itemPrice}</span>
                  </div>
                )}
                {!order.details?.items?.[0] && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item Cost</span>
                    <span className="font-medium">₹{itemPrice}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-medium">₹{deliveryFee}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-[#f58634]">₹{total}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Payment Method</span>
                  <span className="capitalize">{order.paymentMethod || order.details?.paymentMethod || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* OTP */}
            {order.otp && order.status !== 'Delivered' && order.status !== 'Reviewed' && (
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-3">Share OTP with Driver</h3>
                <div className="text-4xl font-bold tracking-widest text-center mb-2">{order.otp}</div>
                <p className="text-blue-100 text-xs text-center">Show this to verify your delivery</p>
              </div>
            )}

            {/* Delivery Boy */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Boy</h3>
              <div className="space-y-4">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 border-2 border-orange-200">
                    <User size={28} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base">Ramesh Kumar</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">4.8 (120 trips)</span>
                    </div>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'Out for Delivery' ? 'bg-green-100 text-green-700' :
                      order.status === 'Delivered' ? 'bg-gray-100 text-gray-600' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'Out for Delivery' ? '🟢 On the way' :
                       order.status === 'Delivered' ? '✅ Delivered' : '🕐 Assigned'}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Vehicle</p>
                    <p className="font-medium text-gray-900">Honda Activa</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Vehicle No.</p>
                    <p className="font-medium text-gray-900">TS 08 EN 1234</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Experience</p>
                    <p className="font-medium text-gray-900">3 Years</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Phone</p>
                    <p className="font-medium text-gray-900">+91 98765 43210</p>
                  </div>
                </div>

                {/* Call + Message buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => window.open('tel:+919876543210')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    <Phone size={16} />
                    Call
                  </button>
                  <button
                    onClick={() => window.open('sms:+919876543210')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Message
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
