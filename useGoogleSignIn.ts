import { useCallback, useEffect } from "react";

// Google Sign-In hook using Google Identity Services (GSI)
// Replace VITE_GOOGLE_CLIENT_ID in your .env file with your actual client ID
// Get one at: https://console.cloud.google.com/apis/credentials

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  role?: string;
}

function parseJwt(token: string): GoogleUser {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  const decoded = JSON.parse(jsonPayload);
  return {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    picture: decoded.picture,
  };
}

export function useGoogleSignIn(
  onSuccess: (user: GoogleUser) => void,
  onError?: (error: string) => void
) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    // Load the GSI script if not already loaded
    if (!document.getElementById("google-gsi-script")) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const initializeGoogleButton = useCallback(
    (buttonElement: HTMLElement) => {
      if (!clientId) {
        console.warn(
          "VITE_GOOGLE_CLIENT_ID is not set. Add it to your .env file to enable Google Sign-In."
        );
        return;
      }

      const tryInit = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: GoogleCredentialResponse) => {
              try {
                const user = parseJwt(response.credential);
                onSuccess(user);
              } catch {
                onError?.("Failed to parse Google credentials");
              }
            },
          });

          window.google.accounts.id.renderButton(buttonElement, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: buttonElement.offsetWidth || 400,
          });
        } else {
          setTimeout(tryInit, 200);
        }
      };

      tryInit();
    },
    [clientId, onSuccess, onError]
  );

  // Fallback: trigger one-tap prompt
  const signInWithGoogle = useCallback(() => {
    if (!clientId) {
      onError?.(
        "Google Sign-In is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file."
      );
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  }, [clientId, onError]);

  return { initializeGoogleButton, signInWithGoogle, isConfigured: Boolean(clientId) };
}
