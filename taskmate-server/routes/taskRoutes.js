import { Router } from 'express';
import { pool } from '../db/config.js';

const router = Router();

function normalizeDate(value) {
  if (!value) return null;
  try {
    // Extract only the date part: 2025-10-07 from 2025-10-07T17:00:00.000Z
    return value.split('T')[0];
  } catch {
    return null;
  }
}

// GET /tasks
router.get('/', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM tasks ORDER BY updated_at DESC');
  res.json(rows);
});

// GET /tasks/:id
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM tasks WHERE id=?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
});

// POST /tasks
router.post('/', async (req, res) => {
  try {
    console.log('📥 Incoming task data:', req.body);
    const {
      id, title, description, deadline, category = 'Umum',
      priority = 'Low', status = 'pending', progress = 0
    } = req.body;

    if (!id || !title)
      return res.status(400).json({ message: 'id & title required' });

    const normalizedDeadline = normalizeDate(deadline);

    const [result] = await pool.query(
      'INSERT INTO tasks (id, title, description, deadline, category, priority, status, progress) VALUES (?,?,?,?,?,?,?,?)',
      [id, title, description ?? null, normalizedDeadline, category, priority, status, progress]
    );

    console.log('✅ Task inserted:', result);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('❌ Insert task error:', err);
    res.status(500).json({ message: 'DB insert failed', error: err.message });
  }
});




// PUT /tasks/:id
router.put('/:id', async (req, res) => {
  const fields = ['title', 'description', 'deadline', 'category', 'priority', 'status', 'progress'];
  const set = [];
  const vals = [];

  for (const f of fields) {
    if (typeof req.body[f] !== 'undefined') {
      let val = req.body[f];
      if (f === 'deadline') val = normalizeDate(val);
      set.push(`${f}=?`);
      vals.push(val);
    }
  }

  if (!set.length) return res.status(400).json({ message: 'no changes' });

  vals.push(req.params.id);
  const [result] = await pool.query(`UPDATE tasks SET ${set.join(',')} WHERE id=?`, vals);

  if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});


// DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM tasks WHERE id=?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});

export default router;
