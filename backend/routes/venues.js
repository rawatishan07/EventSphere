const express = require('express');
const router = express.Router();
const { query, get, run } = require('../database/db');

// GET /api/venues - List all venues with event counts and total capacity
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        v.*,
        COUNT(DISTINCT e.id) AS hosted_events_count,
        COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0) AS total_attendees_served
      FROM venues v
      LEFT JOIN events e ON v.id = e.venue_id
      LEFT JOIN bookings b ON e.id = b.event_id
      GROUP BY v.id
      ORDER BY v.name ASC
    `;
    const venues = await query(sql);
    res.json({ success: true, count: venues.length, data: venues });
  } catch (err) {
    console.error('Error fetching venues:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/venues - Create new venue
router.post('/', async (req, res) => {
  try {
    const { name, city, state, address, capacity, amenities, contact_phone, image_url } = req.body;

    if (!name || !city || !address || !capacity) {
      return res.status(400).json({ success: false, error: 'Name, city, address, and capacity are required.' });
    }

    const defaultImg = image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80';

    const result = await run(
      `INSERT INTO venues (name, city, state, address, capacity, amenities, contact_phone, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, city, state || '', address, parseInt(capacity), amenities || '', contact_phone || '', defaultImg]
    );

    res.status(201).json({
      success: true,
      message: 'Venue created successfully',
      venueId: result.lastID
    });
  } catch (err) {
    console.error('Error creating venue:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/categories - List categories with event statistics
router.get('/categories/all', async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT e.id) AS total_events,
        COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.total_amount ELSE 0 END), 0) AS total_revenue
      FROM categories c
      LEFT JOIN events e ON c.id = e.category_id
      LEFT JOIN bookings b ON e.id = b.event_id
      GROUP BY c.id
      ORDER BY total_events DESC, c.name ASC
    `;
    const categories = await query(sql);
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

