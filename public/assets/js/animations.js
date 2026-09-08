/**
 * REPLATE Professional UI & Motion Engine
 * Enterprise-grade subtle interactions:
 * - Animated number counters with cubic easing (IntersectionObserver)
 * - Celebratory rescue confetti particle burst
 */

(function () {
  'use strict';

  // No-op compatibility stubs for retired vibe-coded cursor/canvas
  function initCustomCursor() {}
  function initAmbientCanvas() {}

  // --- 1. ANIMATED NUMBER COUNTERS ---
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
            const duration = 1600;
            const startTime = performance.now();

            function updateCounter(now) {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic for natural deceleration
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
      { threshold: 0.15 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  // --- 2. CELEBRATORY CONFETTI CANNON (On Successful Reservation) ---
  function fireConfetti() {
    const confettiCount = 60;
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

    const colors = ['#B7F36B', '#F4F6F0', '#38EF7D', '#FFD166', '#38BDF8'];
    const particles = [];

    for (let i = 0; i < confettiCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 40,
        radius: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16,
        gravity: 0.32,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
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
        p.opacity -= 0.014;

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
      if (alive && frame < 100) {
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
    animateCounters();
  });
})();
