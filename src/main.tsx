import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './index.css';

// Register service worker with update detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'sw.js')
      .then((reg) => {
        // Check for updates periodically (every 60 minutes)
        setInterval(() => reg.update(), 60 * 60 * 1000);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              // Reload once to pick up new SW; guard prevents loop
              if (!sessionStorage.getItem('__sw_reloaded')) {
                sessionStorage.setItem('__sw_reloaded', '1');
                window.location.reload();
              }
            }
          });
        });

        // Clear the reload guard on each fresh page load so future SW updates
        // can still trigger a one-time reload.
        sessionStorage.removeItem('__sw_reloaded');
      })
      .catch((err) => {
        console.warn('SW registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
