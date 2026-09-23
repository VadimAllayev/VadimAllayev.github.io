// Drifting clouds
(function () {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes cloudDrift { from { transform:translateX(-220px); } to { transform:translateX(calc(100vw + 220px)); } }
    .cloud { position:absolute; pointer-events:none; user-select:none; z-index:2; line-height:1; opacity:0.88; }
  `;
  document.head.appendChild(s);

  [
    { top: '22vh', size: '3rem',   dur:  65, delay:   0 },
    { top: '30vh', size: '2rem',   dur:  92, delay: -35 },
    { top: '17vh', size: '2.6rem', dur:  76, delay: -18 },
    { top: '37vh', size: '1.8rem', dur: 110, delay: -55 },
    { top: '26vh', size: '2.4rem', dur:  84, delay: -12 },
  ].forEach(c => {
    const el = document.createElement('div');
    el.className = 'cloud';
    el.textContent = '☁️';
    el.style.cssText = `top:${c.top};font-size:${c.size};animation:cloudDrift ${c.dur}s linear ${c.delay}s infinite;`;
    document.body.appendChild(el);
  });
})();

// Sun or moon based on time of day
(function () {
  const hour = new Date().getHours();
  let emoji;
  if (hour >= 6 && hour < 8)        emoji = '🌅';
  else if (hour >= 8 && hour < 18)  emoji = '☀️';
  else if (hour >= 18 && hour < 20) emoji = '🌇';
  else                               emoji = '🌙';

  const s = document.createElement('style');
  s.textContent = `
    @keyframes celestialSpin { to { transform: rotate(360deg); } }
    .celestial { animation: celestialSpin 25s linear infinite; }
  `;
  document.head.appendChild(s);

  const el = document.createElement('div');
  el.textContent = emoji;
  el.className = 'celestial';
  el.style.cssText = `
    position:fixed; top:100px; right:18px; font-size:3.5rem;
    z-index:99; pointer-events:none; user-select:none;
    line-height:1; filter:drop-shadow(0 3px 6px rgba(0,0,0,0.18));
    transform-origin:center;
  `;
  document.body.appendChild(el);
})();

// Duck + parade of followers
(function () {
  const SPEED          = 3;
  const PARADE_SPACING = 20;
  const HISTORY_MAX    = 400;
  const JOIN_DIST      = 55;

  const posHistory = [];
  const parade     = [];

  const duck = document.createElement('div');
  duck.style.cssText = `
    position:fixed; font-size:32px; pointer-events:none;
    z-index:9999; user-select:none; line-height:1;
    transition:transform 0.1s;
  `;
  duck.textContent = '🦆';
  document.body.appendChild(duck);

  let duckX = 100, duckY = 100, mouseX = 100, mouseY = 100, walkFrame = 0;

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function animate() {
    const dx = mouseX - duckX, dy = mouseY - duckY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moving = dist > 40;

    if (moving) {
      duckX += (dx / dist) * SPEED;
      duckY += (dy / dist) * SPEED;
      walkFrame++;
    }
    const bob  = moving ? Math.sin(walkFrame * 0.3) * 4 : 0;
    const flip = dx > 0 ? 'scaleX(-1)' : 'scaleX(1)';
    duck.style.transform = `${flip} translateY(${bob}px)`;
    duck.style.left = (duckX - 16) + 'px';
    duck.style.top  = (duckY - 16) + 'px';

    posHistory.unshift({ x: duckX, y: duckY });
    if (posHistory.length > HISTORY_MAX) posHistory.pop();

    (window._wanderers || []).forEach(a => {
      if (a.inParade) return;
      const viewY = a.y - window.scrollY;
      const adx = duckX - a.x, ady = duckY - viewY;
      if (Math.sqrt(adx * adx + ady * ady) < JOIN_DIST) {
        a.inParade    = true;
        a.y           = viewY;
        a.el.style.position = 'fixed';
        a.el.style.left     = '0';
        a.el.style.top      = '0';
        a.el.style.zIndex   = String(9998 - parade.length);
        parade.push(a);
      }
    });

    // Perpendicular direction to duck's heading — used to stagger followers sideways
    const headLen = dist > 0 ? dist : 1;
    const perpX = -(dy / headLen), perpY = dx / headLen;
    const SIDE_OFFSETS = [0, -22, 22, -12, 12];

    parade.forEach((a, i) => {
      const histIdx  = Math.min((i + 1) * PARADE_SPACING, posHistory.length - 1);
      const t        = posHistory[histIdx];
      const offset   = SIDE_OFFSETS[i % SIDE_OFFSETS.length];
      const targetX  = t.x + perpX * offset;
      const targetY  = t.y + perpY * offset;

      const pdx = targetX - a.x, pdy = targetY - a.y;
      const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
      const isMoving = pdist > 1;
      if (isMoving) {
        const step = Math.min(pdist, pdist > 4 ? SPEED * 2 : SPEED);
        a.x += (pdx / pdist) * step;
        a.y += (pdy / pdist) * step;
        a.walkFrame = (a.walkFrame || 0) + 1;
      }
      const flipVal = pdx > 0 ? -1 : pdx < 0 ? 1 : (a._lastFlip || 1);
      a._lastFlip = flipVal;
      const bob = isMoving ? Math.sin(a.walkFrame * (a.bobFreq || 0.3)) * (a.bobAmp || 4) : 0;
      a.el.style.transform = `translate(${a.x - 14}px,${a.y - 14 + bob}px) scaleX(${flipVal})`;
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
    .wander { position:absolute; left:0; top:0; pointer-events:none; user-select:none; z-index:2; line-height:1; will-change:transform; }
    @media (max-width:900px) { .ls, .ls-pond, .wander, .cloud { display:none; } }
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

    // Container inserted BEFORE sections in DOM so sections naturally paint on top
    const lsCont = document.createElement('div');
    lsCont.style.cssText = `position:absolute;top:0;left:0;width:100%;height:${docH}px;pointer-events:none;z-index:0;`;
    document.body.insertBefore(lsCont, document.body.firstChild);

    function pond(leftPct, topFrac, w, h) {
      const el = document.createElement('div');
      el.className = 'ls-pond';
      el.style.cssText = `left:${leftPct}%;top:${Math.round(docH * topFrac)}px;width:${w}px;height:${h}px;`;
      lsCont.appendChild(el);
    }

    function item(emoji, leftPct, topFrac, size) {
      const el = document.createElement('div');
      el.className = 'ls';
      el.textContent = emoji;
      el.style.cssText = `left:${leftPct}%;top:${Math.round(docH * topFrac)}px;font-size:${size};`;
      lsCont.appendChild(el);
    }

    pond(2,  0.18, 150, 84);
    pond(83, 0.48, 138, 76);
    pond(3,  0.76, 132, 72);

    item('🌲', 1,  0.04, '3.2rem');
    item('🌳', 2,  0.17, '2.8rem');
    item('🌲', 1,  0.30, '3rem');
    item('🌳', 2,  0.44, '2.6rem');
    item('🌲', 1,  0.58, '3rem');
    item('🌳', 2,  0.71, '2.8rem');
    item('🌲', 1,  0.85, '2.5rem');

    item('🌳', 89, 0.07, '3.5rem');
    item('🌲', 91, 0.21, '2.8rem');
    item('🌳', 89, 0.35, '3rem');
    item('🌲', 90, 0.50, '2.6rem');
    item('🌳', 89, 0.63, '3rem');
    item('🌲', 91, 0.77, '2.5rem');

    item('🌿', 5,  0.11, '1.6rem');
    item('🌸', 6,  0.24, '1.5rem');
    item('🌼', 5,  0.38, '1.4rem');
    item('🌺', 4,  0.53, '1.5rem');
    item('🌻', 6,  0.67, '1.5rem');
    item('🌿', 5,  0.80, '1.6rem');

    item('🌻', 85, 0.14, '1.5rem');
    item('🌿', 86, 0.27, '1.7rem');
    item('🌸', 85, 0.41, '1.4rem');
    item('🌼', 87, 0.56, '1.5rem');
    item('🌺', 85, 0.70, '1.4rem');
    item('🌿', 86, 0.83, '1.7rem');

    // Remove any landscape item whose bounding box overlaps a section-inner
    const sectionInners = Array.from(document.querySelectorAll('.section-inner'));
    Array.from(lsCont.querySelectorAll('.ls, .ls-pond')).forEach(el => {
      const r = el.getBoundingClientRect();
      const overlaps = sectionInners.some(si => {
        const sr = si.getBoundingClientRect();
        return r.right > sr.left && r.left < sr.right &&
               r.bottom > sr.top  && r.top  < sr.bottom;
      });
      if (overlaps) el.remove();
    });

    // Precompute section-inner bounding boxes in document coordinates
    window._barriers = Array.from(document.querySelectorAll('.section-inner')).map(el => {
      const r = el.getBoundingClientRect();
      return {
        left:   r.left   - 8,
        top:    r.top + window.scrollY - 8,
        right:  r.right  + 8,
        bottom: r.bottom + window.scrollY + 8,
      };
    });

    const defs = [
      { emoji: '🐇', speed: 2.2, size: 26, bobFreq: 0.50, bobAmp: 4.0 },
      { emoji: '🦊', speed: 1.6, size: 28, bobFreq: 0.22, bobAmp: 2.5 },
      { emoji: '🐢', speed: 0.8, size: 24, bobFreq: 0.12, bobAmp: 1.5 },
      { emoji: '🦋', speed: 1.4, size: 22, floaty: true },
      { emoji: '🐿️', speed: 2.8, size: 22, bobFreq: 0.42, bobAmp: 3.0 },
    ];

    defs.forEach((def, i) => {
      const el = document.createElement('div');
      el.className = 'wander';
      el.style.fontSize = def.size + 'px';
      el.textContent = def.emoji;
      document.body.appendChild(el);

      // Start each animal outside any barrier
      let startX, startY, attempts = 0;
      do {
        startX = 30 + Math.random() * (W - 60);
        startY = (docH / defs.length) * i + 120;
        attempts++;
      } while (isBlocked(startX, startY) && attempts < 20);

      wanderers.push({
        el, speed: def.speed,
        floaty: def.floaty || false,
        floatOffset: Math.random() * Math.PI * 2,
        walkFrame: 0,
        x: startX, y: startY,
        targetX: 30 + Math.random() * (W - 60),
        targetY: 60  + Math.random() * (docH - 120),
        inParade: false,
        bobFreq: def.bobFreq,
        bobAmp:  def.bobAmp,
      });
    });

    tick();
  });

  function isBlocked(x, y) {
    return (window._barriers || []).some(
      b => x >= b.left && x <= b.right && y >= b.top && y <= b.bottom
    );
  }

  function newTarget(a) {
    const docH = document.documentElement.scrollHeight;
    a.targetX = 30 + Math.random() * (window.innerWidth - 60);
    a.targetY = 60  + Math.random() * (docH - 120);
  }

  function tick() {
    wanderers.forEach(a => {
      if (a.inParade) return;
      const dx = a.targetX - a.x, dy = a.targetY - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 12) { newTarget(a); return; }

      const nx = a.x + (dx / dist) * a.speed;
      const ny = a.y + (dy / dist) * a.speed;

      if (isBlocked(nx, ny)) {
        newTarget(a); // bounce: pick a new direction
      } else {
        a.x = nx;
        a.y = ny;
        a.walkFrame++;
      }

      const flipVal = dx > 0 ? -1 : 1;
      const bob = a.floaty
        ? Math.sin(a.walkFrame * 0.05 + a.floatOffset) * 7
        : Math.sin(a.walkFrame * a.bobFreq) * a.bobAmp;
      a.el.style.transform = `translate(${a.x - 14}px,${a.y - 14 + bob}px) scaleX(${flipVal})`;
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
