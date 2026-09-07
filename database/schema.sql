-- ==========================================================
-- REPLATE Database Schema (MySQL 8.0+ Compatible)
-- Project: REPLATE - Premium Food-Surplus Rescue Platform
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS admin_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS impact_stats;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'restaurant', 'admin') DEFAULT 'customer',
    phone VARCHAR(25) DEFAULT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. RESTAURANTS TABLE
CREATE TABLE restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT DEFAULT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(80) DEFAULT 'Bengaluru',
    latitude DECIMAL(10, 7) DEFAULT 12.9716,
    longitude DECIMAL(10, 7) DEFAULT 77.5946,
    rating DECIMAL(2, 1) DEFAULT 4.8,
    reviews_count INT DEFAULT 42,
    cuisine VARCHAR(100) DEFAULT 'Artisanal & Contemporary',
    image VARCHAR(255) DEFAULT NULL,
    logo VARCHAR(255) DEFAULT NULL,
    status ENUM('active', 'pending', 'suspended') DEFAULT 'active',
    meals_saved_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_restaurant_city (city),
    INDEX idx_restaurant_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CATEGORIES TABLE
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'utensils',
    description VARCHAR(255) DEFAULT NULL,
    display_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. FOODS TABLE
CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    rescue_price DECIMAL(10, 2) NOT NULL,
    discount_percent INT GENERATED ALWAYS AS (ROUND(((original_price - rescue_price) / original_price) * 100)) STORED,
    quantity INT NOT NULL DEFAULT 1,
    initial_quantity INT NOT NULL DEFAULT 1,
    pickup_start VARCHAR(20) NOT NULL DEFAULT '18:00',
    pickup_end VARCHAR(20) NOT NULL DEFAULT '20:30',
    dietary ENUM('veg', 'non-veg', 'vegan') DEFAULT 'veg',
    allergens VARCHAR(255) DEFAULT 'Contains Dairy, Gluten',
    ingredients TEXT DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    status ENUM('available', 'reserved', 'sold_out') DEFAULT 'available',
    weight_grams INT DEFAULT 450,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_food_status (status),
    INDEX idx_food_category (category_id),
    INDEX idx_food_prices (rescue_price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. RESERVATIONS TABLE
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_code VARCHAR(32) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    pickup_time VARCHAR(50) NOT NULL,
    status ENUM('pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled') DEFAULT 'confirmed',
    notes VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_reservation_code (reservation_code),
    INDEX idx_reservation_status (status),
    INDEX idx_reservation_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. FAVORITES TABLE
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_food_fav (user_id, food_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. REVIEWS TABLE
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    food_id INT DEFAULT NULL,
    rating INT NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_review_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. IMPACT STATS TABLE
CREATE TABLE impact_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_meals_saved INT DEFAULT 12840,
    total_kg_diverted DECIMAL(10, 1) DEFAULT 3420.5,
    total_co2_kg_prevented DECIMAL(10, 1) DEFAULT 8551.2,
    total_money_saved_inr DECIMAL(12, 2) DEFAULT 2840900.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('reservation', 'pickup_reminder', 'listing_approved', 'system', 'cancellation') DEFAULT 'reservation',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. ADMIN AUDIT LOGS TABLE
CREATE TABLE admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
