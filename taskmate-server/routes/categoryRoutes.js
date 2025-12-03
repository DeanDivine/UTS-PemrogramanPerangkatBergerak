import { Router } from 'express';
import { pool } from '../db/config.js';

const router = Router();

// GET /categories
router.get('/', async (_req, res) => {
  const [rows] = await pool.query('SELECT `key`, color FROM categories ORDER BY `key` ASC');
  res.json(rows);
});

// POST /categories
router.post('/', async (req, res) => {
  const { key, color = '#334155' } = req.body;
  if (!key) return res.status(400).json({ message: 'key required' });
  await pool.query('INSERT INTO categories (`key`, color) VALUES (?,?)', [key, color]);
  res.status(201).json({ ok: true });
});

export default router;
