import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { OrderSync, setupOrderSyncListener } from "@/lib/orderSync";
import PageWrapper from "@/components/PageWrapper";
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Truck, 
  ClipboardList, 
  Settings,
  Activity,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Filter,
  MapPin,
  Star,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Ban,
  Check,
  User,
  Globe,
  Shield
} from "lucide-react";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', message: 'New vendor registration pending approval', read: false },
    { id: 2, type: 'warning', message: 'High order volume detected', read: false },
    { id: 3, type: 'success', message: 'System backup completed successfully', read: true }
  ]);

  // Mock data for demonstration
  const [users, setUsers] = useState([
    { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'User', status: 'active', joinedDate: '2024-01-15' },
    { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active', joinedDate: '2024-01-20' },
    { id: 'u3', name: 'Bob Wilson', email: 'bob@example.com', role: 'User', status: 'blocked', joinedDate: '2024-01-10' }
  ]);

  const [vendors, setVendors] = useState([
    { id: 'v1', name: 'Food Corner', email: 'vendor@foodcorner.com', status: 'pending', documents: ['license', 'menu'], rating: 4.5 },
    { id: 'v2', name: 'Print Shop', email: 'vendor@printshop.com', status: 'approved', documents: ['license', 'insurance'], rating: 4.8 },
    { id: 'v3', name: 'Quick Delivery', email: 'vendor@quickdelivery.com', status: 'pending', documents: ['license'], rating: 4.2 }
  ]);

  const [agents, setAgents] = useState([
    { id: 'a1', name: 'Mike Johnson', email: 'mike@delivery.com', phone: '+1234567890', status: 'active', deliveries: 145, rating: 4.7 },
    { id: 'a2', name: 'Sarah Lee', email: 'sarah@delivery.com', phone: '+0987654321', status: 'active', deliveries: 132, rating: 4.9 },
    { id: 'a3', name: 'Tom Brown', email: 'tom@delivery.com', phone: '+1122334455', status: 'inactive', deliveries: 98, rating: 4.3 }
  ]);

  const [orders, setOrders] = useState([]);

  const [systemLogs, setSystemLogs] = useState([
    { id: 'l1', type: 'route_optimization', severity: 'info', message: 'Route optimized for delivery #1234', timestamp: '2024-03-20T10:30:00Z' },
    { id: 'l2', type: 'delivery_prediction', severity: 'warning', message: 'Traffic delay expected on route #5678', timestamp: '2024-03-20T11:15:00Z' },
    { id: 'l3', type: 'route_optimization', severity: 'error', message: 'Failed to optimize route #9012', timestamp: '2024-03-20T09:45:00Z' }
  ]);

  const [autoRouting, setAutoRouting] = useState(true);

  // Account Settings State
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    adminName: '',
    contactNumber: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Load currentUser data from localStorage to pre-fill forms
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      setProfileData({
        adminName: parsedUser.fullName || 'Admin User',
        contactNumber: parsedUser.phone || '+1234567890'
      });
    }
  }, []);

  // Real-time order synchronization
  useEffect(() => {
    // Load initial orders
    const initialOrders = OrderSync.getOrders();
    setOrders(initialOrders);

    // Set up listener for real-time updates
    const cleanup = setupOrderSyncListener((updatedOrders) => {
      setOrders(updatedOrders);
    });

    return cleanup;
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'vendors', label: 'Vendor Approval', icon: Store },
    { id: 'agents', label: 'Delivery Agents', icon: Truck },
    { id: 'orders', label: 'Order Logs', icon: ClipboardList },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUserAction = (userId: string, action: 'block' | 'delete' | 'unblock') => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'block': return { ...user, status: 'blocked' };
          case 'delete': return null;
          case 'unblock': return { ...user, status: 'active' };
          default: return user;
        }
      }
      return user;
    }).filter(Boolean));
  };

  const handleVendorAction = (vendorId: string, action: 'approve' | 'reject') => {
    setVendors(prev => prev.map(vendor => {
      if (vendor.id === vendorId) {
        return { ...vendor, status: action === 'approve' ? 'approved' : 'rejected' };
      }
      return vendor;
    }));
  };

  const handleAgentAction = (agentId: string, action: 'activate' | 'deactivate') => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        return { ...agent, status: action === 'activate' ? 'active' : 'inactive' };
      }
      return agent;
    }));
  };

  // Render functions
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, vendors, agents, and platform settings</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
              <p className="text-gray-600 text-sm">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{vendors.filter(v => v.status === 'approved').length}</h3>
              <p className="text-gray-600 text-sm">Active Vendors</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{agents.filter(a => a.status === 'active').length}</h3>
              <p className="text-gray-600 text-sm">Active Agents</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{orders.length}</h3>
              <p className="text-gray-600 text-sm">Total Orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {notifications.slice(0, 3).map(notification => (
              <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'warning' ? 'bg-yellow-500' : notification.type === 'success' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{new Date().toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-900">{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revenue Today</span>
              <span className="text-lg font-bold text-green-600">$2,847</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Orders Today</span>
              <span className="text-lg font-bold text-orange-600">142</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Delivery Time</span>
              <span className="text-lg font-bold text-purple-600">18 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm px-2 py-1 rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-700' : user.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.joinedDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button className="text-orange-600 hover:text-orange-900">
                      <Eye size={16} />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit size={16} />
                    </button>
                    {user.status === 'active' ? (
                      <button 
                        onClick={() => handleUserAction(user.id, 'block')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Ban size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUserAction(user.id, 'unblock')}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVendorApproval = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Approval</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search vendors..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {vendors.map(vendor => (
          <div key={vendor.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
              <span className={`text-sm px-2 py-1 rounded-full ${vendor.status === 'approved' ? 'bg-green-100 text-green-700' : vendor.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {vendor.status}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-600">Rating: {vendor.rating}</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Documents:</p>
                <div className="flex flex-wrap gap-2">
                  {vendor.documents.map(doc => (
                    <span key={doc} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4">
              {vendor.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleVendorAction(vendor.id, 'approve')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleVendorAction(vendor.id, 'reject')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <X size={16} />
                    Reject
                  </button>
                </>
              )}
              {vendor.status === 'approved' && (
                <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  View Details
                </button>
              )}
              {vendor.status === 'rejected' && (
                <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  Review Application
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDeliveryAgents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Delivery Agents</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search agents..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
              <span className={`text-sm px-2 py-1 rounded-full ${agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {agent.status}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{agent.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{agent.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-600">{agent.deliveries} deliveries</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-600">Rating: {agent.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4">
              {agent.status === 'active' ? (
                <button 
                  onClick={() => handleAgentAction(agent.id, 'deactivate')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Ban size={16} />
                  Deactivate
                </button>
              ) : (
                <button 
                  onClick={() => handleAgentAction(agent.id, 'activate')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Check size={16} />
                  Activate
                </button>
              )}
              <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrderLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Order Logs</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                  No orders yet. Orders will appear here when users place them.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-900">#{order.id}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-gray-900">{order.customer}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-gray-900">
                    {order.type === 'Food' 
                      ? (order.details as any)?.restaurant || 'Campus Food Court'
                      : (order.details as any)?.fileName || 'Document'
                    }
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {order.type === 'Food' 
                      ? (order.details as any)?.items?.map((item: any) => item.name).join(', ') || 'Food items'
                      : (order.details as any)?.fileName || 'Document'
                    }
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">${order.price}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                      order.status === 'Ready' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'Accepted' ? 'bg-orange-100 text-orange-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-orange-600 hover:text-orange-900">
                        <Eye size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLiveMonitoring = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Live Monitoring</h2>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Last 24 Hours
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Deliveries</h3>
          <div className="space-y-4">
            {orders.filter(o => o.status === 'in-transit').map(order => (
              <div key={order.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full mt-2 bg-orange-500"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{new Date(order.date).toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer} → {order.vendor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Logs</h3>
          <div className="space-y-3">
            {systemLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${log.severity === 'error' ? 'bg-red-500' : log.severity === 'warning' ? 'bg-yellow-500' : 'bg-orange-500'}`}></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded ${log.type === 'route_optimization' ? 'bg-orange-100 text-orange-700' : log.type === 'delivery_prediction' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {log.type}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-900">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => {
    const tabs = [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'security', label: 'Security', icon: Shield },
      { id: 'preferences', label: 'System Preferences', icon: Settings }
    ];

    const handleSaveChanges = () => {
      // Update localStorage with new profile data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = {
        ...currentUser,
        fullName: profileData.adminName,
        phone: profileData.contactNumber
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Show success feedback
      alert('Profile changes saved successfully!');
    };

    const handlePasswordChange = () => {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('New passwords do not match!');
        return;
      }
      if (passwordData.newPassword.length < 8) {
        alert('Password must be at least 8 characters long!');
        return;
      }
      alert('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const renderProfileTab = () => (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Admin Name</label>
              <input
                type="text"
                value={profileData.adminName}
                onChange={(e) => setProfileData(prev => ({ ...prev, adminName: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter admin name"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="tel"
                value={profileData.contactNumber}
                onChange={(e) => setProfileData(prev => ({ ...prev, contactNumber: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter contact number"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveChanges}
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 transform hover:scale-105 border border-orange-500/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    );

    const renderSecurityTab = () => (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handlePasswordChange}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Enable 2FA</p>
              <p className="text-xs text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={twoFactorEnabled} onChange={(e) => setTwoFactorEnabled(e.target.checked)} />
              <div className="w-14 h-7 bg-gray-200 peer-focus:ring-2 peer-focus:ring-orange-500/20 rounded-full peer-checked:bg-orange-600 peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
            </label>
          </div>
        </div>
      </div>
    );

    const renderPreferencesTab = () => (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Preferences</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Dark Mode</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={toggleDarkMode} />
                <div className="w-16 h-8 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer-checked:after:translate-x-8 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-600 peer-checked:to-orange-500"></div>
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-14 h-7 bg-gray-200 peer-focus:ring-2 peer-focus:ring-orange-500/20 rounded-full peer-checked:bg-orange-600 peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-routing</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoRouting} onChange={(e) => setAutoRouting(e.target.checked)} />
                <div className="w-14 h-7 bg-gray-200 peer-focus:ring-2 peer-focus:ring-orange-500/20 rounded-full peer-checked:bg-orange-600 peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  activeSettingsTab === tab.id
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            {activeSettingsTab === 'profile' && renderProfileTab()}
            {activeSettingsTab === 'security' && renderSecurityTab()}
            {activeSettingsTab === 'preferences' && renderPreferencesTab()}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUserManagement();
      case 'vendors': return renderVendorApproval();
      case 'agents': return renderDeliveryAgents();
      case 'orders': return renderOrderLogs();
      case 'monitoring': return renderLiveMonitoring();
      case 'settings': return renderSettings();
      default: return null;
    }
  };

  return (
    <PageWrapper>
      <div className="flex min-h-screen bg-gray-50">
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} fixed top-0 left-0 h-screen bg-white shadow-lg transition-all duration-300 flex flex-col z-50`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                {sidebarOpen && <h1 className="text-xl font-bold text-gray-900">Admin</h1>}
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <div className="text-sm font-medium text-gray-900">Admin User</div>
                  <div className="text-xs text-gray-500">admin@hyperdeliv.com</div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 ${!sidebarOpen && 'justify-center'}`}
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>

        <div className={`flex-1 bg-gray-50 p-6 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
          {renderContent()}
        </div>
      </div>
    </PageWrapper>
  );
};

export default AdminDashboard;
