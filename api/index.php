<?php
/**
 * REPLATE Unified REST API Endpoint
 * Handles JSON requests and responses
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/Config.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/FoodController.php';
require_once __DIR__ . '/../controllers/ReservationController.php';
require_once __DIR__ . '/../controllers/RestaurantController.php';
require_once __DIR__ . '/../controllers/AdminController.php';
require_once __DIR__ . '/../controllers/ImpactController.php';

// Parse JSON body or form-data
$inputData = [];
if (!empty($_POST)) {
    $inputData = $_POST;
} else {
    $raw = file_get_contents('php://input');
    if (!empty($raw)) {
        $json = json_decode($raw, true);
        if (is_array($json)) {
            $inputData = $json;
        }
    }
}

// Merge GET query parameters into input data
$request = array_merge($_GET, $inputData);
$action = $request['action'] ?? '';

$authCtrl = new AuthController();
$foodCtrl = new FoodController();
$resCtrl = new ReservationController();
$restCtrl = new RestaurantController();
$adminCtrl = new AdminController();
$impactCtrl = new ImpactController();

try {
    switch ($action) {
        // --- AUTH ---
        case 'login':
            $email = $request['email'] ?? '';
            $password = $request['password'] ?? '';
            echo json_encode($authCtrl->login($email, $password));
            break;

        case 'demo_login':
            $role = $request['role'] ?? 'customer';
            echo json_encode($authCtrl->demoLogin($role));
            break;

        case 'register':
            echo json_encode($authCtrl->register($request));
            break;

        case 'logout':
            echo json_encode($authCtrl->logout());
            break;

        case 'me':
            echo json_encode($authCtrl->me());
            break;

        // --- FOODS & MARKETPLACE ---
        case 'get_foods':
            echo json_encode($foodCtrl->index($request));
            break;

        case 'get_food_detail':
            $id = (int)($request['id'] ?? 0);
            echo json_encode($foodCtrl->show($id));
            break;

        case 'get_categories':
            echo json_encode($foodCtrl->categories());
            break;

        case 'get_featured':
            echo json_encode($foodCtrl->featured());
            break;

        case 'add_surplus_food':
            echo json_encode($foodCtrl->create($request));
            break;

        // --- RESTAURANTS ---
        case 'get_restaurants':
            echo json_encode($restCtrl->index());
            break;

        case 'get_restaurant_detail':
            $id = (int)($request['id'] ?? 0);
            echo json_encode($restCtrl->show($id));
            break;

        case 'restaurant_dashboard':
            echo json_encode($restCtrl->dashboard());
            break;

        // --- RESERVATIONS ---
        case 'reserve':
            echo json_encode($resCtrl->create($request));
            break;

        case 'my_reservations':
            echo json_encode($resCtrl->myReservations());
            break;

        case 'restaurant_reservations':
            $rid = (int)($request['restaurant_id'] ?? 0);
            echo json_encode($resCtrl->restaurantReservations($rid));
            break;

        case 'update_reservation_status':
            $id = (int)($request['id'] ?? 0);
            $status = $request['status'] ?? 'confirmed';
            echo json_encode($resCtrl->updateStatus($id, $status));
            break;

        // --- IMPACT ---
        case 'get_platform_impact':
            echo json_encode($impactCtrl->platform());
            break;

        case 'get_personal_impact':
            echo json_encode($impactCtrl->personal());
            break;

        // --- ADMIN ---
        case 'admin_dashboard':
            echo json_encode($adminCtrl->dashboard());
            break;

        case 'admin_toggle_restaurant':
            $id = (int)($request['id'] ?? 0);
            $status = $request['status'] ?? 'active';
            echo json_encode($adminCtrl->toggleRestaurantStatus($id, $status));
            break;

        case 'admin_toggle_food':
            $id = (int)($request['id'] ?? 0);
            $status = $request['status'] ?? 'available';
            echo json_encode($adminCtrl->toggleFoodStatus($id, $status));
            break;

        default:
            echo json_encode([
                'success' => false,
                'error' => 'Unknown action: ' . htmlspecialchars($action),
                'available_actions' => [
                    'login', 'demo_login', 'register', 'logout', 'me',
                    'get_foods', 'get_food_detail', 'get_categories', 'get_featured', 'add_surplus_food',
                    'get_restaurants', 'get_restaurant_detail', 'restaurant_dashboard',
                    'reserve', 'my_reservations', 'restaurant_reservations', 'update_reservation_status',
                    'get_platform_impact', 'get_personal_impact',
                    'admin_dashboard', 'admin_toggle_restaurant', 'admin_toggle_food'
                ]
            ]);
            break;
    }
} catch (Throwable $t) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $t->getMessage(),
        'file' => basename($t->getFile()),
        'line' => $t->getLine()
    ]);
}
