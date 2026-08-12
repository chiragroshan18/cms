import React, { useState, useEffect } from 'react';
import { ToastProvider } from '../components/ui/Toast';
import { AdminAuthView } from '../views/AdminAuthView';
import { AdminDashboardView } from '../views/AdminDashboardView';
import { AdminComplaintView } from '../views/AdminComplaintView';

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState(() => {
    const savedAdmin = localStorage.getItem('adminUser');
    const token = localStorage.getItem('token');
    if (savedAdmin && token) {
      try {
        const parsed = JSON.parse(savedAdmin);
        if (parsed.role === 'ADMIN') {
          return parsed;
        }
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
      }
    }
    return null;
  });
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'dashboard';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('adminActiveTab', tab);
  };

  useEffect(() => {
    document.title = 'CMS - Admin Portal';

    const handleSessionExpired = () => {
      setAdminUser(null);
    };
    window.addEventListener('cms:session-expired', handleSessionExpired);
    return () => window.removeEventListener('cms:session-expired', handleSessionExpired);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminActiveTab');
    localStorage.removeItem('adminSelectedComplaintId');
    setAdminUser(null);
  };

  return (
    <ToastProvider>
      {!adminUser ? (
        <AdminAuthView onLoginSuccess={(user) => setAdminUser(user)} />
      ) : activeTab === 'complaints' ? (
        <AdminComplaintView
          admin={adminUser}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
        <AdminDashboardView
          admin={adminUser}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </ToastProvider>
  );
}
