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
      const flipped = dx < 0 ? 'scaleX(-1)' : 'scaleX(1)';

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
