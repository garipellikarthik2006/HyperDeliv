import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PageWrapper from "@/components/PageWrapper";
import { 
  Settings,
  DollarSign,
  Users,
  Map,
  Bell,
  ToggleLeft,
  ToggleRight,
  Clock,
  MapPin,
  Shield,
  Upload,
  MessageSquare,
  Check,
  X,
  Search,
  Save,
  Send,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

const AdminSettings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // Platform Control State
  const [services, setServices] = useState({
    food: true,
    print: true,
    courier: true
  });
  const [operationalHours, setOperationalHours] = useState("09:00");
  const [deliveryRadius, setDeliveryRadius] = useState(5);
  
  // Financial Management State
  const [financials, setFinancials] = useState({
    baseDeliveryFee: 20,
    bwPrintRate: 3,
    colorPrintRate: 5,
    commissionRate: 15
  });
  
  // User/Vendor Oversight State
  const [verificationQueue, setVerificationQueue] = useState([
    { id: 1, name: "John's Kitchen", email: "john@kitchen.com", type: "vendor", status: "pending" },
    { id: 2, name: "Sarah Print Shop", email: "sarah@print.com", type: "vendor", status: "pending" },
    { id: 3, name: "Mike Delivery", email: "mike@delivery.com", type: "agent", status: "pending" }
  ]);
  const [roleSearch, setRoleSearch] = useState("");
  
  // Appearance State
  const [darkMode, setDarkMode] = useState(false);
  const [announcementBanner, setAnnouncementBanner] = useState("Welcome to HyperDeliv Admin Panel");
  const [heroImage, setHeroImage] = useState<File | null>(null);
  
  // Logistics & Performance State
  const [systemLogs, setSystemLogs] = useState([
    { code: 200, message: "Order #1234 processed successfully", timestamp: new Date().toISOString() },
    { code: 400, message: "Invalid delivery address format", timestamp: new Date().toISOString() },
    { code: 500, message: "Database connection timeout", timestamp: new Date().toISOString() }
  ]);
  
  // Communication State
  const [broadcastMessage, setBroadcastMessage] = useState("");

  // Toggle Service
  const toggleService = (service: keyof typeof services) => {
    setServices(prev => ({ ...prev, [service]: !prev[service] }));
  };

  // Handle Verification Action
  const handleVerificationAction = (id: number, action: 'approve' | 'reject') => {
    setVerificationQueue(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' }
          : item
      )
    );
  };

  // Save Settings
  const saveSettings = () => {
    localStorage.setItem('adminSettings', JSON.stringify({
      services,
      operationalHours,
      deliveryRadius,
      financials,
      darkMode,
      announcementBanner
    }));
    alert('Settings saved successfully!');
  };

  // Send Broadcast
  const sendBroadcast = () => {
    if (broadcastMessage.trim()) {
      // In real app, this would send to all users
      alert(`Broadcast sent: ${broadcastMessage}`);
      setBroadcastMessage("");
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
          <p className="text-gray-600">Manage platform configuration and system settings</p>
        </div>

        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Platform Control */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Platform Control</h2>
            </div>
            
            <div className="space-y-6">
              {/* Service Toggles */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Service Toggles</h3>
                <div className="space-y-3">
                  {Object.entries(services).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                      <button
                        onClick={() => toggleService(key as keyof typeof services)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operational Hours */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Operational Hours
                </label>
                <input
                  type="time"
                  value={operationalHours}
                  onChange={(e) => setOperationalHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Delivery Radius */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Delivery Radius: {deliveryRadius}km
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0km</span>
                  <span>10km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Financial Management</h2>
            </div>
            
            <div className="space-y-6">
              {/* Base Delivery Fee */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Base Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  value={financials.baseDeliveryFee}
                  onChange={(e) => setFinancials(prev => ({ ...prev, baseDeliveryFee: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Print Rates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    B&W Print Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={financials.bwPrintRate}
                    onChange={(e) => setFinancials(prev => ({ ...prev, bwPrintRate: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Color Print Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={financials.colorPrintRate}
                    onChange={(e) => setFinancials(prev => ({ ...prev, colorPrintRate: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Commission Rate */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Commission Rates (%)
                </label>
                <input
                  type="number"
                  value={financials.commissionRate}
                  onChange={(e) => setFinancials(prev => ({ ...prev, commissionRate: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* User/Vendor Oversight */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">User/Vendor Oversight</h2>
            </div>
            
            <div className="space-y-6">
              {/* Verification Queue */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Verification Queue</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {verificationQueue.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerificationAction(item.id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleVerificationAction(item.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Management */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Role Management</h3>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search users by email..."
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* Appearance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
            </div>
            
            <div className="space-y-6">
              {/* Dark Mode Toggle */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Master Dark Mode</h3>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-orange-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Hero Image Manager */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Hero Image Manager</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setHeroImage(e.target.files?.[0] || null)}
                    className="hidden"
                    id="hero-image-upload"
                  />
                  <label 
                    htmlFor="hero-image-upload"
                    className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {heroImage ? heroImage.name : 'Click to upload hero image'}
                  </label>
                </div>
              </div>

              {/* Announcement Banner */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Announcement Banner</h3>
                <textarea
                  value={announcementBanner}
                  onChange={(e) => setAnnouncementBanner(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Enter announcement text..."
                />
              </div>
            </div>
          </div>

          {/* Logistics & Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Map className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Logistics & Performance</h2>
            </div>
            
            <div className="space-y-6">
              {/* Real-time Order Map */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Real-time Order Map</h3>
                <div className="h-48 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg flex items-center justify-center border border-orange-200">
                  <div className="text-center">
                    <Map className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Interactive map view</p>
                    <p className="text-xs text-gray-500">Live order tracking</p>
                  </div>
                </div>
              </div>

              {/* System Logs */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">System Logs</h3>
                <div className="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs">
                  {systemLogs.map((log, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                      <span className={`inline-block w-12 text-center ${
                        log.code === 200 ? 'text-green-400' : 
                        log.code === 400 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {log.code}
                      </span>
                      <span className="text-gray-300">{log.message}</span>
                      <span className="text-gray-500 text-xs ml-auto">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Communication */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Communication</h2>
            </div>
            
            <div className="space-y-6">
              {/* Push Notifications */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Push Notifications</h3>
                <div className="space-y-4">
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Enter broadcast message..."
                  />
                  <button
                    onClick={sendBroadcast}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Send size={16} />
                    Broadcast
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={saveSettings}
            className="flex items-center gap-2 px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AdminSettings;
