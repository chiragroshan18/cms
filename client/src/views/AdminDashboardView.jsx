import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  LayoutDashboard,
  ListFilter,
  UserCheck,
  LogOut,
  Lock,
  Tag,
  Plus,
  Trash2,
  Menu,
  X
} from 'lucide-react';
import { NeuButton } from '../components/ui/NeuButton';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuCard } from '../components/ui/NeuCard';
import { StatCounter, SkeletonLoader } from '../components/ui/NeuUtils';
import { useToast } from '../components/ui/Toast';
import api from '../api/axios';

export function AdminDashboardView({ admin, onLogout, activeTab, setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { addToast } = useToast();

  // Admin Profile Change Password state
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingPass, setUpdatingPass] = useState(false);

  // Category Manager State
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.stats);
      setRecentComplaints(res.data.recentComplaints || []);
    } catch (err) {
      addToast('Failed to load admin dashboard statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/all');
      setCategories(res.data.categories || []);
    } catch (err) {}
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await api.post('/categories', { name: newCatName, description: newCatDesc });
      addToast('Category created.', 'success');
      setNewCatName('');
      setNewCatDesc('');
      fetchCategories();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to create category.', 'error');
    }
  };

  const handleDeactivateCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      addToast('Category deactivated.', 'info');
      fetchCategories();
    } catch (err) {
      addToast('Failed to deactivate category.', 'error');
    }
  };

  const handleEnableCategory = async (id) => {
    try {
      await api.put(`/categories/${id}`, { is_active: true });
      addToast('Category enabled.', 'success');
      fetchCategories();
    } catch (err) {
      addToast('Failed to enable category.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-neu-bg text-neu-text flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neu-bg neu-raised p-4 md:p-6 flex flex-col justify-between shrink-0 z-10">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-neu neu-inset flex items-center justify-center text-neu-primary font-bold text-lg shrink-0">
                <ShieldCheck className="w-5 h-5 text-neu-primary" />
              </div>
              <div className="truncate">
                <h2 className="font-bold text-base tracking-tight leading-none truncate">Admin Panel</h2>
                <span className="text-[10px] font-semibold text-neu-muted uppercase tracking-wider block">System Control</span>
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-neu neu-raised text-neu-text hover:neu-inset transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col gap-2`}>
            {[
              { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'complaints', label: 'Manage Complaints', icon: ListFilter },
              { id: 'categories', label: 'Manage Categories', icon: Tag },
              { id: 'profile', label: 'Admin Profile', icon: UserCheck },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-neu text-sm font-medium transition-all ${
                    isActive
                      ? 'neu-inset text-neu-primary font-bold'
                      : 'hover:neu-raised-sm text-neu-muted hover:text-neu-text'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block pt-4 md:pt-6 border-t border-neu-muted/20 mt-4 md:mt-0`}>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-neu text-xs font-semibold text-neu-danger hover:neu-inset-sm transition-all"
          >
            <LogOut className="w-4 h-4" /> Admin Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin View Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* --- ADMIN DASHBOARD OVERVIEW --- */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-2xl font-bold">Admin Executive Dashboard</h1>
                <p className="text-xs text-neu-muted mt-1">Real-time aggregate complaint status metrics.</p>
              </div>

              {/* Number Count-Up Stat Counters */}
              {loading || !stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonLoader key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <NeuCard className="space-y-1">
                    <span className="text-xs text-neu-muted font-semibold uppercase">Total Complaints</span>
                    <div className="text-3xl text-neu-primary font-bold">
                      <StatCounter value={stats.total} />
                    </div>
                  </NeuCard>
                  <NeuCard className="space-y-1">
                    <span className="text-xs text-amber-700 font-semibold uppercase">Pending</span>
                    <div className="text-3xl text-amber-600 font-bold">
                      <StatCounter value={stats.pending} />
                    </div>
                  </NeuCard>
                  <NeuCard className="space-y-1">
                    <span className="text-xs text-indigo-700 font-semibold uppercase">Assigned</span>
                    <div className="text-3xl text-indigo-600 font-bold">
                      <StatCounter value={stats.assigned} />
                    </div>
                  </NeuCard>
                  <NeuCard className="space-y-1">
                    <span className="text-xs text-cyan-700 font-semibold uppercase">In Progress</span>
                    <div className="text-3xl text-cyan-600 font-bold">
                      <StatCounter value={stats.inProgress} />
                    </div>
                  </NeuCard>
                  <NeuCard className="space-y-1">
                    <span className="text-xs text-emerald-700 font-semibold uppercase">Resolved</span>
                    <div className="text-3xl text-emerald-600 font-bold">
                      <StatCounter value={stats.resolved} />
                    </div>
                  </NeuCard>
                  <NeuCard className="space-y-1">
                    <span className="text-xs text-slate-700 font-semibold uppercase">Closed</span>
                    <div className="text-3xl text-slate-600 font-bold">
                      <StatCounter value={stats.closed} />
                    </div>
                  </NeuCard>
                </div>
              )}
            </motion.div>
          )}

          {/* --- CATEGORY MANAGEMENT --- */}
          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold">Manage Complaint Categories</h1>
                <p className="text-xs text-neu-muted mt-1">Configure active and disabled complaint categories.</p>
              </div>

              <NeuCard className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neu-muted">Add New Category</h3>
                <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
                  <NeuInput
                    placeholder="Category Name"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                  <NeuInput
                    placeholder="Description (optional)"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                  />
                  <NeuButton type="submit" variant="primary" icon={Plus} className="shrink-0">
                    Add Category
                  </NeuButton>
                </form>
              </NeuCard>

              {/* Active Categories Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neu-primary flex items-center gap-2">
                  Active Categories ({categories.filter((c) => c.is_active !== false).length})
                </h3>
                {categories.filter((c) => c.is_active !== false).length === 0 ? (
                  <NeuCard className="p-4 text-center text-xs text-neu-muted">
                    No active categories found.
                  </NeuCard>
                ) : (
                  categories.filter((c) => c.is_active !== false).map((c) => (
                    <NeuCard key={c.id} className="flex items-center justify-between p-4">
                      <div>
                        <h4 className="font-bold text-sm">{c.name}</h4>
                        <p className="text-xs text-neu-muted">{c.description || 'No description'}</p>
                      </div>
                      <NeuButton
                        onClick={() => handleDeactivateCategory(c.id)}
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        className="text-neu-danger hover:text-neu-danger"
                      >
                        Deactivate
                      </NeuButton>
                    </NeuCard>
                  ))
                )}
              </div>

              {/* Disabled Categories Section */}
              <div className="space-y-3 pt-4 border-t border-neu-muted/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neu-muted flex items-center gap-2">
                  Disabled Categories ({categories.filter((c) => c.is_active === false).length})
                </h3>
                {categories.filter((c) => c.is_active === false).length === 0 ? (
                  <NeuCard className="p-4 text-center text-xs text-neu-muted">
                    No disabled categories.
                  </NeuCard>
                ) : (
                  categories.filter((c) => c.is_active === false).map((c) => (
                    <NeuCard key={c.id} className="flex items-center justify-between p-4 opacity-75 neu-inset">
                      <div>
                        <h4 className="font-bold text-sm text-neu-muted line-through">{c.name}</h4>
                        <p className="text-xs text-neu-muted">{c.description || 'No description'}</p>
                      </div>
                      <NeuButton
                        onClick={() => handleEnableCategory(c.id)}
                        variant="success"
                        size="sm"
                      >
                        Enable
                      </NeuButton>
                    </NeuCard>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* --- ADMIN PROFILE --- */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold">Admin Account Profile</h1>
                <p className="text-xs text-neu-muted mt-1">
                  View admin credentials and system authority. Admin credentials are strictly managed at seed time via system environment variables (`ADMIN_PASSWORD`).
                </p>
              </div>

              <NeuCard className="space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-neu-primary" /> Admin Account Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neu-muted font-semibold block uppercase">Role</span>
                    <span className="font-bold text-neu-primary">SYSTEM ADMIN</span>
                  </div>
                  <div>
                    <span className="text-neu-muted font-semibold block uppercase">Email</span>
                    <span className="font-medium">{admin.email}</span>
                  </div>
                </div>
              </NeuCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
