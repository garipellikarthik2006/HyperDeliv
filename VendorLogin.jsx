import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Store, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";

const DEMO_VENDOR = { id: 200, email: "vendor@demo.com", password: "vendor123", fullName: "Vendor User", role: "vendor" };

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const VendorLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const googleButtonRef = useRef(null);

  const handleGoogleSuccess = (googleUser) => {
    const authUser = { id: Date.now(), email: googleUser.email, role: "vendor", fullName: googleUser.name, picture: googleUser.picture };
    const fakeToken = btoa(JSON.stringify(authUser));
    localStorage.setItem("dabbaToken", fakeToken);
    localStorage.setItem("dabbaUser", JSON.stringify(authUser));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", authUser.role);
    toast({ title: "Welcome!", description: `Signed in as ${googleUser.name} via Google` });
    window.location.href = "/vendor";
  };

  const handleGoogleError = (error) => {
    toast({ title: "Google Sign-In Failed", description: error, variant: "destructive" });
  };

  const { initializeGoogleButton, isConfigured } = useGoogleSignIn(handleGoogleSuccess, handleGoogleError);

  useEffect(() => {
    if (googleButtonRef.current) initializeGoogleButton(googleButtonRef.current);
  }, [initializeGoogleButton]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (email === DEMO_VENDOR.email && password === DEMO_VENDOR.password) {
        const authUser = { id: DEMO_VENDOR.id, email: DEMO_VENDOR.email, role: DEMO_VENDOR.role, fullName: DEMO_VENDOR.fullName };
        const fakeToken = btoa(JSON.stringify(authUser));
        localStorage.setItem("dabbaToken", fakeToken);
        localStorage.setItem("dabbaUser", JSON.stringify(authUser));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", authUser.role);
        toast({ title: "Welcome back!", description: "Successfully logged in as Vendor" });
        window.location.href = "/vendor";
        return;
      }
      toast({ title: "Login Failed", description: "Invalid credentials. Use vendor@demo.com / vendor123", variant: "destructive" });
    } catch {
      toast({ title: "Login Failed", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <button onClick={() => navigate("/")} className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        {/* Removed group-hover gradient overlay and hover:scale-105 — they were blocking clicks */}
        <div className="bg-white rounded-2xl shadow-xl p-8 transition-shadow duration-300 hover:shadow-2xl">

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-200">
              <Store className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Login</h2>
            <p className="text-gray-600">Manage your business and serve customers</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" required />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:bg-orange-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">Or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {isConfigured ? (
            <div ref={googleButtonRef} className="w-full flex justify-center" style={{ minHeight: "44px" }} />
          ) : (
            <button type="button"
              onClick={() => toast({ title: "Setup Required", description: "Add VITE_GOOGLE_CLIENT_ID to your .env file to enable Google Sign-In.", variant: "destructive" })}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200 text-gray-600 font-medium text-sm cursor-pointer">
              <GoogleIcon />
              Continue with Google
            </button>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-500">
              <p>Email: vendor@demo.com</p>
              <p>Password: vendor123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
