import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

window.addEventListener('vite:preloadError', (event) => {
  const key = `stylematch-chunk-reload:${location.href}`;
  const previous = Number(sessionStorage.getItem(key) || 0);
  if (Date.now() - previous < 60000) return;
  event.preventDefault();
  sessionStorage.setItem(key, String(Date.now()));
  location.reload();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
