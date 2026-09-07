# REPLATE — Premium Food-Surplus Rescue Platform

> **Tagline:** Rescue food. Reduce waste.  
> **Mission:** Connecting artisanal restaurants, bakeries, and food businesses with conscious diners to rescue premium surplus food at up to 70% off.

![REPLATE Hero Food Drop](public/assets/images/hero-food.jpg)

---

## 1. Executive Summary

**REPLATE** is a full-stack, production-quality food-surplus rescue web application designed for a high-impact college project demonstration with the aesthetic polish and technical rigor of a Silicon Valley sustainability startup.

Every day, commercial kitchens prepare world-class food that goes unsold before closing. **REPLATE** transforms this surplus from an environmental liability into a triple-win economic model:
1. **Amazing Food Avoids Landfills:** Diverting food waste prevents methane emissions and agricultural water loss.
2. **Customers Get Michelin-Grade Gastronomy at 50%–70% Off:** High-quality dining becomes accessible to students and young professionals.
3. **Restaurants Recover Revenue:** Commercial kitchens recoup ingredient costs and build customer loyalty.

---

## 2. Technology Stack & Architecture

### Backend:
- **Language:** PHP 8+ (Pure native PHP without bloated frameworks)
- **Database:** MySQL 8.0+ (with seamless auto-fallback to SQLite for zero-config macOS development)
- **Architecture:** Clean MVC (Model-View-Controller) with RESTful JSON API
- **Security:**
  - `password_hash()` and `password_verify()` (BCrypt)
  - PDO prepared statements (100% SQL injection prevention)
  - PHP session-based authentication & role authorization (`customer`, `restaurant`, `admin`)
  - CSRF protection & strict XSS output escaping

### Frontend:
- **Core:** Semantic HTML5 & Modern Vanilla ES6+ JavaScript
- **Design System:** Custom Dark Luxury CSS with tailored design tokens
  - Palette: `#07110D`, `#09150F`, `#0D1B14`, Electric Lime `#B7F36B`, Soft Sage `#8DAA91`, Warm Cream `#F4F6F0`
  - Typography: *Playfair Display* / *Cormorant Garamond* (editorial display) + *Plus Jakarta Sans* (clean body)
  - Strict price rendering: Collision-proof Indian Rupee (`₹`) symbol formatting
- **Motion Design:**
  - Magnetic custom cursor with delayed ambient follower
  - Real-time interactive HTML5 canvas particle & nebula background
  - Animated number counters with cubic easing
  - Celebratory confetti particle explosion upon meal rescue
  - Responsive across all viewports (320px to 1920px)

---

## 3. Demo Accounts & Personas

For college viva evaluations, a floating **College Viva Demo Bar** is pinned at the bottom of the screen allowing 1-click persona switching:

| Role | Email | Password | Persona & Purpose |
| :--- | :--- | :--- | :--- |
| **Customer** | `demo@replate.test` | `Password123!` | Devansh Sharma (Student rescuer with active orders & eco-score) |
| **Restaurant** | `restaurant@replate.test` | `Password123!` | Chef Marco Ross (Casa Verde Italian Kitchen, Koramangala/Indiranagar) |
| **Restaurant 2** | `forno@replate.test` | `Password123!` | Elena Bianchi (Forno & Co. Artisanal Pizzeria) |
| **Administrator** | `admin@replate.test` | `Password123!` | System Administrator (Full platform governance & moderation) |

---

## 4. How to Run Locally

### Option A: Instant Zero-Dependency Run (Mac / Linux / Windows with Node)
No need to install XAMPP or configure MySQL if you are developing or presenting immediately:

```bash
# 1. Open project directory
cd "/path/to/bcn project"

# 2. Start the universal dev server
npm start
# or: node server.js
```

Open your browser at **`http://localhost:3000`**. The system automatically boots with genuine PHP 8.2 and auto-initializes the database with rich Bengaluru demo data!

---

### Option B: LAMP / WAMP / XAMPP Environment (College Evaluation Setup)

1. **Copy Project to Web Root:**
   - On XAMPP: Copy the project folder into `C:\xampp\htdocs\replate` (Windows) or `/Applications/XAMPP/xamppfiles/htdocs/replate` (Mac).
2. **Start Apache & MySQL** in the XAMPP Control Panel.
3. **Import Database:**
   - Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
   - Create a new database named **`replate_db`**.
   - Click **Import** and select `database/schema.sql`.
   - Click **Import** and select `database/seed.sql`.
4. **Configure Database Credentials (if custom):**
   - Check `config/Config.php` (defaults to `localhost`, `root`, empty password `""`, port `3306`).
5. **Open in Browser:**
   - Navigate to **`http://localhost/replate`** or **`http://localhost/replate/public`**.

---

## 5. College Presentation Viva Guide (5–10 Minute Script)

Follow this structured flow when demonstrating REPLATE in front of your professor and panel:

1. **Introduction & Problem Statement (1 min):**
   - Open homepage: *"Professors, 1.3 billion tonnes of edible food is wasted globally each year while food costs rise. REPLATE solves this with a premium marketplace for commercial surplus."*
   - Highlight the hero typography, live metrics ticker (**12,840+ meals rescued**, **₹2.8M recovered**), and the floating 3D artisan dish card.
2. **Environmental Dashboard & How It Works (1 min):**
   - Scroll down to the **Environmental Balance** section: Show real-time conversions into trees planted and agricultural water preserved.
   - Walk through the 4-step pipeline: *Surplus Identified → Listed → Rescued → Collected*.
3. **Food Discovery & Multi-Facet Filtering (1.5 mins):**
   - Click **Discover Food** in the navbar.
   - Filter by categories (*Bakery*, *Pizza*, *Meals*) and search for *"Pasta"*.
   - Point out the collision-proof `₹` price tags, discount badges (**61% OFF**), and remaining portion badges.
4. **Reservation Checkout & Verification Code (1.5 mins):**
   - Click **Rescue** on *Creamy Truffle Pasta*.
   - Show the dynamic carbon savings notice (*"Rescuing this meal prevents ~480g food waste and ~1.2kg CO2"*).
   - Click **Confirm & Rescue Meal**.
   - Watch the celebratory **confetti animation** and show the generated unique verification pickup code (e.g. `REP-9482-CV`).
5. **Customer Dashboard & Personal Eco-Score (1 min):**
   - Navigate to Customer Dashboard. Show the personal eco-score (*78/100, Eco Warrior 🌱*) and the interactive **Impact Timeline**.
6. **Restaurant Kitchen Portal (1.5 mins):**
   - Click **Restaurant** on the demo bar.
   - Show today's revenue recovered and the **Live Pickup Queue**.
   - Demonstrate the order status progression: click **Mark Ready** or **Complete Pickup**.
   - Click **+ Post New Surplus Drop**: enter Original Price ₹299 and Rescue Price ₹99 to demonstrate **real-time automated discount calculation (67% OFF)**.
7. **Platform Administration (1 min):**
   - Click **Admin** on the demo bar.
   - Show platform KPIs, partner directory, and the security audit trail.

---

## 6. Database Architecture (Entity Relationship Overview)

- **`users`**: Role-based access (`customer`, `restaurant`, `admin`), bcrypt password hashes.
- **`restaurants`**: Geolocation coordinates, ratings, verified cuisines, total meals saved count.
- **`categories`**: Dynamic taxonomy (*Meals*, *Bakery*, *Pizza*, *Indian*, *Asian*, *Healthy*, *Desserts*, *Drinks*, *Groceries*).
- **`foods`**: Atomic stock inventory, discount calculation, pickup windows (`HH:MM` – `HH:MM`), dietary tags, allergens, and weight in grams.
- **`reservations`**: Relational foreign keys with cascade constraints, unique alphanumeric pickup codes (`REP-XXXX-YY`), unit/total price, status lifecycle (`confirmed` → `ready_for_pickup` → `completed`).
- **`impact_stats`**: Aggregated environmental metrics updated via atomic SQL expressions.
- **`reviews`**: Social proof ratings and customer testimonials.
- **`admin_logs`**: Security audit trail recording administrative actions with IP addresses.

---

## 7. Security Features

- **SQL Injection Defense:** 100% prepared statements via PDO with strict parameter binding.
- **Cross-Site Scripting (XSS):** Context-aware escaping via `Config::escape()` / `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')`.
- **Credential Protection:** BCrypt hashing (`PASSWORD_BCRYPT`) with salt derivation; no plaintext passwords stored.
- **Authorization Guard:** Session role validation on all state-mutating endpoints.

---

## 8. Troubleshooting

- **Port 3000 in use?**
  Set a custom port before starting: `PORT=8080 npm start`.
- **Images not showing on XAMPP?**
  Ensure mod_rewrite is enabled or access through `http://localhost/replate/public/`.
- **Database connection error on MySQL?**
  Confirm credentials in `config/Config.php`. If MySQL is offline, REPLATE seamlessly falls back to local SQLite with identical behavior.

---

**REPLATE** — *Food deserves a second chance.*
Crafted with pride for College Capstone Project Presentation.
