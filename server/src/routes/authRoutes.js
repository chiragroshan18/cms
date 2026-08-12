const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register (USER role only - ADMIN registration blocked)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password_hash,
        role: 'USER', // Strictly USER role
      },
    });

    const token = generateToken(user);
    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login (User Login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'USER') {
      return res.status(401).json({ error: 'Invalid user credentials.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid user credentials.' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/forgot-password (Inline state pre-login flow)
// Accepts email, verifies user exists, resets password directly in step
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'USER') {
      return res.status(404).json({ error: 'No user account found with this email.' });
    }

    return res.json({ message: 'User identity verified. Proceed to reset password.', email: user.email });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Server error during password recovery.' });
  }
});

// POST /api/auth/reset-password (Inline state reset step)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'USER') {
      return res.status(404).json({ error: 'Invalid user account.' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash },
    });

    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Server error during password reset.' });
  }
});

// GET /api/auth/me (Current user details)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, created_at: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Server error fetching user profile.' });
  }
});

// PUT /api/auth/change-password (Logged-in user profile flow)
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash },
    });

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Server error updating password.' });
  }
});

module.exports = router;
