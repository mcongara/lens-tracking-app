import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './lib/i18n'; // This needs to be imported before App
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback="Loading...">
      <App />
    </Suspense>
  </React.StrictMode>
);