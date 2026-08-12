const express = require('express');
const prisma = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories (Public/Authenticated user list active categories)
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
    return res.json({ categories });
  } catch (err) {
    console.error('Fetch categories error:', err);
    return res.status(500).json({ error: 'Server error fetching categories.' });
  }
});

// GET /api/categories/all (ADMIN list all active and disabled categories)
router.get('/all', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json({ categories });
  } catch (err) {
    console.error('Fetch all categories error:', err);
    return res.status(500).json({ error: 'Server error fetching all categories.' });
  }
});

// POST /api/categories (ADMIN only create category)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists.' });
    }

    const category = await prisma.category.create({
      data: { name, description: description || null },
    });

    return res.status(201).json({ message: 'Category created.', category });
  } catch (err) {
    console.error('Create category error:', err);
    return res.status(500).json({ error: 'Server error creating category.' });
  }
});

// PUT /api/categories/:id (ADMIN only update category)
router.put('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    return res.json({ message: 'Category updated.', category });
  } catch (err) {
    console.error('Update category error:', err);
    return res.status(500).json({ error: 'Server error updating category.' });
  }
});

// DELETE /api/categories/:id (ADMIN only soft-delete category)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.update({
      where: { id },
      data: { is_active: false },
    });

    return res.json({ message: 'Category deactivated.', category });
  } catch (err) {
    console.error('Delete category error:', err);
    return res.status(500).json({ error: 'Server error deactivating category.' });
  }
});

module.exports = router;
