import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { apiFetch, buildAuthHeaders, clearAuthToken, setAuthToken } from "@/lib/api";

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, role?: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: true,
  login: async (email: string, password: string) => {
    try {
      // Check localStorage users first
      const storedUsers = JSON.parse(localStorage.getItem('dabbaflow_users') || '[]');
      const foundUser = storedUsers.find(user => user.email === email && user.password === password);
      
      if (foundUser) {
        // Set current user session
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        localStorage.setItem('userRole', foundUser.role);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('dabbaUser', JSON.stringify(foundUser));
        localStorage.setItem('dabbaToken', 'demo-token-' + Date.now());
        setAuthToken('demo-token-' + Date.now());
        
        return { error: undefined };
      } else {
        return { error: "Invalid email or password" };
      }
    } catch (error) {
      return { error: "Authentication failed" };
    }
  },
  register: async (email: string, password: string, role?: string) => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('dabbaflow_users') || '[]');
      const newUser = {
        id: Date.now(),
        email,
        password,
        fullName: email.split('@')[0],
        role: role || 'user'
      };
      
      storedUsers.push(newUser);
      localStorage.setItem('dabbaflow_users', JSON.stringify(storedUsers));
      
      return { error: undefined };
    } catch (error) {
      return { error: "Registration failed" };
    }
  },
  logout: () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('dabbaUser');
    localStorage.removeItem('dabbaToken');
    clearAuthToken();
  },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    const token = localStorage.getItem("dabbaToken");
    const storedUser = localStorage.getItem("dabbaUser");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");
    
    if (token && storedUser && isLoggedIn === "true") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setAuthToken(token);
      } catch {
        // Clear corrupted data
        clearAuthToken();
        localStorage.removeItem("dabbaUser");
        localStorage.removeItem("dabbaToken");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await apiFetch<{ token: string; user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (result.error) {
        return { error: result.error };
      }

      setAuthToken(result.data.token);
      localStorage.setItem("dabbaToken", result.data.token);
      localStorage.setItem("dabbaUser", JSON.stringify(result.data.user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", result.data.user.role);
      setUser(result.data.user);
      return { error: undefined };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) || "Unexpected login failure" };
    }
  };

  const register = async (email: string, password: string, role: string = "User") => {
    try {
      const result = await apiFetch<{ token: string; user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      
      if (result.error) {
        return { error: result.error };
      }

      setAuthToken(result.data.token);
      localStorage.setItem("dabbaToken", result.data.token);
      localStorage.setItem("dabbaUser", JSON.stringify(result.data.user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", result.data.user.role);
      setUser(result.data.user);
      return { error: undefined };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) || "Unexpected registration failure" };
    }
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem("dabbaUser");
    localStorage.removeItem("dabbaToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("active_order");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoggedIn, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
