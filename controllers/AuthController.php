<?php
/**
 * Auth Controller
 */

require_once __DIR__ . '/../config/Config.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Restaurant.php';

class AuthController {
    private User $userModel;
    private Restaurant $restaurantModel;

    public function __construct() {
        $this->userModel = new User();
        $this->restaurantModel = new Restaurant();
    }

    public function login(string $email, string $password): array {
        if (empty($email) || empty($password)) {
            return ['success' => false, 'error' => 'Please provide both email and password.'];
        }

        $user = $this->userModel->authenticate($email, $password);
        if (!$user) {
            return ['success' => false, 'error' => 'Invalid email or password.'];
        }

        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];

        if ($user['role'] === 'restaurant') {
            $rest = $this->restaurantModel->getByUserId((int)$user['id']);
            $_SESSION['restaurant_id'] = $rest ? (int)$rest['id'] : 1;
            $_SESSION['restaurant_name'] = $rest ? $rest['name'] : 'Partner Kitchen';
        }

        return [
            'success' => true,
            'message' => 'Welcome back, ' . $user['name'] . '!',
            'user' => [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'restaurant_id' => $_SESSION['restaurant_id'] ?? null
            ]
        ];
    }

    public function demoLogin(string $role): array {
        $roleMap = [
            'customer' => 'demo@replate.test',
            'restaurant' => 'restaurant@replate.test',
            'admin' => 'admin@replate.test'
        ];

        $targetEmail = $roleMap[$role] ?? 'demo@replate.test';
        $user = $this->userModel->findByEmail($targetEmail);

        if (!$user) {
            return ['success' => false, 'error' => 'Demo user not found.'];
        }

        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];

        if ($user['role'] === 'restaurant') {
            $rest = $this->restaurantModel->getByUserId((int)$user['id']);
            $_SESSION['restaurant_id'] = $rest ? (int)$rest['id'] : 1;
            $_SESSION['restaurant_name'] = $rest ? $rest['name'] : 'Casa Verde';
        } else {
            unset($_SESSION['restaurant_id'], $_SESSION['restaurant_name']);
        }

        return [
            'success' => true,
            'message' => 'Switched to ' . ucfirst($role) . ' persona: ' . $user['name'],
            'user' => [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'restaurant_id' => $_SESSION['restaurant_id'] ?? null
            ]
        ];
    }

    public function register(array $data): array {
        $email = strtolower(trim($data['email'] ?? ''));
        $name = trim($data['name'] ?? '');
        $password = $data['password'] ?? '';
        $role = in_array($data['role'] ?? '', ['customer', 'restaurant']) ? $data['role'] : 'customer';

        if (empty($name) || empty($email) || empty($password)) {
            return ['success' => false, 'error' => 'All required fields must be filled.'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'error' => 'Please enter a valid email address.'];
        }

        if (strlen($password) < 6) {
            return ['success' => false, 'error' => 'Password must be at least 6 characters.'];
        }

        if ($this->userModel->findByEmail($email)) {
            return ['success' => false, 'error' => 'An account with this email already exists.'];
        }

        $userId = $this->userModel->create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => $role,
            'phone' => $data['phone'] ?? null
        ]);

        if ($role === 'restaurant') {
            $restId = $this->restaurantModel->create([
                'user_id' => $userId,
                'name' => $data['restaurant_name'] ?? ($name . ' Kitchen'),
                'description' => $data['restaurant_description'] ?? 'Artisanal kitchen committed to zero-waste food rescue.',
                'address' => $data['address'] ?? 'Bengaluru, India',
                'city' => $data['city'] ?? 'Bengaluru',
                'cuisine' => $data['cuisine'] ?? 'Contemporary Sustainable',
                'status' => 'active'
            ]);
            $_SESSION['restaurant_id'] = $restId;
        }

        $_SESSION['user_id'] = $userId;
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_role'] = $role;

        return [
            'success' => true,
            'message' => 'Registration successful! Welcome to Replate.',
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'role' => $role,
                'restaurant_id' => $_SESSION['restaurant_id'] ?? null
            ]
        ];
    }

    public function logout(): array {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        return ['success' => true, 'message' => 'Logged out successfully.'];
    }

    public function me(): array {
        if (!Config::isLoggedIn()) {
            return ['authenticated' => false, 'user' => null];
        }
        $currentUser = Config::getCurrentUser();
        return ['authenticated' => true, 'user' => $currentUser];
    }
}
