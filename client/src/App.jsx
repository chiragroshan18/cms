import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import { LandingView } from './views/LandingView';

function RootLanding() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const adminStr = localStorage.getItem('adminUser');

  // If already authenticated, skip chooser and navigate straight to dashboard
  if (token && userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u.role === 'USER') return <Navigate to="/user" replace />;
    } catch (e) {}
  }

  if (token && adminStr) {
    try {
      const a = JSON.parse(adminStr);
      if (a.role === 'ADMIN') return <Navigate to="/admin" replace />;
    } catch (e) {}
  }

  return (
    <LandingView
      onSelectUser={() => navigate('/user')}
      onSelectAdmin={() => navigate('/admin')}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLanding />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
