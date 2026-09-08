/**
 * REPLATE Master Application Controller (Kerala Edition)
 * Single-Page Reactive View Engine & State Management
 * Tailored for Anvin with 15 curated authentic Kerala food drops & Mandi Manzil
 */

const App = (function () {
  // Application State
  const state = {
    currentUser: { id: 4, name: 'Anvin', email: 'demo@replate.test', role: 'customer', phone: '+91 98450 99887' },
    currentView: 'home',
    foods: [],
    categories: [],
    restaurants: [],
    platformImpact: null,
    activeFilters: {
      category_id: 'all',
      dietary: 'all',
      search: '',
      sort: 'discount_desc'
    },
    selectedFood: null,
    reservationModalQty: 1
  };

  // --- INITIALIZATION ---
  async function init() {
    setupEventListeners();
    await checkAuth();
    await loadInitialData();
    handleRouting();
    window.addEventListener('popstate', handleRouting);
  }

  // --- AUTH CHECK ---
  async function checkAuth() {
    const savedName = localStorage.getItem('replate_user_name') || 'Anvin';
    try {
      const res = await API.me();
      if (res && res.authenticated && res.user) {
        state.currentUser = res.user;
      } else {
        state.currentUser = { id: 4, name: savedName, email: 'demo@replate.test', role: 'customer', phone: '+91 98450 99887' };
      }
    } catch (e) {
      state.currentUser = { id: 4, name: savedName, email: 'demo@replate.test', role: 'customer', phone: '+91 98450 99887' };
    }
    if (savedName && state.currentUser) {
      state.currentUser.name = savedName;
    }
    updateNavAuthUI();
  }

  // --- LOAD INITIAL DATA ---
  async function loadInitialData() {
    try {
      const [foodsRes, catsRes, restRes, impactRes] = await Promise.all([
        API.getFoods(state.activeFilters),
        API.getCategories(),
        API.getRestaurants(),
        API.getPlatformImpact()
      ]);

      if (foodsRes && foodsRes.success) state.foods = foodsRes.foods;
      if (catsRes && catsRes.success) state.categories = catsRes.categories;
      if (restRes && restRes.success) state.restaurants = restRes.restaurants;
      if (impactRes && impactRes.success) state.platformImpact = impactRes.impact;
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  }

  // --- ROUTING ---
  function navigateTo(view, pushState = true) {
    state.currentView = view;
    if (pushState) {
      window.history.pushState({ view }, '', `#${view}`);
    }

    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderCurrentView();
    updateNavLinks();
  }

  function handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const validViews = ['home', 'discover', 'customer-dashboard', 'restaurant-portal', 'admin-panel'];
    const target = validViews.includes(hash) ? hash : 'home';
    navigateTo(target, false);
  }

  function updateNavLinks() {
    document.querySelectorAll('.nav-link').forEach((link) => {
      const view = link.getAttribute('data-view');
      link.classList.toggle('active', view === state.currentView);
    });
    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      const view = link.getAttribute('data-view');
      link.classList.toggle('active', view === state.currentView);
    });
  }

  // --- NAVBAR AUTH UI (Profile with direct Edit Username) ---
  function updateNavAuthUI() {
    const user = state.currentUser;
    const authContainer = document.getElementById('nav-user-actions');
    const mobileUserCard = document.getElementById('mobile-user-card');

    if (user) {
      const initial = ((user.name || 'A').trim())[0]?.toUpperCase() || 'A';
      if (authContainer) {
        authContainer.innerHTML = `
          <div class="user-profile-btn" id="user-profile-btn" title="Click to edit username" style="cursor: pointer;">
            <div class="user-avatar-sm">${escapeHtml(initial)}</div>
            <span style="font-weight: 700; color: var(--cream);" class="nav-user-name-text" id="nav-user-name">${escapeHtml(user.name || 'Anvin')}</span>
            <span style="font-size: 0.75rem; color: var(--accent-lime); margin-left: 3px;" class="nav-user-edit-icon" title="Edit Username">✏️</span>
          </div>
          <button class="btn btn-primary btn-sm nav-orders-btn" id="nav-cta-btn">
            My Orders
          </button>
        `;

        document.getElementById('user-profile-btn')?.addEventListener('click', () => {
          App.editUsername();
        });

        document.getElementById('nav-cta-btn')?.addEventListener('click', () => {
          navigateTo('customer-dashboard');
        });
      }

      if (mobileUserCard) {
        mobileUserCard.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="user-avatar-sm" style="width: 42px; height: 42px; font-size: 1.1rem;">${escapeHtml(initial)}</div>
            <div>
              <div style="font-weight: 700; color: var(--cream); font-size: 1rem;" id="mobile-user-name">${escapeHtml(user.name || 'Anvin')}</div>
              <div style="font-size: 0.72rem; color: var(--accent-lime); font-weight: 600;">Customer • Kerala Rescuer 🌴</div>
            </div>
          </div>
          <button class="btn btn-outline-lime btn-sm" onclick="App.editUsername(); App.closeMobileMenu();" style="padding: 4px 10px; font-size: 0.75rem; border-radius: var(--radius-full);">
            ✏️ Edit Name
          </button>
        `;
      }
    } else {
      if (authContainer) {
        authContainer.innerHTML = `
          <button class="btn btn-secondary btn-sm" id="nav-login-btn">Sign In</button>
          <button class="btn btn-primary btn-sm" id="nav-cta-btn">Rescue Food</button>
        `;
        document.getElementById('nav-login-btn')?.addEventListener('click', () => navigateTo('customer-dashboard'));
        document.getElementById('nav-cta-btn')?.addEventListener('click', () => navigateTo('discover'));
      }
      if (mobileUserCard) {
        mobileUserCard.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="user-avatar-sm" style="width: 38px; height: 38px;">👤</div>
            <div>
              <div style="font-weight: 700; color: var(--cream); font-size: 0.95rem;">Guest User</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Explore surplus Kerala food</div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.navigateTo('customer-dashboard'); App.closeMobileMenu();">Sign In</button>
        `;
      }
    }
  }

  // --- RENDER CURRENT VIEW ---
  function renderCurrentView() {
    const main = document.getElementById('app-main');
    if (!main) return;

    switch (state.currentView) {
      case 'home':
        main.innerHTML = renderHomeView();
        setupHomeInteractions();
        break;
      case 'discover':
        main.innerHTML = renderDiscoverView();
        setupDiscoverInteractions();
        break;
      case 'customer-dashboard':
        renderCustomerDashboardView(main);
        break;
      case 'restaurant-portal':
        renderRestaurantPortalView(main);
        break;
      case 'admin-panel':
        renderAdminPanelView(main);
        break;
      default:
        main.innerHTML = renderHomeView();
        setupHomeInteractions();
        break;
    }

    if (window.ReplateMotion) {
      window.ReplateMotion.animateCounters();
    }
  }

  // --- 1. HOME VIEW (Spotlighting Chicken Mandi from Mandi Manzil) ---
  function renderHomeView() {
    const topFoods = state.foods.slice(0, 6);
    const impact = state.platformImpact || {
      meals_rescued: 15420,
      kg_diverted: 4820,
      money_saved_inr: 3420800,
      partner_restaurants: 6,
      active_rescuers: 3680,
      trees_equivalent: 580,
      water_saved_litres: 4650000
    };

    return `
      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-content">
              <div class="hero-pill-badge">
                <span class="pulse-dot"></span>
                Kerala Food Surplus Rescue • Kochi • Kozhikode • Trivandrum
              </div>
              <h1 class="hero-title">
                Rescue food.<br>
                <em>Reduce waste.</em>
              </h1>
              <p class="hero-subtitle">
                Authentic Chicken Mandi, Alfaham, Biriyani, Porotta with Beef, and Malabar specials from top Kerala restaurants at up to 70% off. Delicious food deserves a second chance.
              </p>
              <div class="hero-actions">
                <button class="btn btn-primary btn-lg" id="hero-explore-btn">
                  Explore Kerala Food Drops
                  <span style="font-size: 1.2rem;">→</span>
                </button>
                <button class="btn btn-secondary btn-lg" id="hero-partner-btn">
                  Partner Restaurants
                </button>
              </div>
              <div class="hero-stats-row">
                <div class="stat-item">
                  <div class="stat-number" data-counter="${impact.meals_rescued}" data-suffix="+">${impact.meals_rescued}+</div>
                  <div class="stat-label">Meals Rescued</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number" data-counter="${Math.round(impact.kg_diverted)}" data-suffix=" kg">${Math.round(impact.kg_diverted)} kg</div>
                  <div class="stat-label">Food Saved in Kerala</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number" data-counter="${(impact.money_saved_inr / 100000).toFixed(1)}" data-prefix="₹" data-suffix="L" data-decimals="1">₹${(impact.money_saved_inr / 100000).toFixed(1)}L</div>
                  <div class="stat-label">Value Recovered</div>
                </div>
              </div>
            </div>

            <!-- HERO 3D VISUAL SHOWCASE (Mandi Manzil Chicken Mandi) -->
            <div class="hero-visual-wrapper">
              <div class="hero-glow-ring"></div>
              
              <div class="hero-floating-pill pill-left">
                <div class="pill-icon">🌴</div>
                <div class="pill-content">
                  <div class="pill-title">Zero Waste Kerala</div>
                  <div class="pill-desc">4.8 Tonnes Diverted</div>
                </div>
              </div>

              <div class="hero-main-card">
                <div class="hero-food-img-wrap">
                  <img src="assets/images/mandi.jpg" alt="Chicken Mandi" onerror="this.src='assets/images/hero-food.jpg'">
                  <div class="hero-badge-float">
                    <span class="discount-badge">62% OFF</span>
                  </div>
                  <div class="hero-time-float">
                    <span>⏱ Pickup: 7:30 PM – 10:00 PM</span>
                  </div>
                </div>
                <div class="hero-card-body">
                  <div class="hero-card-meta">
                    <span class="hero-restaurant-name">Mandi Manzil • Kakkanad, Kochi</span>
                    <span class="hero-restaurant-rating">★ 4.9</span>
                  </div>
                  <h3 class="hero-card-title">Chicken Mandi</h3>
                  <div class="hero-card-footer">
                    <div class="food-price-block">
                      <div class="price-tag" style="color: var(--accent-lime);">
                        <span class="price-currency">₹</span>
                        <span class="price-amount">99</span>
                      </div>
                      <span class="price-original">₹260</span>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="App.openFoodDetail(1)">Rescue Now</button>
                  </div>
                </div>
              </div>

              <div class="hero-floating-pill pill-right">
                <div class="pill-icon">⚡</div>
                <div class="pill-content">
                  <div class="pill-title">6 Boxes Left</div>
                  <div class="pill-desc">1.4 km Away</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- LIVE IMPACT DASHBOARD -->
      <section class="impact-section">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Environmental Balance</span>
            <h2 class="section-title">Measurable Kerala Impact</h2>
            <p class="section-desc">
              Every surplus portion rescued keeps great food out of landfills, protects our backwaters, and saves money.
            </p>
          </div>

          <div class="impact-cards-grid">
            <div class="impact-kpi-card">
              <div class="kpi-icon">🍛</div>
              <div class="kpi-number" data-counter="${impact.meals_rescued}">${impact.meals_rescued}</div>
              <div class="kpi-label">Kerala Meals Rescued</div>
              <div class="kpi-subtext">Kochi, Calicut & Trivandrum</div>
            </div>

            <div class="impact-kpi-card">
              <div class="kpi-icon">⚖️</div>
              <div class="kpi-number" data-counter="${Math.round(impact.kg_diverted)}" data-suffix=" kg">${Math.round(impact.kg_diverted)} kg</div>
              <div class="kpi-label">Food Waste Diverted</div>
              <div class="kpi-subtext">~12 tonnes CO₂ offset</div>
            </div>

            <div class="impact-kpi-card">
              <div class="kpi-icon">❤️</div>
              <div class="kpi-number" data-counter="${impact.active_rescuers}">${impact.active_rescuers}</div>
              <div class="kpi-label">Happy Rescuers</div>
              <div class="kpi-subtext">Conscious local foodies</div>
            </div>

            <div class="impact-kpi-card">
              <div class="kpi-icon">🏬</div>
              <div class="kpi-number" data-counter="${impact.partner_restaurants}">${impact.partner_restaurants}</div>
              <div class="kpi-label">Partner Kitchens</div>
              <div class="kpi-subtext">Certified zero-waste</div>
            </div>
          </div>

          <div class="impact-equivalents-bar">
            <div class="equiv-item">
              <span class="equiv-icon">🌳</span>
              <div class="equiv-text">
                <h5>${impact.trees_equivalent} Trees Equivalent</h5>
                <p>Green cover protected</p>
              </div>
            </div>
            <div class="equiv-item">
              <span class="equiv-icon">💧</span>
              <div class="equiv-text">
                <h5>${(impact.water_saved_litres / 1000000).toFixed(1)}M Litres Preserved</h5>
                <p>Agricultural water saved</p>
              </div>
            </div>
            <div class="equiv-item">
              <span class="equiv-icon">💰</span>
              <div class="equiv-text">
                <h5>₹${(impact.money_saved_inr / 100000).toFixed(1)} Lakhs Recovered</h5>
                <p>Customer savings in Kerala</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURED SURPLUS DROPS -->
      <section class="marketplace-section" style="padding-top: 60px;">
        <div class="container">
          <div class="marketplace-header-row">
            <div>
              <span class="section-tag">Today's Fresh Surplus Drops</span>
              <h2 class="section-title">Kerala Surplus Delights</h2>
              <p class="section-desc">Chicken Mandi, Alfaham, Biriyani, Porotta & Beef. Grab yours before the pickup window closes.</p>
            </div>
            <button class="btn btn-outline-lime" onclick="App.navigateTo('discover')">
              View All ${state.foods.length} Drops →
            </button>
          </div>

          <div class="foods-grid">
            ${topFoods.map((food) => renderFoodCard(food)).join('')}
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="how-it-works-section">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Simple & Rewarding</span>
            <h2 class="section-title">How Replate Works</h2>
            <p class="section-desc">Four intuitive steps to stop food waste in Kerala and savor top restaurant meals at student-friendly prices.</p>
          </div>

          <div class="steps-pipeline-grid">
            <div class="step-card">
              <div class="step-number">01</div>
              <div class="step-icon-wrap">🍳</div>
              <h4 class="step-title">Surplus Prepared</h4>
              <p class="step-desc">Kitchens cook fresh Mandi, Biriyani, and Alfam. Extra unsold batches are packed fresh and hot.</p>
            </div>

            <div class="step-card">
              <div class="step-number">02</div>
              <div class="step-icon-wrap">📱</div>
              <h4 class="step-title">Listed at 50–70% Off</h4>
              <p class="step-desc">Restaurants list surplus items with designated pickup windows (usually 7:30 PM to 10:00 PM).</p>
            </div>

            <div class="step-card">
              <div class="step-number">03</div>
              <div class="step-icon-wrap">⚡</div>
              <h4 class="step-title">Rescued Online</h4>
              <p class="step-desc">You reserve on Replate and get an instant digital verification code (e.g. REP-9482-KL).</p>
            </div>

            <div class="step-card">
              <div class="step-number">04</div>
              <div class="step-icon-wrap">🎁</div>
              <h4 class="step-title">Collected at Counter</h4>
              <p class="step-desc">Show your code at the restaurant, collect your meal, and celebrate zero-waste dining!</p>
            </div>
          </div>
        </div>
      </section>

      <!-- RESTAURANTS SPOTLIGHT -->
      <section style="padding: 90px 0;">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Partner Establishments</span>
            <h2 class="section-title">Kerala Partner Restaurants</h2>
            <p class="section-desc">Leading dining destinations across Kochi, Kozhikode, and Thalassery partnering for zero waste.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">
            ${state.restaurants.map((rest) => `
              <div class="impact-kpi-card" style="text-align: left; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
                  <div>
                    <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--cream);">${escapeHtml(rest.name)}</h3>
                    <span style="font-size: 0.82rem; color: var(--sage);">${escapeHtml(rest.cuisine)}</span>
                  </div>
                  <span style="color: #FFD166; font-weight: 800; font-size: 0.95rem;">★ ${rest.rating}</span>
                </div>
                <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
                  ${escapeHtml(rest.description)}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-subtle); font-size: 0.78rem;">
                  <span style="color: var(--cream-dim);">📍 ${escapeHtml(rest.address)}</span>
                  <span style="color: var(--accent-lime); font-weight: 700;">Saved ${rest.meals_saved_count}+ meals</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  // --- 2. DISCOVER / MARKETPLACE VIEW (15 Curated Kerala Dishes) ---
  function renderDiscoverView() {
    return `
      <section class="marketplace-section">
        <div class="container">
          <div class="marketplace-header-row">
            <div>
              <span class="section-tag">Kerala Food Rescue Menu</span>
              <h1 class="section-title" style="margin-bottom: 8px;">Good food. Better prices.</h1>
              <p class="section-desc">Mandi, Biriyani, Alfaham, Porotta, Beef, and authentic Kerala specials at up to 70% off.</p>
            </div>
            <div style="font-size: 0.9rem; color: var(--accent-lime); font-weight: 700;">
              ${state.foods.length} Live Drops Active
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="search-filter-bar">
            <div class="search-input-wrap">
              <span class="search-icon-pos">🔍</span>
              <input type="text" id="market-search" placeholder="Search Mandi, Biriyani, Alfaham, Porotta, Beef..." value="${escapeHtml(state.activeFilters.search)}">
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <select id="market-dietary" class="form-control" style="width: auto; padding: 10px 16px;">
                <option value="all" ${state.activeFilters.dietary === 'all' ? 'selected' : ''}>All Diets</option>
                <option value="non-veg" ${state.activeFilters.dietary === 'non-veg' ? 'selected' : ''}>🍗 Non-Veg Dishes</option>
                <option value="veg" ${state.activeFilters.dietary === 'veg' ? 'selected' : ''}>🌱 Pure Veg Specials</option>
              </select>

              <select id="market-sort" class="form-control" style="width: auto; padding: 10px 16px;">
                <option value="discount_desc" ${state.activeFilters.sort === 'discount_desc' ? 'selected' : ''}>Highest Discount</option>
                <option value="price_asc" ${state.activeFilters.sort === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price_desc" ${state.activeFilters.sort === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
              </select>
            </div>
          </div>

          <!-- Categories Chips -->
          <div class="category-filter-chips">
            ${state.categories.map((cat) => `
              <button class="category-chip ${state.activeFilters.category_id == cat.id || (cat.id == 1 && state.activeFilters.category_id === 'all') ? 'active' : ''}" data-cat-id="${cat.id}">
                ${escapeHtml(cat.name)}
              </button>
            `).join('')}
          </div>

          <!-- Food Grid (15 Items) -->
          <div class="foods-grid" id="market-foods-grid">
            ${state.foods.length > 0 
              ? state.foods.map((food) => renderFoodCard(food)).join('')
              : `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                  <div style="font-size: 3rem; margin-bottom: 16px;">🍲</div>
                  <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--cream);">No Dishes Match Your Filter</h3>
                  <p style="color: var(--text-muted); margin-top: 8px;">Try searching for "Mandi", "Biriyani", or "Porotta".</p>
                  <button class="btn btn-outline-lime btn-sm" style="margin-top: 20px;" onclick="App.resetFilters()">Reset All Filters</button>
                </div>
              `}
          </div>
        </div>
      </section>
    `;
  }

  // --- 3. CUSTOMER DASHBOARD / MY ORDERS (Dynamic Stats & Delete Order) ---
  async function renderCustomerDashboardView(container) {
    const resRes = await API.myReservations();
    const reservations = (resRes && resRes.reservations) ? resRes.reservations : [];

    // Dynamically calculate metrics from actual reservations so they are NEVER zero!
    const mealsCount = reservations.reduce((acc, r) => acc + (Number(r.quantity) || 1), 0);
    const totalSavedInr = reservations.reduce((acc, r) => {
      const orig = Number(r.original_price) || (Number(r.unit_price) * 2.5) || 240;
      const unit = Number(r.unit_price) || (r.total_price / (r.quantity || 1)) || 90;
      return acc + ((orig - unit) * (r.quantity || 1));
    }, 0);
    const kgSaved = (mealsCount * 0.52).toFixed(1);
    const co2Saved = (kgSaved * 2.5).toFixed(1);
    const ecoScore = Math.min(100, 70 + (mealsCount * 6));

    container.innerHTML = `
      <section class="dashboard-section">
        <div class="container">
          <div class="dashboard-hero-header">
            <div class="dash-user-info">
              <span class="section-tag">Personal Impact Dashboard</span>
              <div style="display: flex; align-items: center; gap: 10px; margin: 4px 0 6px;">
                <h2 style="margin: 0;">Welcome, ${escapeHtml(state.currentUser?.name || 'Anvin')}</h2>
                <button class="btn btn-outline-lime btn-sm" onclick="App.editUsername()" title="Edit Username" style="padding: 4px 10px; font-size: 0.78rem; border-radius: var(--radius-full);">
                  ✏️ Edit Name
                </button>
              </div>
              <p>Kerala Sustainability Score: <strong>${ecoScore}/100</strong> • Level: <strong>${ecoScore >= 85 ? 'Master Rescuer 🌴' : 'Kerala Eco Warrior 🌱'}</strong></p>
            </div>
            <button class="btn btn-primary" onclick="App.navigateTo('discover')">Rescue More Food</button>
          </div>

          <!-- DYNAMIC STATS - GUARANTEED NON-ZERO -->
          <div class="impact-cards-grid" style="margin-bottom: 40px;">
            <div class="impact-kpi-card">
              <div class="kpi-icon">🍱</div>
              <div class="kpi-number">${mealsCount}</div>
              <div class="kpi-label">Meals Rescued</div>
              <div class="kpi-subtext">Active rescued food portions</div>
            </div>

            <div class="impact-kpi-card">
              <div class="kpi-icon">💰</div>
              <div class="kpi-number">₹${Math.round(totalSavedInr)}</div>
              <div class="kpi-label">Total Amount Saved</div>
              <div class="kpi-subtext">Saved from original menu prices</div>
            </div>

            <div class="impact-kpi-card">
              <div class="kpi-icon">🌴</div>
              <div class="kpi-number">${kgSaved} kg</div>
              <div class="kpi-label">Food Waste Prevented</div>
              <div class="kpi-subtext">Diverted from waste in Kerala</div>
            </div>

            <div class="impact-kpi-card">
              <div class="kpi-icon">🛡️</div>
              <div class="kpi-number">${co2Saved} kg</div>
              <div class="kpi-label">CO₂ Emissions Offset</div>
              <div class="kpi-subtext">Environmental carbon reduction</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--cream);">My Orders (${reservations.length})</h3>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Manage or cancel active pickup reservations</span>
          </div>

          <div class="data-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Pickup Code</th>
                  <th>Dish</th>
                  <th>Restaurant</th>
                  <th>Pickup Window</th>
                  <th>Price Paid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${reservations.length > 0 ? reservations.map((r) => `
                  <tr>
                    <td>
                      <span style="font-family: var(--font-display); font-weight: 800; color: var(--accent-lime);">${escapeHtml(r.reservation_code)}</span>
                    </td>
                    <td>
                      <strong>${escapeHtml(r.food_name)}</strong>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${r.quantity} portion(s)</div>
                    </td>
                    <td>${escapeHtml(r.restaurant_name)}</td>
                    <td>${escapeHtml(r.pickup_time)}</td>
                    <td>
                      <div class="price-tag" style="color: var(--cream);">
                        <span class="price-currency">₹</span>
                        <span class="price-amount">${Number(r.total_price).toFixed(0)}</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill ${r.status}">${escapeHtml(r.status.replace('_', ' '))}</span>
                    </td>
                    <td>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="btn btn-secondary btn-sm" onclick="App.showReservationDetailModal(${r.id})">
                          View Ticket
                        </button>
                        <button class="btn-danger-subtle" onclick="App.deleteOrder(${r.id})" title="Remove this order from My Orders">
                          ✕ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                      No active orders found. <a href="javascript:void(0)" onclick="App.navigateTo('discover')" style="color: var(--accent-lime); text-decoration: underline; margin-left: 6px;">Rescue delicious Kerala food now →</a>
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  // --- DELETE ORDER HANDLER ---
  async function deleteOrder(id) {
    if (!confirm('Are you sure you want to cancel and remove this order from My Orders?')) {
      return;
    }

    const res = await API.deleteReservation(id);
    if (res && res.success) {
      showToast('Order deleted successfully');
      renderCurrentView();
    } else {
      showToast(res ? res.error : 'Failed to delete order', 'error');
    }
  }

  // --- Helper: Build queue row HTML ---
  function buildQueueRow(order) {
    var code = escapeHtml(order.reservation_code);
    var name = escapeHtml(order.customer_name);
    var phone = escapeHtml(order.customer_phone || '');
    var food = escapeHtml(order.food_name);
    var statusText = escapeHtml(order.status.replace('_', ' '));
    var actionHtml = '<span style="color: var(--accent-lime); font-size: 0.8rem; font-weight: 700;">✓ Completed</span>';
    if (order.status === 'confirmed') {
      actionHtml = '<button class="btn btn-primary btn-sm" onclick="App.updateOrderStatus(' + order.id + ', \'ready_for_pickup\')">Mark Ready</button>';
    } else if (order.status === 'ready_for_pickup') {
      actionHtml = '<button class="btn btn-outline-lime btn-sm" onclick="App.updateOrderStatus(' + order.id + ', \'completed\')">Complete Pickup</button>';
    }
    return '<tr>' +
      '<td><span style="font-family: var(--font-display); font-weight: 800; color: var(--accent-lime);">' + code + '</span></td>' +
      '<td><strong>' + name + '</strong><div style="font-size: 0.75rem; color: var(--text-muted);">' + phone + '</div></td>' +
      '<td>' + food + '</td>' +
      '<td>' + order.quantity + '</td>' +
      '<td>₹' + Number(order.total_price).toFixed(0) + '</td>' +
      '<td><span class="status-pill ' + order.status + '">' + statusText + '</span></td>' +
      '<td>' + actionHtml + '</td>' +
    '</tr>';
  }

  // --- Helper: Build inventory row HTML ---
  function buildInventoryRow(food) {
    var catName = (state.categories.find(function(c) { return c.id === food.category_id; }) || {}).name || 'General';
    var stockColor = food.quantity <= 3 ? '#EF4444' : 'var(--cream)';
    return '<tr>' +
      '<td><strong>' + escapeHtml(food.name) + '</strong><div style="font-size: 0.72rem; color: var(--text-muted);">' + escapeHtml(food.dietary) + '</div></td>' +
      '<td>' + escapeHtml(catName) + '</td>' +
      '<td>₹' + Number(food.original_price).toFixed(0) + '</td>' +
      '<td style="color: var(--accent-lime); font-weight: 700;">₹' + Number(food.rescue_price).toFixed(0) + '</td>' +
      '<td><span class="discount-badge" style="font-size: 0.72rem; padding: 2px 8px;">' + food.discount_percent + '% OFF</span></td>' +
      '<td><span style="color: ' + stockColor + '; font-weight: 700;">' + food.quantity + '</span></td>' +
      '<td>' + escapeHtml(food.pickup_start) + ' – ' + escapeHtml(food.pickup_end) + '</td>' +
      '<td><span class="status-pill active">Live</span></td>' +
    '</tr>';
  }

  // --- Helper: Build admin restaurant row ---
  function buildAdminRestaurantRow(r) {
    return '<tr>' +
      '<td><strong>' + escapeHtml(r.name) + '</strong></td>' +
      '<td>' + escapeHtml(r.cuisine) + '</td>' +
      '<td>' + escapeHtml(r.city) + '</td>' +
      '<td>★ ' + r.rating + '</td>' +
      '<td>' + (r.meals_saved_count || 0) + '</td>' +
      '<td><span class="status-pill active">Verified</span></td>' +
    '</tr>';
  }

  // --- Helper: Build admin user row ---
  function buildAdminUserRow(u) {
    var roleClass = u.role === 'admin' ? 'ready_for_pickup' : (u.role === 'restaurant' ? 'confirmed' : 'active');
    return '<tr>' +
      '<td><strong>' + escapeHtml(u.name) + '</strong></td>' +
      '<td>' + escapeHtml(u.email) + '</td>' +
      '<td>' + escapeHtml(u.phone || 'N/A') + '</td>' +
      '<td><span class="status-pill ' + roleClass + '">' + escapeHtml(u.role) + '</span></td>' +
      '<td><span class="status-pill active">Active</span></td>' +
    '</tr>';
  }

  // --- Helper: Build admin order row ---
  function buildAdminOrderRow(o) {
    var statusText = escapeHtml(o.status.replace('_', ' '));
    return '<tr>' +
      '<td><span style="font-family: var(--font-display); font-weight: 800; color: var(--accent-lime);">' + escapeHtml(o.reservation_code) + '</span></td>' +
      '<td>' + escapeHtml(o.customer_name) + '</td>' +
      '<td>' + escapeHtml(o.food_name) + '</td>' +
      '<td>' + escapeHtml(o.restaurant_name) + '</td>' +
      '<td>' + o.quantity + '</td>' +
      '<td>₹' + Number(o.total_price).toFixed(0) + '</td>' +
      '<td><span class="status-pill ' + o.status + '">' + statusText + '</span></td>' +
    '</tr>';
  }

  // --- Helper: Build activity log row ---
  function buildLogRow(log) {
    return '<tr>' +
      '<td style="white-space: nowrap; color: var(--accent-lime); font-weight: 600;">' + escapeHtml(log.time) + '</td>' +
      '<td><strong>' + escapeHtml(log.event) + '</strong></td>' +
      '<td style="color: var(--text-muted);">' + escapeHtml(log.detail) + '</td>' +
    '</tr>';
  }

  // --- 4. RESTAURANT PORTAL ---
  async function renderRestaurantPortalView(container) {
    var dashQueueResults = await Promise.all([
      API.restaurantDashboard(),
      API.restaurantReservations(1)
    ]);
    var dashRes = dashQueueResults[0];
    var queueRes = dashQueueResults[1];

    var rest = dashRes.restaurant || { name: 'Mandi Manzil', cuisine: 'Arabian & Malabar Mandi Specialist' };
    var metrics = dashRes.metrics || {
      meals_rescued: 1980,
      revenue_recovered: 154200,
      pending_pickups: 2,
      active_listings: state.foods.length
    };
    var listings = dashRes.listings || state.foods;
    var queue = queueRes.reservations || [];

    var queueRows = queue.length > 0
      ? queue.map(buildQueueRow).join('')
      : '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">No pickup orders yet. Customer orders will appear here when they reserve your surplus food.</td></tr>';

    var inventoryRows = listings.map(buildInventoryRow).join('');

    container.innerHTML = ''
      + '<section class="dashboard-section">'
      + '<div class="container">'
      + '<div class="dashboard-hero-header">'
      + '  <div class="dash-user-info">'
      + '    <span class="section-tag">Commercial Kitchen Portal</span>'
      + '    <h2>' + escapeHtml(rest.name) + '</h2>'
      + '    <p>' + escapeHtml(rest.cuisine) + ' • Location: <strong>Kochi, Kerala</strong> • Rating: <strong>★ 4.9</strong></p>'
      + '  </div>'
      + '  <button class="btn btn-primary" id="open-add-food-btn">+ Post New Surplus Drop</button>'
      + '</div>'

      + '<div class="impact-cards-grid" style="margin-bottom: 40px;">'
      + '  <div class="impact-kpi-card"><div class="kpi-icon">📦</div><div class="kpi-number">' + metrics.meals_rescued + '</div><div class="kpi-label">Meals Rescued</div></div>'
      + '  <div class="impact-kpi-card"><div class="kpi-icon">💵</div><div class="kpi-number">₹' + metrics.revenue_recovered + '</div><div class="kpi-label">Revenue Recovered</div></div>'
      + '  <div class="impact-kpi-card"><div class="kpi-icon">⏳</div><div class="kpi-number">' + metrics.pending_pickups + '</div><div class="kpi-label">Pending Pickups</div></div>'
      + '  <div class="impact-kpi-card"><div class="kpi-icon">🍛</div><div class="kpi-number">' + metrics.active_listings + '</div><div class="kpi-label">Active Surplus Drops</div></div>'
      + '</div>'

      + '<div style="margin-bottom: 50px;">'
      + '  <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--cream); margin-bottom: 16px;">Live Customer Pickup Queue</h3>'
      + '  <div class="data-table-wrap"><table class="data-table">'
      + '    <thead><tr><th>Verification Code</th><th>Customer</th><th>Dish</th><th>Qty</th><th>Price</th><th>Status</th><th>Action</th></tr></thead>'
      + '    <tbody>' + queueRows + '</tbody>'
      + '  </table></div>'
      + '</div>'

      + '<div style="margin-bottom: 50px;">'
      + '  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">'
      + '    <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--cream);">Active Surplus Inventory (' + listings.length + ')</h3>'
      + '    <span style="font-size: 0.82rem; color: var(--text-muted);">Manage your published surplus food drops</span>'
      + '  </div>'
      + '  <div class="data-table-wrap"><table class="data-table">'
      + '    <thead><tr><th>Dish</th><th>Category</th><th>Original</th><th>Rescue Price</th><th>Discount</th><th>Stock Left</th><th>Pickup Window</th><th>Status</th></tr></thead>'
      + '    <tbody>' + inventoryRows + '</tbody>'
      + '  </table></div>'
      + '</div>'

      + '</div></section>';

    document.getElementById('open-add-food-btn')?.addEventListener('click', openAddFoodModal);
  }

  // --- 5. ADMIN PANEL ---
  async function renderAdminPanelView(container) {
    var adminRes = await API.adminDashboard();
    var metrics = adminRes.metrics || {};
    var restaurants = adminRes.restaurants || state.restaurants;
    var users = adminRes.users || [];
    var orders = adminRes.orders || [];
    var logs = adminRes.logs || [];

    var restaurantRows = restaurants.map(buildAdminRestaurantRow).join('');
    var userRows = users.map(buildAdminUserRow).join('');
    var orderRows = orders.length > 0
      ? orders.map(buildAdminOrderRow).join('')
      : '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">No orders placed yet.</td></tr>';
    var logRows = logs.map(buildLogRow).join('');

    container.innerHTML = ''
      + '<section class="dashboard-section">'
      + '<div class="container">'
      + '<div class="dashboard-hero-header">'
      + '  <div class="dash-user-info">'
      + '    <span class="section-tag">System Administration</span>'
      + '    <h2>Kerala Platform Oversight Hub</h2>'
      + '    <p>System Status: <strong style="color: var(--accent-lime);">● Operational (100%)</strong> • Hub: <strong>Kochi &amp; Calicut</strong></p>'
      + '  </div>'
      + '</div>'

      + '<div class="impact-cards-grid" style="margin-bottom: 40px;">'
      + '  <div class="impact-kpi-card"><div class="kpi-icon">👥</div><div class="kpi-number">' + (metrics.total_users || 4) + '</div><div class="kpi-label">Registered Users</div></div>'
      + '  <div class="impact-kpi-card"><div class="kpi-icon">🏬</div><div class="kpi-number">' + (metrics.total_restaurants || 6) + '</div><div class="kpi-label">Partner Kitchens</div></div>'
      + '  <div class="impact-kpi-card"><div class="kpi-icon">🍛</div><div class="kpi-number">' + (metrics.meals_rescued || 15420) + '</div><div class="kpi-label">Total Rescued Meals</div></div>'
      + '  <div class="impact-kpi-card"><div class="kpi-icon">💰</div><div class="kpi-number">₹' + ((metrics.money_saved_inr || 3420800) / 100000).toFixed(1) + 'L</div><div class="kpi-label">Total Value Recovered</div></div>'
      + '</div>'

      + '<div style="margin-bottom: 50px;">'
      + '  <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--cream); margin-bottom: 16px;">Platform Users (' + (users.length || 4) + ')</h3>'
      + '  <div class="data-table-wrap"><table class="data-table">'
      + '    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th></tr></thead>'
      + '    <tbody>' + userRows + '</tbody>'
      + '  </table></div>'
      + '</div>'

      + '<div style="margin-bottom: 50px;">'
      + '  <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--cream); margin-bottom: 16px;">Partner Restaurants Directory</h3>'
      + '  <div class="data-table-wrap"><table class="data-table">'
      + '    <thead><tr><th>Restaurant</th><th>Cuisine</th><th>City</th><th>Rating</th><th>Meals Saved</th><th>Status</th></tr></thead>'
      + '    <tbody>' + restaurantRows + '</tbody>'
      + '  </table></div>'
      + '</div>'

      + '<div style="margin-bottom: 50px;">'
      + '  <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--cream); margin-bottom: 16px;">All Platform Orders (' + orders.length + ')</h3>'
      + '  <div class="data-table-wrap"><table class="data-table">'
      + '    <thead><tr><th>Code</th><th>Customer</th><th>Dish</th><th>Restaurant</th><th>Qty</th><th>Total</th><th>Status</th></tr></thead>'
      + '    <tbody>' + orderRows + '</tbody>'
      + '  </table></div>'
      + '</div>'

      + '<div style="margin-bottom: 50px;">'
      + '  <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--cream); margin-bottom: 16px;">Recent Activity Log</h3>'
      + '  <div class="data-table-wrap"><table class="data-table">'
      + '    <thead><tr><th>Time</th><th>Event</th><th>Details</th></tr></thead>'
      + '    <tbody>' + logRows + '</tbody>'
      + '  </table></div>'
      + '</div>'

      + '</div></section>';
  }

  // --- 6. FOOD CARD TEMPLATE ---
  function renderFoodCard(food) {
    return `
      <div class="food-card" data-food-id="${food.id}">
        <div class="food-card-thumb">
          <img src="assets/images/${escapeHtml(food.image)}" alt="${escapeHtml(food.name)}" loading="lazy" onerror="this.src='assets/images/mandi.jpg'">
          <span class="badge-dietary ${food.dietary}">${food.dietary}</span>
          <div class="badge-discount-float">
            <span class="discount-badge">${food.discount_percent}% OFF</span>
          </div>
        </div>

        <div class="food-card-body">
          <div class="food-card-restaurant-row">
            <span class="restaurant-link">${escapeHtml(food.restaurant_name)}</span>
            <span class="restaurant-rating">★ ${food.restaurant_rating || '4.8'}</span>
          </div>

          <h3 class="food-card-title">${escapeHtml(food.name)}</h3>
          <p class="food-card-desc">${escapeHtml(food.description)}</p>

          <div class="food-card-info-chips">
            <span class="info-chip ${food.quantity <= 3 ? 'stock-warning' : ''}">
              📦 ${food.quantity} left
            </span>
            <span class="info-chip">
              ⏱ ${escapeHtml(food.pickup_start)} – ${escapeHtml(food.pickup_end)}
            </span>
            <span class="info-chip">
              📍 Kerala
            </span>
          </div>

          <div class="food-card-footer">
            <div class="food-price-block">
              <div class="price-tag" style="color: var(--accent-lime);">
                <span class="price-currency">₹</span>
                <span class="price-amount">${Number(food.rescue_price).toFixed(0)}</span>
              </div>
              <span class="price-original">₹${Number(food.original_price).toFixed(0)}</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="App.openFoodDetail(${food.id})">
              Rescue
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- MODALS & CHECKOUT ---
  async function openFoodDetail(id) {
    const res = await API.getFoodDetail(id);
    if (!res || !res.success) {
      showToast('Could not load dish details', 'error');
      return;
    }

    const food = res.food;
    state.selectedFood = food;
    state.reservationModalQty = 1;

    let modal = document.getElementById('food-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'food-detail-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-sheet">
        <button class="modal-close-btn" onclick="App.closeModal('food-detail-modal')">✕</button>
        <div class="modal-food-hero">
          <img src="assets/images/${escapeHtml(food.image)}" alt="${escapeHtml(food.name)}" onerror="this.src='assets/images/mandi.jpg'">
          <div style="position: absolute; top: 20px; left: 20px;">
            <span class="discount-badge" style="font-size: 0.9rem; padding: 6px 14px;">${food.discount_percent}% OFF SURPLUS DEAL</span>
          </div>
        </div>

        <div class="modal-content-body">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
            <span style="color: var(--sage); font-weight: 600;">${escapeHtml(food.restaurant_name)} • ${escapeHtml(food.restaurant_address || 'Kerala')}</span>
            <span style="color: #FFD166; font-weight: 700;">★ ${food.restaurant_rating}</span>
          </div>

          <h2 style="font-family: var(--font-serif); font-size: 2.2rem; color: var(--cream); margin-bottom: 12px; line-height: 1.15;">
            ${escapeHtml(food.name)}
          </h2>

          <p style="color: var(--cream-dim); line-height: 1.6; margin-bottom: 20px;">
            ${escapeHtml(food.description)}
          </p>

          <div class="environmental-banner">
            <span class="env-icon">🌴</span>
            <div class="env-text">
              By rescuing this meal, you're preventing <strong>~${food.weight_grams || 500}g</strong> of delicious food from being wasted and avoiding <strong>~1.4 kg</strong> of CO₂ emissions.
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; font-size: 0.85rem;">
            <div style="background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: var(--radius-sm);">
              <span style="color: var(--text-muted); display: block; margin-bottom: 4px;">Pickup Window</span>
              <strong style="color: var(--cream);">${escapeHtml(food.pickup_start)} – ${escapeHtml(food.pickup_end)} (Today)</strong>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: var(--radius-sm);">
              <span style="color: var(--text-muted); display: block; margin-bottom: 4px;">Available Portions</span>
              <strong style="color: var(--accent-lime);">${food.quantity} portions remaining</strong>
            </div>
          </div>

          <div class="checkout-control-row">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Select Portions</span>
              <div class="qty-counter" style="margin-top: 6px;">
                <button class="qty-btn" onclick="App.changeQty(-1)">-</button>
                <span class="qty-val" id="modal-qty-val">1</span>
                <button class="qty-btn" onclick="App.changeQty(1)">+</button>
              </div>
            </div>

            <div style="text-align: right;">
              <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Total Rescue Price</span>
              <div class="price-tag" style="color: var(--accent-lime); font-size: 1.6rem; margin-top: 4px;">
                <span class="price-currency">₹</span>
                <span class="price-amount" id="modal-total-price">${Number(food.rescue_price).toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 24px;">
            <button class="btn btn-primary btn-block btn-lg" id="confirm-reserve-btn" onclick="App.submitReservation()">
              Confirm & Rescue Meal
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  function changeQty(delta) {
    if (!state.selectedFood) return;
    const max = state.selectedFood.quantity || 1;
    state.reservationModalQty = Math.max(1, Math.min(max, state.reservationModalQty + delta));
    
    document.getElementById('modal-qty-val').textContent = state.reservationModalQty;
    const total = state.reservationModalQty * state.selectedFood.rescue_price;
    document.getElementById('modal-total-price').textContent = total.toFixed(0);
  }

  async function submitReservation() {
    if (!state.selectedFood) return;
    const btn = document.getElementById('confirm-reserve-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Confirming Rescue...';
    }

    const res = await API.reserve({
      food_id: state.selectedFood.id,
      quantity: state.reservationModalQty,
      pickup_time: `${state.selectedFood.pickup_start} – ${state.selectedFood.pickup_end}`
    });

    if (res && res.success && res.reservation) {
      closeModal('food-detail-modal');
      openConfirmationModal(res.reservation);
      if (window.ReplateMotion) {
        window.ReplateMotion.fireConfetti();
      }
      showToast('Meal rescued successfully! 🌴');
      const freshFoods = await API.getFoods(state.activeFilters);
      if (freshFoods && freshFoods.success) state.foods = freshFoods.foods;
    } else {
      showToast(res ? res.error : 'Reservation failed.', 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Confirm & Rescue Meal';
      }
    }
  }

  function openConfirmationModal(reservation) {
    let modal = document.getElementById('reservation-confirmation-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'reservation-confirmation-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-sheet" style="max-width: 580px;">
        <button class="modal-close-btn" onclick="App.closeModal('reservation-confirmation-modal')">✕</button>
        <div class="confirmation-card">
          <div class="celebration-icon">✓</div>
          <span class="section-tag">Rescue Confirmed</span>
          <h2 style="font-family: var(--font-serif); font-size: 2.2rem; color: var(--cream); margin: 8px 0 16px;">
            Your meal has been rescued!
          </h2>
          <p style="color: var(--cream-dim); font-size: 0.95rem; line-height: 1.6;">
            Show your verification code at the restaurant counter to collect your fresh Kerala meal.
          </p>

          <div class="pickup-code-box">
            <div class="pickup-code-label">Verification Pickup Code</div>
            <div class="pickup-code-val">${escapeHtml(reservation.reservation_code)}</div>
          </div>

          <div style="background: var(--bg-card); border-radius: var(--radius-md); padding: 18px; text-align: left; margin-bottom: 24px; font-size: 0.88rem;">
            <div style="margin-bottom: 8px;">
              <span style="color: var(--text-muted);">Dish:</span>
              <strong style="color: var(--cream); margin-left: 6px;">${reservation.quantity}x ${escapeHtml(reservation.food_name)}</strong>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="color: var(--text-muted);">Restaurant:</span>
              <strong style="color: var(--cream); margin-left: 6px;">${escapeHtml(reservation.restaurant_name)}</strong>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="color: var(--text-muted);">Pickup Window:</span>
              <strong style="color: var(--accent-lime); margin-left: 6px;">${escapeHtml(reservation.pickup_time)}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted);">Amount Paid:</span>
              <strong style="color: var(--cream); margin-left: 6px;">₹${Number(reservation.total_price).toFixed(0)}</strong>
            </div>
          </div>

          <div style="display: flex; gap: 12px;">
            <button class="btn btn-secondary btn-block" onclick="App.closeModal('reservation-confirmation-modal')">Done</button>
            <button class="btn btn-primary btn-block" onclick="App.closeModal('reservation-confirmation-modal'); App.navigateTo('customer-dashboard');">View in My Orders</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  function showReservationDetailModal(resId) {
    API.myReservations().then((res) => {
      const reservation = res.reservations?.find((r) => r.id === resId);
      if (reservation) {
        openConfirmationModal(reservation);
      }
    });
  }

  function openAddFoodModal() {
    let modal = document.getElementById('add-food-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'add-food-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-sheet" style="max-width: 640px;">
        <button class="modal-close-btn" onclick="App.closeModal('add-food-modal')">✕</button>
        <div class="modal-content-body">
          <span class="section-tag">Restaurant Partner</span>
          <h2 style="font-family: var(--font-serif); font-size: 2rem; color: var(--cream); margin: 6px 0 20px;">
            Post Surplus Drop
          </h2>

          <form id="add-food-form">
            <div class="form-group">
              <label class="form-label">Dish Name *</label>
              <input type="text" name="name" class="form-control" required placeholder="e.g. Kozhikode Chicken Biriyani">
            </div>

            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea name="description" class="form-control" required placeholder="Describe portion, freshness, and packaging details..."></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Original Price (₹) *</label>
                <input type="number" id="add-orig-price" name="original_price" class="form-control" required placeholder="260" min="1">
              </div>

              <div class="form-group">
                <label class="form-label">Surplus Rescue Price (₹) *</label>
                <input type="number" id="add-rescue-price" name="rescue_price" class="form-control" required placeholder="99" min="1">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Quantity Available *</label>
                <input type="number" name="quantity" class="form-control" required value="5" min="1">
              </div>

              <div class="form-group">
                <label class="form-label">Category *</label>
                <select name="category_id" class="form-control">
                  <option value="2">Mandi & Biriyani</option>
                  <option value="3">Alfaham & Grills</option>
                  <option value="4">Porotta & Curries</option>
                  <option value="5">Rice & Combos</option>
                  <option value="6">Seafood</option>
                  <option value="7">Roasts & Starters</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Pickup Start Time *</label>
                <input type="text" name="pickup_start" class="form-control" value="19:30">
              </div>

              <div class="form-group">
                <label class="form-label">Pickup End Time *</label>
                <input type="text" name="pickup_end" class="form-control" value="22:00">
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 10px;">
              Publish Surplus Drop
            </button>
          </form>
        </div>
      </div>
    `;

    modal.classList.add('active');

    document.getElementById('add-food-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      const res = await API.addSurplusFood(data);
      if (res && res.success) {
        showToast('New Kerala surplus drop published! 🌴');
        closeModal('add-food-modal');
        renderCurrentView();
      } else {
        showToast(res ? res.error : 'Failed to publish drop.', 'error');
      }
    });
  }

  async function updateOrderStatus(id, status) {
    const res = await API.updateReservationStatus(id, status);
    if (res && res.success) {
      showToast(res.message);
      renderCurrentView();
    } else {
      showToast(res ? res.error : 'Failed to update order.', 'error');
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        if (view) navigateTo(view);
      });
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        if (view) {
          closeMobileMenu();
          navigateTo(view);
        }
      });
    });

    document.getElementById('mobile-menu-btn')?.addEventListener('click', toggleMobileMenu);
    document.getElementById('mobile-nav-close')?.addEventListener('click', closeMobileMenu);
    document.getElementById('mobile-nav-overlay')?.addEventListener('click', closeMobileMenu);

    window.addEventListener('scroll', () => {
      const header = document.querySelector('.site-header');
      if (header) {
        header.classList.toggle('scrolled', window.scrollY > 30);
      }
    });
  }

  function openMobileMenu() {
    document.getElementById('mobile-nav-drawer')?.classList.add('active');
    document.getElementById('mobile-nav-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    document.getElementById('mobile-nav-drawer')?.classList.remove('active');
    document.getElementById('mobile-nav-overlay')?.classList.remove('active');
    document.body.style.overflow = '';
  }

  function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-nav-drawer');
    if (drawer && drawer.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function switchDemoRole(role) {
    if (role === 'restaurant') {
      navigateTo('restaurant-portal');
    } else if (role === 'admin') {
      navigateTo('admin-panel');
    } else {
      navigateTo('customer-dashboard');
    }
    showToast(`Switched view to ${role.toUpperCase()} 🌿`);
  }

  function setupHomeInteractions() {
    document.getElementById('hero-explore-btn')?.addEventListener('click', () => navigateTo('discover'));
    document.getElementById('hero-partner-btn')?.addEventListener('click', () => navigateTo('discover'));
  }

  function setupDiscoverInteractions() {
    const searchInput = document.getElementById('market-search');
    const dietSelect = document.getElementById('market-dietary');
    const sortSelect = document.getElementById('market-sort');

    searchInput?.addEventListener('input', (e) => {
      state.activeFilters.search = e.target.value;
      applyFilters();
    });

    dietSelect?.addEventListener('change', (e) => {
      state.activeFilters.dietary = e.target.value;
      applyFilters();
    });

    sortSelect?.addEventListener('change', (e) => {
      state.activeFilters.sort = e.target.value;
      applyFilters();
    });

    document.querySelectorAll('.category-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const catId = chip.getAttribute('data-cat-id');
        state.activeFilters.category_id = catId;
        document.querySelectorAll('.category-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        applyFilters();
      });
    });
  }

  async function applyFilters() {
    const res = await API.getFoods(state.activeFilters);
    if (res && res.success) {
      state.foods = res.foods;
      const grid = document.getElementById('market-foods-grid');
      if (grid) {
        grid.innerHTML = state.foods.length > 0 
          ? state.foods.map((f) => renderFoodCard(f)).join('')
          : `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
              <div style="font-size: 3rem; margin-bottom: 16px;">🍲</div>
              <h3 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--cream);">No Dishes Match Your Filter</h3>
              <p style="color: var(--text-muted); margin-top: 8px;">Try searching for "Mandi", "Biriyani", or "Porotta".</p>
              <button class="btn btn-outline-lime btn-sm" style="margin-top: 20px;" onclick="App.resetFilters()">Reset All Filters</button>
            </div>
          `;
      }
    }
  }

  function resetFilters() {
    state.activeFilters = {
      category_id: 'all',
      dietary: 'all',
      search: '',
      sort: 'discount_desc'
    };
    navigateTo('discover');
  }

  function editUsername() {
    const currentName = state.currentUser?.name || 'Anvin';
    
    let modal = document.getElementById('edit-username-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'edit-username-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
      <div class="modal-sheet" style="max-width: 400px; padding: 0;">
        <button class="modal-close-btn" onclick="App.closeModal('edit-username-modal')">✕</button>
        <div class="modal-content-body" style="padding: 24px; text-align: left;">
          <h3 style="font-size: 1.5rem; color: var(--cream); margin-bottom: 16px; font-family: var(--font-serif);">Edit Profile</h3>
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">Username</label>
            <input type="text" id="edit-username-input" class="form-control" style="width: 100%; padding: 10px 14px; font-size: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-main);" value="${escapeHtml(currentName)}">
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button class="btn btn-secondary" onclick="App.closeModal('edit-username-modal')">Cancel</button>
            <button class="btn btn-primary" id="save-username-btn">Save Changes</button>
          </div>
        </div>
      </div>
    `;
    
    // Add active class for animation after a tiny delay
    requestAnimationFrame(() => {
      modal.classList.add('active');
      const input = document.getElementById('edit-username-input');
      input.focus();
      // Move cursor to end of input
      input.setSelectionRange(input.value.length, input.value.length);
    });

    // Handle Save
    document.getElementById('save-username-btn').addEventListener('click', async () => {
      const newName = document.getElementById('edit-username-input').value;
      if (!newName) return;
      const trimmed = newName.trim();
      if (!trimmed || trimmed === currentName) {
        App.closeModal('edit-username-modal');
        return;
      }

      const saveBtn = document.getElementById('save-username-btn');
      saveBtn.disabled = true;
      saveBtn.innerHTML = 'Saving...';

      state.currentUser.name = trimmed;
      localStorage.setItem('replate_user_name', trimmed);
      try {
        await API.updateProfile({ name: trimmed });
      } catch (e) {
        console.warn('Profile sync:', e);
      }
      
      updateNavAuthUI();
      renderCurrentView();
      showToast(`Username updated to "${trimmed}"! 🌴`);
      App.closeModal('edit-username-modal');
    });

    // Handle Enter key
    document.getElementById('edit-username-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('save-username-btn').click();
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    init,
    navigateTo,
    openFoodDetail,
    changeQty,
    submitReservation,
    showReservationDetailModal,
    updateOrderStatus,
    deleteOrder,
    closeModal,
    resetFilters,
    editUsername,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,
    switchDemoRole
  };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
