// Embedded fallback store for static deployments (e.g. Netlify) when no backend API is reachable.
const STORAGE_KEY = 'eventsphere_static_db_v1';

const INITIAL_STATE = {
  venues: [
    { id: 1, name: 'Metropolitan Convention Center', city: 'New York', state: 'NY', address: '655 W 34th St, New York, NY 10001', capacity: 1200, amenities: 'High-speed Wi-Fi, 4K Projectors, VIP Lounge' },
    { id: 2, name: 'Grand Symphony Hall', city: 'Boston', state: 'MA', address: '301 Massachusetts Ave, Boston, MA 02115', capacity: 850, amenities: 'Acoustic Soundstage, Orchestra Pit' },
    { id: 3, name: 'Silicon Innovation Hub', city: 'San Francisco', state: 'CA', address: '450 Townsend St, San Francisco, CA 94107', capacity: 500, amenities: 'Fiber Optic LAN, Live Stream Booth' },
    { id: 4, name: 'Aurora Arts Pavilion', city: 'Chicago', state: 'IL', address: '201 E Randolph St, Chicago, IL 60602', capacity: 350, amenities: 'Gallery Lighting, Rooftop Terrace' },
    { id: 5, name: 'Olympus Sports Arena', city: 'Austin', state: 'TX', address: '2001 Robert Dedman Dr, Austin, TX 78712', capacity: 2500, amenities: 'LED Scoreboards, Broadcast Media Hub' }
  ],
  categories: [
    { id: 1, name: 'Technology & AI', slug: 'technology', icon: 'Cpu', badge_color: '#0284c7' },
    { id: 2, name: 'Music & Concerts', slug: 'music', icon: 'Music', badge_color: '#8b5cf6' },
    { id: 3, name: 'Business & Startups', slug: 'business', icon: 'Briefcase', badge_color: '#10b981' },
    { id: 4, name: 'Arts & Culture', slug: 'arts', icon: 'Palette', badge_color: '#f59e0b' },
    { id: 5, name: 'Sports & Fitness', slug: 'sports', icon: 'Trophy', badge_color: '#ef4444' }
  ],
  users: [
    { id: 1, name: 'Ishan Rawat', email: 'ishan.rawat@eventsphere.io', phone: '+1-555-0101', role: 'organizer' },
    { id: 2, name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+1-555-0201', role: 'attendee' }
  ],
  events: [
    {
      id: 1,
      title: 'Global AI & Autonomous Systems Summit 2026',
      description: 'Industry summit exploring generative agents, neural architectures, and enterprise AI systems.',
      category_id: 1,
      venue_id: 1,
      organizer_id: 1,
      event_date: '2026-12-05',
      start_time: '09:00',
      end_time: '17:30',
      banner_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
      total_seats: 600,
      base_price: 149.0,
      status: 'UPCOMING'
    }
  ],
  ticket_tiers: [
    { id: 1, event_id: 1, tier_name: 'Standard Pass', price: 149.0, total_allocation: 400, perks: 'Keynotes, Expo Floor Access, Lunch Buffet' },
    { id: 2, event_id: 1, tier_name: 'VIP All-Access', price: 299.0, total_allocation: 150, perks: 'Front Row Seating, Speaker Lounge Access, Gala Dinner' },
    { id: 3, event_id: 1, tier_name: 'Student Delegate', price: 79.0, total_allocation: 50, perks: 'Valid Student ID Required, Full Keynote Access' }
  ],
  bookings: [
    {
      id: 1,
      booking_reference: 'ES-2026-8812',
      user_id: 2,
      event_id: 1,
      ticket_tier_id: 2,
      quantity: 2,
      unit_price: 299.0,
      total_amount: 598.0,
      booking_status: 'CONFIRMED',
      payment_status: 'COMPLETED',
      notes: 'Sample VIP booking',
      booking_date: '2026-11-01 10:15:00',
      cancelled_at: null
    }
  ],
  tickets: [
    { id: 1, booking_id: 1, ticket_code: 'TKT-AI-001', seat_label: 'VIP-A01', status: 'VALID', qr_payload: 'ES:1:TKT-AI-001:USER-2' },
    { id: 2, booking_id: 1, ticket_code: 'TKT-AI-002', seat_label: 'VIP-A02', status: 'VALID', qr_payload: 'ES:1:TKT-AI-002:USER-2' }
  ],
  audit_logs: [
    { id: 1, action_type: 'BOOKING_CREATED', table_name: 'bookings', record_id: 1, details: 'Ref ES-2026-8812 | Qty: 2 | Amount: $598', created_at: '2026-11-01 10:15:00' }
  ]
};

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  const copy = JSON.parse(JSON.stringify(INITIAL_STATE));
  saveDb(copy);
  return copy;
}

function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (_) {}
}

function enrichEvent(db, e) {
  const cat = db.categories.find(c => c.id === Number(e.category_id)) || {};
  const ven = db.venues.find(v => v.id === Number(e.venue_id)) || {};
  const org = db.users.find(u => u.id === Number(e.organizer_id)) || {};
  const booked = db.bookings
    .filter(b => b.event_id === e.id && b.booking_status === 'CONFIRMED')
    .reduce((sum, b) => sum + b.quantity, 0);
  const remaining = Math.max(0, e.total_seats - booked);
  return {
    ...e,
    category_name: cat.name || 'General',
    category_slug: cat.slug || 'general',
    badge_color: cat.badge_color || '#4f46e5',
    venue_name: ven.name || 'TBD',
    venue_city: ven.city || 'Online',
    venue_state: ven.state || '',
    venue_address: ven.address || '',
    venue_capacity: ven.capacity || e.total_seats,
    venue_amenities: ven.amenities || '',
    organizer_name: org.name || 'Organizer',
    organizer_email: org.email || '',
    booked_seats: booked,
    remaining_seats: remaining,
    occupancy_percentage: Number(((booked * 100) / Math.max(1, e.total_seats)).toFixed(1))
  };
}

export const fallbackApi = {
  getEvents(params = {}) {
    const db = loadDb();
    let list = db.events.map(e => enrichEvent(db, e));
    if (params.category) list = list.filter(e => e.category_slug === params.category || e.category_name === params.category);
    if (params.city) list = list.filter(e => e.venue_city.toLowerCase() === params.city.toLowerCase());
    if (params.status) list = list.filter(e => e.status === params.status);
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.venue_name.toLowerCase().includes(q));
    }
    if (params.sort === 'price_low') list.sort((a, b) => a.base_price - b.base_price);
    else if (params.sort === 'price_high') list.sort((a, b) => b.base_price - a.base_price);
    else if (params.sort === 'popularity') list.sort((a, b) => b.booked_seats - a.booked_seats);
    else list.sort((a, b) => a.event_date.localeCompare(b.event_date));
    return { success: true, count: list.length, data: list };
  },

  getEventById(id) {
    const db = loadDb();
    const ev = db.events.find(e => e.id === Number(id));
    if (!ev) throw new Error('Event not found');
    const tiers = db.ticket_tiers.filter(t => t.event_id === ev.id);
    return { success: true, data: { ...enrichEvent(db, ev), ticket_tiers: tiers } };
  },

  createEvent(data) {
    const db = loadDb();
    const id = (db.events.reduce((m, e) => Math.max(m, e.id), 0) || 0) + 1;
    const newEv = {
      id,
      title: data.title,
      description: data.description || '',
      category_id: Number(data.category_id),
      venue_id: Number(data.venue_id),
      organizer_id: Number(data.organizer_id || 1),
      event_date: data.event_date,
      start_time: data.start_time || '10:00',
      end_time: data.end_time || '17:00',
      banner_url: data.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      total_seats: Number(data.total_seats || 100),
      base_price: Number(data.base_price || 0),
      status: data.status || 'UPCOMING'
    };
    db.events.push(newEv);
    db.ticket_tiers.push({ id: db.ticket_tiers.length + 1, event_id: id, tier_name: 'Standard Pass', price: newEv.base_price, total_allocation: newEv.total_seats, perks: 'General Event Access' });
    saveDb(db);
    return { success: true, data: enrichEvent(db, newEv) };
  },

  updateEvent(id, data) {
    const db = loadDb();
    const idx = db.events.findIndex(e => e.id === Number(id));
    if (idx === -1) throw new Error('Event not found');
    db.events[idx] = { ...db.events[idx], ...data };
    saveDb(db);
    return { success: true, data: enrichEvent(db, db.events[idx]) };
  },

  deleteEvent(id) {
    const db = loadDb();
    db.events = db.events.filter(e => e.id !== Number(id));
    saveDb(db);
    return { success: true };
  },

  getBookings(params = {}) {
    const db = loadDb();
    let list = db.bookings.map(b => {
      const u = db.users.find(x => x.id === b.user_id) || {};
      const e = db.events.find(x => x.id === b.event_id) || {};
      const v = db.venues.find(x => x.id === e.venue_id) || {};
      const c = db.categories.find(x => x.id === e.category_id) || {};
      const tt = db.ticket_tiers.find(x => x.id === b.ticket_tier_id) || {};
      const validCount = db.tickets.filter(t => t.booking_id === b.id && t.status === 'VALID').length;
      return {
        ...b,
        user_name: u.name, user_email: u.email, user_phone: u.phone,
        event_title: e.title, event_date: e.event_date, start_time: e.start_time, end_time: e.end_time, event_banner: e.banner_url,
        category_name: c.name, badge_color: c.badge_color,
        venue_name: v.name, venue_city: v.city, venue_address: v.address,
        tier_name: tt.tier_name || 'Standard Pass',
        valid_ticket_count: validCount
      };
    });
    if (params.userId) list = list.filter(b => b.user_id === Number(params.userId));
    if (params.eventId) list = list.filter(b => b.event_id === Number(params.eventId));
    if (params.status) list = list.filter(b => b.booking_status === params.status);
    return { success: true, count: list.length, data: list.reverse() };
  },

  getBookingById(id) {
    const all = this.getBookings().data;
    const found = all.find(b => b.id === Number(id));
    if (!found) throw new Error('Booking not found');
    const db = loadDb();
    return { success: true, data: { ...found, tickets: db.tickets.filter(t => t.booking_id === found.id) } };
  },

  bookTickets(payload) {
    const db = loadDb();
    const ev = enrichEvent(db, db.events.find(e => e.id === Number(payload.event_id)) || {});
    const qty = Number(payload.quantity);
    if (!ev.id || qty < 1) throw new Error('Invalid booking request');
    if (ev.remaining_seats < qty) throw new Error(`Only ${ev.remaining_seats} seat(s) remaining.`);
    const tier = db.ticket_tiers.find(t => t.id === Number(payload.ticket_tier_id));
    const unitPrice = tier ? tier.price : ev.base_price;
    const totalAmount = Number((unitPrice * qty).toFixed(2));
    const id = (db.bookings.reduce((m, b) => Math.max(m, b.id), 0) || 0) + 1;
    const ref = `ES-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const booking = {
      id,
      booking_reference: ref,
      user_id: Number(payload.user_id || 2),
      event_id: ev.id,
      ticket_tier_id: payload.ticket_tier_id ? Number(payload.ticket_tier_id) : null,
      quantity: qty,
      unit_price: unitPrice,
      total_amount: totalAmount,
      booking_status: 'CONFIRMED',
      payment_status: 'COMPLETED',
      notes: payload.notes || '',
      booking_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      cancelled_at: null
    };
    db.bookings.push(booking);
    const tickets = [];
    for (let i = 0; i < qty; i++) {
      const code = `TKT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const tkt = { id: db.tickets.length + 1, booking_id: id, ticket_code: code, seat_label: `STD-${100 + i}`, status: 'VALID', qr_payload: `ES:${ev.id}:${ref}:${code}` };
      db.tickets.push(tkt);
      tickets.push(tkt);
    }
    db.audit_logs.unshift({ id: db.audit_logs.length + 1, action_type: 'BOOKING_CREATED', table_name: 'bookings', record_id: id, details: `Ref ${ref} | Qty: ${qty} | Amount: $${totalAmount}`, created_at: booking.booking_date });
    saveDb(db);
    return { success: true, message: `Successfully booked ${qty} ticket(s)!`, booking: { ...booking, tickets } };
  },

  cancelBooking(id) {
    const db = loadDb();
    const b = db.bookings.find(x => x.id === Number(id));
    if (!b) throw new Error('Booking not found');
    b.booking_status = 'CANCELLED';
    b.payment_status = 'REFUNDED';
    b.cancelled_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    db.tickets.filter(t => t.booking_id === b.id).forEach(t => { t.status = 'CANCELLED'; });
    db.audit_logs.unshift({ id: db.audit_logs.length + 1, action_type: 'BOOKING_CANCELLED', table_name: 'bookings', record_id: b.id, details: `Ref ${b.booking_reference} | Refunded: $${b.total_amount}`, created_at: b.cancelled_at });
    saveDb(db);
    return { success: true, message: `Booking #${b.booking_reference} cancelled successfully.` };
  },

  getVenues() { return { success: true, data: loadDb().venues }; },
  getCategories() { return { success: true, data: loadDb().categories }; },
  getUsers(role = '') {
    const u = loadDb().users;
    return { success: true, data: role ? u.filter(x => x.role === role) : u };
  },

  getDbmsOverview() {
    const db = loadDb();
    const starRows = this.getBookings().data.slice(0, 10).map(b => ({
      booking_id: b.id, booking_reference: b.booking_reference, booking_date: b.booking_date,
      quantity: b.quantity, total_amount: b.total_amount, booking_status: b.booking_status,
      event_id: b.event_id, event_title: b.event_title, category_name: b.category_name,
      venue_name: b.venue_name, venue_city: b.venue_city, attendee_name: b.user_name
    }));
    const totalRev = db.bookings.filter(b => b.booking_status === 'CONFIRMED').reduce((s, b) => s + b.total_amount, 0);
    const windowMetrics = db.events.map((e, i) => {
      const cat = db.categories.find(c => c.id === e.category_id) || {};
      const confirmed = db.bookings.filter(b => b.event_id === e.id && b.booking_status === 'CONFIRMED');
      const rev = confirmed.reduce((s, b) => s + b.total_amount, 0);
      return {
        id: e.id, title: e.title, category_name: cat.name,
        total_bookings: db.bookings.filter(b => b.event_id === e.id).length,
        tickets_sold: confirmed.reduce((s, b) => s + b.quantity, 0),
        revenue: rev, revenue_rank: i + 1, platform_total_revenue: totalRev
      };
    });
    return {
      success: true,
      engine: 'Static Browser Store (Netlify Fallback)',
      units: {
        unit1_design: { title: 'Unit 1: Database Design & Relational Model', normal_form: '3NF / BCNF (7 normalized tables + audit_logs)', star_schema_view: 'v_fact_bookings_star', star_rows: starRows },
        unit2_sql: { title: 'Unit 2: SQL Queries, CTEs & Window Functions', window_metrics: windowMetrics },
        unit3_transactions: { title: 'Unit 3: ACID Transactions, Triggers & Security', acid_mode: 'BEGIN IMMEDIATE / COMMIT / ROLLBACK on bookings & cancellations', security: 'Parameterized queries (?) + CHECK constraints + Trigger auditing', audit_logs: db.audit_logs.slice(0, 10) },
        unit4_performance_nosql: {
          title: 'Unit 4: Query Optimization (EXPLAIN) & NoSQL Comparison',
          execution_plan: [{ detail: 'SEARCH events USING INDEX idx_events_status (status=?)' }, { detail: 'USE TEMP B-TREE FOR ORDER BY' }],
          nosql_document: starRows[0] ? { _collection: 'bookings_nosql', _id: starRows[0].booking_reference, bookingStatus: starRows[0].booking_status, quantity: starRows[0].quantity, totalAmount: starRows[0].total_amount, event: { id: starRows[0].event_id, title: starRows[0].event_title, category: starRows[0].category_name }, venue: { name: starRows[0].venue_name, city: starRows[0].venue_city }, attendee: starRows[0].attendee_name } : null
        }
      }
    };
  }
};
