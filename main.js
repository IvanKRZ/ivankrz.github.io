/* ── Console-Greeting für neugierige DevTools-Besucher ── */
(() => {
  const title = 'color: #ff8a3d; font: 600 14px "IBM Plex Mono", monospace;';
  const dim   = 'color: #8b919c; font: 400 12px "IBM Plex Mono", monospace;';
  const hl    = 'color: #ff8a3d; font: 500 12px "IBM Plex Mono", monospace;';

  console.log('%c> ivankrz.github.io', title);
  console.log(
    '%c> uptime:%c ∞   %crecruiters:%c welcome   %ccurious devs:%c extra welcome',
    dim, hl, dim, hl, dim, hl
  );
  console.log('%c> tip: curl -s ivankrz.github.io/robots.txt', dim);
  console.log('%c> mail: Ivan_KB@web.de', dim);
})();

document.addEventListener('DOMContentLoaded', () => {
  /* ── Typewriter ── */
  const PHRASES = [
    { prefix: 'Werkzeugmacher → Fachinformatiker,', highlight: 'von der Werkstatt zum Homelab.' },
    { prefix: 'Proxmox, Docker, Tailscale –', highlight: 'virtuelle Infrastruktur im Eigenbau.' },
    { prefix: 'Local LLMs, Claude Code,', highlight: 'KI-Workflows im Eigenbau.' },
    { prefix: 'Taucher, Gamer,', highlight: 'Nerd.' },
  ];

  const textEl = document.getElementById('heroText');
  const cursorEl = document.getElementById('heroCursor');
  if (!textEl) return;

  /* Typewriter runs in all modes — it's content, not decoration.
     Cursor blink is handled in CSS via reduced-motion. */
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const { prefix, highlight } = PHRASES[phraseIdx];
    const full = prefix + ' ' + highlight;
    const pLen = prefix.length + 1;

    if (!deleting) {
      charIdx = Math.min(charIdx + 1, full.length);
      const shown = full.slice(0, charIdx);
      textEl.innerHTML = charIdx <= pLen
        ? shown
        : prefix + ' <span class="word">' + shown.slice(pLen) + '</span>';
      if (charIdx === full.length) {
        setTimeout(() => { deleting = true; type(); }, 2400);
        return;
      }
      setTimeout(type, 44);
    } else {
      charIdx = Math.max(charIdx - 1, 0);
      const shown = full.slice(0, charIdx);
      textEl.innerHTML = charIdx <= pLen
        ? shown
        : prefix + ' <span class="word">' + shown.slice(pLen) + '</span>';
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        setTimeout(type, 480);
        return;
      }
      setTimeout(type, 20);
    }
  }
  setTimeout(type, 900);

  /* ── Hero parallax fade on scroll ── */
  const heroInner = document.querySelector('.hero-inner');
  const scrollHint = document.getElementById('scrollHint');
  const headerEl = document.querySelector('header');
  let cachedHeaderHeight = headerEl ? headerEl.offsetHeight : 0;
  window.addEventListener('resize', () => {
    if (headerEl) cachedHeaderHeight = headerEl.offsetHeight;
  }, { passive: true });

  let ticking = false;

  function updateHero() {
    const y = window.scrollY;
    const progress = Math.min(y / (cachedHeaderHeight * 0.5), 1);
    const opacity  = 1 - progress * progress;
    if (heroInner) heroInner.style.opacity = opacity;
    if (scrollHint) scrollHint.classList.toggle('hidden', y > 60);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHero);
      ticking = true;
    }
  }, { passive: true });

  /* ── Scroll Reveal ── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ── Section Label Glow ── */
  const labelObs = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('lit', e.isIntersecting));
  }, { threshold: 0.5 });
  document.querySelectorAll('.section-label').forEach(el => labelObs.observe(el));

  /* ── Email kopieren ── */
  const emailBtn = document.getElementById('emailBtn');
  if (emailBtn) {
    const showToast = (message) => {
      if (emailBtn.querySelector('.copy-toast')) return;
      const toast = document.createElement('span');
      toast.className = 'copy-toast';
      toast.textContent = message;
      emailBtn.appendChild(toast);
      setTimeout(() => toast.remove(), 2400);
    };

    emailBtn.addEventListener('click', () => {
      const email = 'Ivan_KB@web.de';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
          .then(() => showToast('Kopiert!'))
          .catch(() => showToast('Manuell kopieren: ' + email));
      } else {
        showToast('Manuell kopieren: ' + email);
      }
    });
  }
});
