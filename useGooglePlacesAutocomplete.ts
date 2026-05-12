import { useState, useEffect, useRef } from 'react';

// Conditional import to prevent blank screen
let GOOGLE_MAPS_CONFIG: any;
try {
  GOOGLE_MAPS_CONFIG = require("@/config/googleMaps").GOOGLE_MAPS_CONFIG;
} catch (error) {
  GOOGLE_MAPS_CONFIG = {
    API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
    DEFAULT_CENTER: { lat: 17.3850, lng: 78.4867 },
    DEFAULT_ZOOM: 12,
    HYDERABAD_BOUNDS: {
      north: 17.5500,
      south: 17.2000,
      east: 78.6000,
      west: 78.3000
    },
    AUTOCOMPLETE_OPTIONS: {
      componentRestrictions: { country: 'IN' },
      types: ['address', 'establishment'],
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id', 'name', 'icon'],
      strictBounds: true,
      bounds: {
        north: 17.5,
        south: 17.2,
        east: 78.6,
        west: 78.3
      }
    }
  };
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

interface AddressData {
  formatted_address: string;
  place_id: string;
  lat: number;
  lng: number;
  address_components: any[];
}

export const useGooglePlacesAutocomplete = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [address, setAddress] = useState<AddressData | null>(null);
  const [isAddressVerified, setIsAddressVerified] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Load Google Maps script with Places library
  const loadGoogleMapsScript = () => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    // Check if API key is configured
    if (!GOOGLE_MAPS_CONFIG.API_KEY || GOOGLE_MAPS_CONFIG.API_KEY === 'your_google_maps_api_key_here') {
      console.error('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Add error handling
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
    };
    
    window.initGoogleMaps = () => {
      console.log('Google Maps loaded successfully');
      setIsLoaded(true);
    };

    document.head.appendChild(script);
  };

  // Initialize autocomplete on input element
  const initializeAutocomplete = (inputElement: HTMLInputElement) => {
    if (!window.google || !inputElement) {
      console.error('Google Maps not loaded or input element not found');
      return;
    }

    // Clear any existing autocomplete and event listeners
    if (autocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
    }
    
    // Remove previous event listeners if they exist
    const existingListeners = (inputElement as any)._googlePlacesListeners;
    if (existingListeners) {
      inputElement.removeEventListener('keydown', existingListeners.keydownHandler);
      inputElement.removeEventListener('input', existingListeners.inputHandler);
      delete (inputElement as any)._googlePlacesListeners;
    }

    // Hyderabad bounds for strict location filtering
    const bounds = GOOGLE_MAPS_CONFIG.HYDERABAD_BOUNDS || {
      north: 17.5500,
      south: 17.2000,
      east: 78.6000,
      west: 78.3000
    };
    
    const hyderabadBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(bounds.south, bounds.west),  // Southwest corner
      new window.google.maps.LatLng(bounds.north, bounds.east)   // Northeast corner
    );

    const autocompleteOptions = {
      ...GOOGLE_MAPS_CONFIG.AUTOCOMPLETE_OPTIONS,
      bounds: hyderabadBounds,
      strictBounds: true
    };

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputElement,
      autocompleteOptions
    );

    autocompleteRef.current = autocomplete;

    // Handle place selection
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      console.log('Place changed event triggered:', place);
      
      if (place.geometry) {
        const addressData: AddressData = {
          formatted_address: place.formatted_address,
          place_id: place.place_id,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address_components: place.address_components
        };
        
        console.log('Setting address verified to true for:', addressData.formatted_address);
        
        setAddress(addressData);
        setIsAddressVerified(true);
        setShowCheckmark(true);
        inputElement.value = place.formatted_address;
        inputElement.style.borderColor = '#10b981'; // Green border
        inputElement.style.paddingRight = '2.5rem'; // Space for checkmark
        
        // Hide checkmark after 2 seconds
        setTimeout(() => {
          setShowCheckmark(false);
          inputElement.style.paddingRight = '';
        }, 2000);
        
        console.log('Place selected:', place.formatted_address);
      } else {
        console.log('No geometry found for place');
      }
    });

    // Prevent manual entry - only allow Google suggestions
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const place = autocomplete.getPlace();
        
        console.log('Enter key pressed, place data:', place);
        
        // Check if we have a valid place with geometry
        if (!place || !place.geometry || !place.formatted_address) {
          console.log('Invalid place on Enter, clearing input');
          inputElement.value = '';
          inputElement.style.borderColor = '#ef4444'; // Red border
          inputElement.placeholder = 'Please select a verified address from the list';
          setIsAddressVerified(false);
          setShowCheckmark(false);
          setTimeout(() => {
            inputElement.style.borderColor = '';
            inputElement.placeholder = 'Start typing to search for real Hyderabad addresses...';
          }, 3000);
        } else {
          // Valid place selected, let the place_changed handler deal with it
          console.log('Valid place on Enter, letting place_changed handle it');
        }
      }
    };

    // Handle manual text changes
    const inputHandler = (e: Event) => {
      // Only reset verification if the input doesn't match the verified address
      const currentValue = inputElement.value;
      const verifiedAddress = address?.formatted_address;
      
      if (currentValue !== verifiedAddress) {
        setIsAddressVerified(false);
        setShowCheckmark(false);
        // Remove red border while typing - only show validation on submission
        inputElement.style.borderColor = '';
        inputElement.style.paddingRight = '';
      }
    };

    inputElement.addEventListener('keydown', keydownHandler);
    inputElement.addEventListener('input', inputHandler);

    // Store event listeners for cleanup
    (inputElement as any)._googlePlacesListeners = { keydownHandler, inputHandler };

    console.log('Autocomplete initialized for input:', inputElement.id);
  };

  // Setup autocomplete when input is ready
  const setupAutocomplete = (inputId?: string) => {
    console.log('Setting up autocomplete for:', inputId, 'isLoaded:', isLoaded);
    
    // Multiple attempts to find the input element
    const findInputElement = (attempts = 0): HTMLInputElement | null => {
      const input = inputId 
        ? document.getElementById(inputId) as HTMLInputElement
        : inputRef.current;
      
      console.log(`Attempt ${attempts + 1}: Found input element:`, input, 'for ID:', inputId);
      
      if (input) {
        // Check if input is actually visible and enabled
        const rect = input.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const isEnabled = !input.disabled && !input.readOnly;
        
        console.log('Input state:', {
          isVisible,
          isEnabled,
          disabled: input.disabled,
          readOnly: input.readOnly,
          rect: rect,
          computedStyle: window.getComputedStyle(input),
          pointerEvents: window.getComputedStyle(input).pointerEvents
        });
        
        if (isVisible && isEnabled) {
          return input;
        }
      }
      
      return null;
    };
    
    // Try multiple times with increasing delays
    const trySetup = (attempt = 0) => {
      if (attempt >= 5) {
        console.error('Failed to find input element after 5 attempts');
        return;
      }
      
      const input = findInputElement(attempt);
      
      if (input && isLoaded) {
        console.log('Initializing autocomplete on input:', input);
        initializeAutocomplete(input);
      } else {
        console.log(`Retrying in ${200 * (attempt + 1)}ms...`);
        setTimeout(() => trySetup(attempt + 1), 200 * (attempt + 1));
      }
    };
    
    trySetup();
  };

  // Manual verification function to check if current input matches a verified address
  const verifyCurrentAddress = () => {
    const inputElement = inputRef.current || document.querySelector('input[id*="location"]') as HTMLInputElement;
    if (inputElement && address) {
      const currentValue = inputElement.value.trim();
      const verifiedAddress = address.formatted_address;
      
      console.log('Manual verification check:', {
        currentValue,
        verifiedAddress,
        matches: currentValue === verifiedAddress
      });
      
      if (currentValue === verifiedAddress) {
        setIsAddressVerified(true);
        return true;
      } else {
        setIsAddressVerified(false);
        return false;
      }
    }
    return false;
  };

  // Clear current address
  const clearAddress = () => {
    setAddress(null);
    setIsAddressVerified(false);
    setShowCheckmark(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Load Google Maps on mount
  useEffect(() => {
    loadGoogleMapsScript();
    
    // Cleanup function
    return () => {
      // Clear autocomplete instance
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
      
      // Remove event listeners from input
      if (inputRef.current) {
        const listeners = (inputRef.current as any)._googlePlacesListeners;
        if (listeners) {
          inputRef.current.removeEventListener('keydown', listeners.keydownHandler);
          inputRef.current.removeEventListener('input', listeners.inputHandler);
        }
      }
    };
  }, []);

  return {
    isLoaded,
    address,
    isAddressVerified,
    showCheckmark,
    inputRef,
    setupAutocomplete,
    clearAddress,
    initializeAutocomplete,
    verifyCurrentAddress
  };
};
