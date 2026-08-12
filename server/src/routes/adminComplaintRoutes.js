const express = require('express');
const prisma = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware ensuring ADMIN role for all routes in this file
router.use(authenticateToken, requireRole('ADMIN'));

// GET /api/admin/dashboard (Aggregate stats computed directly from PostgreSQL)
router.get('/dashboard', async (req, res) => {
  try {
    const total = await prisma.complaint.count();
    const pending = await prisma.complaint.count({ where: { status: 'PENDING' } });
    const assigned = await prisma.complaint.count({ where: { status: 'ASSIGNED' } });
    const inProgress = await prisma.complaint.count({ where: { status: 'IN_PROGRESS' } });
    const resolved = await prisma.complaint.count({ where: { status: 'RESOLVED' } });
    const closed = await prisma.complaint.count({ where: { status: 'CLOSED' } });

    // Recent activity list
    const recentComplaints = await prisma.complaint.findMany({
      take: 5,
      orderBy: { submitted_at: 'desc' },
      include: {
        category: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({
      stats: {
        total,
        pending,
        assigned,
        inProgress,
        resolved,
        closed,
      },
      recentComplaints,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return res.status(500).json({ error: 'Server error fetching dashboard metrics.' });
  }
});

// GET /api/admin/complaints (List all complaints with filtering & search)
router.get('/complaints', async (req, res) => {
  try {
    const { status, category_id, priority, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (category_id) where.category_id = category_id;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { complaint_number: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        category: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { submitted_at: 'desc' },
    });

    return res.json({ complaints });
  } catch (err) {
    console.error('Admin complaints fetch error:', err);
    return res.status(500).json({ error: 'Server error fetching complaints.' });
  }
});

// GET /api/admin/complaints/:id (Single complaint details for admin)
router.get('/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        category: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        status_history: { orderBy: { created_at: 'asc' } },
      },
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    return res.json({ complaint });
  } catch (err) {
    console.error('Admin single complaint fetch error:', err);
    return res.status(500).json({ error: 'Server error fetching complaint.' });
  }
});

// PUT /api/admin/complaints/:id (Full edit priority/remarks/resolution)
router.put('/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { priority, admin_remark, resolution_description } = req.body;

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        priority: priority || existing.priority,
        admin_remark: admin_remark !== undefined ? admin_remark : existing.admin_remark,
        resolution_description: resolution_description !== undefined ? resolution_description : existing.resolution_description,
      },
      include: { category: true, user: { select: { id: true, name: true, email: true } } },
    });

    return res.json({ message: 'Complaint updated.', complaint: updated });
  } catch (err) {
    console.error('Admin update complaint error:', err);
    return res.status(500).json({ error: 'Server error updating complaint.' });
  }
});

// PUT /api/admin/complaints/:id/status (Change status + log history)
router.put('/complaints/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark, resolution_description } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'New status is required.' });
    }

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const old_status = existing.status;
    const updateData = { status };

    if (status === 'RESOLVED' && !existing.resolved_at) {
      updateData.resolved_at = new Date();
      if (resolution_description) {
        updateData.resolution_description = resolution_description;
      }
    } else if (status === 'CLOSED' && !existing.closed_at) {
      updateData.closed_at = new Date();
    } else if (status === 'ASSIGNED' && !existing.assigned_at) {
      updateData.assigned_at = new Date();
    }

    if (remark) {
      updateData.admin_remark = remark;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const resComplaint = await tx.complaint.update({
        where: { id },
        data: updateData,
        include: { category: true, user: { select: { id: true, name: true, email: true } } },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaint_id: id,
          old_status,
          new_status: status,
          changed_by: req.user.name || 'System Admin',
          remark: remark || `Status changed to ${status}`,
        },
      });

      return resComplaint;
    });

    return res.json({ message: `Status updated to ${status}.`, complaint: updated });
  } catch (err) {
    console.error('Admin update status error:', err);
    return res.status(500).json({ error: 'Server error updating status.' });
  }
});

// PUT /api/admin/complaints/:id/assign (Assign complaint + log history)
router.put('/complaints/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, remark } = req.body;

    if (!assigned_to) {
      return res.status(400).json({ error: 'assigned_to field is required.' });
    }

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const old_status = existing.status;
    const new_status = existing.status === 'PENDING' ? 'ASSIGNED' : existing.status;

    const updated = await prisma.$transaction(async (tx) => {
      const resComplaint = await tx.complaint.update({
        where: { id },
        data: {
          assigned_to,
          assigned_at: existing.assigned_at || new Date(),
          status: new_status,
        },
        include: { category: true, user: { select: { id: true, name: true, email: true } } },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaint_id: id,
          old_status,
          new_status,
          changed_by: req.user.name || 'System Admin',
          remark: remark || `Complaint assigned to ${assigned_to}`,
        },
      });

      return resComplaint;
    });

    return res.json({ message: 'Complaint assigned successfully.', complaint: updated });
  } catch (err) {
    console.error('Admin assign complaint error:', err);
    return res.status(500).json({ error: 'Server error assigning complaint.' });
  }
});

module.exports = router;
