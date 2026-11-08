'use strict';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function startLoader() {
  const loader = document.querySelector('.loader');
  if (!loader || reducedMotion.matches || location.hash) return;
  try {
    if (sessionStorage.getItem('philposium:intro')) return;
    sessionStorage.setItem('philposium:intro', 'seen');
  } catch {
    // The introduction also works without browser storage.
  }

  const english = document.documentElement.lang === 'en';
  const facts = english ? [
    'Philposium is run by philosophy students at Marmara University.',
    'The gallery features works from The Met’s Open Access collection.',
    'Philposium is an undergraduate philosophy symposium.',
  ] : [
    'Philposium, Marmara Üniversitesi Felsefe öğrencileri tarafından yürütülür.',
    'Galeride The Met’in açık erişim koleksiyonundan eserler yer alır.',
    'Philposium bir lisans felsefe sempozyumudur.',
  ];
  loader.querySelector('.loader__fact p').textContent = facts[Math.floor(Math.random() * facts.length)];
  loader.hidden = false;
  const animation = window.mountKiwiLoader?.(loader.querySelector('.loader__bird'), {
    label: english ? 'Loading' : 'Yükleniyor',
  });
  let dismissed = false;

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(timeout);
    loader.classList.add('is-leaving');
    setTimeout(() => {
      loader.hidden = true;
      animation?.destroy();
    }, 760);
  };

  const timeout = setTimeout(dismiss, animation ? 2800 : 1650);
  loader.querySelector('.loader__skip').addEventListener('click', dismiss);
  loader.addEventListener('keydown', event => {
    if (event.key === 'Escape') dismiss();
  });
  animation?.player.addEventListener('enterFrame', event => {
    // The walk segment ends at frame 96 in the supplied animation.
    if (event.currentTime >= 95) dismiss();
  });
}

function setupOpening() {
  const opening = document.querySelector('.opening');
  if (!opening) return;
  const pin = opening.querySelector('.opening__pin');
  const [cover, about] = opening.querySelectorAll('.spread');
  let frame = 0;
  let touchStart = null;
  let focusAbout = false;
  about.tabIndex = -1;

  const top = () => opening.getBoundingClientRect().top + window.scrollY;
  const travel = () => Math.max(1, opening.getBoundingClientRect().height - pin.getBoundingClientRect().height);

  function render() {
    frame = 0;
    const horizontal = opening.classList.contains('is-horizontal');
    const distance = travel();
    const y = window.scrollY - top();
    const progress = horizontal ? (distance - y < 1 ? 1 : clamp(y / distance, 0, 1)) : 0;
    opening.style.setProperty('--spread', progress.toFixed(5));
    cover.inert = horizontal && progress >= .5;
    about.inert = horizontal && progress < .5;
    if (focusAbout && (!horizontal || progress === 1)) {
      focusAbout = false;
      about.focus({ preventScroll: true });
    }
  }

  function alignAbout(instant) {
    if (!opening.classList.contains('is-horizontal')) {
      about.scrollIntoView({ behavior: instant ? 'instant' : 'smooth' });
      return;
    }
    window.scrollTo({ top: top() + travel(), behavior: instant ? 'instant' : 'smooth' });
  }

  function syncMotion() {
    opening.classList.toggle('is-horizontal', !reducedMotion.matches);
    render();
    if (location.hash === '#hakkinda') alignAbout(true);
  }

  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => {
    if (location.hash === '#hakkinda' && Math.abs(top() + travel() - window.scrollY) < 120) alignAbout(true);
    schedule();
  }, { passive: true });
  window.addEventListener('hashchange', () => {
    if (location.hash === '#hakkinda') requestAnimationFrame(() => alignAbout(true));
  });
  window.addEventListener('pageshow', () => {
    if (location.hash === '#hakkinda') {
      document.fonts.ready.then(() => requestAnimationFrame(() => alignAbout(true)));
    }
  });
  cover.querySelector('a[href="#hakkinda"]').addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== '#hakkinda') history.pushState(null, '', '#hakkinda');
    focusAbout = true;
    alignAbout(reducedMotion.matches);
    schedule();
  });
  pin.addEventListener('wheel', event => {
    if (!reducedMotion.matches && Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      const multiplier = [1, 16, window.innerHeight][event.deltaMode] || 1;
      window.scrollBy(0, event.deltaX * multiplier);
    }
  }, { passive: true });
  pin.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? event.touches[0] : null;
  }, { passive: true });
  pin.addEventListener('touchend', event => {
    if (!touchStart || reducedMotion.matches) return;
    const touch = event.changedTouches[0];
    const x = touch.clientX - touchStart.clientX;
    const y = touch.clientY - touchStart.clientY;
    touchStart = null;
    if (Math.abs(x) < 48 || Math.abs(x) < Math.abs(y) * 1.5) return;
    if (x > 0) window.scrollTo({ top: top(), behavior: 'smooth' });
    else alignAbout(false);
  }, { passive: true });
  pin.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
}

function setupCoverArt() {
  const art = document.querySelector('.cover__art');
  if (!art) return;
  const image = art.querySelector('image');
  const bend = art.querySelector('feDisplacementMap');
  let frame = 0;

  function reset() {
    cancelAnimationFrame(frame);
    art.style.removeProperty('--cover-rx');
    art.style.removeProperty('--cover-ry');
    image.removeAttribute('filter');
  }

  function follow(event) {
    if (reducedMotion.matches || !event.isPrimary) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const rect = art.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      const y = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
      art.style.setProperty('--cover-rx', `${-y * 6}deg`);
      art.style.setProperty('--cover-ry', `${x * 8}deg`);
      bend.setAttribute('scale', String(6 + 10 * Math.max(Math.abs(x), Math.abs(y))));
      image.setAttribute('filter', 'url(#cover-bend)');
    });
  }

  art.addEventListener('pointerdown', follow);
  art.addEventListener('pointermove', follow);
  art.addEventListener('pointerleave', reset);
  art.addEventListener('pointercancel', reset);
  art.addEventListener('pointerup', event => {
    if (event.pointerType !== 'mouse') reset();
  });
  reducedMotion.addEventListener('change', reset);
}

function setupWormhole() {
  const space = document.querySelector('.wormhole');
  if (!space) return;
  const canvas = space.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;

  // Disc contraction and phase acceleration follow the motion in Wormhole by Antoine Wodniack.
  const colors = ['#a36d36', '#bd831c', '#745446', '#816161', '#ac5835'];
  const opacityLevels = [.2, .38, .62, .84];
  const discCount = 145;
  const discs = Array.from({ length: discCount }, (_, index) => ({ position: index / discCount }));
  const dots = Array.from({ length: 9800 }, () => ({
    disc: discs[Math.floor(Math.random() * discs.length)],
    phase: Math.random(),
    opacity: .26 + Math.random() * .74,
    color: Math.floor(Math.random() * colors.length),
  }));
  const buckets = colors.flatMap(() => opacityLevels.map(() => []));
  const twoPi = 2 * Math.PI;
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastTime = 0;

  function render(elapsed = 0) {
    context.clearRect(0, 0, width, height);
    buckets.forEach(bucket => { bucket.length = 0; });

    context.strokeStyle = '#81616150';
    context.lineWidth = .65;
    for (const disc of discs) {
      const p = disc.position = (disc.position + elapsed * .000018) % 1;
      const sx = (1 - p) ** 3;
      const sy = 2 ** (-10 * p);
      const area = sx * sy;
      disc.x = width * .5;
      disc.rx = width * .95 * sx;
      disc.ry = height * .82 * sy;
      disc.y = height * (.06 + p * .9) + disc.ry;
      disc.fade = area < .012 ? (area / .012) ** 2.2 : area > .23 ? (1 - area) / .77 : 1;
      disc.speed = .000062 * 2 ** (-10 * area);
      if (disc.fade < .035) continue;
      context.globalAlpha = disc.fade * .69;
      context.beginPath();
      context.ellipse(disc.x, disc.y, disc.rx, disc.ry, 0, 0, twoPi);
      context.stroke();
    }

    const density = width < 600 ? 5100 : dots.length;
    for (let index = 0; index < density; index++) {
      const dot = dots[index];
      const disc = dot.disc;
      dot.phase = (dot.phase + elapsed * disc.speed) % 1;
      const alpha = disc.fade * dot.opacity;
      if (alpha < .1) continue;
      const phase = dot.phase * twoPi;
      const x = disc.x + Math.cos(phase) * disc.rx;
      const y = disc.y + Math.sin(phase) * disc.ry;
      if (x < -2 || x > width + 2 || y > height + 2) continue;
      const bucket = dot.color * opacityLevels.length + Math.min(3, Math.floor(alpha * 4));
      buckets[bucket].push(x, y, width < 600 ? .83 : 1.13);
    }

    buckets.forEach((bucket, index) => {
      context.fillStyle = colors[Math.floor(index / opacityLevels.length)];
      context.globalAlpha = opacityLevels[index % opacityLevels.length];
      context.beginPath();
      for (let point = 0; point < bucket.length; point += 3) {
        const x = bucket[point], y = bucket[point + 1], r = bucket[point + 2];
        context.moveTo(x + r, y);
        context.arc(x, y, r, 0, twoPi);
      }
      context.fill();
    });
    context.globalAlpha = 1;
  }

  function tick(time) {
    render(lastTime ? time - lastTime : 0);
    lastTime = time;
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    const play = !reducedMotion.matches && !document.hidden;
    if (play && !frame) frame = requestAnimationFrame(tick);
    if (!play && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (reducedMotion.matches) lastTime = 0;
  }

  new ResizeObserver(() => {
    width = space.clientWidth;
    height = space.clientHeight;
    const pixelRatio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    render();
  }).observe(space);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  sync();
}

startLoader();
setupOpening();
setupCoverArt();
setupWormhole();
