<?php
/**
 * Food Controller
 */

require_once __DIR__ . '/../config/Config.php';
require_once __DIR__ . '/../models/Food.php';
require_once __DIR__ . '/../models/Restaurant.php';

class FoodController {
    private Food $foodModel;
    private Restaurant $restaurantModel;

    public function __construct() {
        $this->foodModel = new Food();
        $this->restaurantModel = new Restaurant();
    }

    public function index(array $params = []): array {
        $foods = $this->foodModel->getAll($params);
        return [
            'success' => true,
            'count' => count($foods),
            'foods' => $foods
        ];
    }

    public function show(int $id): array {
        $food = $this->foodModel->getById($id);
        if (!$food) {
            return ['success' => false, 'error' => 'Food item not found.'];
        }
        return ['success' => true, 'food' => $food];
    }

    public function categories(): array {
        $db = Database::getInstance()->getConnection();
        $cats = $db->query("
            SELECT c.*, COUNT(f.id) as active_foods_count 
            FROM categories c
            LEFT JOIN foods f ON f.category_id = c.id AND f.status = 'available'
            GROUP BY c.id
            ORDER BY c.display_order ASC
        ")->fetchAll();

        return ['success' => true, 'categories' => $cats];
    }

    public function create(array $data): array {
        if (!Config::isLoggedIn()) {
            return ['success' => false, 'error' => 'Authentication required.'];
        }

        $user = Config::getCurrentUser();
        if ($user['role'] !== 'restaurant' && $user['role'] !== 'admin') {
            return ['success' => false, 'error' => 'Only restaurant partners can list surplus food.'];
        }

        $restaurantId = $user['restaurant_id'] ?? 1;

        if (empty($data['name']) || empty($data['original_price']) || empty($data['rescue_price']) || empty($data['quantity'])) {
            return ['success' => false, 'error' => 'Please provide name, original price, rescue price, and quantity.'];
        }

        $orig = (float)$data['original_price'];
        $resc = (float)$data['rescue_price'];

        if ($resc >= $orig) {
            return ['success' => false, 'error' => 'Rescue price must be lower than original price to provide a surplus discount.'];
        }

        $data['restaurant_id'] = $restaurantId;
        $data['category_id'] = (int)($data['category_id'] ?? 2);

        $id = $this->foodModel->create($data);
        $newFood = $this->foodModel->getById($id);

        return [
            'success' => true,
            'message' => 'Surplus drop listed successfully! Customers can now discover and rescue it.',
            'food' => $newFood
        ];
    }

    public function updateStatus(int $id, string $status): array {
        if (!Config::isLoggedIn()) {
            return ['success' => false, 'error' => 'Authentication required.'];
        }
        $res = $this->foodModel->updateStatus($id, $status);
        return ['success' => $res, 'message' => 'Listing status updated to ' . $status];
    }

    public function featured(): array {
        $foods = $this->foodModel->getAll(['sort' => 'discount_desc']);
        $featured = array_slice($foods, 0, 6);
        return ['success' => true, 'featured' => $featured];
    }
}
