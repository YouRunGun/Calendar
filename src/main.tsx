import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Подавление доброкачественных ошибок ResizeObserver и Script error. в iFrame-окружении
if (typeof window !== 'undefined') {
  const ignoreErrors = [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Script error.'
  ];

  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msgStr = String(message || '');
    if (ignoreErrors.some(msg => msgStr.includes(msg))) {
      return true; // подавить ошибку
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };
  
  window.addEventListener('error', (e) => {
    if (e && e.message && ignoreErrors.some(msg => e.message.includes(msg))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    if (e && e.reason && e.reason.message && ignoreErrors.some(msg => e.reason.message.includes(msg))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

