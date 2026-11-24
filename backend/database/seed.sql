-- ==============================================================
-- EventSphere - Seed Data with Realistic Multi-Category Events (MySQL)
-- ==============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Venues
INSERT IGNORE INTO venues (id, name, city, state, address, capacity, amenities, contact_phone, image_url) VALUES
(1, 'Metropolitan Convention Center', 'New York', 'NY', '655 W 34th St, New York, NY 10001', 1200, 'High-speed Wi-Fi, 4K Projectors, VIP Lounge, Valet Parking', '+1-212-555-0199', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80'),
(2, 'Grand Symphony Hall', 'Boston', 'MA', '301 Massachusetts Ave, Boston, MA 02115', 850, 'Acoustic Soundstage, Orchestra Pit, Tiered Balcony, Coat Check', '+1-617-555-0142', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80'),
(3, 'Silicon Innovation Hub', 'San Francisco', 'CA', '450 Townsend St, San Francisco, CA 94107', 500, 'Fiber Optic LAN, Live Stream Booth, Demo Pods, Catering Area', '+1-415-555-0188', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80'),
(4, 'Aurora Arts Pavilion', 'Chicago', 'IL', '201 E Randolph St, Chicago, IL 60602', 350, 'Gallery Lighting, Sculpture Courtyard, Rooftop Terrace', '+1-312-555-0163', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1000&q=80'),
(5, 'Olympus Sports Arena', 'Austin', 'TX', '2001 Robert Dedman Dr, Austin, TX 78712', 2500, 'LED Scoreboards, Locker Rooms, Broadcast Media Hub, Medical Station', '+1-512-555-0174', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80');

-- 2. Categories
INSERT IGNORE INTO categories (id, name, slug, icon, badge_color, description) VALUES
(1, 'Technology & AI', 'technology', 'Cpu', '#0284c7', 'Cutting-edge software engineering, artificial intelligence, and developer summits.'),
(2, 'Music & Concerts', 'music', 'Music', '#8b5cf6', 'Live concerts, acoustic evenings, orchestras, and indie music festivals.'),
(3, 'Business & Startups', 'business', 'Briefcase', '#10b981', 'Venture capital pitching, networking, leadership, and startup summits.'),
(4, 'Arts & Culture', 'arts', 'Palette', '#f59e0b', 'Contemporary art exhibitions, theater plays, and creative showcases.'),
(5, 'Sports & Fitness', 'sports', 'Trophy', '#ef4444', 'Marathons, tournaments, wellness bootcamps, and eSports championships.');

-- 3. Users (Organizers & Attendees)
INSERT IGNORE INTO users (id, name, email, phone, role, avatar_url) VALUES
(1, 'Ishan Rawat', 'ishan.rawat@eventsphere.io', '+1-555-0101', 'organizer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
(2, 'Elena Rostova', 'elena.rostova@techsummit.org', '+1-555-0102', 'organizer', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'),
(3, 'Marcus Vance', 'marcus.v@austinsports.com', '+1-555-0103', 'organizer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
(4, 'Sarah Jenkins', 'sarah.j@example.com', '+1-555-0201', 'attendee', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'),
(5, 'David Kim', 'david.kim@example.com', '+1-555-0202', 'attendee', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'),
(6, 'Priya Patel', 'priya.patel@example.com', '+1-555-0203', 'attendee', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'),
(7, 'Alex Rivera', 'alex.rivera@example.com', '+1-555-0204', 'attendee', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'),
(8, 'Chloe Bennett', 'chloe.b@example.com', '+1-555-0205', 'attendee', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80');

-- 4. Events
INSERT IGNORE INTO events (id, title, description, category_id, venue_id, organizer_id, event_date, start_time, end_time, banner_url, total_seats, base_price, status) VALUES
(1, 'Global AI & Autonomous Systems Summit 2026', 'Join over 800 industry pioneers exploring generative agents, neural architectures, and enterprise AI transformation.', 1, 1, 1, '2026-12-05', '09:00', '17:30', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', 600, 149.00, 'UPCOMING'),
(2, 'Midnight Philharmonic: Chopin & Stravinsky Live', 'An enchanting evening of classical masterpieces performed by the Boston Metropolitan Philharmonic Orchestra.', 2, 2, 2, '2026-11-28', '19:30', '22:00', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80', 450, 65.00, 'UPCOMING'),
(3, 'VenturePulse: Next-Gen Startup Pitch Day', '50 venture capital funds meet 20 hand-picked seed stage startups disrupting cloud, climate tech, and fintech.', 3, 3, 1, '2026-12-12', '10:00', '18:00', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80', 300, 95.00, 'UPCOMING'),
(4, 'Neo-Impressionism & Digital Art Biennial', 'An immersive gallery experience bridging physical oil paintings with holographic and generative digital installations.', 4, 4, 2, '2026-12-18', '11:00', '20:00', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80', 250, 35.00, 'UPCOMING'),
(5, 'Apex National CrossFit & Endurance Open', 'The premier athletic clash featuring endurance athletes competing in high-octane obstacle runs and strength trials.', 5, 5, 3, '2026-12-20', '08:00', '16:00', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', 1200, 45.00, 'UPCOMING'),
(6, 'Full-Stack React & Node Cloud Architecture Day', 'Deep-dive masterclass into high-performance distributed systems, state machines, and micro-frontends.', 1, 3, 1, '2026-12-22', '09:30', '16:30', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80', 180, 80.00, 'UPCOMING');

-- 5. Ticket Tiers
INSERT IGNORE INTO ticket_tiers (id, event_id, tier_name, price, total_allocation, perks) VALUES
(1, 1, 'Standard Pass', 149.00, 400, 'Keynotes, Expo Floor Access, Lunch Buffet'),
(2, 1, 'VIP All-Access', 299.00, 150, 'Front Row Seating, Speaker Lounge Access, Exclusive Gala Dinner'),
(3, 1, 'Student Delegate', 79.00, 50, 'Valid Student ID Required, Full Keynote Access'),
(4, 2, 'Orchestra Stalls', 85.00, 200, 'Prime acoustical positioning in Center Stalls'),
(5, 2, 'Balcony Tier', 55.00, 250, 'Elevated panoramic views of the stage'),
(6, 3, 'Founder Pass', 95.00, 180, 'Full Pitch Hall Access & Networking Cocktail'),
(7, 3, 'Investor Ticket', 250.00, 120, 'Direct Investor Lounge, Startup Deal-Book Access'),
(8, 4, 'General Admission', 35.00, 200, 'Access to all main gallery installations'),
(9, 4, 'Curator Guided Tour', 60.00, 50, 'Private 1-hour walkthrough with chief curator'),
(10, 5, 'Spectator Bleacher', 45.00, 900, 'Arena seating, digital replay feed access'),
(11, 5, 'Athlete Competitor', 110.00, 300, 'Competitor entry, event jersey, recovery zone access'),
(12, 6, 'Developer Seat', 80.00, 180, 'Hands-on lab access, code repos, certificate');

-- 6. Initial Seed Bookings (Diverse timeline to demonstrate Window Functions & Analytics)
INSERT IGNORE INTO bookings (id, booking_reference, user_id, event_id, ticket_tier_id, quantity, unit_price, total_amount, booking_status, payment_status, notes, booking_date) VALUES
(1, 'ES-2026-8812', 4, 1, 2, 2, 299.00, 598.00, 'CONFIRMED', 'COMPLETED', 'VIP booking for engineering directors', '2026-11-01 10:15:00'),
(2, 'ES-2026-8813', 5, 1, 1, 3, 149.00, 447.00, 'CONFIRMED', 'COMPLETED', 'Dev team passes', '2026-11-02 14:30:00'),
(3, 'ES-2026-8814', 6, 2, 4, 2, 85.00, 170.00, 'CONFIRMED', 'COMPLETED', 'Classical anniversary date night', '2026-11-03 09:20:00'),
(4, 'ES-2026-8815', 7, 3, 7, 1, 250.00, 250.00, 'CONFIRMED', 'COMPLETED', 'Angel investor ticket', '2026-11-05 11:45:00'),
(5, 'ES-2026-8816', 8, 4, 9, 2, 60.00, 120.00, 'CONFIRMED', 'COMPLETED', 'Curator private tour for 2', '2026-11-06 16:10:00'),
(6, 'ES-2026-8817', 4, 5, 10, 4, 45.00, 180.00, 'CONFIRMED', 'COMPLETED', 'Friends group spectator seats', '2026-11-08 12:05:00'),
(7, 'ES-2026-8818', 5, 2, 5, 2, 55.00, 110.00, 'CANCELLED', 'REFUNDED', 'Customer had a schedule conflict', '2026-11-09 15:30:00'),
(8, 'ES-2026-8819', 6, 1, 3, 2, 79.00, 158.00, 'CONFIRMED', 'COMPLETED', 'AI student researchers', '2026-11-10 13:00:00'),
(9, 'ES-2026-8820', 7, 6, 12, 1, 80.00, 80.00, 'CONFIRMED', 'COMPLETED', 'Cloud architecture masterclass', '2026-11-12 17:40:00');

UPDATE bookings SET cancelled_at = '2026-11-10 11:00:00' WHERE id = 7;

-- 7. Initial Seed Tickets for Confirmed Bookings
INSERT IGNORE INTO tickets (id, booking_id, ticket_code, seat_label, status, qr_payload) VALUES
(1, 1, 'TKT-AI-001', 'VIP-A01', 'VALID', 'ES:1:TKT-AI-001:USER-4'),
(2, 1, 'TKT-AI-002', 'VIP-A02', 'VALID', 'ES:1:TKT-AI-002:USER-4'),
(3, 2, 'TKT-AI-003', 'STD-B12', 'VALID', 'ES:1:TKT-AI-003:USER-5'),
(4, 2, 'TKT-AI-004', 'STD-B13', 'VALID', 'ES:1:TKT-AI-004:USER-5'),
(5, 2, 'TKT-AI-005', 'STD-B14', 'VALID', 'ES:1:TKT-AI-005:USER-5'),
(6, 3, 'TKT-MS-001', 'ORC-C04', 'VALID', 'ES:2:TKT-MS-001:USER-6'),
(7, 3, 'TKT-MS-002', 'ORC-C05', 'VALID', 'ES:2:TKT-MS-002:USER-6'),
(8, 4, 'TKT-VP-001', 'INV-D01', 'VALID', 'ES:3:TKT-VP-001:USER-7'),
(9, 5, 'TKT-AR-001', 'CUR-E10', 'VALID', 'ES:4:TKT-AR-001:USER-8'),
(10, 5, 'TKT-AR-002', 'CUR-E11', 'VALID', 'ES:4:TKT-AR-002:USER-8'),
(11, 6, 'TKT-SP-001', 'BLC-F21', 'VALID', 'ES:5:TKT-SP-001:USER-4'),
(12, 6, 'TKT-SP-002', 'BLC-F22', 'VALID', 'ES:5:TKT-SP-002:USER-4'),
(13, 6, 'TKT-SP-003', 'BLC-F23', 'VALID', 'ES:5:TKT-SP-003:USER-4'),
(14, 6, 'TKT-SP-004', 'BLC-F24', 'VALID', 'ES:5:TKT-SP-004:USER-4'),
(15, 7, 'TKT-MS-003', 'BAL-G05', 'CANCELLED', 'ES:2:TKT-MS-003:USER-5'),
(16, 7, 'TKT-MS-004', 'BAL-G06', 'CANCELLED', 'ES:2:TKT-MS-004:USER-5'),
(17, 8, 'TKT-AI-006', 'STU-H01', 'VALID', 'ES:1:TKT-AI-006:USER-6'),
(18, 8, 'TKT-AI-007', 'STU-H02', 'VALID', 'ES:1:TKT-AI-007:USER-6'),
(19, 9, 'TKT-RD-001', 'LAB-J08', 'VALID', 'ES:6:TKT-RD-001:USER-7');

SET FOREIGN_KEY_CHECKS = 1;
