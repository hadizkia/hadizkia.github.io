/* ================================================================
   SCROLL PROGRESS BAR
   ================================================================ */
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  if (progressBar) progressBar.style.width = Math.min(pct, 100) + '%';
}, { passive: true });

/* ================================================================
   CURSOR GLOW
   ================================================================ */
(function () {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  let mx = -999, my = -999;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  function frame() { glow.style.transform = `translate(${mx - 190}px, ${my - 190}px)`; requestAnimationFrame(frame); }
  frame();
})();

/* ================================================================
   3D CARD TILT + SHINE
   ================================================================ */
document.querySelectorAll('.project-card').forEach(card => {
  const shine = card.querySelector('.card-shine');
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const x  = e.clientX - r.left;
    const y  = e.clientY - r.top;
    const cx = r.width  / 2;
    const cy = r.height / 2;
    const rX = ((y - cy) / cy) * -7;
    const rY = ((x - cx) / cx) *  7;
    card.style.transform = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) translateY(-6px) scale(1.01)`;
    if (shine) shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.09) 0%, transparent 60%)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    if (shine) shine.style.background = '';
  });
});

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

/* ================================================================
   ENSO LIVE INDICATOR + ONI SPARKLINE
   ================================================================ */
(function () {
  const phaseEl  = document.getElementById('enso-phase');
  const oniEl    = document.getElementById('enso-oni-val');
  const valEls   = [document.getElementById('enso-val'), document.getElementById('enso-val-2')];
  const dotEls   = [document.getElementById('enso-dot'), document.getElementById('enso-dot-2')];
  const canvas   = document.getElementById('enso-canvas');
  if (!phaseEl) return;

  function classifyONI(v) {
    if (v >=  0.5) return { phase: 'El Niño',   cls: 'el-nino', color: '#f97316' };
    if (v <= -0.5) return { phase: 'La Niña',   cls: 'la-nina', color: '#60a5fa' };
    return           { phase: 'Neutral',   cls: 'neutral', color: '#94a3b8' };
  }

  function drawSparkline(data, currentColor) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const min = Math.min(...data, -1.5), max = Math.max(...data, 1.5);
    const toY = v => H - ((v - min) / (max - min)) * H * 0.8 - H * 0.1;
    const toX = (i) => (i / (data.length - 1)) * W;

    // Zero line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(0, toY(0)); ctx.lineTo(W, toY(0));
    ctx.stroke(); ctx.setLineDash([]);

    // Fill area
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, currentColor + '55');
    grad.addColorStop(1, currentColor + '00');
    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(toX(data.length - 1), H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    data.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.stroke();

    // Latest dot
    const lx = toX(data.length - 1), ly = toY(data[data.length - 1]);
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = currentColor;
    ctx.fill();
  }

  async function fetchENSO() {
    // Try NOAA ONI text file via CORS proxy
    const proxy = 'https://corsproxy.io/?';
    const src   = 'https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt';
    const res   = await fetch(proxy + encodeURIComponent(src));
    if (!res.ok) throw new Error('fetch failed');
    const text = await res.text();
    const lines = text.trim().split('\n').filter(l => /^\d{4}/.test(l));
    // Each line: SEAS YR ANOM  e.g.  DJF 2016 2.3
    // Last 24 entries ≈ 2 years of monthly values
    const vals = lines.slice(-24).map(l => parseFloat(l.trim().split(/\s+/)[2])).filter(v => !isNaN(v));
    const latest = vals[vals.length - 1];
    return { oni: latest, history: vals };
  }

  async function fetchENSOFallback() {
    // Alternative: NOAA JSON via different proxy
    const proxy = 'https://api.allorigins.win/raw?url=';
    const src   = 'https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt';
    const res   = await fetch(proxy + encodeURIComponent(src));
    if (!res.ok) throw new Error();
    const text  = await res.text();
    const lines = text.trim().split('\n').filter(l => /^\d{4}/.test(l));
    const vals  = lines.slice(-24).map(l => parseFloat(l.trim().split(/\s+/)[2])).filter(v => !isNaN(v));
    return { oni: vals[vals.length - 1], history: vals };
  }

  function applyENSO(oni, history) {
    const { phase, cls, color } = classifyONI(oni);
    if (phaseEl) { phaseEl.textContent = phase; phaseEl.className = 'enso-phase ' + cls; }
    if (oniEl)   oniEl.textContent = (oni >= 0 ? '+' : '') + oni.toFixed(1) + '°C';
    valEls.forEach(el => { if (el) { el.textContent = phase; el.style.color = color; } });
    dotEls.forEach(el => { if (el) el.style.background = color; });
    drawSparkline(history, color);
  }

  // Try primary, then fallback, then hardcoded default
  fetchENSO()
    .then(({ oni, history }) => applyENSO(oni, history))
    .catch(() => fetchENSOFallback()
      .then(({ oni, history }) => applyENSO(oni, history))
      .catch(() => applyENSO(-0.1, [-0.3,-0.2,-0.1,0.0,0.1,0.0,-0.1,-0.2,-0.1,0.0,0.1,-0.1]))
    );
})();

/* ================================================================
   LIVE CO₂  (NOAA GML weekly Mauna Loa)
   ================================================================ */
(function () {
  const v1 = document.getElementById('co2-val');
  const v2 = document.getElementById('co2-val-2');
  if (!v1) return;

  async function fetchCO2() {
    const proxy = 'https://corsproxy.io/?';
    const src   = 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_weekly_mlo.csv';
    const res   = await fetch(proxy + encodeURIComponent(src));
    if (!res.ok) throw new Error();
    const text = await res.text();
    const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const last  = lines[lines.length - 1].split(',');
    return parseFloat(last[4]);   // column 5 = CO2 ppm
  }

  async function fetchCO2Fallback() {
    const res  = await fetch('https://api.allorigins.win/raw?url=' +
      encodeURIComponent('https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_weekly_mlo.csv'));
    const text = await res.text();
    const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const last  = lines[lines.length - 1].split(',');
    return parseFloat(last[4]);
  }

  function setCO2(ppm) {
    const str = isNaN(ppm) ? '—' : ppm.toFixed(1);
    [v1, v2].forEach(el => { if (el) el.textContent = str; });
  }

  fetchCO2().then(setCO2).catch(() => fetchCO2Fallback().then(setCO2).catch(() => setCO2(424.0)));
})();
