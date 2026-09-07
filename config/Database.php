<?php
/**
 * REPLATE Universal Database Access Layer (PDO)
 * Automatically connects to MySQL (default for XAMPP / LAMP)
 * Gracefully activates local SQLite if MySQL is unavailable.
 */

require_once __DIR__ . '/Config.php';

class Database {
    private static ?Database $instance = null;
    private ?PDO $connection = null;
    private string $driver = 'mysql';

    private function __construct() {
        // First try connecting to MySQL
        try {
            $dsn = sprintf(
                "mysql:host=%s;port=%s;dbname=%s;charset=%s",
                Config::DB_HOST,
                Config::DB_PORT,
                Config::DB_NAME,
                Config::DB_CHARSET
            );
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 2
            ];
            $this->connection = new PDO($dsn, Config::DB_USER, Config::DB_PASS, $options);
            $this->driver = 'mysql';
        } catch (PDOException $e) {
            // If MySQL is offline or not installed, fallback to SQLite for local development
            $sqlitePath = Config::SQLITE_FILE;
            $dir = dirname($sqlitePath);
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }

            $needsInit = !file_exists($sqlitePath) || filesize($sqlitePath) === 0;

            try {
                $this->connection = new PDO('sqlite:' . $sqlitePath);
                $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                $this->connection->exec("PRAGMA foreign_keys = ON;");
                $this->driver = 'sqlite';

                if ($needsInit) {
                    $this->initializeSqlite();
                }
            } catch (Exception $ex) {
                die("Database connection error: " . $ex->getMessage());
            }
        }
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->connection;
    }

    public function getDriver(): string {
        return $this->driver;
    }

    /**
     * Initializes SQLite schema and seeds demo data if running in SQLite mode
     */
    public function initializeSqlite(): void {
        $pdo = $this->connection;

        // Schema for SQLite
        $schema = <<<SQL
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT CHECK(role IN ('customer', 'restaurant', 'admin')) DEFAULT 'customer',
            phone TEXT,
            avatar TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS restaurants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            address TEXT NOT NULL,
            city TEXT DEFAULT 'Bengaluru',
            latitude REAL DEFAULT 12.9716,
            longitude REAL DEFAULT 77.5946,
            rating REAL DEFAULT 4.8,
            reviews_count INTEGER DEFAULT 42,
            cuisine TEXT DEFAULT 'Artisanal & Contemporary',
            image TEXT,
            logo TEXT,
            status TEXT CHECK(status IN ('active', 'pending', 'suspended')) DEFAULT 'active',
            meals_saved_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE,
            icon TEXT DEFAULT 'utensils',
            description TEXT,
            display_order INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS foods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            restaurant_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            original_price REAL NOT NULL,
            rescue_price REAL NOT NULL,
            discount_percent INTEGER DEFAULT 60,
            quantity INTEGER NOT NULL DEFAULT 1,
            initial_quantity INTEGER NOT NULL DEFAULT 1,
            pickup_start TEXT NOT NULL DEFAULT '18:00',
            pickup_end TEXT NOT NULL DEFAULT '20:30',
            dietary TEXT CHECK(dietary IN ('veg', 'non-veg', 'vegan')) DEFAULT 'veg',
            allergens TEXT DEFAULT 'Contains Dairy, Gluten',
            ingredients TEXT,
            image TEXT,
            status TEXT CHECK(status IN ('available', 'reserved', 'sold_out')) DEFAULT 'available',
            weight_grams INTEGER DEFAULT 450,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
        );

        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reservation_code TEXT NOT NULL UNIQUE,
            user_id INTEGER NOT NULL,
            food_id INTEGER NOT NULL,
            restaurant_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            pickup_time TEXT NOT NULL,
            status TEXT CHECK(status IN ('pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled')) DEFAULT 'confirmed',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
            FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            food_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, food_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            restaurant_id INTEGER NOT NULL,
            food_id INTEGER,
            rating INTEGER NOT NULL DEFAULT 5,
            comment TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS impact_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_meals_saved INTEGER DEFAULT 12840,
            total_kg_diverted REAL DEFAULT 3420.5,
            total_co2_kg_prevented REAL DEFAULT 8551.2,
            total_money_saved_inr REAL DEFAULT 2840900.00,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'reservation',
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS admin_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT DEFAULT '127.0.0.1',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
SQL;
        $pdo->exec($schema);

        // Seed Users
        $seedPass = '$2y$10$kaCVB4.dEz3WV2fOFSrxvuL5jlfXgKRq1z2K.nvOShFvATyUsuwMO'; // Password123!
        $pdo->exec("INSERT INTO users (id, name, email, password_hash, role, phone, avatar) VALUES
            (1, 'System Administrator', 'admin@replate.test', '{$seedPass}', 'admin', '+91 98450 11223', 'admin-avatar.jpg'),
            (2, 'Chef Marco Ross', 'restaurant@replate.test', '{$seedPass}', 'restaurant', '+91 98765 43210', 'chef-marco.jpg'),
            (3, 'Elena Bianchi', 'forno@replate.test', '{$seedPass}', 'restaurant', '+91 98844 55667', 'elena-bianchi.jpg'),
            (4, 'Devansh Sharma', 'demo@replate.test', '{$seedPass}', 'customer', '+91 99001 23456', 'devansh.jpg'),
            (5, 'Ananya Sen', 'ananya@replate.test', '{$seedPass}', 'customer', '+91 97112 34567', 'ananya.jpg'),
            (6, 'Rohan Verma', 'rohan@replate.test', '{$seedPass}', 'customer', '+91 98200 45678', 'rohan.jpg');
        ");

        // Seed Restaurants
        $pdo->exec("INSERT INTO restaurants (id, user_id, name, description, address, city, latitude, longitude, rating, reviews_count, cuisine, image, logo, status, meals_saved_count) VALUES
            (1, 2, 'Casa Verde', 'Gourmet rustic Italian kitchen crafting artisanal fresh handmade pasta, wood-fired focaccia, and sustainable Mediterranean classics.', '12th Main Road, Indiranagar, Bengaluru', 'Bengaluru', 12.9784, 77.6408, 4.8, 128, 'Italian Kitchen & Deli', 'casa-verde.webp', 'logo-casa.webp', 'active', 1420),
            (2, 3, 'Forno & Co.', 'Slow-fermented naturally leavened sourdough bakery and Neapolitan pizzeria utilizing locally sourced heritage grains.', '5th Block, Koramangala, Bengaluru', 'Bengaluru', 12.9352, 77.6245, 4.9, 94, 'Artisanal Pizzeria & Bakes', 'forno-co.webp', 'logo-forno.webp', 'active', 890),
            (3, 1, 'Mizu Contemporary', 'Mindful Japanese gastronomy spotlighting sustainably caught seafood, handmade nori rolls, and seasonal dashi bowls.', 'Lavelle Road, Central Bengaluru', 'Bengaluru', 12.9719, 77.5956, 4.9, 156, 'Japanese Contemporary', 'mizu.webp', 'logo-mizu.webp', 'active', 1130),
            (4, 1, 'Green Table Bistro', 'Plant-forward organic café featuring nutrient-dense macrobiotic bowls, cold-pressed elixirs, and zero-waste confectionery.', 'ITPB Main Road, Whitefield, Bengaluru', 'Bengaluru', 12.9863, 77.7345, 4.7, 72, 'Plant-Based & Wellness', 'green-table.webp', 'logo-greentable.webp', 'active', 760),
            (5, 1, 'Daily Loaf Bakery', 'Classic French viennoiserie, golden croissants, and artisan sourdough loaves baked fresh thrice daily.', 'MG Road Promenade, Bengaluru', 'Bengaluru', 12.9754, 77.6068, 4.8, 110, 'French Viennoiserie & Café', 'daily-loaf.webp', 'logo-dailyloaf.webp', 'active', 2140),
            (6, 1, 'Fresh & Wild Organics', 'Farm-to-fork organic pantry offering seasonal farm surplus boxes, cold-pressed juices, and chef-curated salad hampers.', '27th Main, HSR Layout, Sector 1, Bengaluru', 'Bengaluru', 12.9121, 77.6446, 4.6, 58, 'Organic Pantry & Salads', 'fresh-wild.webp', 'logo-freshwild.webp', 'active', 540);
        ");

        // Seed Categories
        $pdo->exec("INSERT INTO categories (id, name, slug, icon, description, display_order) VALUES
            (1, 'All', 'all', 'utensils', 'Explore all fresh surplus drops across Bengaluru', 1),
            (2, 'Meals', 'meals', 'soup', 'Hearty chef-curated hot dinners and gourmet dishes', 2),
            (3, 'Bakery', 'bakery', 'croissant', 'Artisan sourdough, pastries, and French viennoiserie', 3),
            (4, 'Pizza', 'pizza', 'pizza', 'Wood-fired Neapolitan slices and gourmet sourdough crusts', 4),
            (5, 'Indian', 'indian', 'flame', 'Modern Indian curries, tandoor specials, and biryanis', 5),
            (6, 'Asian', 'asian', 'chopsticks', 'Sushi sets, dim sum platters, and Tokyo ramen boxes', 6),
            (7, 'Healthy', 'healthy', 'salad', 'Farm-fresh harvest bowls, protein plates, and macro salads', 7),
            (8, 'Desserts', 'desserts', 'cake', 'Handmade tiramisu, tartlets, and luxury confections', 8),
            (9, 'Drinks', 'drinks', 'coffee', 'Cold-pressed wellness elixirs and artisanal brew duos', 9),
            (10, 'Groceries', 'groceries', 'shopping-bag', 'Surplus farm produce boxes, organic cheeses, and fresh greens', 10);
        ");

        // Seed Foods
        $pdo->exec("INSERT INTO foods (id, restaurant_id, category_id, name, description, original_price, rescue_price, discount_percent, quantity, initial_quantity, pickup_start, pickup_end, dietary, allergens, ingredients, image, status, weight_grams) VALUES
            (1, 1, 2, 'Creamy Truffle Wild Mushroom Pasta', 'Housemade tagliatelle coated in a rich black truffle and mascarpone emulsion with sautéed forest mushrooms and 24-month Parmigiano-Reggiano.', 229.00, 89.00, 61, 6, 8, '19:00', '21:00', 'veg', 'Contains Dairy, Gluten', 'Fresh Semolina Tagliatelle, Porcini Mushrooms, Black Truffle Emulsion, Mascarpone, Thyme, Parmigiano-Reggiano', 'creamy-pasta.webp', 'available', 480),
            (2, 2, 4, 'Artisan Wood-Fired Pizza Slice Box', 'Surplus slices of our flagship 48-hour fermented Margherita DOP and Charred Bell Pepper & Smoked Scamorza pizza, baked at 450°C in our volcanic stone oven.', 299.00, 99.00, 67, 4, 6, '20:00', '21:30', 'veg', 'Contains Dairy, Gluten', '00 Heritage Flour, San Marzano Tomatoes, Fior di Latte, Fresh Basil, Smoked Scamorza, EVOO', 'artisan-pizza.webp', 'available', 520),
            (3, 3, 6, 'Nigiri & Handcrafted Maki Sushi Set', '8-piece sushi box crafted fresh this evening by Master Tani: 4x Salmon and Tuna Nigiri, 4x Avocado & Truffle Shiitake Maki with aged shoyu.', 399.00, 149.00, 63, 3, 5, '20:30', '22:00', 'non-veg', 'Contains Fish, Soy, Sesame', 'Sashimi-grade Salmon & Tuna, Japanese Koshihikari Rice, Nori, Ripe Haas Avocado, Shiitake, Wasabi', 'sushi-set.webp', 'available', 360),
            (4, 4, 7, 'Organic Harvest Protein Bowl', 'Warm red quinoa, charred sweet potato wedges, balsamic roasted beetroot, edamame, baby spinach, avocado, and toasted sunflower seeds with house turmeric tahini dressing.', 249.00, 89.00, 64, 5, 8, '18:30', '20:30', 'vegan', 'Contains Sesame, Nuts', 'Tri-color Quinoa, Local Organic Greens, Avocado, Edamame, Roasted Sweet Potato, Sesame Tahini', 'harvest-bowl.webp', 'available', 450),
            (5, 5, 3, 'Parisian Viennoiserie Surprise Box', 'Assortment of four freshly laminated morning and afternoon pastries: 1x Butter Croissant, 1x Pain au Chocolat with Valrhona 70%, 1x Pistachio Escargot, and 1x Kouign-Amann.', 179.00, 59.00, 67, 8, 12, '18:00', '20:00', 'veg', 'Contains Dairy, Gluten, Eggs, Nuts', 'French AOP Butter, T55 Flour, Valrhona Dark Chocolate, Bronte Pistachio Paste, Cane Sugar', 'bakery-box.webp', 'available', 400),
            (6, 6, 10, 'Farm Fresh Organic Fruit & Greens Hamper', 'Curated surplus harvest box straight from our Kolar organic partners: 500g ripe Alphonso mangoes, 1 bunch Italian basil, crisp butterhead lettuce, and heirloom tomatoes.', 199.00, 69.00, 65, 4, 7, '19:00', '21:00', 'vegan', 'None', 'Organic Alphonso Mangoes, Hydroponic Butterhead, Heirloom Cherry Tomatoes, Strawberries, Fresh Basil', 'fruit-box.webp', 'available', 1200),
            (7, 1, 8, 'Handcrafted Classic Tiramisu Duo', 'Two individual glasses of Venetian tiramisu prepared with Italian Savoiardi ladyfingers soaked in single-origin espresso, whipped Zabaglione cream, and Dutch cocoa.', 189.00, 69.00, 63, 5, 8, '19:30', '21:30', 'veg', 'Contains Dairy, Gluten, Eggs', 'Galbani Mascarpone, Free-Range Eggs, Espresso Roast, Savoiardi Biscuits, Valrhona Cocoa 100%', 'tiramisu.webp', 'available', 320),
            (8, 1, 2, 'Wild Forest Porcini Risotto Bowl', 'Creamy Acquerello Carnaroli rice simmered in slow vegetable brodo, finished with brown butter, pan-roasted wild chanterelles, and freshly cracked Tellicherry black pepper.', 269.00, 99.00, 63, 3, 5, '19:00', '21:00', 'veg', 'Contains Dairy', 'Acquerello Carnaroli Rice, Chanterelles, Porcini, White Wine Reduction, Butter, Parmigiano-Reggiano', 'risotto.webp', 'available', 460),
            (9, 5, 3, 'Gourmet Sourdough Country Loaf & Brioche', '1x 800g crusty open-crumb sourdough loaf made with organic stoneground whole wheat + 1x golden sweet Brioche Nanterre bun.', 160.00, 55.00, 66, 7, 10, '18:00', '20:00', 'veg', 'Contains Dairy, Gluten, Eggs', 'Stoneground Whole Wheat, Sourdough Levain, Filtered Water, Sea Salt, Normandy Butter', 'sourdough.webp', 'available', 950),
            (10, 3, 6, 'Smoked Teriyaki Salmon Poke Bowl', 'Fluffy Japanese sushi rice topped with glazed Atlantic salmon cubes, cucumber ribbons, pickled daikon, wakame seaweed salad, and creamy sriracha drizzle.', 349.00, 139.00, 60, 2, 4, '20:30', '22:00', 'non-veg', 'Contains Fish, Soy, Sesame', 'Salmon, Koshihikari Rice, Wakame, Japanese Cucumber, House Teriyaki Glaze, Sesame', 'salmon-poke.webp', 'available', 420),
            (11, 4, 5, 'Slow-Simmered Dal Bukhara & Truffle Kulcha', 'Black urad lentils cooked overnight on charcoal embers with tomatoes and fresh cream, accompanied by two clay-oven baked mini truffle kulchas.', 219.00, 79.00, 64, 6, 8, '19:00', '21:00', 'veg', 'Contains Dairy, Gluten', 'Black Gram Lentils, Butter, Cream, San Marzano Puree, Wheat Flour, White Truffle Oil', 'dal-kulcha.webp', 'available', 500),
            (12, 6, 9, 'Cold-Pressed Wellness Elixir Duo (500ml)', 'Two 250ml glass bottles: 1x Glow (Valencia Orange, Carrot, Golden Turmeric, Ginger) + 1x Vitality (Kale, Green Apple, Cucumber, Lemon, Mint).', 149.00, 49.00, 67, 9, 15, '17:30', '20:00', 'vegan', 'None', 'Valencia Orange, Nagpur Carrots, Lakadong Turmeric, Himalayan Apple, Organic Kale, Mint', 'juice-duo.webp', 'available', 520);
        ");

        // Seed Reservations
        $pdo->exec("INSERT INTO reservations (id, reservation_code, user_id, food_id, restaurant_id, quantity, unit_price, total_price, pickup_time, status, notes) VALUES
            (1, 'REP-9482-CV', 4, 1, 1, 2, 89.00, 178.00, 'Today, 7:30 PM', 'ready_for_pickup', 'Please pack fork and napkin'),
            (2, 'REP-8120-FC', 4, 2, 2, 1, 99.00, 99.00, 'Today, 8:15 PM', 'confirmed', 'Extra crispy if possible'),
            (3, 'REP-7734-DL', 4, 5, 5, 1, 59.00, 59.00, 'Yesterday, 6:30 PM', 'completed', 'Picked up successfully');
        ");

        // Seed Favorites
        $pdo->exec("INSERT INTO favorites (id, user_id, food_id) VALUES
            (1, 4, 1),
            (2, 4, 3),
            (3, 4, 5);
        ");

        // Seed Reviews
        $pdo->exec("INSERT INTO reviews (id, user_id, restaurant_id, food_id, rating, comment) VALUES
            (1, 4, 1, 1, 5, 'The Truffle Pasta was restaurant-grade! Rescued it for ₹89 instead of ₹229, warm, decadent, and saved top-tier food from waste.'),
            (2, 5, 2, 2, 5, 'Forno & Co. pizza is world-class. The crust was bubbly and charred. Picking it up in Koramangala was seamless.'),
            (3, 6, 3, 3, 5, 'Mizu sushi for ₹149 is unbelievable value. The salmon melted in my mouth. Packaging was completely biodegradable!');
        ");

        // Seed Impact Stats
        $pdo->exec("INSERT INTO impact_stats (id, total_meals_saved, total_kg_diverted, total_co2_kg_prevented, total_money_saved_inr) VALUES
            (1, 12840, 3420.5, 8551.2, 2840900.00);
        ");

        // Seed Notifications
        $pdo->exec("INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
            (1, 4, 'Ready for Pickup!', 'Your Creamy Truffle Pasta (Code: REP-9482-CV) at Casa Verde is packed and awaiting pickup.', 'pickup_reminder', 0),
            (2, 4, 'Reservation Confirmed', 'Forno & Co. confirmed your Artisan Wood-Fired Pizza Slice Box for 8:15 PM.', 'reservation', 1),
            (3, 2, 'New Surplus Reservation', 'Customer Devansh Sharma just reserved 2x Creamy Truffle Pasta for pickup at 7:30 PM.', 'reservation', 0);
        ");

        // Seed Admin Logs
        $pdo->exec("INSERT INTO admin_logs (id, user_id, action, details, ip_address) VALUES
            (1, 1, 'SYSTEM_INIT', 'Replate platform initialized with 6 certified restaurants and 12 surplus drops.', '127.0.0.1');
        ");
    }
}
