/**
 * REPLATE API Client
 * Clean fetch wrapper for REST API endpoints
 */

const API = (function () {
  const BASE_URL = 'api/index.php';

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
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`API Error [${action}]:`, err);
      return { success: false, error: err.message };
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
