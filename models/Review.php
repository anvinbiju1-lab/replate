<?php
/**
 * Review Model
 */

require_once __DIR__ . '/../config/Database.php';

class Review {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getByRestaurant(int $restaurantId): array {
        $stmt = $this->db->prepare("
            SELECT rev.*, u.name as customer_name, u.avatar as customer_avatar
            FROM reviews rev
            JOIN users u ON rev.user_id = u.id
            WHERE rev.restaurant_id = :rid
            ORDER BY rev.id DESC
        ");
        $stmt->execute(['rid' => $restaurantId]);
        return $stmt->fetchAll();
    }

    public function getFeatured(): array {
        $stmt = $this->db->query("
            SELECT rev.*, u.name as customer_name, rest.name as restaurant_name
            FROM reviews rev
            JOIN users u ON rev.user_id = u.id
            JOIN restaurants rest ON rev.restaurant_id = rest.id
            ORDER BY rev.rating DESC, rev.id DESC
            LIMIT 6
        ");
        return $stmt->fetchAll();
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("
            INSERT INTO reviews (user_id, restaurant_id, food_id, rating, comment)
            VALUES (:uid, :rid, :fid, :rating, :comment)
        ");
        $stmt->execute([
            'uid' => $data['user_id'],
            'rid' => $data['restaurant_id'],
            'fid' => $data['food_id'] ?? null,
            'rating' => max(1, min(5, (int)$data['rating'])),
            'comment' => $data['comment']
        ]);
        return (int)$this->db->lastInsertId();
    }
}
