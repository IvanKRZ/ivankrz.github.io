/*!
 * © 2026 Ivan Krznaric-Bertic — https://ivankrz.github.io
 * Vanilla JS, keine externen Abhängigkeiten.
 */

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

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Typewriter ──
   Läuft in allen Modi — es ist Inhalt, keine Deko.
   Der Cursor-Blink wird per CSS über prefers-reduced-motion abgeschaltet. */
const PHRASES = [
  { p: 'Werkzeugmacher → Fachinformatiker,', h: 'von der Werkstatt zum Homelab.' },
  { p: 'Proxmox, Nextcloud, Tailscale,',      h: 'Infrastruktur im Eigenbau.' },
  { p: 'Local LLMs, Claude Code,',            h: 'KI-Workflows, die ich selbst baue.' },
  { p: 'Taucher, Gamer,',                     h: 'Nerd.' },
];

const hookEl = document.getElementById('hook');
if (hookEl) {
  let pi = 0, ci = 0, deleting = false;
  const type = () => {
    const { p, h } = PHRASES[pi];
    const full = p + ' ' + h;
    const pLen = p.length + 1;
    ci += deleting ? -1 : 1;
    ci = Math.max(0, Math.min(ci, full.length));
    const shown = full.slice(0, ci);
    hookEl.innerHTML = ci <= pLen ? shown : p + ' <span class="word">' + shown.slice(pLen) + '</span>';
    if (!deleting && ci === full.length) { setTimeout(() => { deleting = true; type(); }, 2200); return; }
    if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % PHRASES.length; setTimeout(type, 450); return; }
    setTimeout(type, deleting ? 30 : 55);
  };
  setTimeout(type, 700);
}

/* ── Scroll-Spy: aktiver Abschnitt markiert den passenden Sidebar-Link ── */
const navLinks = [...document.querySelectorAll('.side-nav a')];
if (navLinks.length) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('active', l.dataset.t === e.target.id));
    });
  }, { rootMargin: '-20% 0px -60% 0px' });
  document.querySelectorAll('.block').forEach(b => spy.observe(b));
}

/* ── Scroll-Reveal ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('vis');
    revealObs.unobserve(e.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── E-Mail kopieren ── */
const emailBtn = document.getElementById('mail');
const toast = document.getElementById('toast');
if (emailBtn && toast) {
  emailBtn.addEventListener('click', () => {
    const email = 'Ivan_KB@web.de';
    const show = (msg) => {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => show('Kopiert!')).catch(() => show('Manuell kopieren: ' + email));
    } else {
      show('Manuell kopieren: ' + email);
    }
  });
}

/* ── GitHub-Statistiken (dynamisch, mit statischem Fallback im HTML) ──
   Ein Request auf /users/<user>/repos liefert Repo-Anzahl, Star-Summe
   und die Sterne pro Projekt. Ergebnis wird 6 h in localStorage gecacht,
   damit die Zahlen nicht bei jedem Aufruf neu laden oder „poppen“.
   Schlägt der Abruf fehl, bleiben einfach die statischen Fallback-Werte. */
(() => {
  const USER = 'IvanKRZ';
  const CACHE_KEY = 'gh-stats-v1';
  const MAX_AGE = 6 * 60 * 60 * 1000; // 6 Stunden

  const apply = (data) => {
    if (!data) return;
    const repoEl = document.getElementById('stat-repos');
    const starEl = document.getElementById('stat-stars');
    if (repoEl && Number.isFinite(data.repos)) repoEl.textContent = data.repos;
    if (starEl && Number.isFinite(data.stars)) starEl.textContent = data.stars;
    document.querySelectorAll('.star[data-repo]').forEach(el => {
      const n = data.perRepo[el.dataset.repo.toLowerCase()];
      if (typeof n !== 'number') return;
      el.textContent = n > 0 ? '★ ' + n : '↗';
    });
  };

  const readCache = () => {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (c && (Date.now() - c.t) < MAX_AGE) return c.d;
    } catch { /* ignore */ }
    return null;
  };

  const fetchStats = async () => {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&type=owner`, {
      headers: { 'Accept': 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error('GitHub API ' + res.status);
    const repos = await res.json();
    const perRepo = {};
    let stars = 0;
    repos.forEach(r => { perRepo[r.name.toLowerCase()] = r.stargazers_count; stars += r.stargazers_count; });
    return { repos: repos.length, stars, perRepo };
  };

  // Frischer Cache → sofort anwenden, kein API-Call (spart Rate-Limit, kein Nachladen).
  const cached = readCache();
  if (cached) { apply(cached); return; }

  fetchStats()
    .then(data => {
      apply(data);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: data })); } catch { /* ignore */ }
    })
    .catch(() => { /* Fallback-Werte im HTML bleiben stehen */ });
})();
