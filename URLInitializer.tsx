import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const URLInitializer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    // This runs on page load to handle URL parameters
    const view = searchParams.get('view');
    const tab = searchParams.get('tab');

    // Authentication guard for protected views
    if (!isLoggedIn && (view === 'food' || view === 'print')) {
      navigate('/', { replace: true });
      return;
    }

    // Handle view parameter for Users
    if (isLoggedIn && user?.role === 'User') {
      if (view === 'food') {
        navigate('/food', { replace: true });
      } else if (view === 'print') {
        navigate('/print', { replace: true });
      }
    }

    // Handle tab parameter for vendors
    if (isLoggedIn && user?.role === 'vendor') {
      const validTab = tab === 'jobs' || tab === 'print' || tab === 'earnings' ? tab : 'jobs';
      if (window.location.pathname === '/vendor') {
        // We're already on the vendor page, just ensure the tab is correct
        if (tab !== validTab) {
          navigate(`/vendor?tab=${validTab}`, { replace: true });
        }
      }
    }
  }, [isLoggedIn, user, navigate, searchParams]);

  return null; // This component doesn't render anything
};
