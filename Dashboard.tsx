import { useNavigate, useSearchParams } from "react-router-dom";
import { Utensils, Printer, User, Package, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import OtpDisplay from "@/components/OtpDisplay";
import OrderTrackingView from "./OrderTrackingView";
import PageWrapper from "@/components/PageWrapper";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const [activeView, setActiveView] = useState('home');
  
  // Get user from localStorage with session persistence
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedRole = localStorage.getItem('userRole');
    
    console.log('Dashboard - storedUser from currentUser:', storedUser);
    console.log('Dashboard - storedRole:', storedRole);
    
    // Prioritize currentUser (from login) over generic user object
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Dashboard - parsedUser:', parsedUser);
      console.log('Dashboard - parsedUser.fullName:', parsedUser.fullName);
      return parsedUser;
    }
    
    // Fallback to auth user or role-based user
    const fallbackUser = authUser || { role: storedRole || 'User' };
    console.log('Dashboard - fallbackUser:', fallbackUser);
    return fallbackUser;
  });

  // Handle URL parameter routing on component mount
  useEffect(() => {
    const view = searchParams.get('view') || 'home';
    setActiveView(view);
    
    // Store user session in localStorage for persistence
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role || 'User');
      
      // Ensure currentUser is also set for session persistence
      if (!localStorage.getItem('currentUser') && user.fullName) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    }
  }, [searchParams, user]);

  // Session persistence effect - check for currentUser on mount
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    console.log("Dashboard mount - currentUser from localStorage:", currentUser);
    console.log("Dashboard mount - user from auth context:", user);
    
    if (currentUser && !user?.fullName) {
      const parsedUser = JSON.parse(currentUser);
      console.log("Dashboard - setting user from localStorage:", parsedUser);
      setUser(parsedUser);
    }
  }, [user]); // Only run when user context changes

  const quickActions = [
    {
      icon: Utensils,
      title: "Order Food",
      description: "Browse menu and place food orders",
      action: () => {
        navigate("/food?view=food");
        setActiveView('food');
      },
      color: "text-orange-600"
    },
    {
      icon: Printer,
      title: "Print Documents",
      description: "Upload and print documents quickly",
      action: () => {
        navigate("/print?view=print");
        setActiveView('print');
      },
      color: "text-blue-600"
    },
    {
      icon: Package,
      title: "My Orders",
      description: "View your order history",
      action: () => {
        navigate("/orders?view=orders");
        setActiveView('orders');
      },
      color: "text-green-600"
    },
    {
      icon: Settings,
      title: "Account Settings",
      description: "Manage your account and preferences",
      action: () => {
        navigate("/account");
        setActiveView('account');
      },
      color: "text-purple-600"
    }
  ];

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName || user?.email || 'User'}! 
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your HyperDeliv account today.
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Current view: <span className="font-medium">{activeView}</span>
          </div>
          {user?.fullName && (
            <div className="mt-1 text-sm text-gray-600">
              Logged in as: <span className="font-medium">{user.fullName}</span>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="group rounded-lg border bg-white p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-[#f58634]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-[#f58634]/10">
                  <action.icon size={24} className={`text-gray-600 group-hover:text-[#f58634] transition-colors`} />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-[#f58634] transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Based on Active View */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {activeView === 'home' && 'Dashboard Overview'}
            {activeView === 'food' && 'Food Orders'}
            {activeView === 'print' && 'Print Jobs'}
            {activeView === 'orders' && 'Order History'}
            {activeView === 'account' && 'Account Details'}
            {activeView === 'tracking' && 'Order Tracking'}
          </h3>
          <div className="space-y-4">
            {activeView === 'home' && (
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  <Utensils size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Recent Activity</p>
                  <p className="text-xs text-gray-600">Chicken Biryani x1</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-500">2 hours ago</span>
                    <span className="text-xs text-green-600">completed</span>
                  </div>
                </div>
              </div>
            )}
            {activeView === 'tracking' && (
              <OrderTrackingView orderId={searchParams.get('orderId')} />
            )}
            {activeView !== 'home' && activeView !== 'tracking' && (
              <p className="text-sm text-gray-600">
                {activeView === 'food' && 'No active food orders'}
                {activeView === 'print' && 'No pending print jobs'}
                {activeView === 'orders' && 'No recent orders'}
                {activeView === 'account' && 'Account settings and preferences'}
              </p>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Account Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="font-medium capitalize text-gray-900">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium text-gray-900">Today</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Session Status</p>
              <p className="font-medium text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* OTP Display */}
      <OtpDisplay onClose={() => {}} />
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
