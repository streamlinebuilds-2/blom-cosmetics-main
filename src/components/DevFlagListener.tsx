import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FLAG_KEY = 'uber_delivery_enabled';

/**
 * Listens for ?devmode=uber123 or ?devmode=off in the URL and sets/clears
 * the Uber delivery feature flag in localStorage.
 *
 * Mount this once inside <BrowserRouter> so it runs on every page.
 * Normal customers are unaffected — the param is never shown in the UI.
 */
export function DevFlagListener() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const devMode = params.get('devmode');

    if (devMode === 'uber123') {
      try {
        const alreadySet = localStorage.getItem(FLAG_KEY) === 'true';
        localStorage.setItem(FLAG_KEY, 'true');
        console.log('[DevFlag] Uber same-day delivery ENABLED');
        // Reload without the query param so React re-reads localStorage on mount
        if (!alreadySet) {
          window.location.replace(window.location.pathname);
        }
      } catch { /* ignore */ }
    } else if (devMode === 'off') {
      try {
        localStorage.removeItem(FLAG_KEY);
        console.log('[DevFlag] Uber same-day delivery DISABLED');
        window.location.replace(window.location.pathname);
      } catch { /* ignore */ }
    }
  }, [location.search]);

  return null;
}
