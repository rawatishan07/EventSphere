const express = require('express');
const router = express.Router();
const { query, get, run } = require('../database/db');

// GET /api/events - List events with multi-table JOINs, filtering, and real-time availability tracking
router.get('/', async (req, res) => {
  try {
    const { category, city, status, search, sort } = req.query;

    let sql = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.banner_url,
        e.total_seats,
        e.base_price,
        e.status,
        e.created_at,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        c.badge_color,
        v.id AS venue_id,
        v.name AS venue_name,
        v.city AS venue_city,
        v.state AS venue_state,
        v.address AS venue_address,
        v.capacity AS venue_capacity,
        u.id AS organizer_id,
        u.name AS organizer_name,
        u.email AS organizer_email,
        -- Real-time availability calculation via Aggregated Subquery / JOIN
        COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0) AS booked_seats,
        (e.total_seats - COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0)) AS remaining_seats,
        ROUND((COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0) * 100.0) / e.total_seats, 1) AS occupancy_percentage
      FROM events e
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN venues v ON e.venue_id = v.id
      INNER JOIN users u ON e.organizer_id = u.id
      LEFT JOIN bookings b ON e.id = b.event_id
      WHERE 1=1
    `;

    const params = [];

    if (category) {
      sql += ` AND (c.slug = ? OR c.name = ?)`;
      params.push(category, category);
    }

    if (city) {
      sql += ` AND LOWER(v.city) = LOWER(?)`;
      params.push(city);
    }

    if (status) {
      sql += ` AND e.status = ?`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (e.title LIKE ? OR e.description LIKE ? OR v.name LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ` GROUP BY e.id`;

    // Dynamic sorting
    if (sort === 'date_asc') {
      sql += ` ORDER BY e.event_date ASC, e.start_time ASC`;
    } else if (sort === 'date_desc') {
      sql += ` ORDER BY e.event_date DESC`;
    } else if (sort === 'price_low') {
      sql += ` ORDER BY e.base_price ASC`;
    } else if (sort === 'price_high') {
      sql += ` ORDER BY e.base_price DESC`;
    } else if (sort === 'popularity') {
      sql += ` ORDER BY booked_seats DESC`;
    } else {
      sql += ` ORDER BY e.event_date ASC`;
    }

    const events = await query(sql, params);
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/events/:id - Get single event with venue, ticket tiers, and live availability
router.get('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    const eventSql = `
      SELECT 
        e.*,
        c.name AS category_name,
        c.badge_color,
        v.name AS venue_name,
        v.city AS venue_city,
        v.state AS venue_state,
        v.address AS venue_address,
        v.capacity AS venue_capacity,
        v.amenities AS venue_amenities,
        u.name AS organizer_name,
        u.email AS organizer_email,
        u.phone AS organizer_phone,
        COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0) AS booked_seats,
        (e.total_seats - COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0)) AS remaining_seats,
        ROUND((COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0) * 100.0) / e.total_seats, 1) AS occupancy_percentage
      FROM events e
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN venues v ON e.venue_id = v.id
      INNER JOIN users u ON e.organizer_id = u.id
      LEFT JOIN bookings b ON e.id = b.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `;

    const event = await get(eventSql, [eventId]);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Fetch ticket tiers for this event
    const tiersSql = `
      SELECT 
        tt.*,
        COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0) AS booked_count,
        (tt.total_allocation - COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0)) AS remaining_count
      FROM ticket_tiers tt
      LEFT JOIN bookings b ON tt.id = b.ticket_tier_id
      WHERE tt.event_id = ?
      GROUP BY tt.id
      ORDER BY tt.price ASC
    `;
    const tiers = await query(tiersSql, [eventId]);

    res.json({
      success: true,
      data: {
        ...event,
        ticket_tiers: tiers
      }
    });
  } catch (err) {
    console.error('Error fetching event details:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/events - Create new event (CRUD: Create)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      venue_id,
      organizer_id = 1,
      event_date,
      start_time,
      end_time,
      banner_url,
      total_seats,
      base_price,
      ticket_tiers = []
    } = req.body;

    if (!title || !description || !category_id || !venue_id || !event_date || !start_time || !total_seats || base_price === undefined) {
      return res.status(400).json({ success: false, error: 'Please provide all mandatory event fields.' });
    }

    // Check venue capacity constraint
    const venue = await get('SELECT capacity FROM venues WHERE id = ?', [venue_id]);
    if (!venue) {
      return res.status(400).json({ success: false, error: 'Selected venue does not exist.' });
    }
    if (parseInt(total_seats) > venue.capacity) {
      return res.status(400).json({
        success: false,
        error: `Total seats (${total_seats}) cannot exceed venue maximum capacity (${venue.capacity}).`
      });
    }

    const defaultBanner = banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

    const insertEventSql = `
      INSERT INTO events (title, description, category_id, venue_id, organizer_id, event_date, start_time, end_time, banner_url, total_seats, base_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UPCOMING')
    `;

    const result = await run(insertEventSql, [
      title,
      description,
      category_id,
      venue_id,
      organizer_id,
      event_date,
      start_time,
      end_time || null,
      defaultBanner,
      parseInt(total_seats),
      parseFloat(base_price)
    ]);

    const newEventId = result.lastID;

    // Insert ticket tiers if provided, or create default Standard tier
    if (ticket_tiers && ticket_tiers.length > 0) {
      for (const tier of ticket_tiers) {
        await run(
          `INSERT INTO ticket_tiers (event_id, tier_name, price, total_allocation, perks) VALUES (?, ?, ?, ?, ?)`,
          [newEventId, tier.tier_name, parseFloat(tier.price), parseInt(tier.total_allocation), tier.perks || '']
        );
      }
    } else {
      // Create a default tier matching total_seats
      await run(
        `INSERT INTO ticket_tiers (event_id, tier_name, price, total_allocation, perks) VALUES (?, ?, ?, ?, ?)`,
        [newEventId, 'General Admission', parseFloat(base_price), parseInt(total_seats), 'Standard entry to all event sessions']
      );
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      eventId: newEventId
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/events/:id - Update event details (CRUD: Update)
router.put('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      title,
      description,
      category_id,
      venue_id,
      event_date,
      start_time,
      end_time,
      banner_url,
      total_seats,
      base_price,
      status
    } = req.body;

    const existing = await get('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const updateSql = `
      UPDATE events
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        venue_id = COALESCE(?, venue_id),
        event_date = COALESCE(?, event_date),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        banner_url = COALESCE(?, banner_url),
        total_seats = COALESCE(?, total_seats),
        base_price = COALESCE(?, base_price),
        status = COALESCE(?, status)
      WHERE id = ?
    `;

    await run(updateSql, [
      title || null,
      description || null,
      category_id || null,
      venue_id || null,
      event_date || null,
      start_time || null,
      end_time || null,
      banner_url || null,
      total_seats ? parseInt(total_seats) : null,
      base_price !== undefined ? parseFloat(base_price) : null,
      status || null,
      eventId
    ]);

    res.json({ success: true, message: 'Event updated successfully.' });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/events/:id - Delete an event (CRUD: Delete)
router.delete('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    // Check if there are active bookings
    const activeBookings = await get(
      `SELECT COUNT(*) as active_count FROM bookings WHERE event_id = ? AND booking_status = 'CONFIRMED'`,
      [eventId]
    );

    if (activeBookings && activeBookings.active_count > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete event with ${activeBookings.active_count} active bookings. Please cancel bookings or change event status to CANCELLED instead.`
      });
    }

    // Delete associated bookings (if cancelled/refunded), tickets, and tiers
    await run(`DELETE FROM tickets WHERE booking_id IN (SELECT id FROM bookings WHERE event_id = ?)`, [eventId]);
    await run(`DELETE FROM bookings WHERE event_id = ?`, [eventId]);
    await run(`DELETE FROM ticket_tiers WHERE event_id = ?`, [eventId]);
    await run(`DELETE FROM events WHERE id = ?`, [eventId]);

    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

