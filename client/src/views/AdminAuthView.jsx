import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, LogIn } from 'lucide-react';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuButton } from '../components/ui/NeuButton';
import { useToast } from '../components/ui/Toast';
import api from '../api/axios';

export function AdminAuthView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { email, password });
      localStorage.removeItem('user');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.user));
      addToast('Admin authentication successful.', 'success');
      onLoginSuccess(res.data.user);
    } catch (err) {
      addToast(err.response?.data?.error || 'Invalid admin credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neu-bg">
      <div className="w-full max-w-md">
        <div className="p-8 rounded-neu-lg neu-raised text-neu-text space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-neu neu-inset text-neu-primary mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">System Admin Portal</h2>
            <p className="text-xs text-neu-muted">Administrative control panel sign in</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <NeuInput
              label="Admin Email"
              type="email"
              required
              icon={Mail}
              placeholder="admin@cms.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <NeuInput
              label="Admin Password"
              type="password"
              required
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* EXPLICIT RULE ENFORCED: NO "Forgot Password?" link present on Admin Login screen */}

            <NeuButton
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={loading}
              icon={LogIn}
            >
              {loading ? 'Authenticating...' : 'Admin Sign In'}
            </NeuButton>
          </form>

          <div className="pt-4 text-center border-t border-neu-muted/20">
            <p className="text-xs text-neu-muted">
              Not an admin?{' '}
              <Link
                to="/user"
                className="text-neu-primary font-semibold hover:underline"
              >
                User login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
