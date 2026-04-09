import { useState, useEffect } from 'react';

const FLAG_KEY = 'uber_delivery_enabled';

/**
 * Returns true when the hidden Uber same-day delivery feature flag is active.
 * Enable by visiting any page with ?devmode=uber123 in the URL.
 * Disable by visiting with ?devmode=off.
 */
export function useUberDeliveryFlag(): boolean {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(FLAG_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = () => {
      try {
        setEnabled(localStorage.getItem(FLAG_KEY) === 'true');
      } catch {
        setEnabled(false);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return enabled;
}
