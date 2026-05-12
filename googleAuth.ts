// Google OAuth configuration and utilities
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface GoogleAuthResponse {
  user: GoogleUser;
  token: string;
}

// Google OAuth configuration
export const GOOGLE_CONFIG = {
  // You'll need to get these from Google Cloud Console
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin,
  scope: 'email profile',
};

// Load Google API script
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    
    document.head.appendChild(script);
  });
};

// Initialize Google Sign-In
export const initializeGoogleSignIn = async () => {
  try {
    await loadGoogleScript();
    
    if (!window.google?.accounts) {
      throw new Error('Google API not loaded');
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CONFIG.clientId,
      callback: handleGoogleSignIn,
      auto_select: false,
      cancel_on_tap_outside: false,
    });
  } catch (error) {
    console.error('Failed to initialize Google Sign-In:', error);
    throw error;
  }
};

// Handle Google Sign-In response
const handleGoogleSignIn = (response: any) => {
  try {
    // Decode JWT token
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    const googleUser: GoogleUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture,
      locale: payload.locale,
    };

    // Store user data and token
    localStorage.setItem('googleUser', JSON.stringify(googleUser));
    localStorage.setItem('googleToken', response.credential);
    
    // Trigger custom event for components to listen
    window.dispatchEvent(new CustomEvent('googleSignInSuccess', { detail: googleUser }));
    
    return { user: googleUser, token: response.credential };
  } catch (error) {
    console.error('Error handling Google Sign-In:', error);
    throw error;
  }
};

// Sign in with Google popup
export const signInWithGoogle = async (): Promise<GoogleAuthResponse> => {
  try {
    await initializeGoogleSignIn();
    
    return new Promise((resolve, reject) => {
      const handleSuccess = (event: CustomEvent) => {
        window.removeEventListener('googleSignInSuccess', handleSuccess as EventListener);
        resolve({ user: event.detail, token: localStorage.getItem('googleToken')! });
      };
      
      const handleError = (error: ErrorEvent) => {
        window.removeEventListener('googleSignInError', handleError as EventListener);
        reject(error.error);
      };
      
      window.addEventListener('googleSignInSuccess', handleSuccess as EventListener);
      window.addEventListener('googleSignInError', handleError as EventListener);
      
      // Show Google Sign-In popup
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          window.removeEventListener('googleSignInSuccess', handleSuccess as EventListener);
          window.removeEventListener('googleSignInError', handleError as EventListener);
          reject(new Error('Google Sign-In was not displayed'));
        }
      });
    });
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out from Google
export const signOutFromGoogle = () => {
  try {
    // Clear Google-related data
    localStorage.removeItem('googleUser');
    localStorage.removeItem('googleToken');
    
    // Revoke Google token if needed
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('googleSignOutSuccess'));
  } catch (error) {
    console.error('Error signing out from Google:', error);
  }
};

// Get current Google user
export const getCurrentGoogleUser = (): GoogleUser | null => {
  try {
    const userStr = localStorage.getItem('googleUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current Google user:', error);
    return null;
  }
};

// Check if user is signed in with Google
export const isGoogleSignedIn = (): boolean => {
  return !!localStorage.getItem('googleToken') && !!getCurrentGoogleUser();
};

// Extend Window interface for Google API
declare global {
  interface Window {
    google: any;
  }
}
