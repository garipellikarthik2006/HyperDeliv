import React, { useState, useEffect } from 'react';
import { Chrome } from 'lucide-react';
import { signInWithGoogle, GoogleUser } from '@/lib/googleAuth';

interface GoogleSignInButtonProps {
  onSuccess: (user: GoogleUser) => void;
  onError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
  text?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  className = '',
  disabled = false,
  text = 'Continue with Google'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if Google script is already loaded
    const checkScriptLoaded = () => {
      if (window.google?.accounts) {
        setIsScriptLoaded(true);
      } else {
        // Try again after a delay
        setTimeout(checkScriptLoaded, 100);
      }
    };
    
    checkScriptLoaded();
  }, []);

  const handleGoogleSignIn = async () => {
    if (isLoading || disabled || !isScriptLoaded) return;

    setIsLoading(true);
    
    try {
      const response = await signInWithGoogle();
      onSuccess(response.user);
    } catch (error) {
      console.error('Google Sign-In error:', error);
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading || !isScriptLoaded}
      className={`
        flex items-center justify-center gap-3 w-full px-4 py-3
        border border-gray-300 rounded-lg
        bg-white text-gray-700
        hover:bg-gray-50 hover:border-gray-400
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-sm hover:shadow-md
        ${className}
      `}
    >
      <Chrome className="w-5 h-5" />
      <span className="font-medium">
        {isLoading ? 'Signing in...' : text}
      </span>
    </button>
  );
};

export default GoogleSignInButton;
