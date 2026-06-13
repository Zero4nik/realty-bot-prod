import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  // requestFullscreen is Bot API 8.0+ and throws on older/unsupported clients.
  try {
    tg.requestFullscreen();
  } catch {
    // not supported on this client
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
