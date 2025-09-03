import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';

function App() {
  return (
    <div className="min-h-screen bg-royal-dark">
      <main>
        <Routes>
          <Route path="/" element={<Admin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;