<?php
/**
 * Restaurant Model
 */

require_once __DIR__ . '/../config/Database.php';

class Restaurant {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll(string $status = 'active'): array {
        $stmt = $this->db->prepare("
            SELECT r.*, COUNT(f.id) as active_foods_count
            FROM restaurants r
            LEFT JOIN foods f ON f.restaurant_id = r.id AND f.status = 'available'
            WHERE r.status = :status
            GROUP BY r.id
            ORDER BY r.rating DESC, r.meals_saved_count DESC
        ");
        $stmt->execute(['status' => $status]);
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM restaurants WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $restaurant = $stmt->fetch();
        return $restaurant ?: null;
    }

    public function getByUserId(int $userId): ?array {
        $stmt = $this->db->prepare("SELECT * FROM restaurants WHERE user_id = :user_id LIMIT 1");
        $stmt->execute(['user_id' => $userId]);
        $restaurant = $stmt->fetch();
        return $restaurant ?: null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("
            INSERT INTO restaurants (user_id, name, description, address, city, latitude, longitude, rating, cuisine, image, logo, status)
            VALUES (:user_id, :name, :description, :address, :city, :latitude, :longitude, :rating, :cuisine, :image, :logo, :status)
        ");
        $stmt->execute([
            'user_id' => $data['user_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'address' => $data['address'],
            'city' => $data['city'] ?? 'Bengaluru',
            'latitude' => $data['latitude'] ?? 12.9716,
            'longitude' => $data['longitude'] ?? 77.5946,
            'rating' => $data['rating'] ?? 5.0,
            'cuisine' => $data['cuisine'] ?? 'Artisanal & Contemporary',
            'image' => $data['image'] ?? 'restaurant-default.webp',
            'logo' => $data['logo'] ?? 'logo-default.webp',
            'status' => $data['status'] ?? 'active'
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function updateStatus(int $id, string $status): bool {
        $stmt = $this->db->prepare("UPDATE restaurants SET status = :status WHERE id = :id");
        return $stmt->execute(['status' => $status, 'id' => $id]);
    }

    public function incrementMealsSaved(int $restaurantId, int $count = 1): void {
        $stmt = $this->db->prepare("UPDATE restaurants SET meals_saved_count = meals_saved_count + :count WHERE id = :id");
        $stmt->execute(['count' => $count, 'id' => $restaurantId]);
    }

    public function getDashboardMetrics(int $restaurantId): array {
        // Today's rescued meals & revenue
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) as total_reservations,
                COALESCE(SUM(quantity), 0) as meals_rescued,
                COALESCE(SUM(total_price), 0) as revenue_recovered,
                SUM(CASE WHEN status = 'ready_for_pickup' OR status = 'confirmed' THEN 1 ELSE 0 END) as pending_pickups,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_pickups
            FROM reservations 
            WHERE restaurant_id = :restaurant_id
        ");
        $stmt->execute(['restaurant_id' => $restaurantId]);
        $res = $stmt->fetch();

        // Active listings
        $stmtListings = $this->db->prepare("
            SELECT COUNT(*) FROM foods WHERE restaurant_id = :restaurant_id AND status = 'available'
        ");
        $stmtListings->execute(['restaurant_id' => $restaurantId]);
        $activeListings = (int)$stmtListings->fetchColumn();

        return [
            'meals_rescued' => (int)$res['meals_rescued'],
            'revenue_recovered' => (float)$res['revenue_recovered'],
            'pending_pickups' => (int)$res['pending_pickups'],
            'completed_pickups' => (int)$res['completed_pickups'],
            'active_listings' => $activeListings,
            'food_waste_prevented_kg' => round((int)$res['meals_rescued'] * 0.45, 1)
        ];
    }
}
