<?php
/**
 * Impact Controller
 */

require_once __DIR__ . '/../config/Config.php';
require_once __DIR__ . '/../models/Impact.php';

class ImpactController {
    private Impact $impactModel;

    public function __construct() {
        $this->impactModel = new Impact();
    }

    public function platform(): array {
        $stats = $this->impactModel->getPlatformStats();
        return ['success' => true, 'impact' => $stats];
    }

    public function personal(): array {
        if (!Config::isLoggedIn()) {
            // Default demo numbers if not logged in
            return [
                'success' => true,
                'impact' => [
                    'meals_rescued' => 4,
                    'money_saved' => 580.00,
                    'kg_diverted' => 1.8,
                    'co2_saved_kg' => 4.5,
                    'eco_score' => 78,
                    'eco_badge' => 'Eco Warrior 🌱'
                ]
            ];
        }

        $user = Config::getCurrentUser();
        $stats = $this->impactModel->getCustomerStats($user['id']);
        return ['success' => true, 'impact' => $stats];
    }
}
