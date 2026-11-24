-- ==============================================================
-- EventSphere - Clean Production Seed Data (1 Sample Event)
-- ==============================================================

-- 1. Venues (Dropdown reference data)
INSERT OR IGNORE INTO venues (id, name, city, state, address, capacity, amenities, contact_phone, image_url) VALUES
(1, 'Metropolitan Convention Center', 'New York', 'NY', '655 W 34th St, New York, NY 10001', 1200, 'High-speed Wi-Fi, 4K Projectors, VIP Lounge, Valet Parking', '+1-212-555-0199', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80'),
(2, 'Grand Symphony Hall', 'Boston', 'MA', '301 Massachusetts Ave, Boston, MA 02115', 850, 'Acoustic Soundstage, Orchestra Pit, Tiered Balcony, Coat Check', '+1-617-555-0142', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80'),
(3, 'Silicon Innovation Hub', 'San Francisco', 'CA', '450 Townsend St, San Francisco, CA 94107', 500, 'Fiber Optic LAN, Live Stream Booth, Demo Pods, Catering Area', '+1-415-555-0188', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80'),
(4, 'Aurora Arts Pavilion', 'Chicago', 'IL', '201 E Randolph St, Chicago, IL 60602', 350, 'Gallery Lighting, Sculpture Courtyard, Rooftop Terrace', '+1-312-555-0163', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1000&q=80'),
(5, 'Olympus Sports Arena', 'Austin', 'TX', '2001 Robert Dedman Dr, Austin, TX 78712', 2500, 'LED Scoreboards, Locker Rooms, Broadcast Media Hub, Medical Station', '+1-512-555-0174', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80');

-- 2. Categories (Dropdown reference data)
INSERT OR IGNORE INTO categories (id, name, slug, icon, badge_color, description) VALUES
(1, 'Technology & AI', 'technology', 'Cpu', '#0284c7', 'Software engineering, artificial intelligence, and developer summits.'),
(2, 'Music & Concerts', 'music', 'Music', '#8b5cf6', 'Live concerts, acoustic evenings, orchestras, and music festivals.'),
(3, 'Business & Startups', 'business', 'Briefcase', '#10b981', 'Venture capital pitching, networking, and startup summits.'),
(4, 'Arts & Culture', 'arts', 'Palette', '#f59e0b', 'Art exhibitions, theater plays, and creative showcases.'),
(5, 'Sports & Fitness', 'sports', 'Trophy', '#ef4444', 'Marathons, tournaments, and wellness bootcamps.');

-- 3. Users (1 Organizer + 1 Attendee)
INSERT OR IGNORE INTO users (id, name, email, phone, role, avatar_url) VALUES
(1, 'Ishan Rawat', 'ishan.rawat@eventsphere.io', '+1-555-0101', 'organizer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
(2, 'Sarah Jenkins', 'sarah.j@example.com', '+1-555-0201', 'attendee', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80');

-- 4. Single Sample Event
INSERT OR IGNORE INTO events (id, title, description, category_id, venue_id, organizer_id, event_date, start_time, end_time, banner_url, total_seats, base_price, status) VALUES
(1, 'Global AI & Autonomous Systems Summit 2026', 'Industry summit exploring generative agents, neural architectures, and enterprise AI systems.', 1, 1, 1, '2026-12-05', '09:00', '17:30', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', 600, 149.00, 'UPCOMING');

-- 5. Ticket Tiers for the Sample Event
INSERT OR IGNORE INTO ticket_tiers (id, event_id, tier_name, price, total_allocation, perks) VALUES
(1, 1, 'Standard Pass', 149.00, 400, 'Keynotes, Expo Floor Access, Lunch Buffet'),
(2, 1, 'VIP All-Access', 299.00, 150, 'Front Row Seating, Speaker Lounge Access, Gala Dinner'),
(3, 1, 'Student Delegate', 79.00, 50, 'Valid Student ID Required, Full Keynote Access');

-- 6. Single Sample Booking
INSERT OR IGNORE INTO bookings (id, booking_reference, user_id, event_id, ticket_tier_id, quantity, unit_price, total_amount, booking_status, payment_status, notes, booking_date) VALUES
(1, 'ES-2026-8812', 2, 1, 2, 2, 299.00, 598.00, 'CONFIRMED', 'COMPLETED', 'Sample VIP booking', '2026-11-01 10:15:00');

-- 7. Tickets for the Sample Booking
INSERT OR IGNORE INTO tickets (id, booking_id, ticket_code, seat_label, status, qr_payload) VALUES
(1, 1, 'TKT-AI-001', 'VIP-A01', 'VALID', 'ES:1:TKT-AI-001:USER-2'),
(2, 1, 'TKT-AI-002', 'VIP-A02', 'VALID', 'ES:1:TKT-AI-002:USER-2');
