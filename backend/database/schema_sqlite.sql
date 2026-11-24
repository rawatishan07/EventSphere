-- ==============================================================
-- EventSphere - Relational Database Schema (SQLite 3.25+)
-- ==============================================================

PRAGMA foreign_keys = ON;

-- 1. Venues Table
CREATE TABLE IF NOT EXISTS venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    address TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    amenities TEXT,
    contact_phone TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT 'Calendar',
    badge_color TEXT DEFAULT '#0284c7',
    description TEXT
);

-- 3. Users Table (Attendees, Organizers, Admins)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'attendee' CHECK (role IN ('attendee', 'organizer', 'admin')),
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Events Table
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    event_date TEXT NOT NULL, -- YYYY-MM-DD
    start_time TEXT NOT NULL, -- HH:MM
    end_time TEXT,            -- HH:MM
    banner_url TEXT,
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    base_price REAL NOT NULL CHECK (base_price >= 0),
    status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Ticket Tiers Table (e.g., General, VIP, Early Bird, Student)
CREATE TABLE IF NOT EXISTS ticket_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    total_allocation INTEGER NOT NULL CHECK (total_allocation > 0),
    perks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bookings Table (Manages ticket purchases & cancellations)
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_reference TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
    ticket_tier_id INTEGER REFERENCES ticket_tiers(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL CHECK (unit_price >= 0),
    total_amount REAL NOT NULL CHECK (total_amount >= 0),
    booking_status TEXT DEFAULT 'CONFIRMED' CHECK (booking_status IN ('CONFIRMED', 'CANCELLED', 'REFUNDED')),
    payment_status TEXT DEFAULT 'COMPLETED' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'REFUNDED')),
    notes TEXT,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME
);

-- 7. Tickets Table (Individual generated pass for each seat booked)
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    ticket_code TEXT NOT NULL UNIQUE,
    seat_label TEXT,
    status TEXT DEFAULT 'VALID' CHECK (status IN ('VALID', 'USED', 'CANCELLED')),
    qr_payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(ticket_code);

-- 8. Audit Logs Table (Unit 3: Triggers & Security Auditing)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Unit 3: Automated Triggers for Booking & Cancellation Auditing
CREATE TRIGGER IF NOT EXISTS trg_booking_audit_insert
AFTER INSERT ON bookings
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, details)
    VALUES ('BOOKING_CREATED', 'bookings', NEW.id, 'Ref ' || NEW.booking_reference || ' | Qty: ' || NEW.quantity || ' | Amount: $' || NEW.total_amount);
END;

CREATE TRIGGER IF NOT EXISTS trg_booking_audit_cancel
AFTER UPDATE OF booking_status ON bookings
WHEN NEW.booking_status = 'CANCELLED' AND OLD.booking_status != 'CANCELLED'
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, details)
    VALUES ('BOOKING_CANCELLED', 'bookings', NEW.id, 'Ref ' || NEW.booking_reference || ' | Refunded: $' || NEW.total_amount);
END;

-- Unit 1 & 2: Star Schema Fact-Dimension View for Analytics
CREATE VIEW IF NOT EXISTS v_fact_bookings_star AS
SELECT
    b.id AS booking_id,
    b.booking_reference,
    b.booking_date,
    b.quantity,
    b.total_amount,
    b.booking_status,
    e.id AS event_id,
    e.title AS event_title,
    c.name AS category_name,
    v.name AS venue_name,
    v.city AS venue_city,
    u.name AS attendee_name
FROM bookings b
JOIN events e ON b.event_id = e.id
JOIN categories c ON e.category_id = c.id
JOIN venues v ON e.venue_id = v.id
JOIN users u ON b.user_id = u.id;
