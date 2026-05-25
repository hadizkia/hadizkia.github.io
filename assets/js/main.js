/* ================================================================
   NAVBAR SCROLL
   ================================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ================================================================
   HERO CANVAS — ATMOSPHERIC PARTICLE NETWORK
   ================================================================ */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const N = 70, LINK = 130;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function init() {
    resize();
    particles = Array.from({ length: N }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.8 + 0.4,
      a:  Math.random() * 0.5 + 0.1,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < N; i++) {
      const p = particles[i];
      for (let j = i + 1; j < N; j++) {
        const q  = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,170,${(1 - d / LINK) * 0.16})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,170,${p.a})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    }
    requestAnimationFrame(tick);
  }

  init();
  tick();
  window.addEventListener('resize', () => { resize(); });
})();

/* ================================================================
   TYPEWRITER
   ================================================================ */
(function () {
  const el = document.getElementById('typewriter-text');
  if (!el) return;
  const phrases = [
    'Postdoctoral Fellow · University of Houston',
    'Atmospheric Scientist · Climate Data',
    'CFD · LES · Turbulence Modeling',
    'Ensemble Forecast Validation',
    'Weather → Signal → Decision',
    'Deep Learning for Atmosphere',
  ];
  let pi = 0, ci = 0, deleting = false;
  const SPEED = 52, DELETE = 30, PAUSE = 2200;

  function type() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(type, PAUSE); return; }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(type, deleting ? DELETE : SPEED);
  }
  type();
})();

/* ================================================================
   SCROLL FADE-IN
   ================================================================ */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

/* ================================================================
   SKILL BARS
   ================================================================ */
const skillSection = document.getElementById('skills');
const fills = document.querySelectorAll('.skill-fill');
const skillObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) { fills.forEach(el => { el.style.width = el.dataset.width; }); skillObs.disconnect(); }
}, { threshold: 0.25 });
if (skillSection) skillObs.observe(skillSection);

/* ================================================================
   STAT COUNTERS
   ================================================================ */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1400, step = 16;
  let cur = 0, inc = target / (dur / step);
  const t = setInterval(() => {
    cur = Math.min(cur + inc, target);
    el.textContent = Math.floor(cur) + suffix;
    if (cur >= target) clearInterval(t);
  }, step);
}
const heroEl = document.getElementById('hero');
const counters = document.querySelectorAll('.stat-num');
const cntObs = new IntersectionObserver((e) => {
  if (e[0].isIntersecting) { counters.forEach(animateCounter); cntObs.disconnect(); }
}, { threshold: 0.4 });
if (heroEl) cntObs.observe(heroEl);

/* ================================================================
   LIGHTBOX
   ================================================================ */
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lightbox-img');
const lbClose  = document.getElementById('lightbox-close');

document.querySelectorAll('.project-figures').forEach(fig => {
  fig.addEventListener('click', () => {
    const img = fig.querySelector('img');
    if (img) { lbImg.src = img.src; lightbox.classList.add('open'); document.body.style.overflow = 'hidden'; }
  });
});
function closeLightbox() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ================================================================
   SMOOTH NAV
   ================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ================================================================
   WIND MAP PANEL  (Windy.com embed — free, no API key)
   ================================================================ */
(function () {
  const panel      = document.getElementById('wind-panel');
  const toggle     = document.getElementById('wind-toggle');
  const closeBtn   = document.getElementById('wind-close');
  const wrap       = document.getElementById('wind-iframe-wrap');
  const loading    = document.getElementById('wind-loading');
  const modelLabel = document.getElementById('wind-model-label');
  const tabs       = document.querySelectorAll('.wind-tab');
  if (!panel || !toggle) return;

  // Windy embed base — surface wind animation centered on USA
  const BASE = 'https://embed.windy.com/embed2.html' +
    '?lat=39.5&lon=-98.35&detailLat=39.5&detailLon=-98.35' +
    '&zoom=3&level=surface&overlay=wind' +
    '&menu=&message=true&marker=&calendar=now' +
    '&pressure=&type=map&location=coordinates' +
    '&detail=&metricWind=default&metricTemp=default&radarRange=-1';

  const MODEL_LABELS = { ecmwf: 'ECMWF', gfs: 'GFS', icon: 'ICON' };
  let currentProduct = 'ecmwf';
  let iframeLoaded   = false;

  function buildURL(product) {
    return BASE + '&product=' + product;
  }

  function loadIframe(product) {
    // Remove existing iframe if any
    const old = wrap.querySelector('iframe');
    if (old) old.remove();
    if (loading) loading.style.display = 'flex';

    const iframe = document.createElement('iframe');
    iframe.src = buildURL(product);
    iframe.title = 'Animated US wind forecast — ' + MODEL_LABELS[product];
    iframe.allow = 'fullscreen';
    iframe.setAttribute('loading', 'lazy');
    iframe.addEventListener('load', () => {
      if (loading) loading.style.display = 'none';
      requestAnimationFrame(() => iframe.classList.add('ready'));
    });
    wrap.appendChild(iframe);
    if (modelLabel) modelLabel.textContent = MODEL_LABELS[product] || product.toUpperCase();
    iframeLoaded = true;
  }

  function openPanel() {
    panel.classList.add('open');
    toggle.classList.add('open');
    if (!iframeLoaded) loadIframe(currentProduct);
  }

  function closePanel() {
    panel.classList.remove('open');
    toggle.classList.remove('open');
  }

  toggle.addEventListener('click', () => {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  closeBtn.addEventListener('click', closePanel);

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentProduct = tab.dataset.product;
      iframeLoaded = false;
      loadIframe(currentProduct);
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });
})();

/* ================================================================
   LIVE WEATHER WIDGET  (Open-Meteo — no API key needed)
   ================================================================ */
(function () {
  const widget = document.getElementById('weather-widget');
  if (!widget || !navigator.geolocation) return;

  const WX_ICONS = {
    0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️',
    45: '🌫', 48: '🌫',
    51: '🌦', 53: '🌦', 55: '🌧',
    61: '🌧', 63: '🌧', 65: '🌧',
    71: '❄️', 73: '❄️', 75: '❄️', 77: '🌨',
    80: '🌦', 81: '🌧', 82: '⛈',
    85: '🌨', 86: '🌨',
    95: '⛈',  96: '⛈', 99: '⛈',
  };
  const WX_DESC = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Icy fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Showers', 81: 'Rain showers', 82: 'Violent showers',
    85: 'Snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Heavy thunderstorm',
  };

  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    const { latitude: lat, longitude: lon } = coords;
    try {
      const [wxRes, geoRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`),
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&format=json&zoom=10`)
      ]);
      const wx  = await wxRes.json();
      const geo = await geoRes.json();

      const c    = wx.current;
      const code = c.weather_code;
      const city = geo.address.city || geo.address.town || geo.address.village || geo.address.county || 'Your Location';
      const state = geo.address.state_code || geo.address.country_code?.toUpperCase() || '';

      document.getElementById('wx-icon-big').textContent  = WX_ICONS[code] ?? '🌡';
      document.getElementById('wx-temp-big').textContent  = `${Math.round(c.temperature_2m)}°F`;
      document.getElementById('wx-desc-text').textContent = WX_DESC[code] ?? 'Current conditions';
      document.getElementById('wx-feels-text').textContent = `Feels like ${Math.round(c.apparent_temperature)}°F`;
      document.getElementById('wx-location').textContent  = state ? `${city}, ${state}` : city;
      document.getElementById('wx-wind-val').textContent  = `${Math.round(c.wind_speed_10m)} mph`;
      document.getElementById('wx-hum-val').textContent   = `${c.relative_humidity_2m}%`;

      widget.classList.add('loaded');
    } catch (_) { /* silently fail */ }
  }, () => { /* geolocation denied — widget stays hidden */ }, { timeout: 8000 });
})();
