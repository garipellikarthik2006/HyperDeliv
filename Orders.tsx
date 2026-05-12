import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, FileText, Truck, MapPin, Phone, Clock, CheckCircle, Circle } from "lucide-react";

interface FoodOrder {
  id: string;
  type: 'food';
  pickupLocation: string;
  dropLocation: string;
  amount: number;
  paymentMethod: string;
  specialInstructions: string;
  status: 'delivered' | 'pending' | 'in_progress';
  orderDate: string;
  estimatedTime?: string;
}

interface PrintOrder {
  id: string;
  type: 'print';
  fileName: string;
  copies: number;
  printType: 'bw' | 'color';
  status: 'completed' | 'pending' | 'processing';
  orderDate: string;
  fileSize?: string;
}

type Order = FoodOrder | PrintOrder;

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from localStorage on component mount
  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(storedOrders);
  }, []);

  const foodOrders = orders.filter(order => order.type === 'food') as FoodOrder[];
  const printOrders = orders.filter(order => order.type === 'print') as PrintOrder[];

  const totalFoodDeliveries = foodOrders.filter(order => order.status === 'delivered').length;
  const totalPrintOuts = printOrders.filter(order => order.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium";
    
    switch (status) {
      case 'delivered':
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'in_progress':
      case 'processing':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <CheckCircle size={12} />;
      case 'in_progress':
      case 'processing':
        return <Clock size={12} />;
      case 'pending':
        return <Circle size={12} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        </div>

        {/* Stats Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Package size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Food Deliveries</p>
                <p className="text-2xl font-bold text-foreground">{totalFoodDeliveries}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Print Outs</p>
                <p className="text-2xl font-bold text-foreground">{totalPrintOuts}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Truck size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground">{totalFoodDeliveries + totalPrintOuts}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Clock size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-foreground">
                  {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Food Orders Section */}
        <div className="mb-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Food Deliveries</h2>
          <div className="space-y-4">
            {foodOrders.length > 0 ? (
              foodOrders.map((order) => (
                <div key={order.id} className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-4 flex items-center gap-2">
                        <Package size={20} className="text-orange-600" />
                        <h3 className="font-semibold text-card-foreground">Order #{order.id}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Pickup Location</p>
                            <p className="text-sm font-medium text-foreground">{order.pickupLocation}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Drop Location</p>
                            <p className="text-sm font-medium text-foreground">{order.dropLocation}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Order Date</p>
                            <p className="text-sm font-medium text-foreground">{formatDate(order.orderDate)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-green-800">₹</span>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="text-sm font-medium text-foreground">{order.amount}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-800">💳</span>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Payment Method</p>
                            <p className="text-sm font-medium text-foreground capitalize">{order.paymentMethod}</p>
                          </div>
                        </div>
                        
                        {order.specialInstructions && (
                          <div className="flex items-start gap-3">
                            <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-purple-800">📝</span>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Special Instructions</p>
                              <p className="text-sm font-medium text-foreground">{order.specialInstructions}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end gap-2">
                      {order.estimatedTime && (
                        <span className="text-xs text-muted-foreground">ETA: {order.estimatedTime}</span>
                      )}
                      <button
                        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                        style={{ backgroundColor: '#f58634' }}
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border bg-card p-8 text-center">
                <Package size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No food orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Print Orders Section */}
        <div>
          <h2 className="mb-6 text-xl font-semibold text-foreground">Print Jobs</h2>
          <div className="space-y-4">
            {printOrders.length > 0 ? (
              printOrders.map((order) => (
                <div key={order.id} className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-blue-600" />
                        <h3 className="font-semibold text-card-foreground">Order #{order.id}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-start gap-3">
                          <FileText size={16} className="mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">File Name</p>
                            <p className="text-sm font-medium text-foreground">{order.fileName}</p>
                            {order.fileSize && (
                              <p className="text-xs text-muted-foreground">{order.fileSize}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Package size={16} className="text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Number of Copies</p>
                            <p className="text-sm font-medium text-foreground">{order.copies}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={`h-4 w-4 rounded-full ${
                            order.printType === 'color' ? 'bg-blue-500' : 'bg-gray-500'
                          }`} />
                          <div>
                            <p className="text-xs text-muted-foreground">Print Type</p>
                            <p className="text-sm font-medium text-foreground capitalize">
                              {order.printType === 'color' ? 'Color' : 'B&W'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Order Date</p>
                            <p className="text-sm font-medium text-foreground">{formatDate(order.orderDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <button
                        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                        style={{ backgroundColor: '#f58634' }}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border bg-card p-8 text-center">
                <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No print jobs yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
