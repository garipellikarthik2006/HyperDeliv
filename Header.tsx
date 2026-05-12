import { NavLink, useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're on dashboard page
  const isDashboardPage = location.pathname === "/dashboard" || location.pathname === "/";
  // Determine if we're on feature pages (food, print)
  const isFeaturePage = ["/food", "/print"].includes(location.pathname);
  // Determine if we're on pages with sidebar navigation (food, print, orders, tracking, payment)
  const hasSidebarNav = ["/food", "/print", "/orders", "/tracking", "/payment"].includes(location.pathname);
  
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Logo - always visible */}
          <NavLink to="/" className="text-2xl font-extrabold text-primary">
            HyperDeliv
          </NavLink>

          <div className="flex items-center gap-6">
            {/* Navigation */}
            <>
              {/* Dashboard: Show NO nav links */}
              {isDashboardPage && (
                <nav className="hidden items-center gap-4 md:flex">
                  {/* Empty - no nav links on dashboard */}
                </nav>
              )}
              
              {/* Feature pages: No nav links */}
              {isFeaturePage && (
                <nav className="hidden items-center gap-4 md:flex">
                  {/* Empty - no nav links on feature pages */}
                </nav>
              )}
            </>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
