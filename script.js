// Duck that follows the mouse
(function () {
  const duck = document.createElement('div');
  duck.style.cssText = `
    position: fixed;
    font-size: 32px;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.1s;
    user-select: none;
    line-height: 1;
  `;
  duck.textContent = '🦆';
  document.body.appendChild(duck);

  let duckX = 100, duckY = 100;
  let mouseX = 100, mouseY = 100;
  let frame = 0;
  let walkFrame = 0;
  const SPEED = 3;
  const FRAMES = ['🦆', '🐦']; // alternate to simulate walking

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    const dx = mouseX - duckX;
    const dy = mouseY - duckY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 40) {
      duckX += (dx / dist) * SPEED;
      duckY += (dy / dist) * SPEED;

      // Flip horizontally based on direction
      const flipped = dx > 0 ? 'scaleX(-1)' : 'scaleX(1)';

      // Bobbing walk animation
      walkFrame++;
      const bob = Math.sin(walkFrame * 0.3) * 4;

      duck.style.transform = `${flipped} translateY(${bob}px)`;
    }

    duck.style.left = (duckX - 16) + 'px';
    duck.style.top  = (duckY - 16) + 'px';

    requestAnimationFrame(animate);
  }

  animate();
})();

// Landscape decorations + wandering animals
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .ls { position:fixed; pointer-events:none; user-select:none; z-index:1; line-height:1; }
    .ls-pond {
      position:fixed; pointer-events:none; z-index:1;
      border-radius:50%;
      background: radial-gradient(ellipse at 38% 32%, #b3e5fc, #29b6f6 55%, #0277bd);
      box-shadow: inset 0 2px 10px rgba(255,255,255,0.5), 0 4px 18px rgba(2,119,189,0.2);
      animation: pondShimmer 5s ease-in-out infinite;
    }
    @keyframes pondShimmer { 0%,100%{opacity:.82} 50%{opacity:1} }
    .wander { position:fixed; pointer-events:none; user-select:none; z-index:9998; line-height:1; }
    @media (max-width: 1100px) { .ls, .ls-pond { display:none; } }
  `;
  document.head.appendChild(style);

  function pond(left, top, w, h) {
    const el = document.createElement('div');
    el.className = 'ls-pond';
    el.style.cssText = `left:${left};top:${top};width:${w}px;height:${h}px;`;
    document.body.appendChild(el);
  }

  function item(emoji, left, top, size) {
    const el = document.createElement('div');
    el.className = 'ls';
    el.textContent = emoji;
    el.style.cssText = `left:${left};top:${top};font-size:${size};`;
    document.body.appendChild(el);
  }

  // Ponds
  pond('2%',  '42vh', 148, 84);
  pond('81%', '64vh', 128, 70);

  // Trees — left edge
  item('🌲', '1%',  '7vh',  '3.2rem');
  item('🌳', '2%',  '27vh', '2.8rem');
  item('🌲', '1%',  '54vh', '3rem');
  item('🌳', '0%',  '78vh', '2.6rem');

  // Trees — right edge
  item('🌳', '89%', '11vh', '3.5rem');
  item('🌲', '91%', '34vh', '2.8rem');
  item('🌳', '89%', '57vh', '3rem');
  item('🌲', '90%', '82vh', '2.5rem');

  // Foliage & flowers — left
  item('🌿', '5%',  '19vh', '1.6rem');
  item('🌸', '6%',  '38vh', '1.5rem');
  item('🌼', '4%',  '62vh', '1.4rem');
  item('🌺', '3%',  '89vh', '1.5rem');

  // Foliage & flowers — right
  item('🌻', '85%', '22vh', '1.5rem');
  item('🌿', '86%', '47vh', '1.7rem');
  item('🌸', '85%', '74vh', '1.4rem');
  item('🌼', '87%', '91vh', '1.5rem');

  // Lily pads & rocks on/near ponds
  item('🪷', '4%',  '44vh', '1.1rem');
  item('🪷', '83%', '66vh', '1rem');
  item('🪨', '7%',  '49vh', '1.2rem');
  item('🪨', '87%', '71vh', '1.1rem');

  // --- Wandering animals ---
  const defs = [
    { emoji: '🐇', speed: 2.2, size: 26 },
    { emoji: '🦊', speed: 1.6, size: 28 },
    { emoji: '🐢', speed: 0.8, size: 24 },
    { emoji: '🦋', speed: 1.4, size: 22, floaty: true },
    { emoji: '🐿️', speed: 2.8, size: 22 },
  ];

  const wanderers = defs.map(def => {
    const el = document.createElement('div');
    el.className = 'wander';
    el.style.fontSize = def.size + 'px';
    el.textContent = def.emoji;
    document.body.appendChild(el);
    return {
      el,
      speed: def.speed,
      floaty: def.floaty || false,
      floatOffset: Math.random() * Math.PI * 2,
      walkFrame: 0,
      x: 40 + Math.random() * (window.innerWidth - 80),
      y: 40 + Math.random() * (window.innerHeight - 80),
      targetX: 40 + Math.random() * (window.innerWidth - 80),
      targetY: 40 + Math.random() * (window.innerHeight - 80),
    };
  });

  function newTarget(a) {
    a.targetX = 40 + Math.random() * (window.innerWidth - 80);
    a.targetY = 40 + Math.random() * (window.innerHeight - 80);
  }

  function tick() {
    wanderers.forEach(a => {
      const dx = a.targetX - a.x;
      const dy = a.targetY - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 12) { newTarget(a); return; }
      a.x += (dx / dist) * a.speed;
      a.y += (dy / dist) * a.speed;
      a.walkFrame++;
      const flip = dx > 0 ? 'scaleX(-1)' : 'scaleX(1)';
      const bob = a.floaty
        ? `translateY(${Math.sin(a.walkFrame * 0.05 + a.floatOffset) * 7}px)`
        : `translateY(${Math.sin(a.walkFrame * 0.28) * 3}px)`;
      a.el.style.left = (a.x - 14) + 'px';
      a.el.style.top  = (a.y - 14) + 'px';
      a.el.style.transform = `${flip} ${bob}`;
    });
    requestAnimationFrame(tick);
  }

  tick();
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
