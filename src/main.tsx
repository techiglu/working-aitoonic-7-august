import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ScrollToTop } from './components/ScrollToTop';
import './index.css';

// Only render if we're in the browser and not using SSR
if (typeof window !== 'undefined') {
  ReactDOM.createRoot(document.getElementById('root')!).render(
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
                }
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
}