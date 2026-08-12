import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowLeft, KeyRound, UserPlus, LogIn } from 'lucide-react';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuButton } from '../components/ui/NeuButton';
import { useToast } from '../components/ui/Toast';
import api from '../api/axios';

export function UserAuthView({ onLoginSuccess }) {
  // View states: 'login' | 'register' | 'forgot-email' | 'forgot-reset'
  const [viewState, setViewState] = useState('login');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // Clear errors & inputs on switch
  const switchState = (newState) => {
    setViewState(newState);
  };

  // 1. LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.removeItem('adminUser');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      addToast('Login successful! Welcome back.', 'success');
      onLoginSuccess(res.data.user);
    } catch (err) {
      addToast(err.response?.data?.error || 'Login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return addToast('Passwords do not match.', 'error');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, phone, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      addToast('Account created successfully!', 'success');
      onLoginSuccess(res.data.user);
    } catch (err) {
      addToast(err.response?.data?.error || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. FORGOT PASSWORD - STEP 1 (Verify Email)
  const handleForgotEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: resetEmail });
      addToast(res.data.message, 'info');
      setViewState('forgot-reset');
    } catch (err) {
      addToast(err.response?.data?.error || 'Account not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. FORGOT PASSWORD - STEP 2 (Reset Password)
  const handleForgotReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return addToast('Passwords do not match.', 'error');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email: resetEmail, newPassword: password });
      addToast('Password reset successfully! Please log in.', 'success');
      // Reset state & return to login
      setPassword('');
      setConfirmPassword('');
      setEmail(resetEmail);
      setViewState('login');
    } catch (err) {
      addToast(err.response?.data?.error || 'Password reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neu-bg">
      <div className="w-full max-w-md">
        <div className="p-8 rounded-neu-lg neu-raised text-neu-text relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* --- LOGIN STATE --- */}
            {viewState === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">User Login</h2>
                  <p className="text-xs text-neu-muted">Access your complaint management portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <NeuInput
                    label="Email Address"
                    type="email"
                    required
                    icon={Mail}
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <NeuInput
                    label="Password"
                    type="password"
                    required
                    icon={Lock}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchState('forgot-email')}
                      className="text-xs text-neu-primary hover:underline font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <NeuButton
                    type="submit"
                    variant="primary"
                    className="w-full mt-2"
                    disabled={loading}
                    icon={LogIn}
                  >
                    {loading ? 'Logging in...' : 'Sign In'}
                  </NeuButton>
                </form>

                <div className="pt-4 text-center border-t border-neu-muted/20 space-y-2">
                  <p className="text-xs text-neu-muted">
                    Don't have an account?{' '}
                    <button
                      onClick={() => switchState('register')}
                      className="text-neu-primary font-semibold hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                  <p className="text-xs text-neu-muted">
                    Are you an administrator?{' '}
                    <Link
                      to="/admin"
                      className="text-neu-primary font-semibold hover:underline"
                    >
                      Admin login
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {/* --- REGISTER STATE --- */}
            {viewState === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
                  <p className="text-xs text-neu-muted">Register to submit and track complaints</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <NeuInput
                    label="Full Name"
                    required
                    icon={User}
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <NeuInput
                    label="Email Address"
                    type="email"
                    required
                    icon={Mail}
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <NeuInput
                    label="Phone Number"
                    icon={Phone}
                    placeholder="+1 234 567 890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <NeuInput
                    label="Password"
                    type="password"
                    required
                    icon={Lock}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <NeuInput
                    label="Confirm Password"
                    type="password"
                    required
                    icon={Lock}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <NeuButton
                    type="submit"
                    variant="primary"
                    className="w-full mt-2"
                    disabled={loading}
                    icon={UserPlus}
                  >
                    {loading ? 'Creating Account...' : 'Register'}
                  </NeuButton>
                </form>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => switchState('login')}
                    className="text-xs text-neu-muted hover:text-neu-text inline-flex items-center gap-1 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- FORGOT PASSWORD STEP 1: EMAIL --- */}
            {viewState === 'forgot-email' && (
              <motion.div
                key="forgot-email"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">Forgot Password</h2>
                  <p className="text-xs text-neu-muted">Enter your account email to verify identity</p>
                </div>

                <form onSubmit={handleForgotEmail} className="space-y-4">
                  <NeuInput
                    label="Account Email"
                    type="email"
                    required
                    icon={Mail}
                    placeholder="registered@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />

                  <NeuButton
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                    icon={KeyRound}
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </NeuButton>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => switchState('login')}
                    className="text-xs text-neu-muted hover:text-neu-text inline-flex items-center gap-1 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- FORGOT PASSWORD STEP 2: RESET --- */}
            {viewState === 'forgot-reset' && (
              <motion.div
                key="forgot-reset"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">Set New Password</h2>
                  <p className="text-xs text-neu-muted">Reset password for {resetEmail}</p>
                </div>

                <form onSubmit={handleForgotReset} className="space-y-4">
                  <NeuInput
                    label="New Password"
                    type="password"
                    required
                    icon={Lock}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <NeuInput
                    label="Confirm New Password"
                    type="password"
                    required
                    icon={Lock}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <NeuButton
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </NeuButton>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
