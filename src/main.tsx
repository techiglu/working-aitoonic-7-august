import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
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
    </BrowserRouter>
  </React.StrictMode>
);