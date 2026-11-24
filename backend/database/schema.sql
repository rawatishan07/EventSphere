-- ==============================================================
-- EventSphere - Relational Database Schema (MySQL 8.0+)
-- Features: Strict foreign keys, indexes, timestamps, InnoDB engine
-- ==============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Venues Table
CREATE TABLE IF NOT EXISTS venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50),
    address VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    amenities TEXT,
    contact_phone VARCHAR(50),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'Calendar',
    badge_color VARCHAR(50) DEFAULT '#0284c7',
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Users Table (Attendees, Organizers, Admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'attendee',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Events Table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    venue_id INT NOT NULL,
    organizer_id INT NOT NULL,
    event_date VARCHAR(20) NOT NULL, -- YYYY-MM-DD
    start_time VARCHAR(20) NOT NULL, -- HH:MM
    end_time VARCHAR(20),            -- HH:MM
    banner_url VARCHAR(500),
    total_seats INT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_events_date (event_date),
    INDEX idx_events_category (category_id),
    INDEX idx_events_venue (venue_id),
    INDEX idx_events_status (status),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE RESTRICT,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Ticket Tiers Table (e.g., General, VIP, Early Bird, Student)
CREATE TABLE IF NOT EXISTS ticket_tiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    tier_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_allocation INT NOT NULL,
    perks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tiers_event (event_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Bookings Table (Manages ticket purchases & cancellations)
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(100) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    ticket_tier_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status VARCHAR(50) DEFAULT 'CONFIRMED',
    payment_status VARCHAR(50) DEFAULT 'COMPLETED',
    notes TEXT,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_event (event_id),
    INDEX idx_bookings_status (booking_status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT,
    FOREIGN KEY (ticket_tier_id) REFERENCES ticket_tiers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tickets Table (Individual generated pass for each seat booked)
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    ticket_code VARCHAR(100) NOT NULL UNIQUE,
    seat_label VARCHAR(100),
    status VARCHAR(50) DEFAULT 'VALID',
    qr_payload TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tickets_code (ticket_code),
    INDEX idx_tickets_booking (booking_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
