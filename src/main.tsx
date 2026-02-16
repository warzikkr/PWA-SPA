import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './index.css';

// Register service worker (cache-only, no auto-reload)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'sw.js')
      .then((reg) => {
        // Check for updates periodically (every 60 minutes)
        setInterval(() => reg.update(), 60 * 60 * 1000);
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
