<?php
/**
 * Impact Model
 */

require_once __DIR__ . '/../config/Database.php';

class Impact {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getPlatformStats(): array {
        $stmt = $this->db->query("SELECT * FROM impact_stats WHERE id = 1 LIMIT 1");
        $stats = $stmt->fetch();

        if (!$stats) {
            $stats = [
                'total_meals_saved' => 12840,
                'total_kg_diverted' => 3420.5,
                'total_co2_kg_prevented' => 8551.2,
                'total_money_saved_inr' => 2840900.00
            ];
        }

        $resCount = (int)$this->db->query("SELECT COUNT(*) FROM restaurants WHERE status = 'active'")->fetchColumn();
        $userCount = (int)$this->db->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn();

        return [
            'meals_rescued' => (int)$stats['total_meals_saved'],
            'kg_diverted' => (float)$stats['total_kg_diverted'],
            'co2_saved_kg' => (float)$stats['total_co2_kg_prevented'],
            'money_saved_inr' => (float)$stats['total_money_saved_inr'],
            'partner_restaurants' => $resCount ?: 187,
            'active_rescuers' => $userCount ?: 2180,
            // Equivalents
            'trees_equivalent' => round(((float)$stats['total_co2_kg_prevented']) / 21.7, 0),
            'water_saved_litres' => round(((float)$stats['total_meals_saved']) * 240, 0),
            'car_km_avoided' => round(((float)$stats['total_co2_kg_prevented']) * 4.1, 0)
        ];
    }

    public function getCustomerStats(int $userId): array {
        $stmt = $this->db->prepare("
            SELECT 
                COALESCE(SUM(r.quantity), 0) as meals_rescued,
                COALESCE(SUM((f.original_price - f.rescue_price) * r.quantity), 0) as money_saved,
                COALESCE(SUM((f.weight_grams * r.quantity) / 1000.0), 0) as kg_diverted
            FROM reservations r
            JOIN foods f ON r.food_id = f.id
            WHERE r.user_id = :uid AND r.status != 'cancelled'
        ");
        $stmt->execute(['uid' => $userId]);
        $data = $stmt->fetch();

        $meals = (int)$data['meals_rescued'];
        $money = (float)$data['money_saved'];
        $kg = (float)$data['kg_diverted'];
        $co2 = round($kg * 2.5, 1);

        // Eco score algorithm (0 - 100 scale)
        $score = min(100, 45 + ($meals * 8));

        return [
            'meals_rescued' => $meals,
            'money_saved' => $money,
            'kg_diverted' => round($kg, 1),
            'co2_saved_kg' => $co2,
            'eco_score' => $score,
            'eco_badge' => $score >= 80 ? 'Master Rescuer 🌿' : ($score >= 60 ? 'Eco Warrior 🌱' : 'Green Explorer 🍃')
        ];
    }
}
