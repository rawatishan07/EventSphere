const express = require('express');
const router = express.Router();
const { query, get, run } = require('../database/db');

// GET /api/users - List users with booking stats
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    let sql = `
      SELECT 
        u.*,
        COUNT(DISTINCT b.id) AS total_bookings,
        COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0) AS total_tickets_bought,
        COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.total_amount ELSE 0 END), 0) AS total_spend
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE 1=1
    `;
    const params = [];
    if (role) {
      sql += ` AND u.role = ?`;
      params.push(role);
    }
    sql += ` GROUP BY u.id ORDER BY u.name ASC`;

    const users = await query(sql, params);
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users - Register attendee or organizer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, role = 'attendee', avatar_url } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const defaultAvatar = avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

    const result = await run(
      `INSERT INTO users (name, email, phone, role, avatar_url) VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || '', role, defaultAvatar]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: result.lastID
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed') || err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'A user with this email address already exists.' });
    }
    console.error('Error registering user:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

