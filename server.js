// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(express.json());

// env vars required:
// DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, PORT (optional)
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  JWT_SECRET,
  PORT = 3001,
} = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME || !JWT_SECRET) {
  console.error('Missing one or more required env vars: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET');
  process.exit(1);
}

let pool;
async function initDb() {
  pool = await mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Create tables if they don't exist
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      is_admin TINYINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      description TEXT,
      start_date DATETIME,
      end_date DATETIME,
      max_participants INT DEFAULT 0,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS signups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      event_id INT,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      score INT DEFAULT 0,
      UNIQUE KEY unique_signup (user_id, event_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);
}

// Helper: query wrapper
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// ====== AUTH ROUTES ======

// Register
app.post(
  '/auth/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      const result = await query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [
        name,
        email,
        hashed,
      ]);
      const userId = result.insertId;
      const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, user: { id: userId, name, email } });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already registered' });
      }
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login
app.post(
  '/auth/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const users = await query('SELECT * FROM users WHERE email = ?', [email]);
      const user = users[0];
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, email: user.email, is_admin: !!user.is_admin }, JWT_SECRET, {
        expiresIn: '7d',
      });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, is_admin: !!user.is_admin } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get current user
app.get('/users/me', authenticateToken, async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, is_admin, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!users[0]) return res.status(404).json({ error: 'User not found' });
    return res.json(users[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ====== EVENTS ======

// List events
app.get('/events', async (req, res) => {
  try {
    const events = await query('SELECT * FROM events ORDER BY start_date ASC');
    return res.json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get event
app.get('/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await query('SELECT * FROM events WHERE id = ?', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Event not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create event (authenticated)
app.post(
  '/events',
  authenticateToken,
  [
    body('title').trim().notEmpty(),
    body('description').optional().trim(),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('max_participants').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description = '', start_date = null, end_date = null, max_participants = 0 } = req.body;
    try {
      const result = await query(
        'INSERT INTO events (title, description, start_date, end_date, max_participants, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, start_date, end_date, max_participants, req.user.id]
      );
      const inserted = await query('SELECT * FROM events WHERE id = ?', [result.insertId]);
      return res.status(201).json(inserted[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update event (authenticated)
app.put(
  '/events/:id',
  authenticateToken,
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('max_participants').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    const { id } = req.params;
    const fields = ['title', 'description', 'start_date', 'end_date', 'max_participants'];
    const updates = [];
    const params = [];

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);

    try {
      await query(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, params);
      const updated = await query('SELECT * FROM events WHERE id = ?', [id]);
      if (!updated[0]) return res.status(404).json({ error: 'Event not found' });
      return res.json(updated[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete event (authenticated)
app.delete('/events/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM events WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ====== SIGNUPS ======

// Signup to event (authenticated)
app.post('/events/:id/signup', authenticateToken, async (req, res) => {
  const { id: eventId } = req.params;
  try {
    // check event exists
    const ev = await query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!ev[0]) return res.status(404).json({ error: 'Event not found' });

    // check capacity if max_participants > 0
    if (ev[0].max_participants && ev[0].max_participants > 0) {
      const count = await query('SELECT COUNT(*) as cnt FROM signups WHERE event_id = ?', [eventId]);
      if (count[0].cnt >= ev[0].max_participants) {
        return res.status(400).json({ error: 'Event is full' });
      }
    }

    try {
      await query('INSERT INTO signups (user_id, event_id) VALUES (?, ?)', [req.user.id, eventId]);
      return res.status(201).json({ success: true, message: 'Signed up' });
    } catch (err) {
      // duplicate signup
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Already signed up' });
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get user's signups
app.get('/users/me/signups', authenticateToken, async (req, res) => {
  try {
    const rows = await query(
      `SELECT s.id, s.event_id, s.joined_at, s.score, e.title, e.start_date, e.end_date
       FROM signups s
       JOIN events e ON e.id = s.event_id
       WHERE s.user_id = ?`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ====== LEADERBOARD ======

// Simple leaderboard aggregated by highest score across signups
app.get('/leaderboard', async (req, res) => {
  try {
    const rows = await query(
      `SELECT u.id as user_id, u.name, u.email, SUM(s.score) as total_score, COUNT(s.id) as events_joined
       FROM signups s
       JOIN users u ON u.id = s.user_id
       GROUP BY u.id
       ORDER BY total_score DESC
       LIMIT 50`
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Admin-only: award points to a signup (authenticated)
app.post(
  '/signups/:id/score',
  authenticateToken,
  [body('points').isInt()],
  async (req, res) => {
    // naive admin-check: is_admin flag in token
    if (!req.user.is_admin) return res.status(403).json({ error: 'Admin only' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { points } = req.body;
    try {
      const result = await query('UPDATE signups SET score = score + ? WHERE id = ?', [points, id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Signup not found' });
      const updated = await query('SELECT * FROM signups WHERE id = ?', [id]);
      return res.json(updated[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// ====== START ======
(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
