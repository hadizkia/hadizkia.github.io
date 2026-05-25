/* ================================================================
   NAVBAR SCROLL
   ================================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ================================================================
   SCROLL FADE-IN
   ================================================================ */
const fadeEls = document.querySelectorAll('.fade-up');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
fadeEls.forEach(el => io.observe(el));

/* ================================================================
   SKILL BAR ANIMATION
   ================================================================ */
const skillSection = document.getElementById('skills');
const fills = document.querySelectorAll('.skill-fill');
const skillObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    fills.forEach(el => { el.style.width = el.dataset.width; });
    skillObs.disconnect();
  }
}, { threshold: 0.3 });
if (skillSection) skillObs.observe(skillSection);

/* ================================================================
   LIGHTBOX
   ================================================================ */
const lightbox   = document.getElementById('lightbox');
const lbImg      = document.getElementById('lightbox-img');
const lbClose    = document.getElementById('lightbox-close');

document.querySelectorAll('.project-figures').forEach(fig => {
  fig.addEventListener('click', () => {
    const img = fig.querySelector('img');
    if (img) { lbImg.src = img.src; lightbox.classList.add('open'); }
  });
});
lbClose.addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') lightbox.classList.remove('open'); });

/* ================================================================
   SMOOTH NAV LINKS
   ================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ================================================================
   STAT COUNTER ANIMATION
   ================================================================ */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1200;
  const step = 16;
  const inc = target / (dur / step);
  let cur = 0;
  const t = setInterval(() => {
    cur = Math.min(cur + inc, target);
    el.textContent = Math.floor(cur) + suffix;
    if (cur >= target) clearInterval(t);
  }, step);
}
const statsSection = document.getElementById('hero');
const counters = document.querySelectorAll('.stat-num');
const counterObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    counters.forEach(animateCounter);
    counterObs.disconnect();
  }
}, { threshold: 0.5 });
if (statsSection) counterObs.observe(statsSection);
