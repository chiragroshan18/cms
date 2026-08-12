import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  LayoutDashboard,
  ListFilter,
  UserCheck,
  LogOut,
  Search,
  ArrowLeft,
  UserPlus,
  Edit,
  CheckCircle,
  MessageSquare,
  Paperclip,
  Tag
} from 'lucide-react';
import { NeuButton } from '../components/ui/NeuButton';
import { NeuInput } from '../components/ui/NeuInput';
import { NeuCard } from '../components/ui/NeuCard';
import { StatusBadge, SkeletonLoader } from '../components/ui/NeuUtils';
import { StatusTimeline } from '../components/ui/StatusTimeline';
import { useToast } from '../components/ui/Toast';
import api from '../api/axios';

export function AdminComplaintView({ admin, onLogout, activeTab, setActiveTab }) {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const { addToast } = useToast();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Admin Action States
  const [assignForm, setAssignForm] = useState({ assigned_to: '', remark: '' });
  const [statusForm, setStatusForm] = useState({ status: '', remark: '', resolution_description: '' });
  const [editForm, setEditForm] = useState({ priority: 'MEDIUM', admin_remark: '', resolution_description: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchCategories();
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category_id = categoryFilter;

      const res = await api.get('/admin/complaints', { params });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      addToast('Error loading admin complaints list.', 'error');
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

  const fetchComplaintDetails = async (id) => {
    try {
      const res = await api.get(`/admin/complaints/${id}`);
      const comp = res.data.complaint;
      setSelectedComplaint(comp);
      setStatusForm({ status: comp.status, remark: '', resolution_description: comp.resolution_description || '' });
      setEditForm({
        priority: comp.priority,
        admin_remark: comp.admin_remark || '',
        resolution_description: comp.resolution_description || '',
      });
    } catch (err) {
      addToast('Error fetching complaint details.', 'error');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.assigned_to) return addToast('Please enter assignee name/department.', 'error');
    setUpdating(true);
    try {
      const res = await api.put(`/admin/complaints/${selectedComplaint.id}/assign`, assignForm);
      addToast('Complaint assigned successfully.', 'success');
      setSelectedComplaint(res.data.complaint);
      setAssignForm({ assigned_to: '', remark: '' });
      fetchComplaints();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to assign complaint.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusForm.status) return addToast('Select a new status.', 'error');
    setUpdating(true);
    try {
      const res = await api.put(`/admin/complaints/${selectedComplaint.id}/status`, statusForm);
      addToast(res.data.message, 'success');
      setSelectedComplaint(res.data.complaint);
      fetchComplaints();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put(`/admin/complaints/${selectedComplaint.id}`, editForm);
      addToast('Complaint details updated.', 'success');
      setSelectedComplaint(res.data.complaint);
      fetchComplaints();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update details.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-neu-bg text-neu-text flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neu-bg neu-raised p-4 md:p-6 flex flex-col justify-between shrink-0 z-10">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-neu neu-inset flex items-center justify-center text-neu-primary font-bold text-lg shrink-0">
              <ShieldCheck className="w-5 h-5 text-neu-primary" />
            </div>
            <div className="truncate">
              <h2 className="font-bold text-base tracking-tight leading-none truncate">CMS Admin</h2>
              <span className="text-[10px] font-semibold text-neu-primary uppercase tracking-wider block">Management</span>
            </div>
          </div>

          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {[
              { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
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
                    setSelectedComplaint(null);
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
            <LogOut className="w-4 h-4" /> Admin Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin View Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {selectedComplaint ? (
            /* --- ADMIN COMPLAINT MANAGEMENT DETAIL VIEW --- */
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-xs text-neu-muted hover:text-neu-text inline-flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back to All Complaints
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Complaint Details & Management Actions */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Overview Card */}
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

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-neu-muted font-semibold block uppercase">Submitted By</span>
                        <span className="font-medium">{selectedComplaint.user?.name} ({selectedComplaint.user?.email})</span>
                      </div>
                      <div>
                        <span className="text-neu-muted font-semibold block uppercase">Category</span>
                        <span className="font-medium">{selectedComplaint.category?.name}</span>
                      </div>
                      <div>
                        <span className="text-neu-muted font-semibold block uppercase">Assigned To</span>
                        <span className="font-bold text-neu-primary">{selectedComplaint.assigned_to || 'Unassigned'}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-xs text-neu-muted font-semibold block uppercase mb-1">Description</span>
                      <div className="neu-inset p-4 rounded-neu text-xs whitespace-pre-wrap leading-relaxed">
                        {selectedComplaint.description}
                      </div>
                    </div>

                    {selectedComplaint.attachment_url && (
                      <div className="pt-1">
                        <span className="text-xs text-neu-muted font-semibold block uppercase mb-1">Attachment</span>
                        <a
                          href={selectedComplaint.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-neu-primary underline font-medium flex items-center gap-1"
                        >
                          <Paperclip className="w-3.5 h-3.5" /> Open Attachment Link
                        </a>
                      </div>
                    )}
                  </NeuCard>

                  {/* Action 1: Assign Complaint */}
                  <NeuCard className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neu-muted flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-neu-primary" /> Assign Complaint Handler
                    </h3>
                    <form onSubmit={handleAssignSubmit} className="space-y-3">
                      <NeuInput
                        label="Assignee Name / Team"
                        placeholder="e.g. IT Support Team 2"
                        required
                        value={assignForm.assigned_to}
                        onChange={(e) => setAssignForm({ ...assignForm, assigned_to: e.target.value })}
                      />
                      <NeuInput
                        label="Assignment Remark (optional)"
                        placeholder="Notes for the assignee..."
                        value={assignForm.remark}
                        onChange={(e) => setAssignForm({ ...assignForm, remark: e.target.value })}
                      />
                      <NeuButton type="submit" variant="primary" disabled={updating} size="sm">
                        Assign Staff
                      </NeuButton>
                    </form>
                  </NeuCard>

                  {/* Action 2: Update Status & Resolution */}
                  <NeuCard className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neu-muted flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-neu-primary" /> Update Status & Resolution
                    </h3>
                    <form onSubmit={handleStatusSubmit} className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neu-muted uppercase">Status</label>
                        <select
                          value={statusForm.status}
                          onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                          className="w-full bg-neu-bg text-neu-text neu-inset rounded-neu px-4 py-2.5 text-sm focus:outline-none"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </div>

                      <NeuInput
                        label="Admin Remark / Audit Note"
                        placeholder="Status update notes..."
                        value={statusForm.remark}
                        onChange={(e) => setStatusForm({ ...statusForm, remark: e.target.value })}
                      />

                      {statusForm.status === 'RESOLVED' && (
                        <NeuInput
                          label="Resolution Description"
                          type="textarea"
                          required
                          rows={3}
                          placeholder="Provide full details of how the issue was resolved..."
                          value={statusForm.resolution_description}
                          onChange={(e) => setStatusForm({ ...statusForm, resolution_description: e.target.value })}
                        />
                      )}

                      <NeuButton type="submit" variant="primary" disabled={updating} size="sm">
                        Update Status
                      </NeuButton>
                    </form>
                  </NeuCard>

                  {/* Action 3: Edit Priority & Remarks */}
                  <NeuCard className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neu-muted flex items-center gap-2">
                      <Edit className="w-4 h-4 text-neu-primary" /> Edit Priority & Admin Notes
                    </h3>
                    <form onSubmit={handleEditSubmit} className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neu-muted uppercase">Priority Level</label>
                        <select
                          value={editForm.priority}
                          onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                          className="w-full bg-neu-bg text-neu-text neu-inset rounded-neu px-4 py-2.5 text-sm focus:outline-none"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>

                      <NeuInput
                        label="Admin Internal Remark"
                        value={editForm.admin_remark}
                        onChange={(e) => setEditForm({ ...editForm, admin_remark: e.target.value })}
                      />

                      <NeuButton type="submit" variant="default" disabled={updating} size="sm">
                        Save Edits
                      </NeuButton>
                    </form>
                  </NeuCard>
                </div>

                {/* Right Column: Audit Log Status History */}
                <div className="lg:col-span-1">
                  <NeuCard>
                    <StatusTimeline
                      currentStatus={selectedComplaint.status}
                      history={selectedComplaint.status_history || []}
                    />
                  </NeuCard>
                </div>
              </div>
            </motion.div>
          ) : (
            /* --- ADMIN COMPLAINTS LIST VIEW --- */
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold">Complaint Management Console</h1>
                <p className="text-xs text-neu-muted mt-1">Search, filter, assign, and update all system complaints.</p>
              </div>

              {/* Multi-Criteria Filter Bar */}
              <NeuCard className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <NeuInput
                    placeholder="Search ID, title, user..."
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

              {/* Complaints Grid List */}
              {loading ? (
                <div className="space-y-3">
                  <SkeletonLoader className="h-16 w-full" />
                  <SkeletonLoader className="h-16 w-full" />
                </div>
              ) : complaints.length === 0 ? (
                <NeuCard className="text-center py-10">
                  <p className="text-xs text-neu-muted">No complaints match current filters.</p>
                </NeuCard>
              ) : (
                <div className="space-y-3">
                  {complaints.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <NeuCard
                        hoverable
                        onClick={() => fetchComplaintDetails(c.id)}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-neu-primary">{c.complaint_number}</span>
                            <StatusBadge status={c.status} />
                            <StatusBadge priority={c.priority} />
                            <span className="text-[10px] text-neu-muted bg-neu-muted/10 px-2 py-0.5 rounded-full font-semibold">
                              {c.category?.name}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm">{c.title}</h3>
                          <p className="text-xs text-neu-muted">Submitted by: {c.user?.name} ({c.user?.email})</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs text-neu-muted block">
                            {new Date(c.submitted_at).toLocaleDateString()}
                          </span>
                          {c.assigned_to && (
                            <span className="text-[10px] font-semibold text-neu-primary block mt-1">
                              Assigned: {c.assigned_to}
                            </span>
                          )}
                        </div>
                      </NeuCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
