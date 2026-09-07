/**
 * REPLATE API Client
 * Clean fetch wrapper for REST API endpoints with instant local fallback for Vercel/Static deployments
 */

const API = (function () {
  const BASE_URL = 'api/index.php';

  // Standalone dataset for Vercel / Static deployments
  const FALLBACK_DATA = {
    user: {
      id: 4,
      name: localStorage.getItem('replate_user_name') || 'Anvin',
      email: 'anvin@replate.test',
      role: 'customer',
      phone: '+91 98450 99887'
    },
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
      { id: 1, name: 'Mandi Manzil', cuisine: 'Arabian & Malabar Mandi Specialist', address: 'Near InfoPark Gate, Kakkanad, Kochi', city: 'Kochi', rating: 4.9, reviews_count: 260, meals_saved_count: 1980 },
      { id: 2, name: 'Paragon Restaurant', cuisine: 'Iconic Malabar Heritage', address: 'CH Flyover Junction, Kozhikode', city: 'Kozhikode', rating: 4.9, reviews_count: 380, meals_saved_count: 2150 },
      { id: 3, name: 'Al Reem Alfam Hub', cuisine: 'Middle-Eastern Charcoal Hub', address: 'Palarivattom Bypass, Kochi', city: 'Kochi', rating: 4.8, reviews_count: 145, meals_saved_count: 1120 },
      { id: 4, name: 'Rahmath Hotel', cuisine: 'Kozhikode Heritage Eatery', address: 'Arakkinar Road, Calicut', city: 'Kozhikode', rating: 4.8, reviews_count: 290, meals_saved_count: 1680 },
      { id: 5, name: 'Grand Pavilion', cuisine: 'Traditional Kerala Coastal', address: 'MG Road, Ernakulam, Kochi', city: 'Kochi', rating: 4.7, reviews_count: 180, meals_saved_count: 940 },
      { id: 6, name: 'Paris Bakery & Eatery', cuisine: 'Historic Malabar Bakes & Eatery', address: 'Logan’s Road, Thalassery', city: 'Thalassery', rating: 4.8, reviews_count: 160, meals_saved_count: 1490 }
    ],
    foods: [
      { id: 1, restaurant_id: 1, category_id: 2, name: 'Chicken Mandi', description: 'Aromatic basmati rice slow-steamed in a charcoal pit with tender roasted chicken quarter, fresh garlic toum, and spicy tomato dip.', original_price: 260, rescue_price: 99, discount_percent: 62, quantity: 6, pickup_start: '19:30', pickup_end: '22:00', dietary: 'non-veg', image: 'mandi.jpg', status: 'available', weight_grams: 550, restaurant_name: 'Mandi Manzil', restaurant_address: 'Near InfoPark Gate, Kakkanad, Kochi', restaurant_rating: 4.9 },
      { id: 2, restaurant_id: 3, category_id: 3, name: 'Alfaham Chicken & Rice', description: 'Smoky charcoal-grilled spicy Alfaham chicken served with fragrant seasoned basmati rice, hot kuboos, and creamy garlic toum.', original_price: 240, rescue_price: 89, discount_percent: 63, quantity: 5, pickup_start: '19:00', pickup_end: '21:30', dietary: 'non-veg', image: 'alfaham.jpg', status: 'available', weight_grams: 500, restaurant_name: 'Al Reem Alfam Hub', restaurant_address: 'Palarivattom Bypass, Kochi', restaurant_rating: 4.8 },
      { id: 3, restaurant_id: 2, category_id: 2, name: 'Thalassery Chicken Biriyani', description: 'Authentic Khyma rice dum biriyani layered with slow-cooked Malabar spiced chicken, golden fried onions (bista), cashews, and raisins.', original_price: 250, rescue_price: 99, discount_percent: 60, quantity: 7, pickup_start: '20:00', pickup_end: '22:30', dietary: 'non-veg', image: 'biriyani.jpg', status: 'available', weight_grams: 500, restaurant_name: 'Paragon Restaurant', restaurant_address: 'CH Flyover Junction, Kozhikode', restaurant_rating: 4.9 },
      { id: 4, restaurant_id: 2, category_id: 2, name: 'Mutton Biriyani', description: 'Fragrant Malabar dum biriyani prepared with tender fall-off-the-bone mutton chunks, fried shallots, pure ghee, and fresh mint.', original_price: 320, rescue_price: 129, discount_percent: 60, quantity: 4, pickup_start: '20:00', pickup_end: '22:30', dietary: 'non-veg', image: 'mutton-biriyani.jpg', status: 'available', weight_grams: 520, restaurant_name: 'Paragon Restaurant', restaurant_address: 'CH Flyover Junction, Kozhikode', restaurant_rating: 4.9 },
      { id: 5, restaurant_id: 4, category_id: 4, name: 'Porotta + Beef Curry', description: 'Flaky, layered golden Kerala porottas paired with rich, dark slow-simmered Kozhikodan beef gravy infused with fennel and black pepper.', original_price: 210, rescue_price: 79, discount_percent: 62, quantity: 8, pickup_start: '19:00', pickup_end: '21:30', dietary: 'non-veg', image: 'porotta-beef.jpg', status: 'available', weight_grams: 500, restaurant_name: 'Rahmath Hotel', restaurant_address: 'Arakkinar Road, Calicut', restaurant_rating: 4.8 },
      { id: 6, restaurant_id: 5, category_id: 4, name: 'Porotta + Chicken Curry', description: 'Crispy layered Kerala parottas served with a traditional clay pot of aromatic coconut-fennel spicy chicken curry.', original_price: 200, rescue_price: 75, discount_percent: 63, quantity: 6, pickup_start: '19:30', pickup_end: '21:30', dietary: 'non-veg', image: 'porotta-chicken.jpg', status: 'available', weight_grams: 480, restaurant_name: 'Grand Pavilion', restaurant_address: 'MG Road, Ernakulam, Kochi', restaurant_rating: 4.7 },
      { id: 7, restaurant_id: 4, category_id: 7, name: 'Beef Roast', description: 'Iconic Kerala Beef Ularthiyathu slow-roasted in a cast iron skillet with toasted crunchy coconut slices (thenga kothu) and curry leaves.', original_price: 220, rescue_price: 89, discount_percent: 60, quantity: 6, pickup_start: '19:00', pickup_end: '21:30', dietary: 'non-veg', image: 'beef-roast.jpg', status: 'available', weight_grams: 420, restaurant_name: 'Rahmath Hotel', restaurant_address: 'Calicut', restaurant_rating: 4.8 },
      { id: 8, restaurant_id: 6, category_id: 7, name: 'Chicken 65', description: 'Crispy golden-red fried bite-sized chicken chunks tossed with fried green chillies, curry leaves, and sliced shallots on banana leaf.', original_price: 180, rescue_price: 69, discount_percent: 62, quantity: 7, pickup_start: '18:00', pickup_end: '21:00', dietary: 'non-veg', image: 'chicken-65.jpg', status: 'available', weight_grams: 350, restaurant_name: 'Paris Bakery & Eatery', restaurant_address: 'Logan’s Road, Thalassery', restaurant_rating: 4.8 },
      { id: 9, restaurant_id: 5, category_id: 4, name: 'Appam + Chicken Stew', description: 'Soft, fluffy fermented rice appams with lacy borders served with creamy white coconut milk chicken stew with potatoes and carrots.', original_price: 210, rescue_price: 79, discount_percent: 62, quantity: 5, pickup_start: '19:30', pickup_end: '21:30', dietary: 'non-veg', image: 'appam-stew.jpg', status: 'available', weight_grams: 460, restaurant_name: 'Grand Pavilion', restaurant_address: 'MG Road, Ernakulam, Kochi', restaurant_rating: 4.7 },
      { id: 10, restaurant_id: 6, category_id: 4, name: 'Pathiri + Chicken Curry', description: 'Delicate soft white circular Malabar rice pathiris stacked fresh, accompanied by rich roasted coconut chicken curry.', original_price: 190, rescue_price: 69, discount_percent: 64, quantity: 6, pickup_start: '19:00', pickup_end: '21:30', dietary: 'non-veg', image: 'pathiri.jpg', status: 'available', weight_grams: 440, restaurant_name: 'Paris Bakery & Eatery', restaurant_address: 'Thalassery', restaurant_rating: 4.8 },
      { id: 11, restaurant_id: 5, category_id: 5, name: 'Kappa + Beef Curry', description: 'Traditional Kerala boiled seasoned tapioca (Kappa Puzhukku) topped with spicy slow-simmered beef curry on fresh plantain leaf.', original_price: 180, rescue_price: 69, discount_percent: 62, quantity: 5, pickup_start: '18:30', pickup_end: '21:30', dietary: 'non-veg', image: 'kappa-beef.jpg', status: 'available', weight_grams: 500, restaurant_name: 'Grand Pavilion', restaurant_address: 'Ernakulam, Kochi', restaurant_rating: 4.7 },
      { id: 12, restaurant_id: 5, category_id: 5, name: 'Kerala Meals', description: 'Grand Kerala noon meals: steamed rice, papadum, sambar, avial, thoran, moru curry, rasam, and traditional sweet payasam.', original_price: 170, rescue_price: 65, discount_percent: 62, quantity: 8, pickup_start: '12:30', pickup_end: '15:00', dietary: 'veg', image: 'kerala-meals.jpg', status: 'available', weight_grams: 650, restaurant_name: 'Grand Pavilion', restaurant_address: 'MG Road, Ernakulam, Kochi', restaurant_rating: 4.7 },
      { id: 13, restaurant_id: 2, category_id: 6, name: 'Fish Fry', description: 'Fresh coastal sea fish marinated in fiery red chilli and turmeric spice paste, pan-fried crisp with onion rings and lime wedge.', original_price: 260, rescue_price: 99, discount_percent: 62, quantity: 4, pickup_start: '19:30', pickup_end: '22:00', dietary: 'non-veg', image: 'fish-fry.jpg', status: 'available', weight_grams: 380, restaurant_name: 'Paragon Restaurant', restaurant_address: 'CH Flyover Junction, Kozhikode', restaurant_rating: 4.9 },
      { id: 14, restaurant_id: 3, category_id: 3, name: 'Shawaya / Shawarma Plate', description: 'Middle Eastern rotisserie roasted Shawaya chicken and shawarma slices with seasoned yellow rice, fresh salad, and garlic toum.', original_price: 200, rescue_price: 79, discount_percent: 60, quantity: 5, pickup_start: '19:00', pickup_end: '21:30', dietary: 'non-veg', image: 'shawarma-plate.jpg', status: 'available', weight_grams: 480, restaurant_name: 'Al Reem Alfam Hub', restaurant_address: 'Palarivattom Bypass, Kochi', restaurant_rating: 4.8 },
      { id: 15, restaurant_id: 1, category_id: 3, name: 'Tandoori Chicken', description: 'Vibrant char-grilled clay-oven tandoori chicken leg marinated in Greek yogurt, Kashmiri red chilli, lemon, and tandoori masala.', original_price: 250, rescue_price: 99, discount_percent: 60, quantity: 5, pickup_start: '19:30', pickup_end: '22:00', dietary: 'non-veg', image: 'tandoori-chicken.jpg', status: 'available', weight_grams: 490, restaurant_name: 'Mandi Manzil', restaurant_address: 'Near InfoPark Gate, Kakkanad, Kochi', restaurant_rating: 4.9 }
    ],
    getReservations() {
      const stored = localStorage.getItem('replate_reservations');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      const initial = [
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
          notes: 'Extra garlic toum requested',
          created_at: '2026-09-07 19:15:00',
          customer_name: localStorage.getItem('replate_user_name') || 'Anvin'
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
          notes: 'Extra spicy',
          created_at: '2026-09-07 19:30:00',
          customer_name: localStorage.getItem('replate_user_name') || 'Anvin'
        }
      ];
      localStorage.setItem('replate_reservations', JSON.stringify(initial));
      return initial;
    },
    saveReservations(list) {
      localStorage.setItem('replate_reservations', JSON.stringify(list));
    }
  };

  function calculateUserImpact(reservations) {
    let mealsCount = 0;
    let totalSavedInr = 0;
    let kgDiverted = 0;
    reservations.forEach(r => {
      const qty = r.quantity || 1;
      mealsCount += qty;
      const orig = r.original_price || (r.unit_price * 2.5);
      const paid = r.unit_price || 0;
      totalSavedInr += (orig - paid) * qty;
      kgDiverted += (qty * 0.52);
    });
    return {
      meals_saved: mealsCount,
      money_saved_inr: Math.round(totalSavedInr),
      kg_diverted: Number(kgDiverted.toFixed(1)),
      co2_kg_prevented: Number((kgDiverted * 2.5).toFixed(1))
    };
  }

  function handleFallback(action, params = {}) {
    const userName = localStorage.getItem('replate_user_name') || 'Anvin';
    FALLBACK_DATA.user.name = userName;

    switch (action) {
      case 'me':
        return { success: true, authenticated: true, user: FALLBACK_DATA.user };

      case 'get_foods': {
        let list = [...FALLBACK_DATA.foods];
        if (params.category_id && params.category_id !== 'all' && Number(params.category_id) !== 1) {
          list = list.filter(f => f.category_id === Number(params.category_id));
        }
        if (params.search) {
          const q = params.search.toLowerCase();
          list = list.filter(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.restaurant_name.toLowerCase().includes(q));
        }
        if (params.dietary && params.dietary !== 'all') {
          list = list.filter(f => f.dietary === params.dietary);
        }
        return { success: true, foods: list, total: list.length };
      }

      case 'get_food_detail': {
        const found = FALLBACK_DATA.foods.find(f => f.id === Number(params.id)) || FALLBACK_DATA.foods[0];
        return { success: true, food: found };
      }

      case 'get_categories':
        return { success: true, categories: FALLBACK_DATA.categories };

      case 'get_restaurants':
        return { success: true, restaurants: FALLBACK_DATA.restaurants };

      case 'get_platform_impact':
        return {
          success: true,
          impact: {
            meals_rescued: 14680,
            kg_diverted: 4820.5,
            money_saved_inr: 3240800,
            active_rescuers: 4210,
            partner_restaurants: 64,
            trees_equivalent: 194,
            water_saved_litres: 12400000
          }
        };

      case 'my_reservations': {
        const resList = FALLBACK_DATA.getReservations();
        return {
          success: true,
          reservations: resList,
          impact: calculateUserImpact(resList)
        };
      }

      case 'delete_reservation': {
        let resList = FALLBACK_DATA.getReservations();
        const resId = Number(params.id);
        resList = resList.filter(r => r.id !== resId);
        FALLBACK_DATA.saveReservations(resList);
        return {
          success: true,
          message: 'Order removed successfully.',
          impact: calculateUserImpact(resList)
        };
      }

      case 'reserve': {
        let resList = FALLBACK_DATA.getReservations();
        const food = FALLBACK_DATA.foods.find(f => f.id === Number(params.food_id)) || FALLBACK_DATA.foods[0];
        const qty = Number(params.quantity) || 1;
        const newRes = {
          id: Date.now(),
          reservation_code: 'REP-' + Math.floor(1000 + Math.random() * 9000) + '-KL',
          user_id: 4,
          food_id: food.id,
          food_name: food.name,
          restaurant_id: food.restaurant_id,
          restaurant_name: food.restaurant_name,
          quantity: qty,
          unit_price: food.rescue_price,
          original_price: food.original_price,
          total_price: food.rescue_price * qty,
          pickup_time: params.pickup_time || `${food.pickup_start} – ${food.pickup_end}`,
          status: 'confirmed',
          customer_name: userName,
          created_at: new Date().toISOString()
        };
        resList.unshift(newRes);
        FALLBACK_DATA.saveReservations(resList);
        return {
          success: true,
          message: 'Meal rescued successfully!',
          reservation: newRes
        };
      }

      case 'update_profile': {
        const newName = (params.name || '').trim();
        if (!newName) return { success: false, error: 'Username cannot be empty.' };
        localStorage.setItem('replate_user_name', newName);
        FALLBACK_DATA.user.name = newName;
        let resList = FALLBACK_DATA.getReservations();
        resList.forEach(r => { r.customer_name = newName; });
        FALLBACK_DATA.saveReservations(resList);
        return {
          success: true,
          message: 'Username updated successfully!',
          user: FALLBACK_DATA.user
        };
      }

      default:
        return { success: true };
    }
  }

  async function request(action, params = {}, method = 'GET') {
    let url = `${BASE_URL}?action=${encodeURIComponent(action)}`;
    const options = {
      method,
      headers: {
        'Accept': 'application/json'
      }
    };

    if (method === 'GET' && Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString();
      url += `&${query}`;
    } else if (method === 'POST') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(params);
    }

    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        // Fallback for static hosts / Vercel
        return handleFallback(action, params);
      }
      const data = await res.json();
      return data;
    } catch (err) {
      // Offline / Vercel static fallback
      return handleFallback(action, params);
    }
  }

  return {
    // Auth
    login: (email, password) => request('login', { email, password }, 'POST'),
    demoLogin: (role) => request('demo_login', { role }, 'POST'),
    register: (data) => request('register', data, 'POST'),
    logout: () => request('logout', {}, 'POST'),
    me: () => request('me'),
    updateProfile: (data) => request('update_profile', data, 'POST'),

    // Foods & Catalog
    getFoods: (params = {}) => request('get_foods', params),
    getFoodDetail: (id) => request('get_food_detail', { id }),
    getCategories: () => request('get_categories'),
    getFeatured: () => request('get_featured'),
    addSurplusFood: (data) => request('add_surplus_food', data, 'POST'),

    // Restaurants
    getRestaurants: () => request('get_restaurants'),
    getRestaurantDetail: (id) => request('get_restaurant_detail', { id }),
    restaurantDashboard: () => request('restaurant_dashboard'),

    // Reservations
    reserve: (data) => request('reserve', data, 'POST'),
    myReservations: () => request('my_reservations'),
    deleteReservation: (id) => request('delete_reservation', { id }, 'POST'),
    restaurantReservations: (rid) => request('restaurant_reservations', { restaurant_id: rid }),
    updateReservationStatus: (id, status) => request('update_reservation_status', { id, status }, 'POST'),

    // Impact
    getPlatformImpact: () => request('get_platform_impact'),
    getPersonalImpact: () => request('get_personal_impact'),

    // Admin
    adminDashboard: () => request('admin_dashboard'),
    adminToggleRestaurant: (id, status) => request('admin_toggle_restaurant', { id, status }, 'POST'),
    adminToggleFood: (id, status) => request('admin_toggle_food', { id, status }, 'POST')
  };
})();

// Toast Notification Manager
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
  toast.innerHTML = `<span style="color: var(--accent-lime); font-weight: bold; font-size: 1.1rem;">${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s, transform 0.4s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
