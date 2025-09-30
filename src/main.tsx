import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Global smooth transition and same-page scroll-to-top for all internal links
(() => {
  const handler = (ev: Event) => {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    const anchor = target.closest('a') as HTMLAnchorElement | null;
    if (!anchor) return;

    // Ignore if has target _blank or download or external
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('http') && !href.startsWith(window.location.origin)) return;
    if (href.startsWith('#')) return;

    // Normalize paths
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const url = new URL(href, window.location.origin);
    const targetPath = url.pathname.replace(/\/$/, '');

    // Intercept
    ev.preventDefault();

    // Smooth scroll to top
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); }

    // If navigating to another page, show overlay and delay navigate
    if (currentPath !== targetPath) {
      const overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      document.body.appendChild(overlay);
      window.setTimeout(() => { window.location.assign(url.href); }, 500);
    }
  };

  // Ensure only one listener
  document.removeEventListener('click', handler as any, true);
  document.addEventListener('click', handler, true);
})();