/*
 * Confirm confetti interaction adapted from Aaron Iker’s public MIT-licensed Pen.
 * https://codepen.io/aaroniker/pen/bGVGNrV
 * The cannon and particle motion use native browser animations.
 */
(() => {
  const language = document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'tr';
  const copy = {
    tr: {
      preview: 'Yerel önizleme. Bu form yalnızca deneme amaçlıdır.',
      demoContact: 'Deneme tamamlandı. Mesaj gönderilmedi.',
      demoNewsletter: 'Deneme tamamlandı. E-posta listesine kayıt yapılmadı.',
      sending: 'Gönderiliyor…',
      contact: 'Mesajınız gönderildi.',
      localContact: 'Mesajınız yerel gelen kutusuna kaydedildi.',
      localNewsletter: 'Adresiniz yerel e-posta listesine kaydedildi.',
      newsletter: 'E-posta listesine kaydoldunuz.',
      invalidEndpoint: 'Formun gönderim adresi yapılandırılmamış.',
      failed: 'Gönderim doğrulanamadı. Bilgileriniz formda duruyor.',
    },
    en: {
      preview: 'Local preview. This form is available for testing only.',
      demoContact: 'Test complete. Your message was not sent.',
      demoNewsletter: 'Test complete. Your address was not added to the mailing list.',
      sending: 'Submitting…',
      contact: 'Your message was sent.',
      localContact: 'Your message was saved to the local inbox.',
      localNewsletter: 'Your address was saved to the local mailing list.',
      newsletter: 'You joined the mailing list.',
      invalidEndpoint: 'The form’s submission address is not configured.',
      failed: 'Submission could not be confirmed. Your entries are still in the form.',
    },
  }[language];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const shades = ['#bb8531', '#816161', '#468200', '#1b00b4', '#e4b63d'];
  const random = (min, max) => min + Math.random() * (max - min);

  function decorate(button) {
    const icon = document.createElement('span');
    icon.className = 'confetti-button__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none">
      <path class="confetti-button__cone" d="M9 11 5 21l10-4-6-6Z M7 16l3 3"/>
      <path class="confetti-button__sparks" d="M12 8c0-2 1-4 2-5m1 8c2 0 4-2 5-4m-3 8 4-1M9 6V4m9 0h.01"/>
      <path class="confetti-button__check" d="m7 12 3 3 7-7"/>
    </svg>`;
    button.prepend(icon);

    button.addEventListener('pointermove', (event) => {
      if (motion.matches || event.pointerType !== 'mouse') return;
      const box = button.getBoundingClientRect();
      const tiltX = (0.5 - (event.clientY - box.top) / box.height) * 13;
      const tiltY = ((event.clientX - box.left) / box.width - 0.5) * 8;
      button.style.setProperty('--confetti-rx', `${tiltX}deg`);
      button.style.setProperty('--confetti-ry', `${tiltY}deg`);
    });
    button.addEventListener('pointerleave', () => {
      button.style.removeProperty('--confetti-rx');
      button.style.removeProperty('--confetti-ry');
    });
    return icon;
  }

  function celebrate(icon) {
    if (motion.matches || !icon.animate) return;
    icon.getAnimations().forEach((animation) => animation.cancel());
    icon.classList.add('is-bursting');
    const recoil = icon.animate([
      { transform: 'translate(0, 0) rotate(0)' },
      { transform: 'translate(-3px, 3px) rotate(-8deg)', offset: .18 },
      { transform: 'translate(1px, -1px) rotate(4deg)', offset: .4 },
      { transform: 'translate(-1px, 1px) rotate(-2deg)', offset: .6 },
      { transform: 'translate(0, 0) rotate(0)' },
    ], { duration: 720, easing: 'ease-out' });
    recoil.onfinish = () => icon.classList.remove('is-bursting');

    icon.querySelector('.confetti-button__burst')?.remove();
    const burst = document.createElement('span');
    burst.className = 'confetti-button__burst';
    icon.append(burst);

    const animations = [];
    for (let index = 0; index < 28; index += 1) {
      const piece = document.createElement('i');
      piece.style.backgroundColor = shades[index % shades.length];
      piece.style.borderRadius = index % 3 === 0 ? '50%' : '1px';
      burst.append(piece);

      const angle = random(-100, -28) * Math.PI / 180;
      const speed = random(80, 155);
      const spin = random(-700, 700);
      const keyframes = Array.from({ length: 10 }, (_, step) => {
        const time = step / 9;
        const x = Math.cos(angle) * speed * time;
        const y = Math.sin(angle) * speed * time + 102 * time * time;
        return {
          opacity: Math.min(1, time * 12, (1 - time) * 2.6),
          transform: `translate(${x}px, ${y}px) rotate(${spin * time}deg)`,
        };
      });
      animations.push(piece.animate(keyframes, {
        duration: random(850, 1250),
        delay: 130,
        fill: 'both',
      }).finished);
    }
    Promise.allSettled(animations).then(() => burst.remove());
  }

  // Configure a public HTTPS endpoint accepting a CORS-enabled multipart POST.
  function getEndpoint(form) {
    const value = (form.getAttribute('data-endpoint') ?? form.getAttribute('action') ?? '').trim();
    if (!value) return null;
    if (value === '/api/' + form.dataset.philForm) {
      return location.protocol === 'http:' && location.hostname === '127.0.0.1' ? new URL(value, location.origin) : null;
    }
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && !url.username && !url.password) return url;
    } catch {
      // Invalid configuration is reported by the form.
    }
    return false;
  }

  for (const form of document.querySelectorAll('form[data-phil-form]')) {
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-form-status]');
    if (!button || !status) continue;

    const isNewsletter = form.dataset.philForm === 'newsletter';
    button.disabled = false;
    const endpoint = getEndpoint(form);
    const local = endpoint?.protocol === 'http:';
    const icon = decorate(button);
    if (!endpoint) {
      const notice = document.createElement('p');
      notice.className = 'form-notice';
      notice.textContent = endpoint === null ? copy.preview : copy.invalidEndpoint;
      form.prepend(notice);
    }

    function report(text, state) {
      status.textContent = text;
      status.dataset.state = state;
      button.dataset.state = state;
    }

    let pending = false;
    form.addEventListener('input', () => {
      if (!pending && status.textContent) report('', '');
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (pending || !form.reportValidity()) return;

      if (endpoint === false) {
        report(copy.invalidEndpoint, 'error');
        return;
      }
      if (endpoint === null) {
        report(isNewsletter ? copy.demoNewsletter : copy.demoContact, 'success');
        celebrate(icon);
        return;
      }

      const fields = new FormData(form);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      pending = true;
      button.setAttribute('aria-disabled', 'true');
      report(copy.sending, 'pending');

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: local ? new URLSearchParams(fields) : fields,
          credentials: 'omit',
          redirect: 'error',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (response.headers.get('content-type')?.includes('application/json')) {
          const result = await response.json();
          if (result?.ok === false || result?.success === false) throw new Error('Rejected');
        }
      } catch {
        report(copy.failed, 'error');
        return;
      } finally {
        clearTimeout(timer);
        pending = false;
        button.removeAttribute('aria-disabled');
      }
      const changed = [...fields].some(([name, value]) => form.elements.namedItem(name)?.value !== value);
      if (!changed) form.reset();
      const success = isNewsletter ? (local ? copy.localNewsletter : copy.newsletter) : (local ? copy.localContact : copy.contact);
      report(success, 'success');
      celebrate(icon);
    });
  }
})();
