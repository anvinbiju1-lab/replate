<?php
/**
 * Reservation Model
 */

require_once __DIR__ . '/../config/Database.php';

class Reservation {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public static function generateCode(string $restaurantName = ''): string {
        $prefix = 'REP';
        $rand = rand(1000, 9999);
        $code = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $restaurantName), 0, 2));
        if (strlen($code) < 2) $code = 'FD';
        return "{$prefix}-{$rand}-{$code}";
    }

    public function create(array $data): ?array {
        $foodId = (int)$data['food_id'];
        $userId = (int)$data['user_id'];
        $qty = max(1, (int)$data['quantity']);

        // Check availability
        $stmtFood = $this->db->prepare("SELECT * FROM foods WHERE id = :id AND status = 'available' AND quantity >= :qty");
        $stmtFood->execute(['id' => $foodId, 'qty' => $qty]);
        $food = $stmtFood->fetch();

        if (!$food) {
            return null; // Sold out or insufficient quantity
        }

        // Fetch restaurant
        $stmtRest = $this->db->prepare("SELECT name FROM restaurants WHERE id = :id");
        $stmtRest->execute(['id' => $food['restaurant_id']]);
        $restName = $stmtRest->fetchColumn() ?: 'Replate';

        $code = self::generateCode($restName);
        $unitPrice = (float)$food['rescue_price'];
        $totalPrice = $unitPrice * $qty;
        $pickupTime = $data['pickup_time'] ?? ($food['pickup_start'] . ' – ' . $food['pickup_end']);

        try {
            $this->db->beginTransaction();

            // Decrement food quantity
            $stmtUpdateFood = $this->db->prepare("
                UPDATE foods 
                SET quantity = quantity - :qty,
                    status = CASE WHEN quantity - :qty <= 0 THEN 'sold_out' ELSE status END
                WHERE id = :id AND quantity >= :qty
            ");
            $stmtUpdateFood->execute(['qty' => $qty, 'id' => $foodId]);

            // Create reservation record
            $stmtRes = $this->db->prepare("
                INSERT INTO reservations (
                    reservation_code, user_id, food_id, restaurant_id, quantity, unit_price, total_price, pickup_time, status, notes
                ) VALUES (
                    :reservation_code, :user_id, :food_id, :restaurant_id, :quantity, :unit_price, :total_price, :pickup_time, 'confirmed', :notes
                )
            ");
            $stmtRes->execute([
                'reservation_code' => $code,
                'user_id' => $userId,
                'food_id' => $foodId,
                'restaurant_id' => $food['restaurant_id'],
                'quantity' => $qty,
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
                'pickup_time' => $pickupTime,
                'notes' => $data['notes'] ?? 'Order created via Replate'
            ]);
            $resId = (int)$this->db->lastInsertId();

            // Increment restaurant meals saved count
            $stmtRestUp = $this->db->prepare("UPDATE restaurants SET meals_saved_count = meals_saved_count + :qty WHERE id = :id");
            $stmtRestUp->execute(['qty' => $qty, 'id' => $food['restaurant_id']]);

            // Update overall impact stats
            $kgSaved = ($qty * ($food['weight_grams'] ?? 450)) / 1000;
            $moneySaved = ($food['original_price'] - $food['rescue_price']) * $qty;
            $co2Saved = $kgSaved * 2.5;

            $this->db->exec("
                UPDATE impact_stats 
                SET total_meals_saved = total_meals_saved + {$qty},
                    total_kg_diverted = total_kg_diverted + {$kgSaved},
                    total_co2_kg_prevented = total_co2_kg_prevented + {$co2Saved},
                    total_money_saved_inr = total_money_saved_inr + {$moneySaved}
                WHERE id = 1
            ");

            // Create notification
            $stmtNotif = $this->db->prepare("
                INSERT INTO notifications (user_id, title, message, type)
                VALUES (:uid, :title, :msg, 'reservation')
            ");
            $stmtNotif->execute([
                'uid' => $userId,
                'title' => 'Rescue Confirmed: ' . $code,
                'msg' => "Your pickup for {$qty}x {$food['name']} is confirmed at {$restName} ({$pickupTime})."
            ]);

            $this->db->commit();

            return $this->getById($resId);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    public function getById(int $id): ?array {
        $sql = "
            SELECT 
                r.*,
                f.name as food_name,
                f.image as food_image,
                f.dietary as food_dietary,
                f.original_price as food_original_price,
                f.weight_grams as food_weight_grams,
                rest.name as restaurant_name,
                rest.address as restaurant_address,
                rest.city as restaurant_city,
                rest.rating as restaurant_rating,
                u.name as customer_name,
                u.email as customer_email,
                u.phone as customer_phone
            FROM reservations r
            JOIN foods f ON r.food_id = f.id
            JOIN restaurants rest ON r.restaurant_id = rest.id
            JOIN users u ON r.user_id = u.id
            WHERE r.id = :id
            LIMIT 1
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getByUser(int $userId): array {
        $sql = "
            SELECT 
                r.*,
                f.name as food_name,
                f.image as food_image,
                f.dietary as food_dietary,
                f.original_price as food_original_price,
                f.rescue_price as food_rescue_price,
                f.weight_grams as food_weight_grams,
                rest.name as restaurant_name,
                rest.address as restaurant_address,
                rest.city as restaurant_city,
                rest.rating as restaurant_rating
            FROM reservations r
            JOIN foods f ON r.food_id = f.id
            JOIN restaurants rest ON r.restaurant_id = rest.id
            WHERE r.user_id = :user_id
            ORDER BY r.id DESC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function getByRestaurant(int $restaurantId): array {
        $sql = "
            SELECT 
                r.*,
                f.name as food_name,
                f.image as food_image,
                f.dietary as food_dietary,
                u.name as customer_name,
                u.phone as customer_phone,
                u.email as customer_email
            FROM reservations r
            JOIN foods f ON r.food_id = f.id
            JOIN users u ON r.user_id = u.id
            WHERE r.restaurant_id = :restaurant_id
            ORDER BY r.id DESC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['restaurant_id' => $restaurantId]);
        return $stmt->fetchAll();
    }

    public function getAll(): array {
        $sql = "
            SELECT 
                r.*,
                f.name as food_name,
                rest.name as restaurant_name,
                u.name as customer_name
            FROM reservations r
            JOIN foods f ON r.food_id = f.id
            JOIN restaurants rest ON r.restaurant_id = rest.id
            JOIN users u ON r.user_id = u.id
            ORDER BY r.id DESC
        ";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function updateStatus(int $id, string $status): bool {
        $stmt = $this->db->prepare("UPDATE reservations SET status = :status WHERE id = :id");
        return $stmt->execute(['status' => $status, 'id' => $id]);
    }
}
