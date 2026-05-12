import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Index from "./pages/Index";
import Login from "./pages/Login.jsx";
import UserLogin from "./pages/UserLogin.jsx";
import VendorLogin from "./pages/VendorLogin.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import UserSignup from "./pages/UserSignup.jsx";
import Dashboard from "./pages/Dashboard";
import Print from "./pages/Print";
import Food from "./pages/Food";
import Account from "./pages/Account";
import Tracking from "./pages/Tracking";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import Payment from "./pages/Payment";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import OtpVerificationPage from "./pages/OtpVerificationPage";

const queryClient = new QueryClient();

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!isLoggedIn || user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Mirrors Sidebar.tsx visibility logic — returns true only when sidebar is rendered
const useShowSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const currentUser = JSON.parse(
    localStorage.getItem('currentUser') || localStorage.getItem('dabbaUser') || '{}'
  );
  const isLoggedIn =
    localStorage.getItem('isLoggedIn') === 'true' || currentUser?.email || user?.email;
  const isHiddenPage =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/admin' ||
    location.pathname.startsWith('/vendor') ||
    location.pathname.startsWith('/admin/') ||
    location.pathname.startsWith('/login/') ||
    location.pathname.startsWith('/signup/');
  return !isHiddenPage && !!isLoggedIn;
};

// Layout wrapper — only applies ml-64 offset when sidebar is actually visible
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const showSidebar = useShowSidebar();
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className={`flex-1 overflow-y-auto min-h-0 ${showSidebar ? 'lg:ml-64' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <div className="container mx-auto px-4 py-8">
                        <Dashboard />
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/food" element={
                    <ProtectedRoute>
                      <div className="container mx-auto px-4 py-8">
                        <Food />
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/print" element={
                    <ProtectedRoute>
                      <div className="container mx-auto px-4 py-8">
                        <Print />
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/tracking" element={
                    <ProtectedRoute>
                      <div className="container mx-auto px-4 py-8">
                        <Tracking />
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <div className="container mx-auto px-4 py-8">
                        <Orders />
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/order-tracking" element={
                    <ProtectedRoute>
                      <OrderTracking />
                    </ProtectedRoute>
                  } />
                  <Route path="/payment" element={
                    <ProtectedRoute>
                      <div className="container mx-auto px-4 py-8">
                        <Payment />
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/account" element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/login/user" element={<UserLogin />} />
                  <Route path="/login/vendor" element={<VendorLogin />} />
                  <Route path="/login/admin" element={<AdminLogin />} />
                  <Route path="/signup/user" element={<UserSignup />} />
                  <Route path="/vendor" element={
                    <ProtectedRoute>
                      <div className="container mx-auto px-4 py-8">
                        <VendorDashboard />
                      </div>
                    </ProtectedRoute>
                  } />
                  <Route path="/vendor/otp-verification" element={<OtpVerificationPage />} />
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/orders" element={
                    <AdminRoute>
                      <AdminOrders />
                    </AdminRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
              <Toaster />
              <Sonner />
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
