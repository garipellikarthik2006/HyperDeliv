import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { Home, Utensils, Printer, User, Menu, X, ClipboardList, Wallet, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Watch for modal open state via body attribute
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsModalOpen(document.body.hasAttribute('data-modal-open'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-modal-open'] });
    return () => observer.disconnect();
  }, []);

  // Get current user from localStorage for fullName
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('dabbaUser') || '{}');

  // Debug logging
  console.log('Sidebar Debug - user:', user);
  console.log('Sidebar Debug - currentUser:', currentUser);
  console.log('Sidebar Debug - isLoggedIn:', localStorage.getItem('isLoggedIn'));

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('dabbaUser');
    localStorage.removeItem('dabbaToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('active_order');
    
    // Call logout function from AuthContext
    logout();
    
    // Redirect to home page
    window.location.href = '/';
  };

  // Hide sidebar on landing, login, vendor, and admin pages
  const isHiddenPage = location.pathname === "/" || 
                     location.pathname === "/login" || 
                     location.pathname === "/admin" ||
                     location.pathname.startsWith("/admin/") ||
                     location.pathname.startsWith("/login/") ||
                     location.pathname.startsWith("/signup/");
  
  // More permissive check - show sidebar if user is logged in via localStorage
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || currentUser?.email || user?.email;
  
  if (isHiddenPage || !isLoggedIn) {
    console.log('Sidebar hidden - isHiddenPage:', isHiddenPage, 'isLoggedIn:', isLoggedIn);
    return null;
  }

  const sidebarItems = [
    ...(user?.role === 'vendor' || localStorage.getItem('userRole') === 'vendor' || currentUser?.role === 'vendor' || location.pathname.startsWith('/vendor') ? [
      {
        icon: Home,
        label: "Overview",
        to: "/vendor?tab=overview"
      },
      {
        icon: ClipboardList,
        label: "Job Board",
        to: "/vendor?tab=jobs"
      },
      {
        icon: Printer,
        label: "Print Queue",
        to: "/vendor?tab=print"
      },
      {
        icon: Wallet,
        label: "Earnings",
        to: "/vendor?tab=earnings"
      },
      {
        icon: User,
        label: "Account Settings",
        to: "/vendor?tab=account"
      }
    ] : [
      {
        icon: Home,
        label: "Home",
        to: "/dashboard"
      },
      {
        icon: Utensils,
        label: "Food Menu",
        to: "/food"
      },
      {
        icon: Printer,
        label: "Print Upload",
        to: "/print"
      },
      {
        icon: ClipboardList,
        label: "My Orders",
        to: "/orders"
      },
      {
        icon: User,
        label: "Account Settings",
        to: "/account"
      }
    ])
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed left-4 top-20 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card shadow-md lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-16 z-40 w-64 border-r border-border bg-white shadow-lg
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:-translate-x-0'}
      `} style={{ height: 'calc(100vh - 64px)' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex-shrink-0">
            <h1 className="text-2xl font-bold text-foreground">DabbaFlow</h1>
          </div>

          {/* Navigation Links - scrollable middle section */}
          <nav className="flex-grow overflow-y-auto space-y-2 px-4">
            {sidebarItems.map((item, index) => {
              // For vendor tabs, match by tab param only (not modal state)
              const isVendorTab = item.to.includes('?tab=');
              const tabParam = isVendorTab ? item.to.split('?tab=')[1] : null;
              const currentTab = searchParams.get('tab');
              const isActive = isVendorTab
                ? currentTab === tabParam
                : location.pathname === item.to;
              return (
                <NavLink
                  key={index}
                  to={item.to}
                  className={() =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out border-2 border-transparent bg-transparent ${
                      isActive
                        ? 'text-[#f58634] border-[#f58634]'
                        : 'text-black hover:text-[#f58634] hover:border-[#f58634]'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={20} className="transition-all duration-200 ease-in-out" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* User Info + Logout - Always pinned to bottom */}
          <div className="flex-shrink-0 p-4 border-t border-border bg-gray-50">
            <div className="mb-1 text-sm text-muted-foreground">
              Status: {currentUser?.fullName || user?.email ? 'Logged In' : 'Guest'}
            </div>
            <div className="font-medium text-foreground text-lg mb-3">
              {currentUser?.fullName || user?.email || 'Guest'}
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border-2 border-red-400"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Modal backdrop overlay on sidebar */}
      {isModalOpen && (
        <div className="fixed left-0 top-16 z-50 w-64 bg-black/50 pointer-events-none" style={{ height: 'calc(100vh - 64px)' }} />
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;