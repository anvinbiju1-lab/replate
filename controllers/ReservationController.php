<?php
/**
 * Reservation Controller
 */

require_once __DIR__ . '/../config/Config.php';
require_once __DIR__ . '/../models/Reservation.php';

class ReservationController {
    private Reservation $reservationModel;

    public function __construct() {
        $this->reservationModel = new Reservation();
    }

    public function create(array $data): array {
        if (!Config::isLoggedIn()) {
            return ['success' => false, 'error' => 'Please sign in or select the Demo Customer account to rescue this meal.'];
        }

        $user = Config::getCurrentUser();
        $foodId = (int)($data['food_id'] ?? 0);
        $qty = max(1, (int)($data['quantity'] ?? 1));

        if ($foodId <= 0) {
            return ['success' => false, 'error' => 'Invalid food item.'];
        }

        try {
            $reservation = $this->reservationModel->create([
                'user_id' => $user['id'],
                'food_id' => $foodId,
                'quantity' => $qty,
                'pickup_time' => $data['pickup_time'] ?? 'Today during pickup window',
                'notes' => $data['notes'] ?? ''
            ]);

            if (!$reservation) {
                return ['success' => false, 'error' => 'Sorry, this surplus drop is now sold out or requested quantity is unavailable.'];
            }

            return [
                'success' => true,
                'message' => 'Meal rescued successfully! Keep your pickup code handy.',
                'reservation' => $reservation
            ];
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Reservation failed: ' . $e->getMessage()];
        }
    }

    public function myReservations(): array {
        if (!Config::isLoggedIn()) {
            return ['success' => false, 'error' => 'Authentication required.', 'reservations' => []];
        }

        $user = Config::getCurrentUser();
        $reservations = $this->reservationModel->getByUser($user['id']);

        return [
            'success' => true,
            'count' => count($reservations),
            'reservations' => $reservations
        ];
    }

    public function restaurantReservations(int $restaurantId = 0): array {
        if (!Config::isLoggedIn()) {
            return ['success' => false, 'error' => 'Authentication required.', 'reservations' => []];
        }

        $user = Config::getCurrentUser();
        $rid = $restaurantId > 0 ? $restaurantId : ($user['restaurant_id'] ?? 1);

        $reservations = $this->reservationModel->getByRestaurant($rid);
        return [
            'success' => true,
            'count' => count($reservations),
            'reservations' => $reservations
        ];
    }

    public function updateStatus(int $id, string $status): array {
        if (!Config::isLoggedIn()) {
            return ['success' => false, 'error' => 'Authentication required.'];
        }

        $valid = ['pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled'];
        if (!in_array($status, $valid)) {
            return ['success' => false, 'error' => 'Invalid reservation status.'];
        }

        $res = $this->reservationModel->updateStatus($id, $status);
        return [
            'success' => $res,
            'message' => 'Reservation status updated to ' . ucwords(str_replace('_', ' ', $status))
        ];
    }
}
