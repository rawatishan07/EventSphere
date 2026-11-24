const express = require('express');
const router = express.Router();
const { query, get, run } = require('../database/db');

// Helper to generate formatted booking reference
function generateBookingReference() {
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `ES-2026-${randomStr}${timestamp}`;
}

// Helper to generate individual ticket code
function generateTicketCode(prefix = 'TKT') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}-${Date.now().toString().slice(-4)}`;
}

// GET /api/bookings - List all bookings with multi-table JOINs (User, Event, Venue, Ticket Tier)
router.get('/', async (req, res) => {
  try {
    const { userId, eventId, status } = req.query;

    let sql = `
      SELECT 
        b.id,
        b.booking_reference,
        b.quantity,
        b.unit_price,
        b.total_amount,
        b.booking_status,
        b.payment_status,
        b.booking_date,
        b.cancelled_at,
        b.notes,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        e.id AS event_id,
        e.title AS event_title,
        e.event_date,
        e.start_time,
        e.end_time,
        e.banner_url AS event_banner,
        c.name AS category_name,
        c.badge_color,
        v.name AS venue_name,
        v.city AS venue_city,
        v.address AS venue_address,
        tt.id AS tier_id,
        tt.tier_name,
        (SELECT COUNT(*) FROM tickets t WHERE t.booking_id = b.id AND t.status = 'VALID') AS valid_ticket_count
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      INNER JOIN events e ON b.event_id = e.id
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN venues v ON e.venue_id = v.id
      LEFT JOIN ticket_tiers tt ON b.ticket_tier_id = tt.id
      WHERE 1=1
    `;

    const params = [];

    if (userId) {
      sql += ` AND b.user_id = ?`;
      params.push(userId);
    }

    if (eventId) {
      sql += ` AND b.event_id = ?`;
      params.push(eventId);
    }

    if (status) {
      sql += ` AND b.booking_status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY b.booking_date DESC`;

    const bookings = await query(sql, params);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bookings/:id - Get single booking details with individual tickets
router.get('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;

    const bookingSql = `
      SELECT 
        b.*,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        e.title AS event_title,
        e.description AS event_description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.banner_url AS event_banner,
        c.name AS category_name,
        c.badge_color,
        v.name AS venue_name,
        v.city AS venue_city,
        v.address AS venue_address,
        tt.tier_name,
        tt.perks AS tier_perks
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      INNER JOIN events e ON b.event_id = e.id
      INNER JOIN categories c ON e.category_id = c.id
      INNER JOIN venues v ON e.venue_id = v.id
      LEFT JOIN ticket_tiers tt ON b.ticket_tier_id = tt.id
      WHERE b.id = ? OR b.booking_reference = ?
    `;

    const booking = await get(bookingSql, [bookingId, bookingId]);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const tickets = await query(`SELECT * FROM tickets WHERE booking_id = ?`, [booking.id]);

    res.json({
      success: true,
      data: {
        ...booking,
        tickets
      }
    });
  } catch (err) {
    console.error('Error fetching booking details:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bookings - Book tickets with real-time seat & capacity verification
router.post('/', async (req, res) => {
  try {
    const {
      user_id = 4, // Default to demo attendee Sarah Jenkins if not provided
      event_id,
      ticket_tier_id,
      quantity = 1,
      notes = ''
    } = req.body;

    const qty = parseInt(quantity, 10);
    if (!event_id || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Event ID and valid quantity are required.' });
    }

    // 1. Fetch Event and verify status
    const event = await get(`SELECT * FROM events WHERE id = ?`, [event_id]);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event does not exist.' });
    }

    if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: `Cannot book tickets for an event that is ${event.status}.` });
    }

    // 2. Real-time availability check: Total seats vs active confirmed bookings
    const availabilityCheck = await get(`
      SELECT 
        e.total_seats,
        COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0) AS booked_count
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [event_id]);

    const remainingSeats = availabilityCheck.total_seats - availabilityCheck.booked_count;

    if (remainingSeats < qty) {
      return res.status(400).json({
        success: false,
        error: `Insufficient availability! Only ${remainingSeats} seat(s) remaining for this event.`
      });
    }

    // 3. Determine price (from ticket tier or event base price)
    let unitPrice = event.base_price;
    let tierName = 'General Admission';

    if (ticket_tier_id) {
      const tier = await get(`SELECT * FROM ticket_tiers WHERE id = ? AND event_id = ?`, [ticket_tier_id, event_id]);
      if (!tier) {
        return res.status(400).json({ success: false, error: 'Selected ticket tier is invalid for this event.' });
      }

      // Check tier allocation
      const tierBooked = await get(`
        SELECT COALESCE(SUM(quantity), 0) as booked 
        FROM bookings 
        WHERE ticket_tier_id = ? AND booking_status = 'CONFIRMED'
      `, [ticket_tier_id]);

      const remainingTierAllocation = tier.total_allocation - tierBooked.booked;
      if (remainingTierAllocation < qty) {
        return res.status(400).json({
          success: false,
          error: `Selected tier '${tier.tier_name}' only has ${remainingTierAllocation} ticket(s) remaining.`
        });
      }

      unitPrice = tier.price;
      tierName = tier.tier_name;
    }

    const totalAmount = parseFloat((unitPrice * qty).toFixed(2));
    const bookingRef = generateBookingReference();

    // 4. Create the booking record
    const insertBookingSql = `
      INSERT INTO bookings (
        booking_reference, user_id, event_id, ticket_tier_id, 
        quantity, unit_price, total_amount, booking_status, payment_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', 'COMPLETED', ?)
    `;

    const bookingResult = await run(insertBookingSql, [
      bookingRef,
      user_id,
      event_id,
      ticket_tier_id || null,
      qty,
      unitPrice,
      totalAmount,
      notes
    ]);

    const bookingId = bookingResult.lastID;

    // 5. Generate individual tickets for each seat
    const generatedTickets = [];
    const prefix = event.title.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'TK');

    for (let i = 1; i <= qty; i++) {
      const ticketCode = generateTicketCode(prefix);
      const seatNumber = `${tierName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const qrData = `ES:${event_id}:${bookingRef}:${ticketCode}:SEAT-${seatNumber}`;

      await run(
        `INSERT INTO tickets (booking_id, ticket_code, seat_label, status, qr_payload) VALUES (?, ?, ?, 'VALID', ?)`,
        [bookingId, ticketCode, seatNumber, qrData]
      );

      generatedTickets.push({
        ticket_code: ticketCode,
        seat_label: seatNumber,
        status: 'VALID',
        qr_payload: qrData
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully booked ${qty} ticket(s)!`,
      booking: {
        id: bookingId,
        booking_reference: bookingRef,
        event_id,
        quantity: qty,
        unit_price: unitPrice,
        total_amount: totalAmount,
        booking_status: 'CONFIRMED',
        payment_status: 'COMPLETED',
        tickets: generatedTickets
      }
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/bookings/:id/cancel - Process booking cancellation and seat restoration
router.post('/:id/cancel', async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Check existing booking
    const booking = await get(`SELECT * FROM bookings WHERE id = ? OR booking_reference = ?`, [bookingId, bookingId]);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    if (booking.booking_status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'This booking has already been cancelled.' });
    }

    // Cancel booking and mark refund
    const cancelTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await run(
      `UPDATE bookings SET booking_status = 'CANCELLED', payment_status = 'REFUNDED', cancelled_at = ? WHERE id = ?`,
      [cancelTime, booking.id]
    );

    // Cancel all associated ticket passes
    await run(`UPDATE tickets SET status = 'CANCELLED' WHERE booking_id = ?`, [booking.id]);

    // Fetch updated event availability for feedback
    const eventStats = await get(`
      SELECT 
        e.title,
        e.total_seats,
        (e.total_seats - COALESCE(SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN b.quantity ELSE 0 END), 0)) AS remaining_seats
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [booking.event_id]);

    res.json({
      success: true,
      message: `Booking #${booking.booking_reference} cancelled successfully. Seats restored to availability.`,
      cancelled_booking_id: booking.id,
      restored_seats: booking.quantity,
      event_now_remaining_seats: eventStats ? eventStats.remaining_seats : null
    });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

