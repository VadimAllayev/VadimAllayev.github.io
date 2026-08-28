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
