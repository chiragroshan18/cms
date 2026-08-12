const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { authenticateToken, requireRole, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/admin/login
// Strictly for seeded ADMIN user. NO forgot-password route exists for admin.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await prisma.user.findUnique({ where: { email } });
    if (!admin || admin.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    if (!admin.is_active) {
      return res.status(403).json({ error: 'Admin account is deactivated.' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const token = generateToken(admin);
    return res.json({
      message: 'Admin login successful.',
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Server error during admin login.' });
  }
});

module.exports = router;
