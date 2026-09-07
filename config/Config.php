<?php
/**
 * REPLATE Configuration System
 * Project: REPLATE - Premium Food-Surplus Rescue Platform
 */

// Start session securely if not already active
if (session_status() === PHP_SESSION_NONE) {
    if (!empty(sys_get_temp_dir()) && is_dir(sys_get_temp_dir())) {
        @session_save_path(sys_get_temp_dir());
    }
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    @session_start();
}

class Config {
    // Application Metadata
    const APP_NAME = 'REPLATE';
    const APP_TAGLINE = 'Rescue food. Reduce waste.';
    const APP_VERSION = '2.4.0';
    const CURRENCY_SYMBOL = '₹';
    const CURRENCY_CODE = 'INR';

    // MySQL Database Settings (Default for XAMPP / LAMP / MAMP)
    const DB_HOST = '127.0.0.1';
    const DB_PORT = '3306';
    const DB_NAME = 'replate_db';
    const DB_USER = 'root';
    const DB_PASS = '';
    const DB_CHARSET = 'utf8mb4';

    // SQLite Fallback (Auto-activated when local MySQL daemon is not running)
    const SQLITE_FILE = __DIR__ . '/../database/replate.sqlite';

    // Uploads
    const UPLOADS_DIR = __DIR__ . '/../uploads/';

    /**
     * Format Indian Rupee currency cleanly without character collision
     */
    public static function formatCurrency($amount): string {
        return self::CURRENCY_SYMBOL . number_format((float)$amount, 0);
    }

    /**
     * Sanitize output to prevent XSS
     */
    public static function escape(?string $str): string {
        return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8');
    }

    /**
     * CSRF Token generation and verification
     */
    public static function getCsrfToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public static function verifyCsrfToken(?string $token): bool {
        if (!isset($_SESSION['csrf_token']) || empty($token)) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Check if user is logged in
     */
    public static function isLoggedIn(): bool {
        return !empty($_SESSION['user_id']);
    }

    /**
     * Get current user details from session
     */
    public static function getCurrentUser(): ?array {
        if (!self::isLoggedIn()) {
            return null;
        }
        return [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'] ?? 'Guest',
            'email' => $_SESSION['user_email'] ?? '',
            'role' => $_SESSION['user_role'] ?? 'customer',
            'restaurant_id' => $_SESSION['restaurant_id'] ?? null
        ];
    }
}
