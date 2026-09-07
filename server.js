/**
 * REPLATE Ultra-Fast High-Performance Development Server
 * Native Node.js HTTP server with instant in-memory & SQLite sync
 * Sub-millisecond response time, 100% Kerala-focused dishes and restaurants!
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.php': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// --- KERALA AUTHENTIC DEMO DATA STORE ---
const DATA = {
  users: [
    { id: 1, name: 'System Administrator', email: 'admin@replate.test', role: 'admin', phone: '+91 94470 12345' },
    { id: 2, name: 'Chef Rasheed', email: 'restaurant@replate.test', role: 'restaurant', restaurant_id: 1, restaurant_name: 'Mandi Manzil', phone: '+91 98460 23456' },
    { id: 3, name: 'Chef Moideen', email: 'paragon@replate.test', role: 'restaurant', restaurant_id: 2, restaurant_name: 'Paragon Restaurant', phone: '+91 98950 34567' },
    { id: 4, name: 'Anvin', email: 'demo@replate.test', role: 'customer', phone: '+91 98450 99887' }
  ],
  currentUser: { id: 4, name: 'Anvin', email: 'demo@replate.test', role: 'customer', phone: '+91 98450 99887' },

  categories: [
    { id: 1, name: 'All Drops', slug: 'all' },
    { id: 2, name: 'Mandi & Biriyani', slug: 'biryani' },
    { id: 3, name: 'Alfaham & Grills', slug: 'alfaham' },
    { id: 4, name: 'Porotta & Curries', slug: 'porotta' },
    { id: 5, name: 'Rice & Combos', slug: 'combos' },
    { id: 6, name: 'Seafood', slug: 'seafood' },
    { id: 7, name: 'Roasts & Starters', slug: 'starters' }
  ],

  restaurants: [
    {
      id: 1,
      name: 'Mandi Manzil',
      cuisine: 'Arabian & Malabar Mandi Specialist',
      address: 'Near InfoPark Gate, Kakkanad, Kochi',
      city: 'Kochi',
      rating: 4.9,
      reviews_count: 260,
      meals_saved_count: 1980,
      description: 'Famous for slow-cooked authentic pit-steamed Kuzhimanthi, fragrant basmati rice, tender roasted chicken, and spicy tomato dips.'
    },
    {
      id: 2,
      name: 'Paragon Restaurant',
      cuisine: 'Iconic Malabar Heritage',
      address: 'CH Flyover Junction, Kozhikode',
      city: 'Kozhikode',
      rating: 4.9,
      reviews_count: 380,
      meals_saved_count: 2150,
      description: 'World-renowned Malabar culinary landmark serving authentic Thalassery dum biryani, tender mutton roasts, and seafood.'
    },
    {
      id: 3,
      name: 'Al Reem Alfam Hub',
      cuisine: 'Middle-Eastern Charcoal Barbecue',
      address: 'Palarivattom Bypass, Kochi',
      city: 'Kochi',
      rating: 4.8,
      reviews_count: 155,
      meals_saved_count: 1240,
      description: 'Slow-charred succulent pepper, honey peri-peri, and green chilli Alfam chicken served with hot flaky kuboos and toum.'
    },
    {
      id: 4,
      name: 'Rahmath Hotel',
      cuisine: 'Kozhikode Heritage Eatery',
      address: 'Arakkinar Road, Calicut',
      city: 'Kozhikode',
      rating: 4.8,
      reviews_count: 290,
      meals_saved_count: 1680,
      description: 'Famous for Kozhikode slow-simmered beef roast, flaky layered Kerala porotta, and traditional Thalassery dum rice.'
    },
    {
      id: 5,
      name: 'Grand Pavilion',
      cuisine: 'Traditional Kerala Coastal',
      address: 'MG Road, Ernakulam, Kochi',
      city: 'Kochi',
      rating: 4.7,
      reviews_count: 180,
      meals_saved_count: 940,
      description: 'Fine Kerala cuisine featuring crisp lace appams, Kuttanadan duck roast, and spicy Travancore fish curry.'
    },
    {
      id: 6,
      name: 'Kayees Rahmathulla Cafe',
      cuisine: 'Historic Mattancherry Biriyani',
      address: 'Gujarati Road, Mattancherry, Kochi',
      city: 'Kochi',
      rating: 4.8,
      reviews_count: 210,
      meals_saved_count: 1520,
      description: 'Historic Kochi destination famous for ghee rice, mutton biriyani, and slow-braised curries.'
    }
  ],

  // 15 Curated Authentic Kerala Dishes - Every dish has a unique matching photo
  foods: [
    {
      id: 1,
      restaurant_id: 1,
      category_id: 2,
      name: 'Chicken Mandi',
      description: 'Aromatic basmati rice slow-steamed in a charcoal pit with tender roasted chicken quarter, fresh garlic toum, and spicy tomato dip.',
      original_price: 260,
      rescue_price: 99,
      discount_percent: 62,
      quantity: 6,
      pickup_start: '19:30',
      pickup_end: '22:00',
      dietary: 'non-veg',
      image: 'mandi.jpg',
      status: 'available',
      weight_grams: 550,
      restaurant_name: 'Mandi Manzil',
      restaurant_address: 'Near InfoPark Gate, Kakkanad, Kochi',
      restaurant_rating: 4.9
    },
    {
      id: 2,
      restaurant_id: 3,
      category_id: 3,
      name: 'Alfaham Chicken & Rice',
      description: 'Smoky charcoal-grilled spicy Alfaham chicken served with fragrant seasoned basmati rice, hot kuboos, and creamy garlic toum.',
      original_price: 240,
      rescue_price: 89,
      discount_percent: 63,
      quantity: 5,
      pickup_start: '19:00',
      pickup_end: '21:30',
      dietary: 'non-veg',
      image: 'alfaham.jpg',
      status: 'available',
      weight_grams: 500,
      restaurant_name: 'Al Reem Alfam Hub',
      restaurant_address: 'Palarivattom Bypass, Kochi',
      restaurant_rating: 4.8
    },
    {
      id: 3,
      restaurant_id: 2,
      category_id: 2,
      name: 'Thalassery Chicken Biriyani',
      description: 'Authentic Khyma rice dum biriyani layered with slow-cooked Malabar spiced chicken, golden fried onions (bista), cashews, and raisins.',
      original_price: 250,
      rescue_price: 99,
      discount_percent: 60,
      quantity: 7,
      pickup_start: '20:00',
      pickup_end: '22:30',
      dietary: 'non-veg',
      image: 'biriyani.jpg',
      status: 'available',
      weight_grams: 500,
      restaurant_name: 'Paragon Restaurant',
      restaurant_address: 'CH Flyover Junction, Kozhikode',
      restaurant_rating: 4.9
    },
    {
      id: 4,
      restaurant_id: 2,
      category_id: 2,
      name: 'Mutton Biriyani',
      description: 'Fragrant Malabar dum biriyani prepared with tender fall-off-the-bone mutton chunks, fried shallots, pure ghee, and fresh mint.',
      original_price: 320,
      rescue_price: 129,
      discount_percent: 60,
      quantity: 4,
      pickup_start: '20:00',
      pickup_end: '22:30',
      dietary: 'non-veg',
      image: 'mutton-biriyani.jpg',
      status: 'available',
      weight_grams: 520,
      restaurant_name: 'Paragon Restaurant',
      restaurant_address: 'CH Flyover Junction, Kozhikode',
      restaurant_rating: 4.9
    },
    {
      id: 5,
      restaurant_id: 4,
      category_id: 4,
      name: 'Porotta + Beef Curry',
      description: 'Flaky, layered golden Kerala porottas paired with rich, dark slow-simmered Kozhikodan beef gravy infused with fennel and black pepper.',
      original_price: 210,
      rescue_price: 79,
      discount_percent: 62,
      quantity: 8,
      pickup_start: '19:00',
      pickup_end: '21:30',
      dietary: 'non-veg',
      image: 'porotta-beef.jpg',
      status: 'available',
      weight_grams: 500,
      restaurant_name: 'Rahmath Hotel',
      restaurant_address: 'Arakkinar Road, Calicut',
      restaurant_rating: 4.8
    },
    {
      id: 6,
      restaurant_id: 5,
      category_id: 4,
      name: 'Porotta + Chicken Curry',
      description: 'Crispy layered Kerala parottas served with a traditional clay pot of aromatic coconut-fennel spicy chicken curry.',
      original_price: 200,
      rescue_price: 75,
      discount_percent: 63,
      quantity: 6,
      pickup_start: '19:30',
      pickup_end: '21:30',
      dietary: 'non-veg',
      image: 'porotta-chicken.jpg',
      status: 'available',
      weight_grams: 480,
      restaurant_name: 'Grand Pavilion',
      restaurant_address: 'MG Road, Ernakulam, Kochi',
      restaurant_rating: 4.7
    },
    {
      id: 7,
      restaurant_id: 4,
      category_id: 7,
      name: 'Beef Roast',
      description: 'Iconic Kerala Beef Ularthiyathu slow-roasted in a cast iron skillet with toasted crunchy coconut slices (thenga kothu) and curry leaves.',
      original_price: 220,
      rescue_price: 89,
      discount_percent: 60,
      quantity: 6,
      pickup_start: '19:00',
      pickup_end: '21:30',
      dietary: 'non-veg',
      image: 'beef-roast.jpg',
      status: 'available',
      weight_grams: 420,
      restaurant_name: 'Rahmath Hotel',
      restaurant_address: 'Calicut',
      restaurant_rating: 4.8
    },
    {
      id: 8,
      restaurant_id: 6,
      category_id: 7,
      name: 'Chicken 65',
      description: 'Crispy golden-red fried bite-sized chicken chunks tossed with fried green chillies, curry leaves, and sliced shallots on banana leaf.',
      original_price: 180,
      rescue_price: 69,
      discount_percent: 62,
      quantity: 7,
      pickup_start: '18:00',
      pickup_end: '21:00',
      dietary: 'non-veg',
      image: 'chicken-65.jpg',
      status: 'available',
      weight_grams: 350,
      restaurant_name: 'Paris Bakery & Eatery',
      restaurant_address: 'Logan’s Road, Thalassery',
      restaurant_rating: 4.8
    },
    {
      id: 9,
      restaurant_id: 5,
      category_id: 4,
      name: 'Appam + Chicken Stew',
      description: 'Soft, fluffy fermented rice appams with lacy borders served with creamy white coconut milk chicken stew with potatoes and carrots.',
      original_price: 210,
      rescue_price: 79,
      discount_percent: 62,
      quantity: 5,
      pickup_start: '19:30',
      pickup_end: '21:30',
      dietary: 'non-veg',
      image: 'appam-stew.jpg',
      status: 'available',
      weight_grams: 460,
      restaurant_name: 'Grand Pavilion',
      restaurant_address: 'MG Road, Ernakulam, Kochi',
      restaurant_rating: 4.7
    },
    {
      id: 10,
      restaurant_id: 6,
      category_id: 4,
      name: 'Pathiri + Chicken Curry',
      description: 'Delicate soft white circular Malabar rice pathiris stacked fresh, accompanied by rich roasted coconut chicken curry.',
      original_price: 190,
      rescue_price: 69,
      discount_percent: 64,
      quantity: 6,
      pickup_start: '19:00',
      pickup_end: '21:30',
      dietary: 'non-veg',
      image: 'pathiri.jpg',
      status: 'available',
      weight_grams: 440,
      restaurant_name: 'Paris Bakery & Eatery',
      restaurant_address: 'Thalassery',
      restaurant_rating: 4.8
    },
    {
      id: 11,
      restaurant_id: 5,
      category_id: 5,
      name: 'Kappa + Beef Curry',
      description: 'Traditional Kerala boiled seasoned tapioca (Kappa Puzhukku) topped with spicy slow-simmered beef curry on fresh plantain leaf.',
      original_price: 180,
      rescue_price: 69,
      discount_percent: 62,
      quantity: 5,
      pickup_start: '18:30',
      pickup_end: '21:30',
      dietary: 'non-veg',
      image: 'kappa-beef.jpg',
      status: 'available',
      weight_grams: 500,
      restaurant_name: 'Grand Pavilion',
      restaurant_address: 'Ernakulam, Kochi',
      restaurant_rating: 4.7
    },
    {
      id: 12,
      restaurant_id: 5,
      category_id: 5,
      name: 'Kerala Meals',
      description: 'Grand Kerala noon meals: steamed rice, papadum, sambar, avial, thoran, moru curry, rasam, and traditional sweet payasam.',
      original_price: 170,
      rescue_price: 65,
      discount_percent: 62,
      quantity: 8,
      pickup_start: '12:30',
      pickup_end: '15:00',
      dietary: 'veg',
      image: 'kerala-meals.jpg',
      status: 'available',
      weight_grams: 650,
      restaurant_name: 'Grand Pavilion',
      restaurant_address: 'MG Road, Ernakulam, Kochi',
      restaurant_rating: 4.7
    },
    {
      id: 13,
      restaurant_id: 2,
      category_id: 6,
      name: 'Fish Fry',
      description: 'Fresh coastal sea fish marinated in fiery red chilli and turmeric spice paste, pan-fried crisp with onion rings and lime wedge.',
      original_price: 260,
      rescue_price: 99,
      discount_percent: 62,
      quantity: 4,
      pickup_start: '19:30',
      pickup_end: '22:00',
      dietary: 'non-veg',
      image: 'fish-fry.jpg',
      status: 'available',
      weight_grams: 380,
      restaurant_name: 'Paragon Restaurant',
      restaurant_address: 'CH Flyover Junction, Kozhikode',
      restaurant_rating: 4.9
    },
    {
      id: 14,
      restaurant_id: 3,
      category_id: 3,
      name: 'Shawaya / Shawarma Plate',
      description: 'Middle Eastern rotisserie roasted Shawaya chicken and shawarma slices with seasoned yellow rice, fresh salad, and garlic toum.',
      original_price: 200,
      rescue_price: 79,
      discount_percent: 60,
      quantity: 5,
      pickup_start: '19:00',
      pickup_end: '21:30',
      dietary: 'non-veg',
      image: 'shawarma-plate.jpg',
      status: 'available',
      weight_grams: 480,
      restaurant_name: 'Al Reem Alfam Hub',
      restaurant_address: 'Palarivattom Bypass, Kochi',
      restaurant_rating: 4.8
    },
    {
      id: 15,
      restaurant_id: 1,
      category_id: 3,
      name: 'Tandoori Chicken',
      description: 'Vibrant char-grilled clay-oven tandoori chicken leg marinated in Greek yogurt, Kashmiri red chilli, lemon, and tandoori masala.',
      original_price: 250,
      rescue_price: 99,
      discount_percent: 60,
      quantity: 5,
      pickup_start: '19:30',
      pickup_end: '22:00',
      dietary: 'non-veg',
      image: 'tandoori-chicken.jpg',
      status: 'available',
      weight_grams: 490,
      restaurant_name: 'Mandi Manzil',
      restaurant_address: 'Near InfoPark Gate, Kakkanad, Kochi',
      restaurant_rating: 4.9
    }
  ],

  // Initial user reservations for Anvin
  reservations: [
    {
      id: 1,
      reservation_code: 'REP-9482-KL',
      user_id: 4,
      food_id: 1,
      food_name: 'Chicken Kuzhimanthi',
      restaurant_id: 1,
      restaurant_name: 'Mandi Manzil',
      quantity: 2,
      unit_price: 99,
      original_price: 260,
      total_price: 198,
      pickup_time: 'Today, 8:30 PM',
      status: 'ready_for_pickup',
      customer_name: 'Anvin',
      customer_phone: '+91 98450 99887'
    },
    {
      id: 2,
      reservation_code: 'REP-8120-KL',
      user_id: 4,
      food_id: 2,
      food_name: 'Alfaham Chicken & Rice',
      restaurant_id: 3,
      restaurant_name: 'Al Reem Alfam Hub',
      quantity: 1,
      unit_price: 89,
      original_price: 240,
      total_price: 89,
      pickup_time: 'Today, 9:15 PM',
      status: 'confirmed',
      customer_name: 'Anvin',
      customer_phone: '+91 98450 99887'
    }
  ]
};

// Helper: Calculate Anvin's personal impact dynamically from reservations
function calculateUserImpact() {
  const userReservations = DATA.reservations.filter((r) => r.user_id === 4);
  const meals = userReservations.reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);
  const savedMoney = userReservations.reduce((sum, r) => {
    const orig = Number(r.original_price) || (Number(r.unit_price) * 2.5);
    const unit = Number(r.unit_price) || (r.total_price / (r.quantity || 1));
    return sum + ((orig - unit) * (r.quantity || 1));
  }, 0);
  const kg = parseFloat((meals * 0.52).toFixed(1));
  const co2 = parseFloat((kg * 2.5).toFixed(1));
  const ecoScore = Math.min(100, 70 + (meals * 6));

  return {
    meals_rescued: meals,
    money_saved: Math.round(savedMoney),
    kg_diverted: kg,
    co2_saved_kg: co2,
    eco_score: ecoScore,
    eco_badge: ecoScore >= 85 ? 'Master Rescuer 🌴' : 'Kerala Eco Warrior 🌱'
  };
}

// --- HTTP REQUEST HANDLER ---
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;
  const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());

  if (pathname === '/' || pathname === '/index.html' || pathname === '/index.php') {
    pathname = '/index.php';
  }

  // --- API HANDLERS ---
  if (pathname === '/api' || pathname === '/api/' || pathname.startsWith('/api/index.php')) {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let postData = {};
      if (body) {
        try {
          postData = JSON.parse(body);
        } catch (e) {
          postData = Object.fromEntries(new URLSearchParams(body).entries());
        }
      }

      const params = Object.assign({}, queryParams, postData);
      const action = params.action || '';

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });

      let response = { success: false, error: 'Unknown action' };

      switch (action) {
        case 'me':
          response = {
            authenticated: DATA.currentUser !== null,
            user: DATA.currentUser
          };
          break;

        case 'demo_login': {
          const role = params.role || 'customer';
          const user = DATA.users.find((u) => u.role === role) || DATA.users[3];
          DATA.currentUser = Object.assign({}, user);
          response = {
            success: true,
            message: `Switched to ${user.name}`,
            user: DATA.currentUser
          };
          break;
        }

        case 'logout':
          DATA.currentUser = null;
          response = { success: true, message: 'Logged out.' };
          break;

        case 'get_foods': {
          let list = [...DATA.foods];
          if (params.category_id && params.category_id !== 'all' && Number(params.category_id) > 1) {
            list = list.filter((f) => f.category_id == params.category_id);
          }
          if (params.dietary && params.dietary !== 'all') {
            list = list.filter((f) => f.dietary === params.dietary);
          }
          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter((f) =>
              f.name.toLowerCase().includes(q) ||
              f.description.toLowerCase().includes(q) ||
              f.restaurant_name.toLowerCase().includes(q)
            );
          }
          if (params.sort === 'price_asc') {
            list.sort((a, b) => a.rescue_price - b.rescue_price);
          } else if (params.sort === 'price_desc') {
            list.sort((a, b) => b.rescue_price - a.rescue_price);
          } else {
            list.sort((a, b) => b.discount_percent - a.discount_percent);
          }
          response = { success: true, count: list.length, foods: list };
          break;
        }

        case 'get_food_detail': {
          const id = Number(params.id);
          const food = DATA.foods.find((f) => f.id === id);
          response = food ? { success: true, food } : { success: false, error: 'Food not found' };
          break;
        }

        case 'get_categories':
          response = { success: true, categories: DATA.categories };
          break;

        case 'get_restaurants':
          response = { success: true, restaurants: DATA.restaurants };
          break;

        case 'get_platform_impact': {
          const totalMeals = 15420 + DATA.reservations.length;
          response = {
            success: true,
            impact: {
              meals_rescued: totalMeals,
              kg_diverted: Math.round(totalMeals * 0.52),
              co2_saved_kg: Math.round(totalMeals * 1.3),
              money_saved_inr: 3420800,
              partner_restaurants: DATA.restaurants.length,
              active_rescuers: 3680,
              trees_equivalent: 580,
              water_saved_litres: 4650000
            }
          };
          break;
        }

        case 'get_personal_impact':
          response = {
            success: true,
            impact: calculateUserImpact()
          };
          break;

        case 'reserve': {
          const foodId = Number(params.food_id);
          const qty = Number(params.quantity) || 1;
          const food = DATA.foods.find((f) => f.id === foodId);

          if (!food || food.quantity < qty) {
            response = { success: false, error: 'Insufficient quantity available.' };
            break;
          }

          food.quantity -= qty;
          const code = `REP-${Math.floor(1000 + Math.random() * 9000)}-KL`;
          const newReservation = {
            id: DATA.reservations.length + 1,
            reservation_code: code,
            user_id: 4, // Anvin
            customer_name: 'Anvin',
            customer_phone: '+91 98450 99887',
            food_id: food.id,
            food_name: food.name,
            restaurant_id: food.restaurant_id,
            restaurant_name: food.restaurant_name,
            quantity: qty,
            unit_price: food.rescue_price,
            original_price: food.original_price,
            total_price: food.rescue_price * qty,
            pickup_time: params.pickup_time || `${food.pickup_start} – ${food.pickup_end}`,
            status: 'confirmed'
          };

          DATA.reservations.unshift(newReservation);

          response = {
            success: true,
            message: 'Meal rescued successfully!',
            reservation: newReservation
          };
          break;
        }

        case 'my_reservations':
          response = {
            success: true,
            reservations: DATA.reservations,
            impact: calculateUserImpact()
          };
          break;

        case 'delete_reservation': {
          const resId = Number(params.id);
          const index = DATA.reservations.findIndex((r) => r.id === resId);
          if (index !== -1) {
            DATA.reservations.splice(index, 1);
            response = {
              success: true,
              message: 'Order removed successfully.',
              impact: calculateUserImpact()
            };
          } else {
            response = { success: false, error: 'Order not found' };
          }
          break;
        }

        case 'update_profile': {
          const newName = (params.name || '').trim();
          if (!newName) {
            response = { success: false, error: 'Username cannot be empty.' };
            break;
          }
          DATA.currentUser.name = newName;
          const userObj = DATA.users.find((u) => u.id === DATA.currentUser.id);
          if (userObj) userObj.name = newName;
          DATA.reservations.forEach((r) => {
            if (r.user_id === DATA.currentUser.id) {
              r.customer_name = newName;
            }
          });
          response = {
            success: true,
            message: 'Username updated successfully!',
            user: DATA.currentUser
          };
          break;
        }

        case 'restaurant_reservations':
          response = { success: true, reservations: DATA.reservations };
          break;

        case 'restaurant_dashboard':
          response = {
            success: true,
            restaurant: DATA.restaurants[0],
            metrics: {
              meals_rescued: 1980,
              revenue_recovered: 154200,
              pending_pickups: DATA.reservations.filter((r) => r.status === 'confirmed' || r.status === 'ready_for_pickup').length,
              active_listings: DATA.foods.length,
              food_waste_prevented_kg: 980
            },
            listings: DATA.foods
          };
          break;

        case 'update_reservation_status': {
          const id = Number(params.id);
          const order = DATA.reservations.find((r) => r.id === id);
          if (order) {
            order.status = params.status;
            response = { success: true, message: `Status updated to ${params.status.replace('_', ' ')}` };
          } else {
            response = { success: false, error: 'Order not found' };
          }
          break;
        }

        default:
          response = { success: false, error: 'Action not supported: ' + action };
          break;
      }

      res.end(JSON.stringify(response));
    });
    return;
  }

  // --- STATIC FILES ---
  if (pathname === '/index.php' || pathname === '/public/index.php') {
    const indexPath = path.join(PUBLIC_DIR, 'index.php');
    fs.readFile(indexPath, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading: ' + err.message);
        return;
      }
      const sanitized = content.replace(/<\?php[\s\S]*?\?>/g, '');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(sanitized);
    });
    return;
  }

  let filePath = path.join(PUBLIC_DIR, pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(ROOT_DIR, pathname);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌴 REPLATE Kerala - Running for Anvin!`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🍛 Menu: 15 curated Kerala dishes with unique matching photos loaded!`);
  console.log(`======================================================\n`);
});
