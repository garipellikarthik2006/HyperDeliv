import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import loginIllustration from "@/assets/login-illustration.png";

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const initialTab = useMemo<"User" | "vendor" | "admin">(() => {
    const mode = searchParams.get("mode");
    return mode === "signup" ? "User" : "User";
  }, [searchParams]);

  const [tab, setTab] = useState<"User" | "vendor" | "admin">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const action = searchParams.get("mode") === "signup" ? "register" : "login";
    const fn = action === "register" ? register : login;
    const result = await fn(email, password, tab);

    setSubmitting(false);

    if (result.error) {
      toast({
        title: "Authentication failed",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Signed in",
      description: "You are now signed in.",
    });

    // Find user in localStorage and save complete user object
    if (tab === 'User') {
      const users = JSON.parse(localStorage.getItem('dabbaflow_users') || '[]');
      const currentUser = users.find((user: any) => user.email === email);
      
      if (currentUser) {
        // Save complete user object to currentUser key
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log('Current user saved to localStorage:', currentUser);
      }
    }

    // Redirect based on user role
    const user = await new Promise((resolve) => {
      setTimeout(() => resolve({ role: tab }), 100);
    });
    
    if (tab === 'vendor') {
      navigate("/vendor");
    } else if (tab === 'admin') {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="container mx-auto animate-fade-in px-4 py-12">
      <h1 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
        User / Vendor / Admin Login
      </h1>

      <div className="mx-auto grid max-w-4xl items-center gap-10 md:grid-cols-2">
        {/* Form */}
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:bg-gradient-to-br hover:from-white hover:to-orange-500 hover:from-bottom-left hover:to-top-right group">
          {/* Tabs */}
          <div className="mb-6 flex border-b">
            {(["User", "vendor", "admin"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 pb-2 text-sm font-semibold capitalize transition-colors ${
                  tab === t
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground group-hover:text-white"
                }`}
              >
                {t} Login
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 group-hover:text-white">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2 group-hover:text-white">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-white group-hover:text-orange-500"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 rounded-lg border border-border/50 bg-muted/30 p-4">
            <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
              Demo Credentials
            </p>
            <div className="space-y-1 text-xs text-muted-foreground/70">
              <div>
                <span className="font-medium">User:</span> user@demo.com / user123
              </div>
              <div>
                <span className="font-medium">Vendor:</span> vendor@demo.com / vendor123
              </div>
              <div>
                <span className="font-medium">Admin:</span> admin@demo.com / admin123
              </div>
            </div>
          </div>
        </div>

        {/* Illustration */}
        <div className="hidden items-center justify-center md:flex">
          <img
            src={loginIllustration}
            alt="User and delivery driver illustration"
            className="max-h-80 w-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
