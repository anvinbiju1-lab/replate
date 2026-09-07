<?php
/**
 * Food Model
 */

require_once __DIR__ . '/../config/Database.php';

class Food {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll(array $filters = []): array {
        $sql = "
            SELECT 
                f.*,
                r.name as restaurant_name,
                r.address as restaurant_address,
                r.city as restaurant_city,
                r.rating as restaurant_rating,
                r.cuisine as restaurant_cuisine,
                r.image as restaurant_image,
                c.name as category_name,
                c.slug as category_slug
            FROM foods f
            JOIN restaurants r ON f.restaurant_id = r.id
            JOIN categories c ON f.category_id = c.id
            WHERE f.status != 'deleted'
        ";
        $params = [];

        // Status filter (default to available unless specified)
        if (!empty($filters['status'])) {
            $sql .= " AND f.status = :status";
            $params['status'] = $filters['status'];
        } else {
            $sql .= " AND f.status IN ('available', 'reserved')";
        }

        // Restaurant filter
        if (!empty($filters['restaurant_id'])) {
            $sql .= " AND f.restaurant_id = :restaurant_id";
            $params['restaurant_id'] = $filters['restaurant_id'];
        }

        // Category filter
        if (!empty($filters['category_id']) && $filters['category_id'] !== 'all' && (int)$filters['category_id'] > 1) {
            $sql .= " AND f.category_id = :category_id";
            $params['category_id'] = (int)$filters['category_id'];
        } elseif (!empty($filters['category_slug']) && $filters['category_slug'] !== 'all') {
            $sql .= " AND c.slug = :category_slug";
            $params['category_slug'] = $filters['category_slug'];
        }

        // Dietary filter
        if (!empty($filters['dietary']) && $filters['dietary'] !== 'all') {
            $sql .= " AND f.dietary = :dietary";
            $params['dietary'] = $filters['dietary'];
        }

        // Min Discount filter
        if (!empty($filters['min_discount'])) {
            $sql .= " AND f.discount_percent >= :min_discount";
            $params['min_discount'] = (int)$filters['min_discount'];
        }

        // Max Price filter
        if (!empty($filters['max_price'])) {
            $sql .= " AND f.rescue_price <= :max_price";
            $params['max_price'] = (float)$filters['max_price'];
        }

        // Keyword Search
        if (!empty($filters['search'])) {
            $term = '%' . trim($filters['search']) . '%';
            $sql .= " AND (f.name LIKE :s1 OR f.description LIKE :s2 OR r.name LIKE :s3 OR r.cuisine LIKE :s4)";
            $params['s1'] = $term;
            $params['s2'] = $term;
            $params['s3'] = $term;
            $params['s4'] = $term;
        }

        // Sorting
        $sort = $filters['sort'] ?? 'discount_desc';
        switch ($sort) {
            case 'price_asc':
                $sql .= " ORDER BY f.rescue_price ASC";
                break;
            case 'price_desc':
                $sql .= " ORDER BY f.rescue_price DESC";
                break;
            case 'newest':
                $sql .= " ORDER BY f.id DESC";
                break;
            case 'quantity_low':
                $sql .= " ORDER BY f.quantity ASC";
                break;
            case 'discount_desc':
            default:
                $sql .= " ORDER BY f.discount_percent DESC, f.id DESC";
                break;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array {
        $sql = "
            SELECT 
                f.*,
                r.name as restaurant_name,
                r.address as restaurant_address,
                r.city as restaurant_city,
                r.rating as restaurant_rating,
                r.reviews_count as restaurant_reviews_count,
                r.cuisine as restaurant_cuisine,
                r.image as restaurant_image,
                r.meals_saved_count as restaurant_meals_saved,
                c.name as category_name,
                c.slug as category_slug
            FROM foods f
            JOIN restaurants r ON f.restaurant_id = r.id
            JOIN categories c ON f.category_id = c.id
            WHERE f.id = :id
            LIMIT 1
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $food = $stmt->fetch();
        return $food ?: null;
    }

    public function create(array $data): int {
        $orig = (float)$data['original_price'];
        $resc = (float)$data['rescue_price'];
        $discount = $orig > 0 ? (int)round((($orig - $resc) / $orig) * 100) : 0;

        $stmt = $this->db->prepare("
            INSERT INTO foods (
                restaurant_id, category_id, name, description, original_price, rescue_price, 
                discount_percent, quantity, initial_quantity, pickup_start, pickup_end, 
                dietary, allergens, ingredients, image, status, weight_grams
            ) VALUES (
                :restaurant_id, :category_id, :name, :description, :original_price, :rescue_price,
                :discount_percent, :quantity, :initial_quantity, :pickup_start, :pickup_end,
                :dietary, :allergens, :ingredients, :image, :status, :weight_grams
            )
        ");
        $stmt->execute([
            'restaurant_id' => $data['restaurant_id'],
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'description' => $data['description'],
            'original_price' => $orig,
            'rescue_price' => $resc,
            'discount_percent' => $discount,
            'quantity' => (int)$data['quantity'],
            'initial_quantity' => (int)$data['quantity'],
            'pickup_start' => $data['pickup_start'] ?? '18:00',
            'pickup_end' => $data['pickup_end'] ?? '20:30',
            'dietary' => $data['dietary'] ?? 'veg',
            'allergens' => $data['allergens'] ?? '',
            'ingredients' => $data['ingredients'] ?? '',
            'image' => $data['image'] ?? 'custom-dish.webp',
            'status' => 'available',
            'weight_grams' => (int)($data['weight_grams'] ?? 450)
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function decrementStock(int $foodId, int $qty): bool {
        $stmt = $this->db->prepare("
            UPDATE foods 
            SET quantity = quantity - :qty,
                status = CASE WHEN quantity - :qty <= 0 THEN 'sold_out' ELSE status END
            WHERE id = :id AND quantity >= :qty
        ");
        return $stmt->execute(['qty' => $qty, 'id' => $foodId]) && $stmt->rowCount() > 0;
    }

    public function updateStatus(int $foodId, string $status): bool {
        $stmt = $this->db->prepare("UPDATE foods SET status = :status WHERE id = :id");
        return $stmt->execute(['status' => $status, 'id' => $foodId]);
    }

    public function delete(int $foodId): bool {
        $stmt = $this->db->prepare("UPDATE foods SET status = 'deleted' WHERE id = :id");
        return $stmt->execute(['id' => $foodId]);
    }
}
