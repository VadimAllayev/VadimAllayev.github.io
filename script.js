// Sun or moon based on time of day
(function () {
  const hour = new Date().getHours();
  let emoji;
  if (hour >= 6 && hour < 8)        emoji = '🌅';
  else if (hour >= 8 && hour < 18)  emoji = '☀️';
  else if (hour >= 18 && hour < 20) emoji = '🌇';
  else                               emoji = '🌙';

  const style = document.createElement('style');
  style.textContent = `
    @keyframes celestialSpin { to { transform: rotate(360deg); } }
    .celestial { animation: celestialSpin 25s linear infinite; }
  `;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.textContent = emoji;
  el.className = 'celestial';
  el.style.cssText = `
    position: fixed;
    top: 68px;
    right: 18px;
    font-size: 3.5rem;
    z-index: 99;
    pointer-events: none;
    user-select: none;
    line-height: 1;
    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.18));
    transform-origin: center;
  `;
  document.body.appendChild(el);
})();

// Duck + parade of followers
(function () {
  const SPEED          = 3;
  const PARADE_SPACING = 20;  // history frames between each follower
  const HISTORY_MAX    = 400;
  const JOIN_DIST      = 55;  // px proximity to recruit an animal

  const posHistory = [];
  const parade     = [];

  const duck = document.createElement('div');
  duck.style.cssText = `
    position: fixed; font-size: 32px; pointer-events: none;
    z-index: 9999; user-select: none; line-height: 1;
    transition: transform 0.1s;
  `;
  duck.textContent = '🦆';
  document.body.appendChild(duck);

  let duckX = 100, duckY = 100;
  let mouseX = 100, mouseY = 100;
  let walkFrame = 0;

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function animate() {
    const dx   = mouseX - duckX;
    const dy   = mouseY - duckY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 40) {
      duckX += (dx / dist) * SPEED;
      duckY += (dy / dist) * SPEED;
      walkFrame++;
      const bob  = Math.sin(walkFrame * 0.3) * 4;
      const flip = dx > 0 ? 'scaleX(-1)' : 'scaleX(1)';
      duck.style.transform = `${flip} translateY(${bob}px)`;
    }
    duck.style.left = (duckX - 16) + 'px';
    duck.style.top  = (duckY - 16) + 'px';

    // Record duck position history in viewport coords
    posHistory.unshift({ x: duckX, y: duckY });
    if (posHistory.length > HISTORY_MAX) posHistory.pop();

    // Check whether any wandering animal is close enough to join
    (window._wanderers || []).forEach(a => {
      if (a.inParade) return;
      const viewY = a.y - window.scrollY;
      const adx   = duckX - a.x;
      const ady   = duckY - viewY;
      if (Math.sqrt(adx * adx + ady * ady) < JOIN_DIST) {
        a.inParade     = true;
        a.paradeIndex  = parade.length;
        a.x            = a.x;
        a.y            = viewY;
        a.el.style.position = 'fixed';
        a.el.style.zIndex   = String(9998 - parade.length);
        parade.push(a);
      }
    });

    // Move each parade member along the duck's position history
    parade.forEach((a, i) => {
      const histIdx = Math.min((i + 1) * PARADE_SPACING, posHistory.length - 1);
      const target  = posHistory[histIdx];
      const pdx     = target.x - a.x;
      const pdy     = target.y - a.y;
      const pdist   = Math.sqrt(pdx * pdx + pdy * pdy);

      if (pdist > 0.5) {
        const step = Math.min(pdist, pdist > 4 ? SPEED * 2 : SPEED);
        a.x += (pdx / pdist) * step;
        a.y += (pdy / pdist) * step;
      }

      a.walkFrame = (a.walkFrame || 0) + 1;
      const flip = pdx > 0 ? 'scaleX(-1)' : pdx < 0 ? 'scaleX(1)' : (a._lastFlip || 'scaleX(1)');
      a._lastFlip = flip;
      const bob = Math.sin(a.walkFrame * 0.3) * 4;
      a.el.style.left      = (a.x - 14) + 'px';
      a.el.style.top       = (a.y - 14) + 'px';
      a.el.style.transform = `${flip} translateY(${bob}px)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
})();

// Landscape decorations + wandering animals
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .ls { position:absolute; pointer-events:none; user-select:none; z-index:2; line-height:1; }
    .ls-pond {
      position:absolute; pointer-events:none; z-index:1;
      border-radius:50%;
      background: radial-gradient(ellipse at 38% 32%, #b3e5fc, #29b6f6 55%, #0277bd);
      box-shadow: inset 0 2px 10px rgba(255,255,255,0.5), 0 4px 18px rgba(2,119,189,0.2);
      animation: pondShimmer 5s ease-in-out infinite;
    }
    @keyframes pondShimmer { 0%,100%{opacity:.82} 50%{opacity:1} }
    .wander { position:absolute; pointer-events:none; user-select:none; z-index:2; line-height:1; }
    @media (max-width: 900px) { .ls, .ls-pond, .wander { display:none; } }
  `;
  document.head.appendChild(style);

  if (getComputedStyle(document.body).position === 'static') {
    document.body.style.position = 'relative';
  }

  const wanderers = [];
  window._wanderers = wanderers;

  window.addEventListener('load', () => {
    const docH = document.documentElement.scrollHeight;
    const W    = window.innerWidth;

    function pond(leftPct, topFrac, w, h) {
      const el = document.createElement('div');
      el.className = 'ls-pond';
      el.style.cssText = `left:${leftPct}%;top:${Math.round(docH * topFrac)}px;width:${w}px;height:${h}px;`;
      document.body.appendChild(el);
    }

    function item(emoji, leftPct, topFrac, size) {
      const el = document.createElement('div');
      el.className = 'ls';
      el.textContent = emoji;
      el.style.cssText = `left:${leftPct}%;top:${Math.round(docH * topFrac)}px;font-size:${size};`;
      document.body.appendChild(el);
    }

    // Three ponds spread across the page
    pond(2,  0.18, 150, 84);
    pond(83, 0.48, 138, 76);
    pond(3,  0.76, 132, 72);

    // Trees — left edge
    item('🌲', 1,  0.04, '3.2rem');
    item('🌳', 2,  0.17, '2.8rem');
    item('🌲', 1,  0.30, '3rem');
    item('🌳', 2,  0.44, '2.6rem');
    item('🌲', 1,  0.58, '3rem');
    item('🌳', 2,  0.71, '2.8rem');
    item('🌲', 1,  0.85, '2.5rem');

    // Trees — right edge
    item('🌳', 89, 0.07, '3.5rem');
    item('🌲', 91, 0.21, '2.8rem');
    item('🌳', 89, 0.35, '3rem');
    item('🌲', 90, 0.50, '2.6rem');
    item('🌳', 89, 0.63, '3rem');
    item('🌲', 91, 0.77, '2.5rem');

    // Foliage & flowers — left
    item('🌿', 5,  0.11, '1.6rem');
    item('🌸', 6,  0.24, '1.5rem');
    item('🌼', 5,  0.38, '1.4rem');
    item('🌺', 4,  0.53, '1.5rem');
    item('🌻', 6,  0.67, '1.5rem');
    item('🌿', 5,  0.80, '1.6rem');

    // Foliage & flowers — right
    item('🌻', 85, 0.14, '1.5rem');
    item('🌿', 86, 0.27, '1.7rem');
    item('🌸', 85, 0.41, '1.4rem');
    item('🌼', 87, 0.56, '1.5rem');
    item('🌺', 85, 0.70, '1.4rem');
    item('🌿', 86, 0.83, '1.7rem');

    // Wandering animals — each starts at a different depth
    const defs = [
      { emoji: '🐇', speed: 2.2, size: 26 },
      { emoji: '🦊', speed: 1.6, size: 28 },
      { emoji: '🐢', speed: 0.8, size: 24 },
      { emoji: '🦋', speed: 1.4, size: 22, floaty: true },
      { emoji: '🐿️', speed: 2.8, size: 22 },
    ];

    defs.forEach((def, i) => {
      const el = document.createElement('div');
      el.className = 'wander';
      el.style.fontSize = def.size + 'px';
      el.textContent = def.emoji;
      document.body.appendChild(el);

      const startY = (docH / defs.length) * i + 120;
      const startX = 30 + Math.random() * (W - 60);
      wanderers.push({
        el, speed: def.speed,
        floaty: def.floaty || false,
        floatOffset: Math.random() * Math.PI * 2,
        walkFrame: 0,
        x: startX, y: startY,
        targetX: 30 + Math.random() * (W - 60),
        targetY: 60  + Math.random() * (docH - 120),
        inParade: false,
      });
    });

    tick();
  });

  function newTarget(a) {
    const docH = document.documentElement.scrollHeight;
    a.targetX = 30 + Math.random() * (window.innerWidth - 60);
    a.targetY = 60 + Math.random() * (docH - 120);
  }

  function tick() {
    wanderers.forEach(a => {
      if (a.inParade) return;
      const dx   = a.targetX - a.x;
      const dy   = a.targetY - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 12) { newTarget(a); return; }
      a.x += (dx / dist) * a.speed;
      a.y += (dy / dist) * a.speed;
      a.walkFrame++;
      const flip = dx > 0 ? 'scaleX(-1)' : 'scaleX(1)';
      const bob  = a.floaty
        ? `translateY(${Math.sin(a.walkFrame * 0.05 + a.floatOffset) * 7}px)`
        : `translateY(${Math.sin(a.walkFrame * 0.28) * 3}px)`;
      a.el.style.left      = (a.x - 14) + 'px';
      a.el.style.top       = (a.y - 14) + 'px';
      a.el.style.transform = `${flip} ${bob}`;
    });
    requestAnimationFrame(tick);
  }
})();

// Nav shadow on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
});

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('#nav ul');
toggle.addEventListener('click', () => navList.classList.toggle('open'));
navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));

// Scroll-reveal
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('section, .project-card, .skill-chip, .contact-item').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});
