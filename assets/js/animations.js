/**
 * REPLATE Advanced Motion & Animation Engine
 * Includes:
 * - Magnetic custom cursor with delayed ambient glow
 * - Dynamic interactive canvas particle atmosphere
 * - Animated number counters with easing
 * - Scroll-triggered entrance animations
 * - Celebratory rescue confetti particle system
 */

(function () {
  'use strict';

  // --- 1. MAGNETIC CUSTOM CURSOR ---
  function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const follower = document.createElement('div');
    follower.className = 'cursor-follower';

    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    });

    function renderFollower() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = `${followerX}px`;
      follower.style.top = `${followerY}px`;
      requestAnimationFrame(renderFollower);
    }
    requestAnimationFrame(renderFollower);

    // Interactive element hover states
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('button, a, .food-card, .btn, .demo-chip, input, select');
      if (target) {
        cursor.style.transform = 'translate(-50%, -50%) scale(2.2)';
        follower.style.transform = 'translate(-50%, -50%) scale(1.6)';
        follower.style.borderColor = 'var(--accent-lime)';
      } else {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        follower.style.transform = 'translate(-50%, -50%) scale(1)';
        follower.style.borderColor = 'rgba(183, 243, 107, 0.4)';
      }
    });
  }

  // --- 2. AMBIENT PARTICLES & NEBULA CANVAS ---
  function initAmbientCanvas() {
    let canvas = document.getElementById('ambient-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'ambient-canvas';
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(45, Math.floor(window.innerWidth / 30));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.5 + 0.15
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle glowing green nebula orbs
      const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 10, width * 0.2, height * 0.3, width * 0.4);
      grad1.addColorStop(0, 'rgba(183, 243, 107, 0.04)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.7, 10, width * 0.8, height * 0.7, width * 0.35);
      grad2.addColorStop(0, 'rgba(20, 41, 31, 0.25)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Draw dust particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(183, 243, 107, ${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#B7F36B';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // --- 3. ANIMATED NUMBER COUNTERS ---
  function animateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const finalVal = parseFloat(target.getAttribute('data-counter')) || 0;
            const prefix = target.getAttribute('data-prefix') || '';
            const suffix = target.getAttribute('data-suffix') || '';
            const decimals = parseInt(target.getAttribute('data-decimals') || '0', 10);
            const duration = 1800;
            const startTime = performance.now();

            function updateCounter(now) {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic
              const ease = 1 - Math.pow(1 - progress, 3);
              const currentVal = (finalVal * ease).toFixed(decimals);

              target.textContent = `${prefix}${Number(currentVal).toLocaleString()}${suffix}`;

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                target.textContent = `${prefix}${Number(finalVal).toLocaleString()}${suffix}`;
              }
            }

            requestAnimationFrame(updateCounter);
            obs.unobserve(target);
          }
        });
      },
      { threshold: 0.2 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  // --- 4. CELEBRATORY CONFETTI CANNON ---
  function fireConfetti() {
    const confettiCount = 70;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '999999';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#B7F36B', '#F4F6F0', '#38EF7D', '#FFD166', '#00B4D8'];
    const particles = [];

    for (let i = 0; i < confettiCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 50,
        radius: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        gravity: 0.35,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frame = 0;
    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
          ctx.restore();
        }
      }

      frame++;
      if (alive && frame < 120) {
        requestAnimationFrame(renderConfetti);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(renderConfetti);
  }

  // Export to window
  window.ReplateMotion = {
    initCustomCursor,
    initAmbientCanvas,
    animateCounters,
    fireConfetti
  };

  // Auto initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initAmbientCanvas();
    animateCounters();
  });
})();
