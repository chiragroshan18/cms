import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  User,
  LogOut,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Paperclip,
  Send,
  Lock,
  Edit2
} from 'lucide-react';
import { NeuButton } from '../components/ui/NeuButton';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuCard } from '../components/ui/NeuCard';
import { NeuModal } from '../components/ui/NeuModal';
import { StatCounter, StatusBadge, SkeletonLoader } from '../components/ui/NeuUtils';
import { StatusTimeline } from '../components/ui/StatusTimeline';
import { useToast } from '../components/ui/Toast';
import api from '../api/axios';

export function UserDashboardView({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'submit' | 'complaints' | 'profile'
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const { addToast } = useToast();

  // Filters & Search for "My Complaints"
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Submit Complaint form state
  const [submitForm, setSubmitForm] = useState({
    title: '',
    category_id: '',
    description: '',
    priority: 'MEDIUM',
    location: '',
    attachment_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
  });
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingPass, setUpdatingPass] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, catRes] = await Promise.all([
        api.get('/complaints/my'),
        api.get('/categories'),
      ]);
      setComplaints(compRes.data.complaints || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      addToast('Failed to load user data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaintDetails = async (id) => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setSelectedComplaint(res.data.complaint);
    } catch (err) {
      addToast('Error fetching complaint details.', 'error');
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!submitForm.category_id) {
      return addToast('Please select a category.', 'error');
    }
    setSubmitting(true);
    try {
      const res = await api.post('/complaints', submitForm);
      addToast('Complaint submitted successfully!', 'success');
      setSubmittedId(res.data.complaint.complaint_number);
      setSubmitForm({
        title: '',
        category_id: '',
        description: '',
        priority: 'MEDIUM',
        location: '',
        attachment_url: '',
      });
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit complaint.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseComplaint = async (id) => {
    try {
      const res = await api.put(`/complaints/${id}/close`);
      addToast('Complaint closed successfully.', 'success');
      setSelectedComplaint(res.data.complaint);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to close complaint.', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return addToast('New passwords do not match.', 'error');
    }
    setUpdatingPass(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      addToast(res.data.message, 'success');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update password.', 'error');
    } finally {
      setUpdatingPass(false);
    }
  };

  // Compute Dashboard Metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  // Filtered complaints list
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.complaint_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesPriority = !priorityFilter || c.priority === priorityFilter;
    const matchesCategory = !categoryFilter || c.category_id === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neu-bg text-neu-text flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neu-bg neu-raised p-4 md:p-6 flex flex-col justify-between shrink-0 z-10">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-neu neu-inset flex items-center justify-center text-neu-primary font-bold text-lg shrink-0">
              C
            </div>
            <div className="truncate">
              <h2 className="font-bold text-base tracking-tight leading-none truncate">CMS User</h2>
              <span className="text-[10px] font-semibold text-neu-muted uppercase tracking-wider block">Portal</span>
            </div>
          </div>

          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'submit', label: 'Submit Complaint', icon: PlusCircle },
              { id: 'complaints', label: 'My Complaints', icon: FileText },
              { id: 'profile', label: 'Profile Settings', icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedComplaint(null);
                    setSubmittedId(null);
                  }}
                  className={`flex-1 md:w-full flex items-center gap-2.5 px-3 md:px-4 py-2.5 md:py-3 rounded-neu text-xs md:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'neu-inset text-neu-primary font-bold'
                      : 'hover:neu-raised-sm text-neu-muted hover:text-neu-text'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-neu-muted/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-neu text-xs font-semibold text-neu-danger hover:neu-inset-sm transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* --- DASHBOARD TAB --- */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
                <p className="text-xs text-neu-muted mt-1">Here is an overview of your submitted complaints.</p>
              </div>

              {/* Animated Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <NeuCard className="space-y-2">
                  <span className="text-xs text-neu-muted font-semibold uppercase">Total Complaints</span>
                  <div className="text-3xl text-neu-primary">
                    <StatCounter value={totalCount} />
                  </div>
                </NeuCard>
                <NeuCard className="space-y-2">
                  <span className="text-xs text-amber-700 font-semibold uppercase">Pending</span>
                  <div className="text-3xl text-amber-600">
                    <StatCounter value={pendingCount} />
                  </div>
                </NeuCard>
                <NeuCard className="space-y-2">
                  <span className="text-xs text-cyan-700 font-semibold uppercase">In Progress</span>
                  <div className="text-3xl text-cyan-600">
                    <StatCounter value={inProgressCount} />
                  </div>
                </NeuCard>
                <NeuCard className="space-y-2">
                  <span className="text-xs text-emerald-700 font-semibold uppercase">Resolved</span>
                  <div className="text-3xl text-emerald-600">
                    <StatCounter value={resolvedCount} />
                  </div>
                </NeuCard>
              </div>

              {/* Recent Complaints */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Recent Complaints</h3>
                  <button
                    onClick={() => setActiveTab('complaints')}
                    className="text-xs text-neu-primary font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <SkeletonLoader className="h-16 w-full" />
                    <SkeletonLoader className="h-16 w-full" />
                  </div>
                ) : complaints.length === 0 ? (
                  <NeuCard className="text-center py-8">
                    <p className="text-xs text-neu-muted">You haven't submitted any complaints yet.</p>
                    <NeuButton
                      onClick={() => setActiveTab('submit')}
                      variant="primary"
                      size="sm"
                      className="mt-4"
                      icon={PlusCircle}
                    >
                      Submit Your First Complaint
                    </NeuButton>
                  </NeuCard>
                ) : (
                  <div className="space-y-3">
                    {complaints.slice(0, 5).map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <NeuCard
                          hoverable
                          onClick={() => {
                            fetchComplaintDetails(c.id);
                            setActiveTab('complaints');
                          }}
                          className="flex items-center justify-between py-4 px-5"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono font-bold text-neu-primary">{c.complaint_number}</span>
                              <StatusBadge status={c.status} />
                              <StatusBadge priority={c.priority} />
                            </div>
                            <h4 className="font-semibold text-sm">{c.title}</h4>
                          </div>
                          <span className="text-xs text-neu-muted">
                            {new Date(c.submitted_at).toLocaleDateString()}
                          </span>
                        </NeuCard>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* --- SUBMIT COMPLAINT TAB --- */}
          {activeTab === 'submit' && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold">Submit a Complaint</h1>
                <p className="text-xs text-neu-muted mt-1">Fill in details below to register a new complaint.</p>
              </div>

              {submittedId ? (
                <NeuCard className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-neu-success/20 text-neu-success mx-auto flex items-center justify-center neu-raised">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">Complaint Submitted!</h3>
                  <p className="text-xs text-neu-muted">Your complaint reference ID is:</p>
                  <div className="text-xl font-mono font-bold text-neu-primary neu-inset inline-block px-6 py-2 rounded-neu">
                    {submittedId}
                  </div>
                  <div className="pt-4 flex justify-center gap-3">
                    <NeuButton
                      onClick={() => setSubmittedId(null)}
                      variant="default"
                      size="sm"
                    >
                      Submit Another
                    </NeuButton>
                    <NeuButton
                      onClick={() => {
                        setSubmittedId(null);
                        setActiveTab('complaints');
                      }}
                      variant="primary"
                      size="sm"
                    >
                      Track Complaints
                    </NeuButton>
                  </div>
                </NeuCard>
              ) : (
                <NeuCard>
                  <form onSubmit={handleSubmitComplaint} className="space-y-4">
                    <NeuInput
                      label="Title / Summary"
                      required
                      placeholder="Brief title describing the complaint"
                      value={submitForm.title}
                      onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neu-muted uppercase">
                          Category <span className="text-neu-danger">*</span>
                        </label>
                        <select
                          required
                          value={submitForm.category_id}
                          onChange={(e) => setSubmitForm({ ...submitForm, category_id: e.target.value })}
                          className="w-full bg-neu-bg text-neu-text neu-inset rounded-neu px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neu-primary/50"
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neu-muted uppercase">Priority</label>
                        <select
                          value={submitForm.priority}
                          onChange={(e) => setSubmitForm({ ...submitForm, priority: e.target.value })}
                          className="w-full bg-neu-bg text-neu-text neu-inset rounded-neu px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neu-primary/50"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium (Default)</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>
                    </div>

                    <NeuInput
                      label="Location / Department"
                      placeholder="Physical location or reference details"
                      value={submitForm.location}
                      onChange={(e) => setSubmitForm({ ...submitForm, location: e.target.value })}
                    />

                    <NeuInput
                      label="Detailed Description"
                      type="textarea"
                      required
                      rows={5}
                      placeholder="Provide full description of the issue..."
                      value={submitForm.description}
                      onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                    />

                    <NeuInput
                      label="Optional Attachment URL"
                      icon={Paperclip}
                      placeholder="https://example.com/attachment.png"
                      value={submitForm.attachment_url}
                      onChange={(e) => setSubmitForm({ ...submitForm, attachment_url: e.target.value })}
                    />

                    <NeuButton
                      type="submit"
                      variant="primary"
                      className="w-full mt-4"
                      disabled={submitting}
                      icon={Send}
                    >
                      {submitting ? 'Submitting...' : 'Submit Complaint'}
                    </NeuButton>
                  </form>
                </NeuCard>
              )}
            </motion.div>
          )}

          {/* --- MY COMPLAINTS TAB & DETAILS --- */}
          {activeTab === 'complaints' && (
            <motion.div
              key="complaints"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {selectedComplaint ? (
                /* --- COMPLAINT DETAILS VIEW --- */
                <div className="space-y-6">
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="text-xs text-neu-muted hover:text-neu-text inline-flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to My Complaints
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <NeuCard className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neu-muted/20">
                          <span className="text-sm font-mono font-bold text-neu-primary">
                            {selectedComplaint.complaint_number}
                          </span>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={selectedComplaint.status} />
                            <StatusBadge priority={selectedComplaint.priority} />
                          </div>
                        </div>

                        <h2 className="text-xl font-bold">{selectedComplaint.title}</h2>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-neu-muted font-semibold block uppercase">Category</span>
                            <span className="font-medium">{selectedComplaint.category?.name}</span>
                          </div>
                          <div>
                            <span className="text-neu-muted font-semibold block uppercase">Submitted Date</span>
                            <span className="font-medium">
                              {new Date(selectedComplaint.submitted_at).toLocaleString()}
                            </span>
                          </div>
                          {selectedComplaint.location && (
                            <div className="col-span-2">
                              <span className="text-neu-muted font-semibold block uppercase">Location</span>
                              <span className="font-medium">{selectedComplaint.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          <span className="text-xs text-neu-muted font-semibold block uppercase mb-1">
                            Description
                          </span>
                          <div className="neu-inset p-4 rounded-neu text-xs whitespace-pre-wrap leading-relaxed">
                            {selectedComplaint.description}
                          </div>
                        </div>

                        {selectedComplaint.attachment_url && (
                          <div className="pt-2">
                            <span className="text-xs text-neu-muted font-semibold block uppercase mb-1">
                              Attachment
                            </span>
                            <a
                              href={selectedComplaint.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-neu-primary underline hover:text-neu-accent font-medium flex items-center gap-1"
                            >
                              <Paperclip className="w-3.5 h-3.5" /> View Attachment
                            </a>
                          </div>
                        )}

                        {/* Admin Resolution & Close Action */}
                        {selectedComplaint.resolution_description && (
                          <div className="p-4 rounded-neu bg-emerald-50 border border-emerald-200 space-y-2">
                            <h4 className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600" /> Official Resolution
                            </h4>
                            <p className="text-xs text-emerald-900 leading-relaxed">
                              {selectedComplaint.resolution_description}
                            </p>
                          </div>
                        )}

                        {selectedComplaint.status === 'RESOLVED' && (
                          <div className="pt-3">
                            <NeuButton
                              onClick={() => handleCloseComplaint(selectedComplaint.id)}
                              variant="success"
                              className="w-full"
                              icon={CheckCircle}
                            >
                              Confirm & Close Complaint
                            </NeuButton>
                          </div>
                        )}
                      </NeuCard>
                    </div>

                    <div className="lg:col-span-1">
                      <NeuCard>
                        <StatusTimeline
                          currentStatus={selectedComplaint.status}
                          history={selectedComplaint.status_history || []}
                        />
                      </NeuCard>
                    </div>
                  </div>
                </div>
              ) : (
                /* --- COMPLAINTS LIST WITH FILTERS & SEARCH --- */
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">My Complaints</h1>
                    <p className="text-xs text-neu-muted mt-1">Search, filter, and track status of all your complaints.</p>
                  </div>

                  {/* Filter Toolbar */}
                  <NeuCard className="p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <NeuInput
                        placeholder="Search title, ID..."
                        icon={Search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-neu-bg text-neu-text neu-inset rounded-neu px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>

                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full bg-neu-bg text-neu-text neu-inset rounded-neu px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>

                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full bg-neu-bg text-neu-text neu-inset rounded-neu px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </NeuCard>

                  {/* List View */}
                  {loading ? (
                    <div className="space-y-3">
                      <SkeletonLoader className="h-16 w-full" />
                      <SkeletonLoader className="h-16 w-full" />
                    </div>
                  ) : filteredComplaints.length === 0 ? (
                    <NeuCard className="text-center py-10">
                      <p className="text-xs text-neu-muted">No complaints found matching your criteria.</p>
                    </NeuCard>
                  ) : (
                    <div className="space-y-3">
                      {filteredComplaints.map((c, i) => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <NeuCard
                            hoverable
                            onClick={() => fetchComplaintDetails(c.id)}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5"
                          >
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-mono font-bold text-neu-primary">
                                  {c.complaint_number}
                                </span>
                                <StatusBadge status={c.status} />
                                <StatusBadge priority={c.priority} />
                                <span className="text-[10px] text-neu-muted bg-neu-muted/10 px-2 py-0.5 rounded-full font-semibold">
                                  {c.category?.name}
                                </span>
                              </div>
                              <h3 className="font-semibold text-sm">{c.title}</h3>
                            </div>

                            <span className="text-xs text-neu-muted shrink-0">
                              {new Date(c.submitted_at).toLocaleDateString()}
                            </span>
                          </NeuCard>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* --- PROFILE SETTINGS TAB --- */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold">Profile & Password Settings</h1>
                <p className="text-xs text-neu-muted mt-1">Manage your account information and password.</p>
              </div>

              {/* Profile Details */}
              <NeuCard className="space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <User className="w-4 h-4 text-neu-primary" /> Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NeuInput label="Full Name" value={profileForm.name} disabled />
                  <NeuInput label="Email Address" value={user.email} disabled />
                </div>
              </NeuCard>

              {/* Change Password Form (Logged-in path b) */}
              <NeuCard className="space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-neu-primary" /> Change Password
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <NeuInput
                    label="Current Password"
                    type="password"
                    required
                    icon={Lock}
                    value={passForm.currentPassword}
                    onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  />
                  <NeuInput
                    label="New Password"
                    type="password"
                    required
                    icon={Lock}
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  />
                  <NeuInput
                    label="Confirm New Password"
                    type="password"
                    required
                    icon={Lock}
                    value={passForm.confirmPassword}
                    onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  />

                  <NeuButton
                    type="submit"
                    variant="primary"
                    disabled={updatingPass}
                    className="w-full mt-2"
                  >
                    {updatingPass ? 'Updating Password...' : 'Update Password'}
                  </NeuButton>
                </form>
              </NeuCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
