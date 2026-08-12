const express = require('express');
const prisma = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Helper to auto-generate complaint number CMP-YYYY-NNNNN
async function generateComplaintNumber() {
  const year = new Date().getFullYear();
  const prefix = `CMP-${year}-`;
  
  // Find highest existing complaint number for current year
  const latestComplaint = await prisma.complaint.findFirst({
    where: {
      complaint_number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      submitted_at: 'desc',
    },
    select: {
      complaint_number: true,
    },
  });

  let nextSeq = 1;
  if (latestComplaint && latestComplaint.complaint_number) {
    const parts = latestComplaint.complaint_number.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }
  }

  const paddedSeq = String(nextSeq).padStart(5, '0');
  return `${prefix}${paddedSeq}`;
}

// ----------------------------------------------------
// USER COMPLAINT ENDPOINTS
// ----------------------------------------------------

// POST /api/complaints (Create complaint)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category_id, priority, location, attachment_url } = req.body;

    if (!title || !description || !category_id) {
      return res.status(400).json({ error: 'Title, description, and category are required.' });
    }

    // Verify category exists
    const categoryExists = await prisma.category.findUnique({ where: { id: category_id } });
    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid category selected.' });
    }

    const complaint_number = await generateComplaintNumber();

    const complaint = await prisma.$transaction(async (tx) => {
      const newComplaint = await tx.complaint.create({
        data: {
          complaint_number,
          user_id: req.user.id,
          category_id,
          title,
          description,
          location: location || null,
          priority: priority || 'MEDIUM',
          status: 'PENDING',
          attachment_url: attachment_url || null,
        },
        include: {
          category: true,
        },
      });

      // Write initial history log
      await tx.complaintStatusHistory.create({
        data: {
          complaint_id: newComplaint.id,
          old_status: null,
          new_status: 'PENDING',
          changed_by: req.user.name || req.user.email,
          remark: 'Complaint submitted by user',
        },
      });

      return newComplaint;
    });

    return res.status(201).json({ message: 'Complaint submitted successfully.', complaint });
  } catch (err) {
    console.error('Create complaint error:', err);
    return res.status(500).json({ error: 'Server error submitting complaint.' });
  }
});

// GET /api/complaints/my (List user's own complaints)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { user_id: req.user.id },
      include: {
        category: true,
      },
      orderBy: { submitted_at: 'desc' },
    });

    return res.json({ complaints });
  } catch (err) {
    console.error('Fetch my complaints error:', err);
    return res.status(500).json({ error: 'Server error fetching complaints.' });
  }
});

// GET /api/complaints/:id (User get single complaint details with status history)
router.get('/:id', authenticateToken, async (req, res) => {
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

    // Authorization check: User can only access their own complaint (unless ADMIN)
    if (req.user.role !== 'ADMIN' && complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this complaint.' });
    }

    return res.json({ complaint });
  } catch (err) {
    console.error('Fetch complaint details error:', err);
    return res.status(500).json({ error: 'Server error fetching complaint details.' });
  }
});

// PUT /api/complaints/:id/close (User close resolved complaint)
router.put('/:id/close', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    if (complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (complaint.status !== 'RESOLVED') {
      return res.status(400).json({ error: 'Only resolved complaints can be closed by the user.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const resComplaint = await tx.complaint.update({
        where: { id },
        data: {
          status: 'CLOSED',
          closed_at: new Date(),
        },
        include: { category: true },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaint_id: id,
          old_status: 'RESOLVED',
          new_status: 'CLOSED',
          changed_by: req.user.name || req.user.email,
          remark: 'Complaint closed by user',
        },
      });

      return resComplaint;
    });

    return res.json({ message: 'Complaint closed successfully.', complaint: updated });
  } catch (err) {
    console.error('Close complaint error:', err);
    return res.status(500).json({ error: 'Server error closing complaint.' });
  }
});

module.exports = router;
