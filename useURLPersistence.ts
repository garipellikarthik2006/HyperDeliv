import { useNavigate, useSearchParams } from 'react-router-dom';

export const useURLPersistence = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Update URL parameter without full page reload
  const updateURLParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(key, value);
    const newURL = `${window.location.pathname}?${newParams.toString()}`;
    
    // Use History API to update URL without reload
    window.history.pushState({ [key]: value }, '', newURL);
  };

  // Get URL parameter value
  const getURLParam = (key: string) => {
    return searchParams.get(key);
  };

  // Navigate with URL parameters
  const navigateWithParams = (path: string, params?: Record<string, string>) => {
    const newParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        newParams.set(key, value);
      });
    }
    
    const queryString = newParams.toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    
    navigate(fullPath, { replace: true });
  };

  return {
    updateURLParam,
    getURLParam,
    navigateWithParams
  };
};
