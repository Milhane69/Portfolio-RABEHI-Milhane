/* Portfolio RABEHI Milhane : navigation, filtres, accordéons, animations */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const header = $('header');
  const navUl = $('nav ul');
  const links = $$('nav ul a');

  // Barre de progression + ombre du header
  const bar = document.createElement('div');
  bar.className = 'progress';
  document.body.prepend(bar);
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    header.classList.toggle('scrolled', scrollY > 20);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Section active dans la navigation (barre basse sur mobile)
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => {
      const on = a.getAttribute('href') === '#' + e.target.id;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      if (on && navUl.scrollWidth > navUl.clientWidth)
        navUl.scrollTo({ left: a.offsetLeft - navUl.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
    });
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach(s => spy.observe(s));

  // Apparition des sections
  const reveal = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('show'); reveal.unobserve(e.target); }
  }), { rootMargin: '200px 0px' });
  $$('section').forEach(s => reveal.observe(s));

  // Compétences : doublons retirés, accessibles au clavier, description en ligne
  const seen = new Set();
  $$('.competence').forEach(c => {
    const k = c.textContent.trim();
    if (seen.has(k)) return c.remove();
    seen.add(k);
    c.tabIndex = 0;
    c.setAttribute('role', 'button');
    c.setAttribute('aria-expanded', 'false');
    const toggle = () => {
      const open = !c.classList.contains('active-tooltip');
      $$('.competence').forEach(o => { o.classList.remove('active-tooltip'); o.setAttribute('aria-expanded', 'false'); });
      c.classList.toggle('active-tooltip', open);
      c.setAttribute('aria-expanded', open);
    };
    c.addEventListener('click', toggle);
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  // Projets : accordéon accessible, alternance COJOP ouverte par défaut
  $$('.toggle-description').forEach(btn => {
    const d = btn.closest('li').querySelector('.projet-description');
    if (!d) return;
    const set = open => {
      d.classList.toggle('active', open);
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? 'Voir moins' : 'Voir plus';
    };
    btn.addEventListener('click', () => set(!d.classList.contains('active')));
    set(btn.closest('#cojop') !== null);
  });

  // Projets : filtres par catégorie (une seule liste affichée à la fois)
  const cats = $$('.projets-category');
  if (cats.length) {
    const names = { 'projets-professionnels': 'Pro & recherche', 'projets-ecole': 'Académiques', 'projets-personnels': 'Personnels' };
    const tabs = document.createElement('div');
    tabs.className = 'filters';
    tabs.setAttribute('role', 'tablist');
    const show = id => {
      cats.forEach(c => { c.hidden = c.id !== id; });
      $$('button', tabs).forEach(b => b.setAttribute('aria-selected', b.dataset.id === id));
    };
    cats.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.id = c.id; b.setAttribute('role', 'tab');
      b.textContent = names[c.id] || c.querySelector('h3').textContent;
      b.addEventListener('click', () => show(c.id));
      tabs.append(b);
    });
    cats[0].before(tabs);
    show(cats[0].id);
  }

  // CV : zoom plein écran, fermeture par clic ou Échap
  const cv = $('#cv-image');
  if (cv) {
    cv.tabIndex = 0;
    cv.setAttribute('role', 'button');
    const set = open => {
      cv.classList.toggle('cv-fullscreen', open);
      document.body.classList.toggle('cv-open', open);
    };
    cv.addEventListener('click', () => set(!cv.classList.contains('cv-fullscreen')));
    cv.addEventListener('keydown', e => { if (e.key === 'Enter') set(!cv.classList.contains('cv-fullscreen')); });
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }
});
