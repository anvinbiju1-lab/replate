-- ==========================================================
-- REPLATE Database Seed Data (Kerala Edition)
-- Demo Accounts:
--   Customer:   demo@replate.test       / Password123! (Anvin)
--   Restaurant: restaurant@replate.test / Password123! (Chef Rasheed, Mandi Manzil)
--   Admin:      admin@replate.test      / Password123! (Platform Admin)
-- ==========================================================

-- 1. SEED USERS
INSERT INTO users (id, name, email, password_hash, role, phone, avatar) VALUES
(1, 'System Administrator', 'admin@replate.test', '$2y$10$kaCVB4.dEz3WV2fOFSrxvuL5jlfXgKRq1z2K.nvOShFvATyUsuwMO', 'admin', '+91 94470 11223', 'admin-avatar.jpg'),
(2, 'Chef Rasheed', 'restaurant@replate.test', '$2y$10$kaCVB4.dEz3WV2fOFSrxvuL5jlfXgKRq1z2K.nvOShFvATyUsuwMO', 'restaurant', '+91 98460 23456', 'chef-rasheed.jpg'),
(3, 'Chef Moideen', 'paragon@replate.test', '$2y$10$kaCVB4.dEz3WV2fOFSrxvuL5jlfXgKRq1z2K.nvOShFvATyUsuwMO', 'restaurant', '+91 98950 34567', 'chef-moideen.jpg'),
(4, 'Anvin', 'demo@replate.test', '$2y$10$kaCVB4.dEz3WV2fOFSrxvuL5jlfXgKRq1z2K.nvOShFvATyUsuwMO', 'customer', '+91 97450 45678', 'anvin.jpg'),
(5, 'Anjali Menon', 'anjali@replate.test', '$2y$10$kaCVB4.dEz3WV2fOFSrxvuL5jlfXgKRq1z2K.nvOShFvATyUsuwMO', 'customer', '+91 96330 56789', 'anjali.jpg');

-- 2. SEED RESTAURANTS (KERALA)
INSERT INTO restaurants (id, user_id, name, description, address, city, latitude, longitude, rating, reviews_count, cuisine, image, logo, status, meals_saved_count) VALUES
(1, 2, 'Mandi Manzil', 'Legendary wood-charcoal cooked Kuzhimanthi prepared with fragrant Basmati, tender spiced chicken, and housemade tomato salsa.', 'Near InfoPark Gate, Kakkanad, Kochi', 'Kochi', 9.9984, 76.3578, 4.9, 240, 'Arabian & Malabar Mandi Hub', 'hero-food.jpg', 'logo-nahdi.webp', 'active', 1840),
(2, 3, 'Paragon Restaurant', 'World-renowned Malabar culinary landmark serving authentic Thalassery dum biryani, tender mutton roasts, and coastal seafood.', 'CH Flyover Junction, Kozhikode', 'Kozhikode', 11.2588, 75.7804, 4.9, 380, 'Iconic Malabar Heritage', 'artisan-pizza.webp', 'logo-paragon.webp', 'active', 2150),
(3, 1, 'Al Reem Alfam & Charcoal Hub', 'Slow-charred succulent pepper, honey peri-peri, and green chilli Alfam chicken served with hot flaky kuboos and toum.', 'Palarivattom Bypass, Kochi', 'Kochi', 9.9982, 76.3082, 4.8, 145, 'Middle-Eastern Grills & Barbecue', 'bakery-box.webp', 'logo-alreem.webp', 'active', 1120),
(4, 1, 'Rahmath Hotel', 'Famous for Kozhikode slow-simmered beef roast, flaky layered Kerala porotta, and traditional Thalassery dum rice.', 'Arakkinar Road, Calicut', 'Kozhikode', 11.2488, 75.7904, 4.8, 290, 'Kozhikode Heritage Eatery', 'sushi-set.webp', 'logo-rahmath.webp', 'active', 1680),
(5, 1, 'Grand Pavilion', 'Fine Kerala cuisine featuring crisp lace appams, Kuttanadan duck roast, and spicy Travancore fish curry.', 'MG Road, Ernakulam, Kochi', 'Kochi', 9.9678, 76.2845, 4.7, 180, 'Traditional Kerala Coastal', 'hero-food.jpg', 'logo-grand.webp', 'active', 940),
(6, 1, 'Paris Bakery & Tea House', 'Historic 1880s bakery crafting hot pazham pori, unnakaya, chatti pathiri, and ghee-rich Kozhikodan black halwa.', 'Logan’s Road, Thalassery', 'Thalassery', 11.7480, 75.4894, 4.8, 160, 'Malabar Traditional Bakes & Halwa', 'bakery-box.webp', 'logo-paris.webp', 'active', 1490);

-- 3. SEED CATEGORIES
INSERT INTO categories (id, name, slug, icon, description, display_order) VALUES
(1, 'All Drops', 'all', 'utensils', 'Explore all fresh Kerala surplus drops', 1),
(2, 'Mandi & Biryani', 'biryani', 'soup', 'Authentic Kuzhimanthi and Thalassery Dum Biryani', 2),
(3, 'Alfam & Grills', 'alfam', 'flame', 'Pepper Alfam, Peri-Peri chicken and kuboos', 3),
(4, 'Porotta & Curries', 'porotta', 'croissant', 'Flaky Kerala porottas and roasted beef/chicken curries', 4),
(5, 'Seafood Specials', 'seafood', 'fish', 'Karimeen pollichathu and coastal fish fries', 5),
(6, 'Malabar Snacks', 'snacks', 'coffee', 'Hot pazham pori, unnakaya, and samosas', 6),
(7, 'Bakeries & Halwa', 'bakery', 'cake', 'Kozhikodan halwa, banana chips, and fresh pastries', 7);

-- 4. SEED FOODS (15 KERALA SURPLUS DROPS - ALL UNIQUE MATCHING IMAGES)
INSERT INTO foods (id, restaurant_id, category_id, name, description, original_price, rescue_price, quantity, initial_quantity, pickup_start, pickup_end, dietary, allergens, ingredients, image, status, weight_grams) VALUES
(1, 1, 2, 'Chicken Mandi', 'Aromatic basmati rice slow-steamed in a charcoal pit with tender roasted chicken quarter, fresh garlic toum, and spicy tomato dip.', 260.00, 99.00, 6, 8, '19:30', '22:00', 'non-veg', 'Contains Garlic, Spices', 'Basmati Rice, Chicken, Mandi Spices, Garlic Emulsion, Charcoal Smoke', 'mandi.jpg', 'available', 550),
(2, 3, 3, 'Alfaham Chicken & Rice', 'Smoky charcoal-grilled spicy Alfaham chicken served with fragrant seasoned basmati rice, hot kuboos, and creamy garlic toum.', 240.00, 89.00, 5, 8, '19:00', '21:30', 'non-veg', 'Contains Garlic', 'Chicken, Wayanad Black Pepper, Peri-Peri Marinade, Kuboos, Garlic Toum', 'alfaham.jpg', 'available', 500),
(3, 2, 2, 'Thalassery Chicken Biriyani', 'Authentic Khyma rice dum biriyani layered with slow-cooked Malabar spiced chicken, golden fried onions (bista), cashews, and raisins.', 250.00, 99.00, 7, 10, '20:00', '22:30', 'non-veg', 'Contains Nuts, Dairy', 'Jeerakasala Khyma Rice, Chicken, Ghee, Fried Onions, Cashews, Raisins', 'biriyani.jpg', 'available', 500),
(4, 2, 2, 'Mutton Biriyani', 'Fragrant Malabar dum biriyani prepared with tender fall-off-the-bone mutton chunks, fried shallots, pure ghee, and fresh mint.', 320.00, 129.00, 4, 6, '20:00', '22:30', 'non-veg', 'Contains Dairy, Nuts', 'Khyma Rice, Fresh Mutton, Ghee, Mint, Malabar Garam Masala', 'mutton-biriyani.jpg', 'available', 520),
(5, 4, 4, 'Porotta + Beef Curry', 'Flaky, layered golden Kerala porottas paired with rich, dark slow-simmered Kozhikodan beef gravy infused with fennel and black pepper.', 210.00, 79.00, 8, 10, '19:00', '21:30', 'non-veg', 'Contains Gluten', 'Flour Porotta, Beef, Coconut Slices, Curry Leaves, Fennel, Black Pepper', 'porotta-beef.jpg', 'available', 500),
(6, 5, 4, 'Porotta + Chicken Curry', 'Crispy layered Kerala parottas served with a traditional clay pot of aromatic coconut-fennel spicy chicken curry.', 200.00, 75.00, 6, 8, '19:30', '21:30', 'non-veg', 'Contains Gluten, Coconut', 'Flour Porotta, Chicken, Roasted Coconut Gravy, Shallots, Spices', 'porotta-chicken.jpg', 'available', 480),
(7, 4, 7, 'Beef Roast', 'Iconic Kerala Beef Ularthiyathu slow-roasted in a cast iron skillet with toasted crunchy coconut slices (thenga kothu) and curry leaves.', 220.00, 89.00, 6, 8, '19:00', '21:30', 'non-veg', 'Contains Coconut', 'Beef Chunks, Fried Coconut Chips, Shallots, Crushed Pepper, Curry Leaves', 'beef-roast.jpg', 'available', 420),
(8, 6, 7, 'Chicken 65', 'Crispy golden-red fried bite-sized chicken chunks tossed with fried green chillies, curry leaves, and sliced shallots on banana leaf.', 180.00, 69.00, 7, 10, '18:00', '21:00', 'non-veg', 'Contains Spices', 'Boneless Chicken, Ginger Garlic Paste, Kashmiri Chilli, Curry Leaves', 'chicken-65.jpg', 'available', 350),
(9, 5, 4, 'Appam + Chicken Stew', 'Soft, fluffy fermented rice appams with lacy borders served with creamy white coconut milk chicken stew with potatoes and carrots.', 210.00, 79.00, 5, 8, '19:30', '21:30', 'non-veg', 'Contains Coconut', 'Fermented Rice Batter, Coconut Milk, Chicken, Potatoes, Whole Spices', 'appam-stew.jpg', 'available', 460),
(10, 6, 4, 'Pathiri + Chicken Curry', 'Delicate soft white circular Malabar rice pathiris stacked fresh, accompanied by rich roasted coconut chicken curry.', 190.00, 69.00, 6, 8, '19:00', '21:30', 'non-veg', 'Contains Coconut', 'Roasted Rice Flour, Water, Coconut Chicken Gravy, Spices', 'pathiri.jpg', 'available', 440),
(11, 5, 5, 'Kappa + Beef Curry', 'Traditional Kerala boiled seasoned tapioca (Kappa Puzhukku) topped with spicy slow-simmered beef curry on fresh plantain leaf.', 180.00, 69.00, 5, 8, '18:30', '21:30', 'non-veg', 'Contains Spices', 'Tapioca, Crushed Coconut, Beef Chunks, Pepper, Mustard Seeds', 'kappa-beef.jpg', 'available', 500),
(12, 5, 5, 'Kerala Meals', 'Grand Kerala noon meals: steamed rice, papadum, sambar, avial, thoran, moru curry, rasam, and traditional sweet payasam.', 170.00, 65.00, 8, 12, '12:30', '15:00', 'veg', 'Contains Dairy, Coconut', 'Kerala Matta Rice, Sambar, Avial, Thoran, Rasam, Papadum, Payasam', 'kerala-meals.jpg', 'available', 650),
(13, 2, 6, 'Fish Fry', 'Fresh coastal sea fish marinated in fiery red chilli and turmeric spice paste, pan-fried crisp with onion rings and lime wedge.', 260.00, 99.00, 4, 6, '19:30', '22:00', 'non-veg', 'Contains Fish', 'Fresh Sea Fish, Red Chilli, Turmeric, Lemon, Coconut Oil, Curry Leaves', 'fish-fry.jpg', 'available', 380),
(14, 3, 3, 'Shawaya / Shawarma Plate', 'Middle Eastern rotisserie roasted Shawaya chicken and shawarma slices with seasoned yellow rice, fresh salad, and garlic toum.', 200.00, 79.00, 5, 8, '19:00', '21:30', 'non-veg', 'Contains Garlic', 'Rotisserie Chicken, Yellow Spiced Rice, Salad, Garlic Mayo Toum', 'shawarma-plate.jpg', 'available', 480),
(15, 1, 3, 'Tandoori Chicken', 'Vibrant char-grilled clay-oven tandoori chicken leg marinated in Greek yogurt, Kashmiri red chilli, lemon, and tandoori masala.', 250.00, 99.00, 5, 8, '19:30', '22:00', 'non-veg', 'Contains Dairy', 'Chicken Leg Quarter, Kashmiri Red Chilli, Hung Curd, Tandoori Masala, Lemon', 'tandoori-chicken.jpg', 'available', 490);

-- 5. SEED RESERVATIONS
INSERT INTO reservations (id, reservation_code, user_id, food_id, restaurant_id, quantity, unit_price, total_price, pickup_time, status, notes) VALUES
(1, 'REP-9482-KL', 4, 1, 1, 2, 99.00, 198.00, 'Today, 8:30 PM', 'ready_for_pickup', 'Extra garlic dip requested'),
(2, 'REP-8120-KL', 4, 3, 3, 1, 89.00, 89.00, 'Today, 9:15 PM', 'confirmed', 'Extra spicy Alfam');

-- 6. SEED IMPACT STATS
INSERT INTO impact_stats (id, total_meals_saved, total_kg_diverted, total_co2_kg_prevented, total_money_saved_inr) VALUES
(1, 14680, 4820.5, 12051.2, 3240800.00);
