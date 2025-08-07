import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import '../index.css';

export { PageShell };

function PageShell({ children, pageContext }: { children: React.ReactNode; pageContext: any }) {
  return (
    <HelmetProvider>
      <AuthProvider>
        <div className="min-h-screen bg-royal-dark overflow-x-hidden">
          {children}
        </div>
      </AuthProvider>
    </HelmetProvider>
  );
}