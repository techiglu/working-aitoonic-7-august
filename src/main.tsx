import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ScrollToTop } from './components/ScrollToTop';
import { preloadCriticalResources } from './utils/preloadCriticalImages';
import './index.css';

// Preload critical resources immediately
preloadCriticalResources();

// Only render if we're in the browser and not using SSR
if (typeof window !== 'undefined') {
  // Use concurrent features for better performance
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <App />
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#0F1428',
                  color: '#fff',
                  border: '1px solid #1A2138'
                },
                duration: 3000,
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
}