import { useState, useEffect } from 'react';

export function usePlaidScript() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if the script is already loaded
    if (window.Plaid) {
      setIsLoaded(true);
      return;
    }

    // Create a script element
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = (e) => {
      setError(new Error('Failed to load Plaid script'));
      console.error('Failed to load Plaid script:', e);
    };

    // Append the script to the document
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return { isLoaded, error };
} 