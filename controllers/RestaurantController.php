<?php
/**
 * Restaurant Controller
 */

require_once __DIR__ . '/../config/Config.php';
require_once __DIR__ . '/../models/Restaurant.php';
require_once __DIR__ . '/../models/Food.php';
require_once __DIR__ . '/../models/Review.php';

class RestaurantController {
    private Restaurant $restaurantModel;
    private Food $foodModel;
    private Review $reviewModel;

    public function __construct() {
        $this->restaurantModel = new Restaurant();
        $this->foodModel = new Food();
        $this->reviewModel = new Review();
    }

    public function index(): array {
        $restaurants = $this->restaurantModel->getAll('active');
        return ['success' => true, 'restaurants' => $restaurants];
    }

    public function show(int $id): array {
        $restaurant = $this->restaurantModel->getById($id);
        if (!$restaurant) {
            return ['success' => false, 'error' => 'Restaurant not found.'];
        }

        $foods = $this->foodModel->getAll(['restaurant_id' => $id, 'status' => 'available']);
        $reviews = $this->reviewModel->getByRestaurant($id);

        return [
            'success' => true,
            'restaurant' => $restaurant,
            'foods' => $foods,
            'reviews' => $reviews
        ];
    }

    public function dashboard(): array {
        if (!Config::isLoggedIn()) {
            return ['success' => false, 'error' => 'Authentication required.'];
        }

        $user = Config::getCurrentUser();
        $rid = $user['restaurant_id'] ?? 1;

        $restaurant = $this->restaurantModel->getById($rid);
        $metrics = $this->restaurantModel->getDashboardMetrics($rid);
        $foods = $this->foodModel->getAll(['restaurant_id' => $rid]);

        return [
            'success' => true,
            'restaurant' => $restaurant,
            'metrics' => $metrics,
            'listings' => $foods
        ];
    }
}
