import React, { useState, useEffect } from 'react';
import { ToastProvider } from '../components/ui/Toast';
import { UserAuthView } from '../views/UserAuthView';
import { UserDashboardView } from '../views/UserDashboardView';

export default function UserPage() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'USER') {
          return parsed;
        }
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return null;
  });

  useEffect(() => {
    document.title = 'CMS - User Portal';

    const handleSessionExpired = () => {
      setUser(null);
    };
    window.addEventListener('cms:session-expired', handleSessionExpired);
    return () => window.removeEventListener('cms:session-expired', handleSessionExpired);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <ToastProvider>
      {!user ? (
        <UserAuthView onLoginSuccess={(u) => setUser(u)} />
      ) : (
        <UserDashboardView user={user} onLogout={handleLogout} />
      )}
    </ToastProvider>
  );
}
