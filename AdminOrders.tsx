import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Edit, Trash2, Search, Filter, ClipboardList, LayoutDashboard, X } from "lucide-react";
import { OrderSync } from "@/lib/orderSync";
import PageWrapper from "@/components/PageWrapper";

interface Order {
  id: string;
  type: "Food" | "Print";
  details: any;
  status: "Pending" | "Accepted" | "Ready" | "Delivered";
  customer: string;
  price: number;
  createdAt: string;
  vendorId?: string;
  vendorName?: string;
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | Order["type"]>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load orders from localStorage
  useEffect(() => {
    const allOrders = OrderSync.getOrders();
    setOrders(allOrders);
  }, []);

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.details as any)?.restaurant?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesType = typeFilter === "all" || order.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "text-yellow-600 bg-yellow-100";
      case "Accepted": return "text-blue-600 bg-blue-100";
      case "Ready": return "text-green-600 bg-green-100";
      case "Delivered": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeColor = (type: Order["type"]) => {
    return type === "Food" ? "text-orange-600 bg-orange-100" : "text-purple-600 bg-purple-100";
  };

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    OrderSync.updateOrderStatus(orderId, newStatus);
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const deleteOrder = (orderId: string) => {
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    // Also update localStorage
    const allOrders = OrderSync.getOrders();
    const filteredOrders = allOrders.filter(order => order.id !== orderId);
    OrderSync.saveOrders(filteredOrders);
  };

  return (
    <PageWrapper>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 flex-shrink-0">
            {/* Logo */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">HyperDeliv</h1>
              <div className="text-xs text-gray-500">admin@hyperdeliv.com</div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => navigate("/admin")}
                className="w-full text-left px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <div className="flex items-center">
                  <LayoutDashboard className="mr-3 h-4 w-4" />
                  Dashboard
                </div>
              </button>
              <button
                onClick={() => navigate("/admin/orders")}
                className="w-full text-left px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                <div className="flex items-center">
                  <ClipboardList className="mr-3 h-4 w-4" />
                  All Orders
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">All Orders</h2>
                <p className="text-gray-500">Manage and monitor all platform orders</p>
              </div>
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to HyperDeliv
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Food">Food Orders</option>
                  <option value="Print">Print Orders</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(order.type)}`}>
                            {order.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.vendorName || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{order.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, "Accepted")}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              disabled={order.status === "Delivered"}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Order ID</p>
                        <p className="text-gray-900">{selectedOrder.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Type</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedOrder.type)}`}>
                          {selectedOrder.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Customer</p>
                        <p className="text-gray-900">{selectedOrder.customer}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Vendor</p>
                        <p className="text-gray-900">{selectedOrder.vendorName || 'Unassigned'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Price</p>
                        <p className="text-gray-900">₹{selectedOrder.price}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Created</p>
                      <p className="text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    
                    {(selectedOrder.details as any)?.restaurant && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Restaurant</p>
                        <p className="text-gray-900">{(selectedOrder.details as any).restaurant}</p>
                      </div>
                    )}
                    
                    {(selectedOrder.details as any)?.items && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Items</p>
                        <div className="space-y-2">
                          {(selectedOrder.details as any).items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-900">{item.name} x {item.quantity}</span>
                              <span className="text-gray-600">₹{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(selectedOrder.details as any)?.deliveryLocation && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Delivery Location</p>
                        <p className="text-gray-900">{(selectedOrder.details as any).deliveryLocation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AdminOrders;
