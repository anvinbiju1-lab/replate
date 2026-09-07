<?php
/**
 * Admin Controller
 */

require_once __DIR__ . '/../config/Config.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Restaurant.php';
require_once __DIR__ . '/../models/Food.php';
require_once __DIR__ . '/../models/Reservation.php';
require_once __DIR__ . '/../models/Impact.php';

class AdminController {
    private User $userModel;
    private Restaurant $restaurantModel;
    private Food $foodModel;
    private Reservation $reservationModel;
    private Impact $impactModel;

    public function __construct() {
        $this->userModel = new User();
        $this->restaurantModel = new Restaurant();
        $this->foodModel = new Food();
        $this->reservationModel = new Reservation();
        $this->impactModel = new Impact();
    }

    private function checkAdmin(): bool {
        if (!Config::isLoggedIn()) return false;
        $user = Config::getCurrentUser();
        return $user['role'] === 'admin';
    }

    public function dashboard(): array {
        if (!$this->checkAdmin()) {
            return ['success' => false, 'error' => 'Admin authorization required.'];
        }

        $impact = $this->impactModel->getPlatformStats();
        $users = $this->userModel->getAll();
        $restaurants = $this->restaurantModel->getAll('active');
        $pendingRestaurants = $this->restaurantModel->getAll('pending');
        $allFoods = $this->foodModel->getAll([]);
        $reservations = $this->reservationModel->getAll();

        $db = Database::getInstance()->getConnection();
        $logs = $db->query("SELECT * FROM admin_logs ORDER BY id DESC LIMIT 10")->fetchAll();

        return [
            'success' => true,
            'metrics' => [
                'total_users' => count($users),
                'total_restaurants' => count($restaurants) + count($pendingRestaurants),
                'active_listings' => count($allFoods),
                'total_reservations' => count($reservations),
                'meals_rescued' => $impact['meals_rescued'],
                'kg_diverted' => $impact['kg_diverted'],
                'money_saved_inr' => $impact['money_saved_inr']
            ],
            'users' => array_slice($users, 0, 15),
            'restaurants' => $restaurants,
            'pending_restaurants' => $pendingRestaurants,
            'recent_reservations' => array_slice($reservations, 0, 10),
            'logs' => $logs
        ];
    }

    public function toggleRestaurantStatus(int $id, string $status): array {
        if (!$this->checkAdmin()) {
            return ['success' => false, 'error' => 'Admin authorization required.'];
        }
        $res = $this->restaurantModel->updateStatus($id, $status);
        return ['success' => $res, 'message' => "Restaurant status set to {$status}."];
    }

    public function toggleFoodStatus(int $id, string $status): array {
        if (!$this->checkAdmin()) {
            return ['success' => false, 'error' => 'Admin authorization required.'];
        }
        $res = $this->foodModel->updateStatus($id, $status);
        return ['success' => $res, 'message' => "Listing status set to {$status}."];
    }
}
