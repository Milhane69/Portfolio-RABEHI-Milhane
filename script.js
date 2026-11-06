/* Portfolio Milhane Rabehi : interactions, animations, données des projets */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- thème ---------- */
const mq = matchMedia('(prefers-color-scheme: dark)');
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : mq.matches;
const metaTheme = $('meta[name="theme-color"]');
let colors = {};
const readColors = () => {
  const cs = getComputedStyle(root);
  colors = { acc: cs.getPropertyValue('--acc').trim(), gold: cs.getPropertyValue('--gold').trim(), line: cs.getPropertyValue('--line').trim(), ink: cs.getPropertyValue('--ink').trim() };
  if (metaTheme) metaTheme.setAttribute('content', isDark() ? '#0b1620' : '#f3f6f8');
};
$('#tg').addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  readColors();
});
mq.addEventListener && mq.addEventListener('change', readColors);
readColors();

/* ---------- progression, section active, apparition ---------- */
const prog = $('#prog');
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const m = root.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (m > 0 ? scrollY / m : 0) + ')';
    ticking = false;
  });
}, { passive: true });

const navLinks = $$('.links a, .dock a');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  navLinks.forEach(a => {
    const sid = e.target.id;
    const on = a.getAttribute('href') === '#' + sid;
    a.classList.toggle('on', on);
    on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
  });
}), { rootMargin: '-40% 0px -55% 0px' });
$$('main > section[id]').forEach(s => spy.observe(s));

const rv = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('on'); rv.unobserve(e.target); }
}), { rootMargin: '0px 0px -6% 0px' });
$$('.rv').forEach(e => rv.observe(e));

/* ---------- compteurs ---------- */
const counter = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const b = e.target, n = +b.dataset.n, pre = b.dataset.p || '', suf = b.dataset.s || '';
  counter.unobserve(b);
  if (reduce) { b.textContent = pre + n + suf; return; }
  const t0 = performance.now(), dur = 1300;
  const step = t => {
    const k = Math.min(1, (t - t0) / dur), v = Math.round(n * (1 - Math.pow(1 - k, 3)));
    b.textContent = pre + v + suf;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}));
$$('[data-n]').forEach(b => counter.observe(b));

/* ---------- requête SQL tapée ---------- */
(() => {
  const toks = [['k', 'SELECT'], ['', ' impact, gouvernance, automatisation\n'], ['k', 'FROM'], ['', '   milhane_rabehi\n'], ['k', 'WHERE'], ['', '  role = '], ['s', "'Data Analytics Engineer'"], ['', '\n'], ['k', 'AND'], ['', '    org  = '], ['s', "'COJOP Alpes 2030'"], ['', ';']];
  const total = toks.reduce((a, t) => a + t[1].length, 0);
  const render = n => {
    let out = '', left = n;
    for (const [c, txt] of toks) {
      if (left <= 0) break;
      const part = txt.slice(0, left); left -= txt.length;
      out += c ? `<span class="${c}">${esc(part)}</span>` : esc(part);
    }
    return out;
  };
  const ghost = $('#ghost'), live = $('#sql');
  ghost.innerHTML = render(total);
  if (reduce) { live.innerHTML = render(total); return; }
  let i = 0;
  const tick = () => {
    live.innerHTML = render(i) + (i < total ? '<span class="cur"></span>' : '<span class="cur"></span>');
    if (i++ < total) setTimeout(tick, 26);
  };
  setTimeout(tick, 500);
})();

/* ---------- courbe animée ---------- */
(() => {
  const c = $('#curve'), x = c.getContext('2d');
  const X = i => 10 + i / (N - 1) * (W - 20);
  const N = 36;
  const pts = Array.from({ length: N }, (_, i) => .3 + .3 * Math.sin(i / 4.2) + i / N * .4 + .05 * Math.sin(i * 2.3));
  let W, H, t = 0, mx = -1, visible = true;
  const size = () => {
    const r = devicePixelRatio || 1;
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * r; c.height = H * r;
    x.setTransform(r, 0, 0, r, 0, 0);
  };
  size();
  new ResizeObserver(size).observe(c);
  const setX = e => { mx = e.clientX - c.getBoundingClientRect().left; };
  c.addEventListener('pointermove', setX);
  c.addEventListener('pointerdown', setX);
  c.addEventListener('pointerleave', () => { mx = -1; });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }).observe(c);
  const y = i => H - (pts[i] + Math.sin(t * 1.4 + i * .5) * .025) * H * .8 - 10;
  function step() {
    t += .016;
    x.clearRect(0, 0, W, H);
    x.strokeStyle = colors.line; x.lineWidth = 1;
    for (let g = 1; g < 5; g++) { x.beginPath(); x.moveTo(0, H * g / 5); x.lineTo(W, H * g / 5); x.stroke(); }
    const prog = reduce ? 1 : Math.min(1, t / 1.6), cnt = Math.floor(prog * (N - 1));
    const gr = x.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, colors.acc + '66'); gr.addColorStop(1, colors.acc + '00');
    x.beginPath(); x.moveTo(X(0), H);
    for (let i = 0; i <= cnt; i++) x.lineTo(X(i), y(i));
    x.lineTo(X(cnt), H); x.fillStyle = gr; x.fill();
    x.beginPath();
    for (let i = 0; i <= cnt; i++) i ? x.lineTo(X(i), y(i)) : x.moveTo(X(0), y(0));
    x.strokeStyle = colors.acc; x.lineWidth = 3; x.lineJoin = 'round'; x.stroke();
    const hi = mx >= 0 ? Math.max(0, Math.min(cnt, Math.round((mx - 10) / (W - 20) * (N - 1)))) : cnt;
    const px = X(hi), py = y(hi);
    x.beginPath(); x.arc(px, py, 6, 0, 7); x.fillStyle = colors.gold; x.fill();
    x.fillStyle = colors.ink; x.font = '600 12px JetBrains Mono, ui-monospace, monospace';
    const label = 'S' + (hi + 1) + ' · ' + Math.round(pts[hi] * 100);
    x.textAlign = px > W - 80 ? 'right' : 'left';
    x.fillText(label, px + (px > W - 80 ? -12 : 12), Math.max(16, py - 12));
  }
  let running = false;
  function start() {
    if (running) return;
    if (reduce) { step(); return; }
    running = true;
    (function f() { if (!visible) { running = false; return; } step(); requestAnimationFrame(f); })();
  }
  start();
})();

/* ---------- réseau de données du hero ---------- */
(() => {
  const c = $('#net'), hero = $('.hero');
  if (!c) return;
  const x = c.getContext('2d');
  let W = 0, H = 0, pts = [], px = -1e3, py = -1e3, vis = true, running = false;
  const seed = () => {
    const n = Math.min(70, Math.floor(W * H / 15000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28 }));
  };
  const size = () => {
    const r = Math.min(devicePixelRatio || 1, 2), w = hero.clientWidth;
    H = hero.clientHeight;
    c.width = w * r; c.height = H * r; x.setTransform(r, 0, 0, r, 0, 0);
    if (w !== W) { W = w; seed(); } else W = w;
    if (reduce) frame();
  };
  const D = 120;
  function frame() {
    x.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (!reduce) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      x.beginPath(); x.arc(p.x, p.y, 1.8, 0, 7); x.fillStyle = colors.acc; x.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < D) { x.globalAlpha = (1 - d / D) * .4; x.strokeStyle = colors.acc; x.lineWidth = 1; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke(); }
      }
      const dm = Math.hypot(p.x - px, p.y - py);
      if (dm < 150) { x.globalAlpha = (1 - dm / 150) * .8; x.strokeStyle = colors.gold; x.lineWidth = 1.4; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(px, py); x.stroke(); }
      x.globalAlpha = 1;
    }
  }
  new ResizeObserver(size).observe(hero);
  size();
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
  hero.addEventListener('pointerleave', () => { px = py = -1e3; });
  new IntersectionObserver(es => {
    vis = es[0].isIntersecting;
    if (!vis || running) return;
    if (reduce) { frame(); return; }
    running = true;
    (function f() { if (!vis) { running = false; return; } frame(); requestAnimationFrame(f); })();
  }).observe(hero);
})();

/* ---------- bandeau d’outils ---------- */
(() => {
  const tr = $('#track');
  if (!tr) return;
  const tools = ['Power BI', 'Power Query', 'Power Automate', 'TypeScript', 'Python', 'SQL', 'PostgreSQL', 'SAP BW', 'Talend', 'Streamlit', 'Machine learning', 'NLP'];
  const html = tools.map(t => '<span>' + esc(t) + '</span>').join('');
  tr.innerHTML = html + html;
})();

/* ---------- halos qui suivent le pointeur ---------- */
$$('.miss article, .edu, .flow li').forEach(e => e.classList.add('spot'));
if (matchMedia('(hover: hover)').matches) {
  addEventListener('pointermove', e => {
    const t = e.target.closest && e.target.closest('.spot');
    if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', e.clientX - r.left + 'px');
    t.style.setProperty('--my', e.clientY - r.top + 'px');
  }, { passive: true });
  addEventListener('pointerout', e => {
    const t = e.target.closest && e.target.closest('.spot');
    if (t) { t.style.removeProperty('--mx'); t.style.removeProperty('--my'); }
  }, { passive: true });
}

/* ---------- parcours : pipeline ---------- */
const P = [
  { i: '1', n: 'Brenntag France', s: 'EXTRACT', w: 'Avril à août 2024', t: 'Data Engineer / SAP BI (stage)', d: 'Restructuration complète d’un cube Materials Management (SAP) pour fiabiliser les flux de données et le reporting des achats.', u: ['Refonte du cube MM pour optimiser l’intégrité et la fluidité des flux de données', 'Modélisation multidimensionnelle sous SAP BW : temps de traitement réduits, KPI d’achats plus fiables', 'Cadre de reporting granulaire sur la performance fournisseurs et les volumes d’achat, pour piloter les achats'], g: ['SAP BW', 'SAP FICO', 'Modélisation'] },
  { i: '2', n: 'Annemasse Agglo', s: 'TRANSFORM', w: 'Septembre 2024 à septembre 2025', t: 'Data Analyst / BI Engineer (alternance)', d: 'Reporting Power BI conçu de A à Z pour le suivi des abonnés au réseau d’eau potable : de l’ingénierie des données à la formation des utilisateurs.', u: ['Dashboards Power BI interactifs, distribution automatisée par e-mail et portails web', 'Pipelines Oracle SQL automatisés, tests unitaires, contrôle de version ; données préparées pour la télérelève (IoT)', 'Machine learning pour détecter doublons et incohérences, nettoyage des adresses et des tiers', 'Gouvernance : procédures, ré-indexation GED, conformité RGPD et sécurité', 'Ateliers agiles et formation des utilisateurs'], g: ['Power BI', 'Oracle SQL', 'Machine learning', 'RGPD'] },
  { i: '3', n: 'Projet JADE', s: 'VALIDATE', w: 'Déc. 2025 à juil. 2026 · Laboratoire Jean Kuntzmann (stage)', t: 'Justice Algorithmique des Élections', d: 'Pipeline ETL, entrepôt PostgreSQL, NLP et application d’analyse du contentieux électoral : plus de 25 000 résumés et 7 800 décisions de justice, en lien avec le CRJ (droit).', u: ['ETL Python orienté objet (pandas, psycopg2, openpyxl), PostgreSQL en zones Staging et Production, vues SQL pour la BI', 'Qualité des données : regex, audit automatisé, table de quarantaine des rejets', 'Classification NLP (TF-IDF, régression logistique) sans data leakage grâce à GroupShuffleSplit', 'Simulateur de risque juridique et audit des anomalies (issues sous 3 % des cas)', 'Application Streamlit et Plotly : heatmaps, sunburst de 4 800 thèmes, inflation normative'], g: ['Python', 'PostgreSQL', 'scikit-learn', 'Streamlit', 'Plotly'] },
  { i: '4', n: 'COJOP Alpes 2030', s: 'LOAD', w: 'Depuis septembre 2026 · Lyon', t: 'Assistant Data Product Manager & Analytics Engineer', d: 'Architecture « Single Source of Truth » pour la planification des 4 pôles olympiques, automatisation cloud et dashboards de pilotage.', u: ['Gouvernance automatisée en TypeScript (Office Scripts)', 'Workflows JSON et API REST sous Power Automate : Excel, SharePoint, Teams, Smartsheet', 'Normalisation en Power Query M, dashboards Power BI de pilotage', 'Recueil de besoins auprès des directions métiers'], g: ['Power BI', 'Power Automate', 'Power Query', 'TypeScript'], go: '#cojop' }
];
const pipe = $('#pipe'), pan = $('#panel');
P.forEach((p, k) => {
  const b = document.createElement('button');
  b.className = 'node'; b.type = 'button';
  b.innerHTML = `<i>${p.i}</i><b>${esc(p.n)}</b><span>${p.s}</span>`;
  b.addEventListener('click', () => show(k));
  pipe.append(b);
});
function show(k) {
  $$('.node', pipe).forEach((n, j) => { n.classList.toggle('on', j === k); n.setAttribute('aria-pressed', j === k); });
  pipe.style.setProperty('--p', k / (P.length - 1));
  const p = P[k];
  pan.style.animation = 'none'; void pan.offsetWidth; pan.style.animation = '';
  pan.innerHTML = `<div class="when">${esc(p.w)}</div><h3>${esc(p.t)}</h3><p class="d">${esc(p.d)}</p><ul>${p.u.map(u => '<li>' + esc(u) + '</li>').join('')}</ul><div class="tags">${p.g.map(g => '<span class="tag">' + esc(g) + '</span>').join('')}</div>${p.go ? `<a class="go" href="${p.go}">Voir le détail de la mission ↑</a>` : ''}`;
}
const pkt = document.createElement('i');
pkt.className = 'pkt'; pkt.setAttribute('aria-hidden', 'true');
pipe.append(pkt);
pipe.style.setProperty('--p', 0);
show(3);
pipe.style.setProperty('--p', 0);
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { pipe.style.setProperty('--p', 1); o.disconnect(); } }, { threshold: .6 }).observe(pipe);

/* ---------- stack ---------- */
const S = {
  'Data & BI': ['Power BI · DAX', 'Power Query M', 'Power Automate', 'SAP BW', 'SAP FICO', 'Talend ETL', 'Knime', 'Excel · VBA', 'Data warehouse', 'MS Project'],
  'Ingénierie': ['Python', 'SQL · Oracle', 'PostgreSQL', 'TypeScript', 'Java', 'C#', 'C++', 'Streamlit', 'CI/CD', 'API REST', 'AWS · Azure', 'Linux'],
  'IA & Cognition': ['Machine learning', 'scikit-learn', 'pandas · NumPy', 'NLP', 'K-Means', 'Minimax · Alpha-Beta', 'Méthodologie expérimentale'],
  'Web & UX': ['HTML · CSS · JS', 'Laravel', 'PHP · MySQL', 'Flask', 'Figma', 'IHM & accessibilité', 'SVG · XML · XSD', 'Azure DevOps', 'Agile · Scrum', 'RGPD']
};
const tabs = $('#tabs'), bub = $('#bub');
bub.insertAdjacentHTML('beforebegin', '<p class="sub hintx">Touche un outil pour voir où je l’ai utilisé : projets, cours et expériences.</p>');
bub.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) openPal(b.dataset.t); });
Object.keys(S).forEach((k, i) => {
  const b = document.createElement('button');
  b.className = 'tab'; b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = k;
  b.addEventListener('click', () => {
    $$('.tab', tabs).forEach(t => { t.classList.toggle('on', t === b); t.setAttribute('aria-selected', t === b); });
    bub.innerHTML = S[k].map((s, j) => `<button class="bub" type="button" data-t="${esc(s.split(' · ')[0])}" style="animation-delay:${j * 45}ms">${esc(s)}</button>`).join('');
  });
  tabs.append(b);
  if (!i) b.click();
});

/* ---------- projets : cartes vitrine ---------- */
const L = { all: 'Tout', pro: 'Expériences pro', rech: 'Recherche', acad: 'Académique', perso: 'Personnel' };
const Q = { all: '', pro: 'pro', rech: 'recherche', acad: 'académique', perso: 'personnel' };
const J = [
  { c: 'pro', t: 'COJOP Alpes 2030 · alternance', s: 'Single Source of Truth, automatisation cloud et dashboards de pilotage.', g: ['Power Automate', 'Power Query', 'Power BI', 'TypeScript'], b: ['Architecture « Single Source of Truth » centralisant les données de planification des 4 pôles olympiques', 'Gouvernance automatisée en TypeScript (Office Scripts) pour la qualité en temps réel', 'Workflows JSON et API REST (Power Automate) entre Excel, SharePoint, Teams et Smartsheet', 'Dashboards Power BI interactifs pour le pilotage, dont le Comité International Olympique', 'Recueil de besoins et facilitation digitale auprès des équipes transverses'], l: [['Voir la mission en détail', '#cojop']] },
  { c: 'rech', live: true, d: 'Travail de recherche mené en parallèle de mes cours et de mon alternance, dans le projet Music Graph RAG (Inria, Philharmonie de Paris) : évaluer et comparer des modèles de reconnaissance automatique de la parole sur les conférences de la Philharmonie, dont les erreurs de transcription dégradent la recherche d’extraits et la reconnaissance des entités nommées. Le sujet comporte plusieurs axes : j’en traite une partie.', st: [['Transcrire','comparer des modèles open source à la baseline WhisperX'],['Corriger','reconnaître les entités nommées pendant ou après la transcription'],['Évaluer','WER et CER, tableaux de résultats']], t: 'Benchmark de transcription automatique · conférences musicales', s: 'Recherche en cours : évaluer et comparer des modèles de reconnaissance de la parole sur les conférences de la Philharmonie de Paris.', g: ['Python', 'ASR', 'NER', 'WER · CER'], b: ['Contexte : la Philharmonie de Paris conserve des centaines d’heures de conférences sur la musique, transcrites automatiquement avec WhisperX', 'Problème : les erreurs de transcription touchent surtout les noms propres et le vocabulaire spécialisé, puis se propagent à la reconnaissance d’entités nommées et à la recherche d’extraits', 'Axe 1 : comparer des modèles de transcription open source ou open weights (dont Qwen3-ASR et Voxtral) à la baseline WhisperX, en WER et CER, y compris sur les entités nommées', 'Axe 2 : reconnaître les entités nommées pendant la transcription ou en post-correction', 'Axe 3 : enrichir le jeu d’évaluation grâce à la post-correction automatique', 'Technologies du sujet : Python, PyTorch, transformers, vLLM, Ollama, serveur de calcul GPU avec gestionnaire de jobs', 'Cadre : projet Music Graph RAG (Inria, Philharmonie de Paris), mené en parallèle de mes cours et de mon alternance, du semestre 10 jusqu’en juin. Le sujet comporte plusieurs axes, dont je traite une partie.'], l: [] },
  { c: 'rech', t: 'Projet JADE · Justice Algorithmique des Élections', s: 'Pipeline ETL Python, modèle NLP sans data leakage et application Streamlit pour explorer le contentieux électoral : 25 000 résumés et 7 800 décisions de justice.', d: 'Stage au Laboratoire Jean Kuntzmann, en lien avec le CRJ (droit) : transformer un corpus 2026 de plus de 25 000 résumés juridiques et 7 800 décisions de justice en une base fiable, un modèle prédictif évalué sans fuite de données et une application que des juristes non techniciens utilisent seuls.', g: ['Python', 'pandas', 'PostgreSQL', 'scikit-learn', 'NLP', 'Streamlit', 'Plotly', 'Regex'], st: [['ETL et entrepôt de données', 'Pipeline ETL de bout en bout en Python orienté objet (pandas, psycopg2, openpyxl), entrepôt PostgreSQL en zones Staging (_raw) et Production, vues SQL optimisées (v_abstracts_jade) pour la BI en temps réel.'], ['Qualité des données', 'Module de nettoyage strict par expressions régulières et audit automatisé, avec isolation des données invalides dans une table de quarantaine (abstracts_rejets).'], ['NLP et machine learning', 'Classification de texte (TfidfVectorizer, LogisticRegression) pour prédire l’issue d’un contentieux à partir du résumé brut.'], ['Évaluation sans fuite', 'Data leakage évité dans un schéma « un-à-plusieurs » grâce à GroupShuffleSplit : le modèle n’est évalué que sur des affaires jamais vues.'], ['Simulateur de risque juridique', 'Moteur de règles lexicales pondérées qui note la probabilité d’annulation d’une élection à partir des griefs saisis par l’utilisateur.'], ['Audit statistique des anomalies', 'Détection des paradoxes jurisprudentiels (issues présentes dans moins de 3 % des cas), avec retour au texte original du juge pour vérification.'], ['Application et dataviz', 'Application Streamlit et Plotly pour des juristes non techniciens : heatmaps sémantiques des taux de succès des arguments, sunburst hiérarchique de plus de 4 800 thèmes juridiques, courbes et barres de l’inflation normative.']], b: ['Pipeline ETL orienté objet en Python, entrepôt PostgreSQL Staging et Production, vues SQL pour la BI', 'Module de qualité des données avec regex et table de quarantaine', 'Classification NLP TF-IDF et régression logistique, GroupShuffleSplit contre le data leakage', 'Simulateur de risque juridique, audit des anomalies, heatmaps et sunburst sous Streamlit et Plotly'], l: [['Support de soutenance (PDF)', 'Support_soutenance_JADE.pdf']] },
  { c: 'pro', t: 'Annemasse Agglo · Data Analyst / BI Engineer', s: 'Reporting Power BI de A à Z pour le réseau d’eau potable : pipelines Oracle SQL, détection d’anomalies par machine learning et gouvernance RGPD.', d: 'Alternance de 13 mois (sept. 2024 à sept. 2025) : concevoir de bout en bout le reporting des abonnés au réseau d’eau potable, de l’extraction des données à la formation des utilisateurs, et préparer les données de la future télérelève.', g: ['Power BI', 'Oracle SQL', 'Machine learning', 'API', 'RGPD', 'GED', 'Agile'], st: [['Dashboards Power BI', 'Développement de bout en bout de tableaux de bord interactifs pour suivre les abonnés au réseau d’eau potable, avec une distribution automatisée et multicanale des rapports (e-mail, portails web) adaptée aux contraintes de chaque utilisateur.'], ['Recueil des besoins et modélisation', 'Recueil des besoins métiers, traduction en spécifications techniques et conception de modèles de données optimisés pour le reporting.'], ['Pipelines Oracle SQL', 'Pipelines d’extraction complexes en Oracle SQL avec actualisations entièrement automatisées, fiabilisés par des tests unitaires et un contrôle de version strict.'], ['Télérelève (IoT)', 'Préparation et structuration de jeux de données volumineux pour le déploiement à venir d’un système de relevé intelligent des compteurs d’eau.'], ['Qualité et machine learning', 'APIs et algorithmes de machine learning pour détecter automatiquement les doublons et incohérences, et grand nettoyage des données (adresses, tiers) pour fiabiliser la base.'], ['Gouvernance et conduite du changement', 'Procédures de gouvernance des données, ré-indexation des documents dans la GED, conformité aux politiques de sécurité et au RGPD, ateliers agiles et formation des utilisateurs pour développer la culture data des services.']], b: ['Dashboards Power BI interactifs et distribution automatisée multicanale des rapports', 'Pipelines Oracle SQL automatisés, tests unitaires, contrôle de version', 'Machine learning pour détecter doublons et incohérences, nettoyage des adresses et des tiers', 'Procédures de gouvernance, GED, RGPD, ateliers agiles, formation des utilisateurs'], l: [] },
  { c: 'pro', t: 'Brenntag France · Data Engineer / SAP BI', s: 'Restructuration d’un cube SAP Materials Management sous SAP BW : temps de traitement réduits, KPI d’achats fiabilisés et reporting fournisseurs.', d: 'Stage de 5 mois (avril à août 2024) : refondre le cube de données achats (Materials Management) pour fiabiliser les flux de données et le pilotage des approvisionnements.', g: ['SAP BW', 'SAP FICO', 'Modélisation multidimensionnelle', 'BI', 'KPI'], st: [['Restructuration du cube MM', 'Pilotage de la refonte complète d’un cube SAP Materials Management pour fiabiliser et fluidifier le flux de données.'], ['Modélisation multidimensionnelle', 'Amélioration du modèle sous SAP Business Warehouse (BW) : temps de traitement nettement réduits et KPI d’achats plus fiables.'], ['Reporting fournisseurs et achats', 'Déploiement d’un cadre de reporting granulaire sur la performance des fournisseurs et les volumes d’achat, pour piloter la fonction achats avec des données.']], b: ['Restructuration d’un cube SAP Materials Management', 'Modélisation multidimensionnelle SAP BW, temps de traitement réduits', 'Reporting granulaire sur la performance fournisseurs et les volumes d’achat'], l: [] },
  { c: 'pro', t: 'Easy Dis · Gestion des commandes e-commerce', s: 'Système de gestion des commandes en PHP et MySQL.', g: ['PHP', 'MySQL'], b: [], l: [] },

  { c: 'acad', t: 'Exposé IHM · Streamlit, un cours qui se joue en direct', s: 'Exposé en binôme (Master MIASHS, 19 novembre 2026) : une appli Streamlit de vote et de quiz en temps réel que la salle utilise sur son téléphone pendant l’exposé.', d: 'Exposé du cours d’IHM sur Streamlit, prévu le 19 novembre 2026. Plutôt que des diapositives seules, nous avons codé une application web de 430 lignes de Python que le public utilise depuis son téléphone : sondages, quiz chronométré et podium, pour illustrer la technologie en la vivant.', g: ['Python', 'Streamlit', 'IHM', 'Heuristiques de Nielsen', 'Temps réel', 'Quiz'], st: [['Application de vote en temps réel', 'Appli Streamlit d’environ 430 lignes de Python, hébergée sur Streamlit Community Cloud : le public scanne un QR code, choisit un pseudo, vote aux sondages et répond à un quiz avec classement final, sans une ligne de JavaScript.'], ['Architecture multi-utilisateurs', '@st.cache_resource pour un état partagé entre tous les téléphones, @st.fragment(run_every=2) pour se rafraîchir sans recharger la page, st.session_state pour un identifiant anonyme par participant (un vote par personne).'], ['Mode présentateur', 'La même application propose une autre vue selon un paramètre d’URL : régie pour lancer les activités, résultats en direct, podium du quiz.'], ['Démo guidée en 4 étapes', 'Tableau de bord de stations de ski : tableau triable, filtres et rerun visible, visualisation choisie par la salle, puis cache avant et après, favoris en session et mini-chat.'], ['Étude de la technologie', 'Cible applicative, concurrents (Power BI, Dash, Gradio, Shiny), acteurs (Snowflake), outils et références ; modèle d’exécution du script relancé à chaque interaction, et ses parades.'], ['Analyse IHM', 'Forces et limites jugées avec les heuristiques de Nielsen et de Norman : cohérence, visibilité de l’état, prévention des erreurs, face à la latence, la personnalisation limitée, le mobile et la montée en charge.']], b: ['Application de vote et de quiz en temps réel sous Streamlit', 'cache_resource, fragment et session_state pour un état partagé multi-utilisateurs', 'Démo de tableau de bord des stations de ski, analyse IHM selon Nielsen'], l: [['Application de l’exposé (Streamlit)', 'https://ihm-g5-miashs.streamlit.app'], ['Présentation (PPTX)', 'Streamlit_Expose_IHM_G5.pptx']] },
  { c: 'acad', t: 'SportConnect · Concevoir un réseau social pour l’événementiel sportif', s: 'Projet du cours d’IHM (Master 2 MIASHS, en binôme) : de trois personas à un prototype Streamlit qui rejoue 7 scénarios de validation, avec 10 tâches modélisées et 13 écrans maquettés.', d: 'Conception centrée utilisateur d’un réseau professionnel dédié à l’événementiel sportif et à l’analyse de données. Du cahier des charges au prototype, chaque choix d’interface est relié à une tâche, à un écran et à un critère ergonomique du cours (Bastien et Scapin).', g: ['IHM', 'Conception centrée utilisateur', 'Personas', 'Modèle de tâches', 'Maquettes', 'Streamlit', 'Plotly', 'SQLite', 'Critères ergonomiques'], st: [['Besoins et personas', 'Cahier des charges, analyse de l’existant et trois personas (une analyste, un organisateur, un décideur) avec leurs frustrations : partager des données autrement qu’en image, recruter vite, trouver l’information utile. Sept scénarios de validation.'], ['Modèle de tâches', 'Dix tâches décomposées jusqu’au clic avec les opérateurs ET, OU et PUIS. En vérifiant que chaque étape des scénarios a sa tâche, le modèle a été révisé : ajout des notifications et du réseau.'], ['Modèle abstrait et maquettes', 'Modèle de navigation, espaces de travail et 13 maquettes annotées : chaque élément est relié à une tâche, à un composant Streamlit et à un critère ergonomique. Règles de conception : moins de clics, pas de surcharge, retour visible après chaque action.'], ['Prototype Streamlit', 'Application multipage en trois couches : interface Streamlit, logique Python (authentification, recherche tolérante, notifications, graphiques Plotly) et base SQLite de 15 tables. Mots de passe hachés (PBKDF2), requêtes paramétrées, données fictives.'], ['Une publication qu’on manipule', 'Le point d’originalité : joindre un graphique interactif à une publication (curseur, choix du jour, survol) au lieu d’une image figée, et partager un tableau de bord en un clic.'], ['Validation', 'Les 7 scénarios sont rejoués automatiquement de bout en bout (12 tests, dont un passage sur tous les écrans pour les 3 personas) et 79 graphiques validés pour toutes les combinaisons de réglages.'], ['Limites assumées', 'Messagerie sans temps réel (Streamlit relance le script), mise en page pensée pour l’ordinateur, données fictives et pas encore de test avec de vrais utilisateurs : prochaine étape, un test d’utilisabilité chronométré.']], b: ['10 tâches, 13 écrans maquettés, 7 scénarios validés', 'Prototype Streamlit + Plotly + SQLite avec graphiques interactifs dans le fil', 'Démarche L2 à L5 : besoins, tâches, abstrait, prototype'], l: [['Cahier des charges (PDF)', 'CahierDesChargesIHM2-DJENNAD-RABEHI.pdf'], ['Soutenance (PPTX)', 'SportConnect_-_Soutenance_IHM.pptx'], ['Modèle de tâches (PDF)', 'ModeleDeTaches-SportConnect-RABEHI-DJENNADV2.pdf'], ['Modèle abstrait et maquettes (PDF)', 'ModeleAbstrait-Maquettes-SportConnect-RABEHI-DJENNAD.pdf']] },
  { c: 'rech', t: 'Zomb’IA · Survie à une apocalypse zombie, simulation multi-agents', s: 'Projet « IA et systèmes complexes » (Master 2 MIASHS) : 3 types d’agents, communication par le bruit, 4 expériences sur 30 répétitions pour mesurer l’émergence et trouver un seuil critique.', d: 'Simulation multi-agents en Python pur (numpy, scipy, pandas, matplotlib) : des civils doivent rejoindre une zone d’évacuation dans une ville de 43 × 43 cases face à des zombies, sans chef ni carte commune. La question de recherche : des règles locales très simples suffisent-elles à produire des comportements collectifs organisés ?', g: ['Systèmes multi-agents', 'Émergence', 'Simulation', 'Python', 'NumPy', 'SciPy', 'Pandas', 'Statistiques', 'Stigmergie'], st: [['Modèle', 'Grille de rues et d’immeubles, civils, zombies et soldats. Civils : fuite, cohésion et alignement avec les voisins, vivres et barricades. Zombies : poursuite, puis bruit, puis errance. Infection avec incubation de 8 ticks, option de spores inspirée d’Ophiocordyceps.'], ['Communication indirecte', 'Aucun échange direct : l’information passe par un champ de bruit qui diffuse et décroît (pas, tirs, événements). Les tirs des soldats attirent donc la meute, un principe de stigmergie.'], ['Protocole expérimental', 'Quatre expériences : courbes de référence, 7 scénarios, ablations pour tester l’émergence et analyse de sensibilité avec seuil critique. 30 répétitions par configuration, mêmes graines pour tous les scénarios, intervalles de confiance à 95 %.'], ['Résultats sur les scénarios', '80 civils, 10 zombies et 4 soldats au départ. Évacuation moyenne de 49 % en référence, 28 % si les civils partent regroupés (p = 0,0014), 10 % sans soldats (p < 0,0001) et 66 % avec les spores (p = 0,006). Pas d’effet détectable des barricades, de la connaissance de la carte ni du bruit des tirs.'], ['Émergence : des résultats nuancés', 'Sans cohésion ni alignement, la polarisation des convois baisse légèrement (0,696 à 0,678, p = 0,005) mais la taille des groupes ne change pas : convois partiels. L’encerclement n’est pas démontré, l’indice choisi ne distingue pas les cas (p = 0,51). Résultat contre-intuitif : sans cohésion, l’évacuation monte de 49 % à 62 %, une hypothèse étant que les groupes font du bruit.'], ['Seuil critique', 'Le nombre initial de zombies est le paramètre le plus influent, devant le nombre de civils. L’évacuation passe sous 50 % à environ 1 zombie pour 8 civils (ratio 0,125) ; le bruit a un effet négligeable.'], ['Reproductibilité', 'Chaque simulation reçoit une graine : mêmes paramètres, mêmes résultats. Une simulation de 300 ticks prend environ une seconde grâce à des tableaux plats et des parcours en largeur ; lancement automatisé sous Windows.'], ['Limites assumées', 'Perception par distance de chemin (pas de ligne de vue), paramètres de référence calibrés à la main, seuil critique interpolé sur 7 valeurs et 15 répétitions seulement. À lire comme des tendances du modèle, pas comme des prédictions.']], b: ['Moteur de simulation multi-agents en Python pur, 30 répétitions par scénario', 'Tests de Mann-Whitney, ablations pour l’émergence et seuil critique', 'Documentation de 14 pages : modèle, code, résultats, limites'], l: [['Présentation (PPTX)', 'Presentation_Zombie.pptx'], ['Documentation (DOCX)', 'Documentation_Projet_Zombie.docx'], ['Code et résultats (ZIP)', 'zombie_sim.zip']] },
  { c: 'acad', t: 'Open Food Facts', s: 'Optimisation PostgreSQL, IA pour le Nutri-Score, détection d’erreurs de saisie, workflows Knime et Power BI.', g: ['PostgreSQL', 'Knime', 'Power BI'], b: ['Documentation technique et scripts de nettoyage et de transformation', 'Vente simulée pour analyses Power BI, workflows Knime', 'Présentation finale en anglais'], l: [['Compte rendu', 'CompteRenduS4.01.pdf']] },
  { c: 'acad', t: 'Projet IMDb · SAE 5.C.01', s: 'OLTP et OLAP, NLP basique des critiques, visualisations et soutenance.', g: ['OLAP', 'NLP', 'Power BI'], b: ['OLTP : modélisation et optimisation', 'OLAP : schéma en étoile et intégration Power BI', 'IA : analyse NLP des critiques, planning Gantt et soutenance'], l: [['Soutenance', 'Soutenance.pdf'], ['Document final', 'Document final.docx'], ['Sujet du projet', 'SAE5.C.01 IMDb 2024-25.docx']] },
  { c: 'acad', t: 'Site Laravel complet', s: 'Sécurité, tests de charge, chatbot, MCD, dashboards Power BI et approche Agile.', g: ['Laravel', 'Power BI', 'RGPD', 'Azure DevOps'], b: ['Gestion des données sensibles, cryptographie, RGPD', 'Tests de charge et chatbot', 'Modélisation (MCD) et visualisation Power BI, gestion Agile sous Azure DevOps'], l: [['Diagramme', 'Rendu FinalS3.01.docx'], ['Cryptographie', 'CryptoS3.01.docx'], ['Réseau et chatbot', 'ChargeReseauChatbotS3.01.docx'], ['Données Excel', 'RenduFinalS3.01.xlsx'], ['RGPD', 'DocRGPDS3.01.docx'], ['Power BI', 'CompteRenduFinalPOWERBIS3.01.docx']] },
  { c: 'acad', t: 'Profilage socio-financier et risque viral', s: 'Étude statistique multivariée sur la propagation virale en Côte d’Ivoire.', g: ['ACP', 'Clustering', 'Statistiques'], b: ['Analyse en composantes principales et clustering pour dégager des profils', 'Corrélation entre précarité financière, isolement social et facteurs de risque'], l: [['Rapport d’analyse', 'Rendu_RABEHI_Milhane.pdf']] },
  { c: 'acad', t: 'Segmentation d’images par K-Means', s: 'Classification non supervisée pour la segmentation colorimétrique d’images.', g: ['K-Means', 'R', 'Python'], b: ['Implémentation de l’algorithme K-Means', 'Transfert de centres entre univers visuels et étude de la convergence'], l: [['Code et résultats', 'TP-Projet-KMEANS-RABEHI-DJENNAD.pdf']] },
  { c: 'acad', t: 'L’autorité du curseur · mouse tracking', s: 'Influence du statut social d’un agent virtuel sur la prise de décision et la motricité.', g: ['Mouse tracking', 'Statistiques', 'Cognition'], b: ['Analyse des trajectoires de souris pour mesurer le conflit moteur', 'Évaluation de la perte de confiance face à une autorité numérique', 'Traitement statistique des temps de réaction'], l: [['Présentation (PPTX)', 'Expérience.pptx'], ['Présentation (PDF)', 'Soutenance-mc.pdf']] },
  { c: 'acad', t: 'Architecture système · gestion de festival', s: 'Conception UML d’une billetterie éco-responsable avec calcul d’empreinte carbone.', g: ['UML', 'Dashboards'], b: ['Diagrammes de classes, cas d’utilisation et séquences', 'Logique de calcul CO2 et bonus ou malus tarifaires', 'Tableaux de bord d’aide à la décision (heatmaps de provenance)'], l: [['Cahier des charges UML', 'Rapport - Projet Génie Logiciel (2).docx'], ['Présentation', 'Rapport - Projet MiART.pdf']] },
  { c: 'acad', t: 'Audit ergonomique · app IKEA', s: 'Évaluation experte du parcours d’achat mobile et prototypes correctifs.', g: ['UX', 'Figma', 'Ergonomie'], b: ['Évaluation selon les critères de Bastien et Scapin', 'Tests utilisateurs et analyse des points de friction', 'Prototypage haute fidélité sous Figma'], l: [['Audit visuel', 'IKEA.pptx']] },
  { c: 'acad', t: 'Conception IHM · borne interurbaine', s: 'Interface simplifiant le zonage tarifaire pour les voyageurs.', g: ['IHM', 'UX', 'Terrain'], b: ['Guérilla testing en gare routière et observation non participante', 'Maquette supprimant la charge mentale du calcul de zones', 'Feedbacks visuels pour rassurer lors du paiement'], l: [['Étude UX/UI', 'RenduV1-IHM.pdf']] },
  { c: 'acad', t: 'Évaluation NLP · traduction neuronale vs humaine', s: 'Productivité et précision sémantique entre traduction humaine et LLM.', g: ['NLP', 'LLM', 'TER'], b: ['Évaluation des modèles via le score TER', 'Gain de temps d’un facteur 4 grâce à la post-édition', 'Analyse des erreurs de contexte et d’intentionnalité'], l: [['Rapport NLP', 'WTrad_Rab_Mil.pdf']] },
  { c: 'acad', t: 'Modélisation cognitive · lecture silencieuse', s: 'Influence de la syntaxe sur la prise de décision en lecture.', g: ['Statistiques', 'Cognition'], b: ['Rôle de la prosodie implicite dans le traitement de l’information', 'Modélisation des choix d’attachement syntaxique, analyse critique des biais et des valeurs p'], l: [['Étude statistique', 'Rapport_RABEHI_Milhane.pdf']] },
  { c: 'acad', t: 'Moteur de jeu Sudoku · XML et SVG', s: 'Application 100 % déclarative : validation XSD, règles XPath, interface SVG.', g: ['XML', 'XSD', 'XPath', 'SVG'], b: ['Structure XML et contraintes strictes via schémas XSD', 'Logique du Sudoku (lignes, colonnes, blocs) traduite en XPath', 'Interface SVG dynamique avec aides et feedbacks en temps réel'], l: [['Rapport technique', 'Rapport.pdf'], ['Support', 'Support.pdf']] },
  { c: 'acad', t: 'Comparaison d’approches algorithmiques', s: 'IA de jeu vidéo avec Minimax, Alpha-Beta et réseaux de neurones.', g: ['Algorithmique', 'IA'], b: ['Développement d’un algorithme d’IA décisionnel', 'Comparaison des approches, analyse des performances et optimisation'], l: [['Compte rendu', 'CompteRenduMonogame.pdf']] },
  { c: 'acad', t: 'Escape game MonoGame', s: 'Jeu d’énigmes interactif avec mini-jeux en HTML, CSS et JavaScript.', g: ['C#', 'MonoGame', 'JavaScript'], b: ['Escape game interactif dans un environnement immersif sous MonoGame', 'Énigmes et mini-jeux en HTML, CSS et JavaScript'], l: [['Compte rendu', 'CompteRenduMonogame.pdf']] },
  { c: 'acad', t: 'Exploitation d’une base de données', s: 'Modélisation, jeux de données, analyses statistiques et visualisations.', g: ['Power BI', 'SQL', 'Excel'], b: ['Documentation technique et rapport d’analyse', 'Fichiers Power BI et Excel'], l: [['Fichier Power BI', 'sae4.pbix']] },
  { c: 'acad', t: 'Exploration algorithmique d’un problème', s: 'Graphes et Excel/VBA pour l’aide à la décision, simulation et optimisation.', g: ['Graphes', 'Excel', 'VBA'], b: ['Modélisation sous forme de graphes', 'Simulation sous Excel et optimisation de la prise de décision'], l: [['Fichier Excel avec macros', 'OutilsDecision_E12V2.xlsm']] },
  { c: 'acad', t: 'Recueil des besoins', s: 'Questionnaire, persona et maquette Figma sur une activité à Annecy.', g: ['UX', 'Figma'], b: ['Questionnaire structuré et persona', 'Maquette du parcours utilisateur'], l: [['Maquette Figma', 'https://www.figma.com/proto/ShATBSnQilreJGmetXW3x5/Untitled?node-id=1-780&node-type=canvas&t=D8qzbtdt0myHRHV8-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A780&show-proto-sidebar=1'], ['Persona', 'Persona.docx'], ['Réponses', 'QuestionnaireS1.05.pdf']] },
  { c: 'acad', t: 'Application IHM connectée à une base', s: 'Application reliée à PhpPgAdmin, tests d’UX et validation.', g: ['IHM', 'PostgreSQL'], b: ['Interface utilisateur, connexion et gestion de données', 'Tests de fluidité'], l: [['Compte rendu IHM', 'IHM.pdf'], ['Cahier des charges', 'cahierdescharges.pdf']] },
  { c: 'acad', t: 'Analyse de l’environnement économique · Capgemini', s: 'Étude de l’entreprise (analyse SWOT) et présentation orale.', g: ['SWOT', 'Analyse'], b: ['Étude approfondie et analyse SWOT', 'Présentation orale'], l: [['Présentation', 'SAe_1.06.pptx'], ['Compte rendu', 'Compte rendu de synthèse Capgemini.docx']] },
  { c: 'acad', t: 'Organisation du travail d’équipe', s: 'Séminaire d’entreprise en anglais : cohésion, communication, présentations.', g: ['Anglais', 'Gestion de projet'], b: ['Cohésion de groupe et communication interculturelle', 'Affiche, dossier de préparation, poster et présentation orale'], l: [['Affiche', 'Affiche_seminaire.pdf'], ['Poster', 'sae6.pdf'], ['Livrable oral', 'Livrable_3_orale_.pdf']] },
  { c: 'acad', t: 'Installation de services réseau', s: 'Site WordPress sur Raspberry Pi avec base MariaDB.', g: ['WordPress', 'MariaDB', 'Réseau'], b: ['Configuration d’un serveur WordPress, gestion de MariaDB', 'Administration, sécurisation et étude performances et sécurité'], l: [['User guide', 'USERGUIDE_SAE']] },
  { c: 'acad', t: 'Installation d’un poste de développement', s: 'VM Debian avec environnement C# et outillage front.', g: ['Debian', 'C#'], b: ['Installation et configuration d’une VM Debian', 'Environnement C# et outils front CSS/JS'], l: [['User guide', 'USER_GUIDE.pdf']] },
  { c: 'acad', t: 'Création d’une base de données', s: 'Conception PostgreSQL, requêtes de validation et tests de stabilité.', g: ['PostgreSQL', 'SQL'], b: ['Modéliser et optimiser', 'Assurer l’intégrité des données et vérifier les performances des requêtes'], l: [] },

  { c: 'perso', t: 'CréaSite · outils pour freelances', s: 'Générateur de maquettes et de devis PDF, déployé via Netlify.', g: ['JavaScript', 'jsPDF', 'EmailJS', 'Netlify'], b: ['Maquettes interactives et devis PDF personnalisés', 'Formulaire de contact intelligent, design responsive'], l: [['Visiter CréaSite', 'https://creasite.netlify.app/']] },
  { c: 'perso', t: 'Site du clan Clash of Clans', s: 'Statistiques Power BI, classement interactif, gestion des membres et candidatures.', g: ['Power BI', 'Web'], b: ['Visualisations Power BI et classement interactif', 'Gestion des membres, formulaire de candidature, espace communautaire'], l: [['Visiter le site', 'https://milhane69.github.io/HOTH-Milhane']] },
  { c: 'perso', t: 'Bot Discord', s: 'Modération, rôles, notifications, intégrations API et statistiques via Power BI.', g: ['Python', 'API', 'Power BI'], b: ['Modération (filtres, logs), rôles, notifications', 'Commandes interactives et statistiques de serveur'], l: [] },
  { c: 'perso', t: 'Automatisation avec Python', s: 'Scripts d’envoi d’e-mails, tri de fichiers, scraping, rappels, extraction Excel/CSV.', g: ['Python', 'Scraping', 'Gmail API'], b: ['Bot d’envoi d’e-mails (Gmail API)', 'Organisation automatique de fichiers, scraper web, planification de rappels, extracteur Excel/CSV'], l: [] },
  { c: 'perso', t: 'Salon TV · une appli de bureau en mode télé', s: 'Application Electron pour Windows qui transforme le PC en smart TV : TV en direct par IPTV, services de streaming, manette, télécommande, fond d’écran animé et double écran.', d: 'Projet personnel : une interface plein écran pensée pour le canapé, qui réunit la télévision en direct, la VOD, la musique et le sport au même endroit. Tout se pilote au clavier, à la manette ou depuis un téléphone.', g: ['Electron', 'JavaScript', 'HTML', 'CSS', 'IPTV', 'M3U', 'EPG', 'Widevine', 'Manette'], st: [['Accueil façon smart TV', 'Salutation selon l’heure, grande horloge, météo, profils et onglets Suggestions, VOD et séries, Télévision, Musique, Sport et Découvrir. Mes chaînes et ma liste se parcourent par glissement, au clavier ou à la manette.'], ['TV en direct par IPTV', 'Lecture de listes M3U avec guide des programmes (EPG) : zapping haut et bas, saisie du numéro de chaîne, liste des chaînes avec favoris, volume et muet.'], ['Services de streaming', 'YouTube, Twitch, Spotify, Crunchyroll, ADN, Netflix, Disney+, Prime Video, Canal+ ou France.tv ouverts dans l’application, avec les sessions conservées d’un lancement à l’autre.'], ['Contenu protégé (DRM)', 'Version d’Electron de castLabs avec Widevine pour les services protégés, scripts d’installation et de signature, et un diagnostic DRM intégré pour comprendre les erreurs.'], ['Manette, télécommande, double écran', 'Navigation à la flèche et à la manette (DualSense via émulation XInput), touches multimédia d’une télécommande, contrôle depuis le téléphone et gestion du double écran.'], ['Fond d’écran et ergonomie', 'Fonds vidéo et web de Wallpaper Engine, mode transparent, recherche globale (Ctrl+K), centre de contrôle, aide des raccourcis (F1) et rappels de navigation affichés à l’écran.'], ['Mise en place', 'Lancement par un simple fichier .bat et un raccourci bureau, sans installateur. Limites connues : certains services peuvent exiger une signature VMP, et le DualSense a besoin d’un pilote de conversion.']], b: ['Application Electron en mode télé pour Windows', 'IPTV (M3U, EPG), streaming, manette, télécommande, double écran, Wallpaper Engine', 'Interface 100 % navigable sans souris'], l: [['Capture d’écran', 'salon-tv.png']] },
  { c: 'perso', t: 'Portfolio personnel', s: 'Le site que vous êtes en train de parcourir, en HTML, CSS et JavaScript.', g: ['HTML', 'CSS', 'JavaScript'], b: ['Animations, thème clair et sombre, navigation pensée pour le mobile'], l: [] }
];
const href = h => /^(https?:|#)/.test(h) ? h : encodeURI(h);
const PAGE = 6;
const ft = $('#ftabs'), pl = $('#plist'), qi = $('#q'), mb = $('#more'), ta = $('#toggleall'), em = $('#empty');
let cat = 'all', term = '', shown = PAGE;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const seed = s => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
const rnd = a => () => (a = Math.imul(a ^ a >>> 15, a | 1), a ^= a + Math.imul(a ^ a >>> 7, a | 61), ((a ^ a >>> 14) >>> 0) / 4294967296);
const BARS = innerWidth < 520 ? 34 : 56;
function wave(t) {
  const r = rnd(seed(t)); let h = '';
  for (let i = 0; i < BARS; i++) h += `<span style="--i:${i};--h:${(.18 + .82 * Math.abs(Math.sin(i / 4 + r() * 3)) * (.45 + r() * .55)).toFixed(2)}"></span>`;
  return h;
}

/* ---------- décors propres à chaque sujet ---------- */
document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--acc)"/><stop offset="1" style="stop-color:var(--gold)"/></linearGradient></defs></svg>');
const SV = s => `<svg class="deco" viewBox="0 0 600 64" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${s}</svg>`;
const cube = (x, y, k, c) => `<g transform="translate(${x} ${y}) scale(${k})"><g class="${c}"><path d="M0-22 36-4 0 14-36-4Z" fill="var(--gold)" opacity=".85"/><path d="M-36-4 0 14V34L-36 16Z" fill="var(--acc)" opacity=".55"/><path d="M36-4 0 14V34L36 16Z" fill="var(--acc)"/></g></g>`;
const cyl = x => `<g transform="translate(${x} 0)"><path class="st" d="M-26 14v28c0 4.4 11.6 8 26 8s26-3.6 26-8V14"/><ellipse class="st" cx="0" cy="14" rx="26" ry="8"/><path class="st" d="M-26 28c0 4.4 11.6 8 26 8s26-3.6 26-8" opacity=".55"/><circle class="led f-gold" cx="14" cy="44" r="2.4"/></g>`;
const DECO = {
  bi: r => { let h = '', d = ''; for (let i = 0; i < 24; i++) { const v = 10 + i / 24 * 24 + r() * 12, x = 96 + i * 19; h += `<rect class="bar" style="--i:${i}" x="${x}" y="${60 - v}" width="10" height="${v}" rx="3" fill="url(#dg)"/>`; d += (i ? 'L' : 'M') + (x + 5) + ' ' + (54 - v) + ' '; } return h + `<path class="st s-gold ln" pathLength="1" d="${d}"/>`; },
  etl: () => { const xs = [90, 195, 300, 405, 510]; let h = ''; xs.forEach((x, i) => { if (i < 4) h += `<path class="st flow" opacity=".6" d="M${x + 14} 32H${xs[i + 1] - 14}"/><circle class="pk f-gold" cx="${x + 14}" cy="32" r="3.5" style="--dx:${xs[i + 1] - x - 28}px;animation-delay:${i * .5}s"/>`; h += `<circle class="st${i === 4 ? ' s-gold' : ''}" cx="${x}" cy="32" r="12"/><circle class="${i === 4 ? 'f-gold' : 'f-acc'}" cx="${x}" cy="32" r="${i === 4 ? 5 : 3.5}"/>`; }); return h; },
  sst: () => { let h = ''; [10, 24, 40, 54].forEach(y => { h += `<path class="st flow" opacity=".65" d="M156 ${y}C225 ${y} 225 32 284 32"/><circle class="f-acc" cx="150" cy="${y}" r="4.5"/>`; }); h += `<path class="st flow" opacity=".65" d="M316 32H388"/><circle class="ring st s-gold" cx="300" cy="32" r="14"/><circle class="st s-gold" cx="300" cy="32" r="14"/><circle class="f-gold" cx="300" cy="32" r="6"/>`; [18, 32, 46].forEach((v, i) => { h += `<rect class="bar" style="--i:${i * 2}" x="${398 + i * 18}" y="${58 - v}" width="12" height="${v}" rx="3" fill="url(#dg)"/>`; }); return h; },
  cube: () => cube(210, 32, .62, 'fl') + cube(300, 26, 1, 'fl') + cube(390, 32, .62, 'fl'),
  db: () => cyl(220) + cyl(300) + cyl(380) + '<path class="st flow" opacity=".6" d="M248 32H272M328 32H352"/>',
  cluster: r => { let h = ''; [[190, 36, 'f-acc'], [300, 22, 'f-gold'], [410, 42, 'f-mut']].forEach(([cx, cy, c], k) => { for (let i = 0; i < 9; i++) h += `<circle class="dotp ${c}" style="--i:${k * 9 + i}" cx="${(cx + (r() - .5) * 74).toFixed(0)}" cy="${Math.max(7, Math.min(57, cy + (r() - .5) * 30)).toFixed(0)}" r="3.2"/>`; h += `<path class="st" style="stroke:var(--ink)" d="M${cx - 6} ${cy - 6}l12 12M${cx + 6} ${cy - 6}l-12 12"/>`; }); return h; },
  traj: () => '<path class="st flow" opacity=".4" d="M70 52C170 52 260 20 330 34S450 30 520 36"/><path class="st s-gold ln" pathLength="1" d="M70 52C150 6 210 62 290 32S430 6 520 36"/><path class="fl" fill="var(--gold)" d="M520 34v20l5-4 4 9 4-2-4-9h7z"/>',
  uml: () => { let h = ''; [140, 258, 376].forEach((x, i) => { h += `<rect class="st" x="${x}" y="10" width="84" height="44" rx="7"/><path class="st" opacity=".6" d="M${x} 23H${x + 84}"/><path class="st" opacity=".4" d="M${x + 10} 32h40M${x + 10} 42h56"/>`; if (i < 2) h += `<path class="st s-gold flow" d="M${x + 88} 32H${x + 114}"/><path class="st s-gold" d="M${x + 110} 27l5 5-5 5"/>`; }); return h; },
  wire: () => '<rect class="st" x="110" y="8" width="130" height="48" rx="7"/><path class="st" opacity=".6" d="M110 20H240"/><circle class="f-gold" cx="120" cy="14" r="2"/><circle class="f-acc" cx="128" cy="14" r="2"/><rect class="f-acc" opacity=".35" x="120" y="27" width="50" height="22" rx="4"/><path class="st" opacity=".5" d="M180 30h48M180 38h36M180 46h44"/><rect class="st" x="272" y="3" width="56" height="58" rx="10"/><path class="st" opacity=".5" d="M284 16h32M284 24h22"/><rect class="ring f-gold" x="284" y="42" width="32" height="10" rx="5"/><rect class="f-gold" x="284" y="42" width="32" height="10" rx="5"/><circle class="st" cx="392" cy="24" r="10"/><path class="st" opacity=".5" d="M412 18h66M412 28h46"/><rect class="st s-gold" x="370" y="42" width="110" height="12" rx="6"/>',
  sport: () => '<rect class="st" x="214" y="3" width="44" height="58" rx="9"/><rect class="f-acc" opacity=".3" x="221" y="12" width="30" height="14" rx="3"/><path class="st" opacity=".55" d="M222 34h28M222 42h20"/><rect class="f-gold led" x="222" y="49" width="16" height="6" rx="3"/><path class="st flow" opacity=".6" d="M266 32H296"/><rect class="st" x="304" y="6" width="140" height="52" rx="8"/><path class="st" opacity=".4" d="M316 18h44"/><path class="st s-gold ln" pathLength="1" d="M316 50C340 48 352 22 376 30S416 20 432 40"/><circle class="f-gold" cx="376" cy="30" r="3.5"/><circle class="f-acc" cx="148" cy="32" r="11"/><path class="st" opacity=".5" d="M170 26h26M170 38h18"/>',
  zomb: r => { let h = ''; [[120,6],[200,6],[280,6],[360,6],[440,6],[120,36],[200,36],[280,36],[360,36],[440,36]].forEach(([x,y]) => { h += `<rect class="st" opacity=".3" x="${x}" y="${y}" width="56" height="20" rx="3"/>`; }); for (let i = 0; i < 7; i++) h += `<circle class="dotp f-acc" style="--i:${i}" cx="${(130 + i * 11 + r() * 6).toFixed(0)}" cy="${(29 + r() * 6).toFixed(0)}" r="2.6"/>`; for (let i = 0; i < 5; i++) h += `<circle class="dotp f-gold" style="--i:${i + 3}" cx="${(330 + r() * 120).toFixed(0)}" cy="${(29 + r() * 6).toFixed(0)}" r="3"/>`; h += '<path class="st flow" opacity=".6" d="M214 32H300"/><rect class="st s-gold" x="500" y="22" width="26" height="20" rx="5"/>'; return h; },
  tv: () => '<rect class="st" x="222" y="6" width="156" height="42" rx="6"/><path class="st" opacity=".5" d="M270 56h60"/><rect class="f-acc" opacity=".3" x="232" y="15" width="40" height="24" rx="3"/><rect class="st" opacity=".5" x="280" y="15" width="40" height="24" rx="3"/><rect class="st s-gold" x="328" y="15" width="40" height="24" rx="3"/><rect class="f-gold led" x="232" y="42" width="20" height="3" rx="1.5"/><rect class="st" x="440" y="26" width="46" height="22" rx="11"/><circle class="f-acc" cx="455" cy="37" r="3.5"/><path class="st" opacity=".5" d="M470 33v8M466 37h8"/>',
  tokens: r => { let h = '', k = 0; [10, 36].forEach(y => { let x = 108 + r() * 20; while (x < 470) { const w = 28 + r() * 40; h += `<g class="dotp" style="--i:${k++}"><rect class="st${r() > .65 ? ' s-gold' : ''}" x="${x.toFixed(0)}" y="${y}" width="${w.toFixed(0)}" height="18" rx="9"/><path class="st" opacity=".45" d="M${(x + 8).toFixed(0)} ${y + 9}h${(w - 16).toFixed(0)}"/></g>`; x += w + 9; } }); return h; },
  grid: r => { let h = '<path class="st" d="M228 20l-14 12 14 12M372 20l14 12-14 12"/>'; for (let i = 0; i <= 9; i++) { const o = 273 + i * 6, t = 5 + i * 6, th = i % 3 === 0; h += `<path class="st" opacity="${th ? 1 : .35}" stroke-width="${th ? 2 : 1}" d="M${o} 5V59M273 ${t}H327"/>`; } for (let i = 0; i < 9; i++) h += `<rect class="dotp f-gold" style="--i:${i}" x="${275 + Math.floor(r() * 9) * 6}" y="${7 + Math.floor(r() * 9) * 6}" width="2.6" height="2.6"/>`; return h; },
  tree: () => { let h = ''; [200, 300, 400].forEach(x => { h += `<path class="st" opacity=".5" d="M300 10L${x} 30"/>`; [-36, 0, 36].forEach(o => { h += `<path class="st" opacity=".5" d="M${x} 30L${x + o} 54"/><circle class="f-acc" cx="${x + o}" cy="54" r="3.5"/>`; }); h += `<circle class="st" style="fill:var(--card)" cx="${x}" cy="30" r="5"/>`; }); return h + '<path class="st s-gold ln" pathLength="1" d="M300 10L300 30L336 54"/><circle class="f-gold" cx="336" cy="54" r="5.5"/><circle class="st s-gold" style="fill:var(--card)" cx="300" cy="9" r="5.5"/>'; },
  maze: r => { let h = '', row = 1, d = '', on = {}; for (let c = 0; c < 31; c++) { if (r() > .55) row = Math.max(0, Math.min(3, row + (r() > .5 ? 1 : -1))); on[c + ',' + row] = 1; d += (c ? 'L' : 'M') + (60 + c * 16 + 6) + ' ' + (8 + row * 16 + 6) + ' '; if (c < 30 && r() > .6) { const nr = Math.max(0, Math.min(3, row + (r() > .5 ? 1 : -1))); if (nr !== row) { on[c + ',' + nr] = 1; d += 'L' + (60 + c * 16 + 6) + ' ' + (8 + nr * 16 + 6) + ' '; row = nr; } } } for (let c = 0; c < 31; c++) for (let k = 0; k < 4; k++) if (!on[c + ',' + k] && r() > .62) h += `<rect class="f-acc" opacity=".28" x="${60 + c * 16}" y="${8 + k * 16}" width="12" height="12" rx="3"/>`; return h + `<path class="st s-gold ln" pathLength="1" stroke-width="3" d="${d}"/>`; },
  graph: r => { const p = Array.from({ length: 15 }, () => [110 + r() * 380, 8 + r() * 48]); let h = ''; p.forEach((a, i) => p.forEach((b, j) => { if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < 92) h += `<path class="st" opacity=".4" stroke-width="1.4" d="M${a[0].toFixed(0)} ${a[1].toFixed(0)}L${b[0].toFixed(0)} ${b[1].toFixed(0)}"/>`; })); p.forEach((a, i) => { h += `<circle class="dotp ${i === 5 ? 'f-gold' : 'f-acc'}" style="--i:${i}" cx="${a[0].toFixed(0)}" cy="${a[1].toFixed(0)}" r="${i === 5 ? 6 : 3.6}"/>`; }); return h; },
  swot: () => { let h = '<path class="st rs" style="--i:0" opacity=".4" d="M130 18H210M130 32H196M130 46H206"/><path class="st rs" style="--i:2" opacity=".4" d="M392 18H470M392 32H456M392 46H466"/>'; [[238, 4, 'S'], [306, 4, 'W'], [238, 34, 'O'], [306, 34, 'T']].forEach(([x, y, l], i) => { h += `<rect class="st${i % 3 ? '' : ' s-gold'}" x="${x}" y="${y}" width="56" height="26" rx="7"/><text x="${x + 28}" y="${y + 18}">${l}</text>`; }); return h; },
  net: () => { let h = ''; [6, 24, 42].forEach((y, i) => { h += `<rect class="st" x="240" y="${y}" width="120" height="16" rx="4"/><path class="st" opacity=".5" d="M250 ${y + 8}h40"/><circle class="led f-gold" style="animation-delay:${i * -.4}s" cx="346" cy="${y + 8}" r="2.6"/><path class="st flow" opacity=".5" d="M240 ${y + 8}L196 32M360 ${y + 8}L404 32"/>`; }); return h + '<circle class="f-acc" cx="190" cy="32" r="6"/><circle class="f-acc" cx="410" cy="32" r="6"/><path class="st flow" opacity=".5" d="M184 32H112M416 32H488"/><circle class="f-gold" cx="104" cy="32" r="4.5"/><circle class="f-gold" cx="496" cy="32" r="4.5"/>'; },
  code: r => { let h = '<path class="st" opacity=".7" d="M150 12q-10 0-10 8v6q0 4-6 6 6 2 6 6v6q0 8 10 8"/><path class="st" opacity=".7" d="M404 12q10 0 10 8v6q0 4 6 6-6 2-6 6v6q0 8-10 8"/>'; for (let i = 0; i < 5; i++) { const x = 172 + (i % 3) * 14, w = 50 + r() * 120, y = 7 + i * 12; h += `<rect class="rs f-gold" style="--i:${i}" x="${x}" y="${y}" width="${(w * .35).toFixed(0)}" height="5" rx="2.5"/><rect class="rs f-acc" style="--i:${i}" opacity=".85" x="${x + w * .35 + 6}" y="${y}" width="${(w * .65).toFixed(0)}" height="5" rx="2.5"/>`; } return h + '<rect class="led f-gold" x="372" y="55" width="7" height="5" rx="1"/>'; }
};

Object.assign(DECO, {
  poll: () => { let h = '<rect class="st" x="196" y="3" width="44" height="58" rx="9"/><path class="st" opacity=".5" d="M208 14h20"/><rect class="f-gold led" x="206" y="46" width="24" height="7" rx="3.5"/><path class="st flow" opacity=".6" d="M244 32H274"/>'; [[16, 150], [40, 96], [64, 56]].forEach(([v, w], i) => { }); [[10, 150], [28, 100], [46, 64]].forEach(([y, w], i) => { h += `<rect class="st" opacity=".35" x="280" y="${y}" width="150" height="12" rx="6"/><rect class="rs ${i === 0 ? 'f-gold' : 'f-acc'}" style="--i:${i}" x="280" y="${y}" width="${w}" height="12" rx="6"/>`; }); [0, 1, 2].forEach(i => { h += `<rect class="dotp f-acc" style="--i:${i}" x="${112 + i * 22}" y="${22 + (i % 2) * 10}" width="14" height="14" rx="3"/>`; }); return h; },
  star: () => { let h = ''; [[170, 6], [170, 40], [380, 6], [380, 40]].forEach(([x, y]) => { h += `<path class="st flow" opacity=".6" d="M${x < 300 ? x + 50 : x} ${y + 9}L${x < 300 ? 270 : 330} 32"/><rect class="st" x="${x}" y="${y}" width="50" height="18" rx="5"/><path class="st" opacity=".4" d="M${x + 8} ${y + 9}h34"/>`; }); return h + '<rect class="fl f-gold" x="270" y="20" width="60" height="24" rx="6"/><path class="st" style="stroke:var(--bg)" opacity=".7" d="M280 32h40"/>'; },
  nutri: () => { let h = ''; 'ABCDE'.split('').forEach((l, i) => { const x = 200 + i * 50; h += `<circle class="${i === 1 ? 'ring ' : ''}st s-gold" cx="${x}" cy="32" r="${i === 1 ? 17 : 14}"/><circle class="${i === 1 ? 'f-gold' : 'st'}" ${i === 1 ? '' : 'opacity=".7"'} cx="${x}" cy="32" r="${i === 1 ? 17 : 14}"/><text x="${x}" y="37" style="${i === 1 ? 'fill:#14232f' : ''}">${l}</text>`; }); return h; },
  heat: r => { let h = ''; for (let c = 0; c < 14; c++) for (let k = 0; k < 4; k++) { const v = r(); h += v > .9 ? `<rect class="dotp f-gold" style="--i:${c + k}" x="${160 + c * 20}" y="${6 + k * 14}" width="16" height="11" rx="3"/>` : `<rect class="f-acc" opacity="${(.1 + v * .6).toFixed(2)}" x="${160 + c * 20}" y="${6 + k * 14}" width="16" height="11" rx="3"/>`; } return h; },
  kiosk: () => '<rect class="st" x="270" y="4" width="60" height="56" rx="9"/><rect class="st" opacity=".6" x="278" y="10" width="44" height="24" rx="4"/><circle class="f-acc" cx="291" cy="22" r="3"/><circle class="f-gold" cx="309" cy="18" r="3"/><circle class="f-acc" cx="313" cy="28" r="3"/><rect class="f-gold" x="292" y="44" width="16" height="6" rx="3"/><path class="st flow" opacity=".7" d="M268 47H214"/><rect class="st s-gold fl" x="168" y="36" width="46" height="20" rx="4"/><path class="st" opacity=".5" d="M176 46h28"/><circle class="st" opacity=".9" cx="430" cy="32" r="8"/><circle class="st" opacity=".6" cx="430" cy="32" r="17"/><circle class="st" opacity=".35" cx="430" cy="32" r="26"/><circle class="f-gold" cx="430" cy="32" r="3.5"/>',
  orders: r => { let h = ''; [8, 26, 44].forEach((y, i) => { h += `<circle class="${i === 1 ? 'led f-gold' : 'f-acc'}" cx="190" cy="${y + 5}" r="4"/><rect class="rs f-acc" style="--i:${i}" opacity=".5" x="206" y="${y + 2}" width="${(90 + r() * 90).toFixed(0)}" height="6" rx="3"/><rect class="st${i === 1 ? ' s-gold' : ''}" x="${390 - 0}" y="${y - 1}" width="40" height="13" rx="6.5"/>`; }); return h + '<path class="st" opacity=".4" d="M170 60H450"/>'; },
  pca: r => { let h = '<path class="st" opacity=".35" d="M170 32H430M300 5V59"/><ellipse class="st s-gold" opacity=".8" cx="300" cy="32" rx="96" ry="16" transform="rotate(-14 300 32)"/>'; for (let i = 0; i < 20; i++) { const t = (r() - .5) * 2, x = 300 + t * 90, y = 32 - t * 22 + (r() - .5) * 16; h += `<circle class="dotp f-acc" style="--i:${i}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="3"/>`; } return h + '<path class="st s-gold flow" d="M212 52L388 12"/>'; },
  team: () => { let h = ''; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283, x = 300 + Math.cos(a) * 32, y = 32 + Math.sin(a) * 22; h += `<path class="st flow" opacity=".5" d="M300 32L${x.toFixed(0)} ${y.toFixed(0)}"/><circle class="dotp f-acc" style="--i:${i}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="6"/>`; } return h + '<circle class="f-gold fl" cx="300" cy="32" r="8"/><path class="st flow" opacity=".4" d="M120 32H236M364 32H480"/><circle class="st" cx="112" cy="32" r="7"/><circle class="st" cx="488" cy="32" r="7"/>'; },
  term: () => '<rect class="st" x="190" y="5" width="220" height="54" rx="8"/><path class="st" opacity=".5" d="M190 18H410"/><circle class="f-gold" cx="202" cy="11.5" r="2"/><circle class="f-acc" cx="210" cy="11.5" r="2"/><path class="st s-gold" d="M204 26l5 4-5 4"/><rect class="rs f-acc" style="--i:0" x="218" y="28" width="110" height="5" rx="2.5"/><rect class="rs f-gold" style="--i:1" opacity=".8" x="204" y="40" width="150" height="5" rx="2.5"/><rect class="led f-gold" x="204" y="49" width="8" height="5" rx="1"/>'
});
const RULES = [[/Salon TV/, 'tv'], [/SportConnect/, 'sport'], [/Zomb/, 'zomb'], [/Streamlit/, 'poll'], [/transcription/i, 'wave'], [/COJOP/, 'sst'], [/JADE/, 'etl'], [/Annemasse|Clash|Exploitation d/, 'bi'], [/Brenntag/, 'cube'], [/IMDb/, 'star'], [/Open Food/, 'nutri'], [/Easy Dis/, 'orders'], [/Création d’une base/, 'db'], [/Profilage/, 'pca'], [/K-Means/, 'cluster'], [/curseur/, 'traj'], [/UML|festival/, 'uml'], [/IKEA/, 'heat'], [/borne/, 'kiosk'], [/IHM|besoins|CréaSite/, 'wire'], [/NLP|lecture/, 'tokens'], [/Sudoku/, 'grid'], [/algorithmiques/, 'tree'], [/Escape/, 'maze'], [/Exploration algorithmique/, 'graph'], [/Capgemini/, 'swot'], [/équipe/, 'team'], [/poste de dév/, 'term'], [/réseau/, 'net'], [/Laravel|Bot|Python|Portfolio/, 'code']];
function deco(p) {
  const k = (RULES.find(x => x[0].test(p.t)) || [0, 'bi'])[1];
  return k === 'wave' ? `<div class="wave" aria-hidden="true">${wave(p.t)}</div>` : SV(DECO[k](rnd(seed(p.t))));
}
const hay = p => norm([p.t, p.s, p.d || '', p.g.join(' '), p.b.join(' '), (p.st || []).map(x => x.join(' ')).join(' '), L[p.c]].join(' '));
J.forEach(p => { p.h = hay(p); p.open = !!p.live; p.star = /COJOP|transcription|JADE/.test(p.t); });
function card(p, i) {
  const id = 'p' + i;
  const steps = (p.st || p.b.map(x => [null, x])).map((s, k) => `<li>${s[0] ? `<b>${esc(s[0])}</b>` : `<b class="n">${String(k + 1).padStart(2, '0')}</b>`}<span>${esc(s[1])}</span></li>`).join('');
  const links = p.l.map(l => `<a class="btn g" href="${esc(href(l[1]))}"${l[1][0] === '#' ? '' : ' target="_blank" rel="noopener"'}>${esc(l[0])}</a>`).join('');
  const has = steps || links;
  const el = document.createElement('article');
  el.className = 'proj spot' + (p.star ? ' star' : '') + (p.live ? ' live' : '') + (p.open ? ' open' : '');
  el.style.setProperty('--d', Math.min(i % PAGE, 8) * 60 + 'ms');
  el.innerHTML = `${deco(p)}
  <div class="nowtxt"><p class="nowlive${p.live ? '' : ' off'}"><i></i>${p.star && !p.live ? '★ À la une · ' : ''}${L[p.c]}${p.live ? ' · en cours · semestre 10, jusqu’en juin' : ''}</p>
  <h3>${esc(p.t)}</h3><p class="lead2">${esc(p.d || p.s)}</p>
  <div class="tags">${p.g.map(g => `<span>${esc(g)}</span>`).join('')}</div>
  ${has ? `<div class="pbody" id="${id}"><div class="pin">${steps ? `<ol class="steps">${steps}</ol>` : ''}${links ? `<div class="acts">${links}</div>` : ''}</div></div>
  <button class="btn g tg2" type="button" aria-expanded="${p.open}" aria-controls="${id}">${p.open ? 'Replier' : 'Voir le détail'}</button>` : ''}</div>`;
  const bt = $('.tg2', el);
  if (bt) bt.addEventListener('click', () => {
    p.open = !p.open; el.classList.toggle('open', p.open);
    bt.setAttribute('aria-expanded', p.open); bt.textContent = p.open ? 'Replier' : 'Voir le détail';
    sync();
  });
  return el;
}
let list = [];
function render() {
  list = J.filter(p => (cat === 'all' || p.c === cat) && (!term || term.split(/\s+/).every(w => p.h.includes(w))));
  pl.innerHTML = '';
  list.slice(0, shown).forEach((p, i) => pl.append(card(p, i)));
  const rest = list.length - shown;
  mb.hidden = rest <= 0; mb.textContent = `Afficher plus (${Math.min(rest, PAGE)} sur ${rest})`;
  em.hidden = list.length > 0;
  const conds = [];
  if (cat !== 'all') conds.push(`type = '${Q[cat]}'`);
  if (term) conds.push(`texte LIKE '%${term.replace(/'/g, '')}%'`);
  $('#qline').textContent = 'SELECT * FROM projets' + (conds.length ? ' WHERE ' + conds.join(' AND ') : '') + ';';
  $('#qcount').textContent = list.length + ' résultat' + (list.length > 1 ? 's' : '');
  sync();
  $$('.tab', ft).forEach(t => { t.querySelector('em').textContent = count(t.dataset.k); });
}
function count(k) { return J.filter(p => (k === 'all' || p.c === k) && (!term || term.split(/\s+/).every(w => p.h.includes(w)))).length; }
function sync() {
  const vis = list.slice(0, shown).filter(p => p.l.length || p.b.length || p.st);
  ta.hidden = vis.length < 2;
  ta.textContent = vis.every(p => p.open) ? 'Tout replier' : 'Tout déplier';
}
Object.keys(L).forEach((k, i) => {
  const b = document.createElement('button');
  b.className = 'tab' + (i ? '' : ' on'); b.type = 'button'; b.dataset.k = k;
  b.innerHTML = `${L[k]} <em></em>`; b.setAttribute('aria-pressed', !i);
  b.addEventListener('click', () => {
    cat = k; shown = PAGE;
    $$('.tab', ft).forEach(t => { t.classList.toggle('on', t === b); t.setAttribute('aria-pressed', t === b); });
    render();
  });
  ft.append(b);
});
let tm;
qi.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { term = norm(qi.value.trim()); shown = PAGE; render(); }, 120); });
mb.addEventListener('click', () => { shown += PAGE; render(); });
ta.addEventListener('click', () => {
  const vis = list.slice(0, shown).filter(p => p.l.length || p.b.length || p.st);
  const all = vis.every(p => p.open); vis.forEach(p => p.open = !all); render();
});
$('#reset').addEventListener('click', () => { qi.value = ''; term = ''; cat = 'all'; shown = PAGE; $$('.tab', ft).forEach((t, i) => { t.classList.toggle('on', !i); t.setAttribute('aria-pressed', !i); }); render(); });
render();

/* ---------- formation : programmes officiels ---------- */
const F = {
  but: {
    tab: 'BUT Informatique · parcours C', t: 'B.U.T. Informatique · parcours C', org: 'IUT d’Annecy · Université Savoie Mont Blanc', when: 'Sept. 2022 – juil. 2025', badge: 'Diplômé · Mention Bien',
    spec: 'Administration, gestion et exploitation des données',
    note: 'Les semestres 1 et 2 sont un tronc commun à tous les parcours ; la spécialisation en données commence au semestre 3.',
    skills: [['Gérer les données de l’information', 3], ['Conduire un projet', 3], ['Travailler dans une équipe informatique', 3], ['Développer une application', 2], ['Optimiser des applications', 2], ['Administrer des systèmes communicants', 2]],
    jobs: ['Administrateur de bases de données', 'Data miner', 'Développeur Big Data'],
    sems: [
      { k: 'S1', t: 'BUT 1 · semestre 1 (tronc commun)', c: ['Initiation au développement', 'Développement d’interfaces web', 'Introduction à l’architecture des ordinateurs', 'Introduction aux systèmes d’exploitation et à leur fonctionnement', 'Introduction aux bases de données et SQL', 'Mathématiques discrètes', 'Outils mathématiques fondamentaux', 'Gestion de projet et des organisations', 'Économie durable et numérique', 'Anglais technique', 'Bases de la communication', 'Projet professionnel et personnel'], s: ['SAÉ 1.01 · Implémentation d’un besoin client', 'SAÉ 1.02 · Comparaison d’approches algorithmiques', 'SAÉ 1.03 · Installation d’un poste pour le développement', 'SAÉ 1.04 · Création d’une base de données', 'SAÉ 1.05 · Recueil de besoins', 'SAÉ 1.06 · Découverte de l’environnement économique et écologique', 'SAÉ 1.07 · Portfolio'], p: ['Comparaison d’approches', 'poste de dév', 'Création d’une base', 'besoins', 'Capgemini'] },
      { k: 'S2', t: 'BUT 1 · semestre 2 (tronc commun)', c: ['Développement orienté objets', 'Développement d’applications avec IHM', 'Qualité de développement', 'Communication et fonctionnement bas niveau', 'Introduction aux services réseaux', 'Exploitation d’une base de données', 'Graphes', 'Outils numériques pour les statistiques descriptives', 'Méthodes numériques', 'Gestion de projet et des organisations', 'Droit des contrats et du numérique', 'Anglais d’entreprise', 'Communication avec le milieu professionnel', 'PPP : métiers de l’informatique'], s: ['SAÉ 2.01 · Développement d’une application', 'SAÉ 2.02 · Exploration algorithmique d’un problème', 'SAÉ 2.03 · Installation de service réseau', 'SAÉ 2.04 · Exploitation d’une base de données', 'SAÉ 2.05 · Gestion d’un projet', 'SAÉ 2.06 · Organisation d’un travail d’équipe', 'SAÉ 2.07 · Portfolio'], p: ['Exploration algorithmique', 'services réseau', 'Exploitation d’une base', 'équipe'] },
      { k: 'S3', t: 'BUT 2 · semestre 3', c: ['Développement web', 'Développement efficace', 'Analyse', 'Qualité de développement', 'Programmation système', 'Architecture des réseaux', 'SQL dans un langage de programmation', 'Probabilités', 'Cryptographie et sécurité', 'Management des systèmes d’information', 'Droit des contrats et du numérique', 'Anglais', 'Communication professionnelle', 'Projet personnel et professionnel'], s: ['SAÉ 3.01 · Développement d’une application', 'SAÉ 3.02 · Portfolio'], p: ['Laravel'] },
      { k: 'S4', t: 'BUT 2 · semestre 4', c: ['Architecture logicielle', 'Qualité de développement', 'Méthodes d’optimisation', 'Anglais', 'Communication interne', 'Projet personnel et professionnel', 'Cryptographie et sécurité', 'Réseau avancé', 'Analyse et visualisation avancée des données', 'Management avancé des systèmes d’information'], s: ['SAÉ 4.01 · Développement avec une base de données et visualisation', 'SAÉ 4.02 · Stage', 'SAÉ 4.03 · Portfolio'], p: ['Brenntag', 'Open Food'] },
      { k: 'S5', t: 'BUT 3 · semestre 5', c: ['Initiation au management d’une équipe de projet informatique', 'Projet personnel et professionnel', 'Politique de communication', 'Programmation au format Web des informations décisionnelles', 'Nouveaux paradigmes de base de données', 'Exploitation de la base de données', 'Données massives', 'Techniques d’intelligence artificielle', 'Statistique inférentielle', 'Économie durable et numérique', 'Optimisation des données et des systèmes décisionnels', 'Anglais'], s: ['SAÉ 5.C.01 · Proposer une solution optimisée à partir de données internes et externes', 'SAÉ 5.C.02 · Portfolio'], p: ['IMDb', 'Annemasse'] },
      { k: 'S6', t: 'BUT 3 · semestre 6', c: ['Initiation à l’entrepreneuriat', 'Droit du numérique et de la propriété intellectuelle', 'Communication : organisation et diffusion de l’information', 'Projet personnel et professionnel', 'Administration des bases de données', 'Méthodes d’optimisation pour l’aide à la décision'], s: ['SAÉ 6.C.01 · Organisation et protection de données', 'SAÉ 6.C.02 · Stage', 'SAÉ 6.C.03 · Portfolio'], p: ['Annemasse'] }
    ],
    src: ['Programme IUT d’Annecy', 'https://formations-iuta.univ-smb.fr/plugins/odf-web/iuta/_content/subprogram-administration-gestion-et-exploitation-des-donnees/Administration,%20gestion%20et%20exploitation%20des%20donn%C3%A9es%20.pdf']
  },
  uga: {
    tab: 'Master MIASHS · Info. et Cognition', t: 'Master MIASHS · Informatique et Cognition', org: 'Université Grenoble Alpes', when: 'Sept. 2025 – 2027', badge: 'En cours · M2 en alternance',
    spec: 'Intelligence artificielle, sciences cognitives et développement logiciel',
    skills: [['Modéliser un problème et proposer une solution algorithmique', 3], ['Développer, tester et faire évoluer un logiciel complexe', 3], ['Gérer des bases de données structurées et multimodales', 3], ['Concevoir des interfaces homme-machine', 2], ['Choisir l’approche de résolution la plus adaptée (IA)', 3]],
    jobs: ['Développeur ou chef de projet junior web', 'Consultant en ergonomie cognitive', 'Recherche en sciences cognitives'],
    sems: [
      { k: 'S7', t: 'Master 1 · semestre 7', c: ['Analyse de données', 'Recherche opérationnelle et graphes', 'Introduction à la programmation web', 'Programmation objet avancée', 'Représentation des données et des connaissances 1', 'Psychologie cognitive et conception de systèmes', 'Outils et méthodes en sciences cognitives 1 : mesures comportementales', 'Intelligence artificielle', 'Traitement automatique des langues', 'Méthodes de génie logiciel'], s: ['Projet tuteuré'], p: [] },
      { k: 'S8', t: 'Master 1 · semestre 8', c: ['Programmation web côté serveur 1', 'Programmation web client 1', 'Recherche d’information', 'Apprentissage statistique 1', 'Gestion de projet', 'Interaction humain-machine 1', 'Anglais', 'Outils et méthodes en sciences cognitives 2 : études comportementales'], s: ['Projet tuteuré'], p: [] },
      { k: 'S9', t: 'Master 2 · semestre 9 (alternance)', c: ['Outils et méthodes en sciences cognitives 1 : mesures comportementales', 'Intelligence artificielle', 'Représentation des données et des connaissances 2', 'Programmation web client 2', 'Programmation web serveur 2', 'Programmation objet avancée'], s: ['Stage en entreprise · COJOP Alpes 2030'], p: ['COJOP', 'Zomb'] },
      { k: 'S10', t: 'Master 2 · semestre 10 (alternance)', c: ['Interaction humain-machine 1', 'Gestion de projet', 'Informatique décisionnelle', 'Outils et méthodes en sciences cognitives 2 : études comportementales', 'Recherche d’informations sur le Web'], s: ['Travail encadré de recherche', 'Stage en entreprise · COJOP Alpes 2030'], p: ['transcription', 'SportConnect', 'Exposé IHM'] }
    ],
    src: ['Programme UGA', 'https://formations.univ-grenoble-alpes.fr/plugins/odf-web/odf/_content/subprogram-web-informatique-et-connaissances-wic_3/Parcours%20Informatique%20et%20cognition%20.pdf']
  }
};
const dt = $('#dtabs'), dg = $('#deg');
let dk = 'but', sk = null, dterm = '';
const nCours = d => d.sems.reduce((a, s) => a + s.c.length + s.s.length, 0);
function drawDeg() {
  const d = F[dk]; if (!sk || !d.sems.some(s => s.k === sk)) sk = d.sems[d.sems.length - 1].k;
  const q = norm(dterm.trim());
  const match = x => !q || norm(x).includes(q);
  const sems = q ? d.sems : d.sems.filter(s => s.k === sk);
  const max = d.skills.filter(s => s[1] === 3).length;
  const block = s => {
    const c = s.c.filter(match), z = s.s.filter(match);
    if (q && !c.length && !z.length) return '';
    const projs = q ? [] : s.p.map(m => J.find(p => new RegExp(m, 'i').test(p.t))).filter(Boolean);
    return `<div class="sem"><h4>${esc(s.t)} <small>${c.length + z.length} enseignement${c.length + z.length > 1 ? 's' : ''}</small></h4>
    <ul class="crs">${z.map(x => `<li class="sae">${esc(x)}</li>`).join('')}${c.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    ${projs.length ? `<p class="lk">Projets liés : ${projs.map(p => `<button class="btn g" type="button" data-q="${esc(p.t.split(' · ')[0])}">${esc(p.t.split(' · ')[0])} ↓</button>`).join('')}</p>` : ''}</div>`;
  };
  const body = sems.map(block).join('') || '<p class="empty">Aucun enseignement ne correspond à cette recherche.</p>';
  dg.innerHTML = `<div class="dhead"><div><small>${esc(d.when)} · ${esc(d.badge)}</small><h3>${esc(d.t)}</h3><p class="org">${esc(d.org)}</p><p class="spec2">${esc(d.spec)}</p></div>
    <dl class="dstat"><div><dt>${d.sems.length}</dt><dd>semestres</dd></div><div><dt>${nCours(d)}</dt><dd>enseignements</dd></div><div><dt>${max}/${d.skills.length}</dt><dd>compétences au niveau 3</dd></div></dl></div>
    <div class="dskills">${d.skills.map(s => `<div class="sk"><span>${esc(s[0])}</span><i aria-label="niveau ${s[1]} sur 3">${[1, 2, 3].map(n => `<b class="${n <= s[1] ? 'on' : ''}"></b>`).join('')}</i></div>`).join('')}</div>
    <div class="tags">${d.jobs.map(j => `<span>${esc(j)}</span>`).join('')}</div>
    <div class="dnav"><div class="tabs" role="group" aria-label="Choisir un semestre">${d.sems.map(s => `<button class="tab${!q && s.k === sk ? ' on' : ''}" type="button" data-s="${s.k}" aria-pressed="${!q && s.k === sk}">${s.k}</button>`).join('')}</div>
    <label class="search"><span class="sr">Filtrer les enseignements</span><input id="dq" type="search" placeholder="Filtrer : SQL, IA, web…" value="${esc(dterm)}" autocomplete="off"></label></div>
    <div class="sems">${body}</div>
    ${d.note ? `<p class="note2">${esc(d.note)}</p>` : ''}<p class="srcl"><a href="${esc(d.src[1])}" target="_blank" rel="noopener">Source : ${esc(d.src[0])} ↗</a></p>`;
  const inp = $('#dq', dg);
  inp.addEventListener('input', () => { dterm = inp.value; const pos = inp.selectionStart; drawDeg(); const n = $('#dq', dg); n.focus(); n.setSelectionRange(pos, pos); });
  $$('[data-s]', dg).forEach(b => b.addEventListener('click', () => { sk = b.dataset.s; dterm = ''; drawDeg(); }));
  $$('[data-q]', dg).forEach(b => b.addEventListener('click', () => {
    qi.value = b.dataset.q; term = norm(qi.value); cat = 'all'; shown = PAGE;
    $$('.tab', ft).forEach((t, i) => { t.classList.toggle('on', !i); t.setAttribute('aria-pressed', !i); });
    render(); $('#projets').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));
}
Object.keys(F).forEach((k, i) => {
  const b = document.createElement('button');
  b.className = 'tab' + (i ? '' : ' on'); b.type = 'button'; b.textContent = F[k].tab; b.setAttribute('aria-pressed', !i);
  b.addEventListener('click', () => { dk = k; sk = null; dterm = ''; $$('.tab', dt).forEach(t => { t.classList.toggle('on', t === b); t.setAttribute('aria-pressed', t === b); }); drawDeg(); });
  dt.append(b);
});
drawDeg();

/* ---------- chiffres clés ---------- */
(() => {
  const nums = $('#nums');
  const items = [[J.length, 'projets au catalogue'], [Object.values(F).reduce((a, d) => a + nCours(d), 0), 'enseignements détaillés'], [J.filter(p => p.c === 'pro').length, 'expériences en entreprise'], [Object.keys(F).length, 'diplômes en data']];
  nums.innerHTML = items.map(i => `<div role="listitem"><b data-c="${i[0]}">${reduce ? i[0] : 0}</b><span>${i[1]}</span></div>`).join('');
  if (reduce) return;
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return; o.disconnect();
    const t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / 1200); $$('[data-c]', nums).forEach(b => { b.textContent = Math.round(+b.dataset.c * (1 - Math.pow(1 - k, 3))); }); if (k < 1) requestAnimationFrame(f); })(t0);
  })).observe(nums);
})();

/* ---------- recherche globale ---------- */
const pal = $('#pal'), pq = $('#pq'), pres = $('#pres');
const SEC = [['Accueil', '#accueil'], ['COJOP · alternance', '#cojop'], ['Parcours · pipeline', '#parcours'], ['Stack · outils', '#stack'], ['Projets', '#projets'], ['Formation', '#formation'], ['Mon CV', '#cv'], ['Contact', '#contact']];
const SUGG = ['Power BI', 'Python', 'SQL', 'IA', 'ETL', 'UX', 'Statistiques', 'Web'];
let pitems = [], pidx = 0;
const jump = sel => { const el = $(sel); el && el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
function gotoProj(p) {
  qi.value = ''; term = ''; cat = 'all'; shown = Math.max(PAGE, J.indexOf(p) + 1); p.open = true;
  $$('.tab', ft).forEach((t, i) => { t.classList.toggle('on', !i); t.setAttribute('aria-pressed', !i); });
  render();
  const el = $$('.proj', pl).find(e => $('h3', e).textContent === p.t);
  (el || $('#projets')).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
function gotoDeg(k, s) {
  dk = k; sk = s; dterm = '';
  $$('.tab', dt).forEach((t, i) => { const on = Object.keys(F)[i] === k; t.classList.toggle('on', on); t.setAttribute('aria-pressed', on); });
  drawDeg(); jump('#formation');
}
function search(raw) {
  const q = norm(raw.trim()); if (!q) return [];
  const ws = q.split(/\s+/), ok = x => ws.every(w => norm(x).includes(w));
  const g = [];
  const sec = SEC.filter(s => ok(s[0])).slice(0, 3);
  if (sec.length) g.push(['Sections', sec.map(s => ({ l: s[0], s: 'Aller à la section', f: () => jump(s[1]) }))]);
  const tools = []; Object.entries(S).forEach(([cat2, arr]) => arr.forEach(t => { if (ok(t)) tools.push({ l: t, s: 'Outil · ' + cat2, f: () => jump('#stack') }); }));
  if (tools.length) g.push(['Outils', tools.slice(0, 4)]);
  const pr = J.filter(p => p.h && ws.every(w => p.h.includes(w)));
  if (pr.length) g.push([`Projets (${pr.length})`, pr.slice(0, 6).map(p => ({ l: p.t, s: L[p.c] + (p.live ? ' · en cours' : ''), f: () => gotoProj(p) }))]);
  const cs = [];
  Object.entries(F).forEach(([k, d]) => d.sems.forEach(s => [...s.s, ...s.c].forEach(x => { if (ok(x)) cs.push({ l: x, s: d.tab.split(' · ')[0] + ' · ' + s.k, f: () => gotoDeg(k, s.k) }); })));
  if (cs.length) g.push([`Enseignements (${cs.length})`, cs.slice(0, 8)]);
  return g;
}
function drawPal() {
  const raw = pq.value;
  pitems = [];
  if (!raw.trim()) {
    pres.innerHTML = `<p class="pg">Suggestions</p><div class="sugg">${SUGG.map(s => `<button class="tab" type="button" data-sg="${esc(s)}">${esc(s)}</button>`).join('')}</div><p class="pg">Aller à</p>` + SEC.map(s => { pitems.push({ f: () => jump(s[1]) }); return `<div class="pi" role="option" data-i="${pitems.length - 1}"><span>${esc(s[0])}</span><small>Section</small></div>`; }).join('');
  } else {
    const g = search(raw);
    pres.innerHTML = g.length ? g.map(([h, arr]) => `<p class="pg">${esc(h)}</p>` + arr.map(it => { pitems.push(it); return `<div class="pi" role="option" data-i="${pitems.length - 1}"><span>${esc(it.l)}</span><small>${esc(it.s)}</small></div>`; }).join('')).join('') : '<p class="empty">Aucun résultat. Essaie « SQL », « Power BI » ou « IA ».</p>';
  }
  pidx = 0; mark();
}
function mark() { $$('.pi', pres).forEach((e, i) => { e.classList.toggle('on', i === pidx); e.setAttribute('aria-selected', i === pidx); if (i === pidx) e.scrollIntoView({ block: 'nearest' }); }); }
function runPal(i) { const it = pitems[i]; if (!it) return; pal.close(); setTimeout(it.f, 40); }
function openPal(v) { pq.value = v || ''; drawPal(); pal.showModal ? pal.showModal() : pal.setAttribute('open', ''); pq.focus(); pq.select(); }
pq.addEventListener('input', drawPal);
pq.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); pidx = Math.min(pitems.length - 1, pidx + 1); mark(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); pidx = Math.max(0, pidx - 1); mark(); }
  else if (e.key === 'Enter') { e.preventDefault(); runPal(pidx); }
});
pres.addEventListener('click', e => {
  const sg = e.target.closest('[data-sg]'); if (sg) { pq.value = sg.dataset.sg; drawPal(); pq.focus(); return; }
  const it = e.target.closest('.pi'); if (it) runPal(+it.dataset.i);
});
pres.addEventListener('pointermove', e => { const it = e.target.closest('.pi'); if (it && +it.dataset.i !== pidx) { pidx = +it.dataset.i; mark(); } });
$('#sbtn').addEventListener('click', () => openPal(''));
$('#pclose').addEventListener('click', () => pal.close());
pal.addEventListener('click', e => { if (e.target === pal) pal.close(); });
addEventListener('keydown', e => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '');
  if ((e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); if (!pal.open) openPal(''); }
});

/* ---------- CV ---------- */
const cvd = $('#cvdlg');
const openCv = () => cvd.showModal ? cvd.showModal() : cvd.setAttribute('open', '');
$('#cvopen').addEventListener('click', openCv);
$('#cvopen2').addEventListener('click', openCv);
$('.x', cvd).addEventListener('click', () => cvd.close());
cvd.addEventListener('click', e => { if (e.target === cvd) cvd.close(); });

/* ---------- copier l’adresse ---------- */
$('#copy').addEventListener('click', async () => {
  const out = $('#mail'), mail = 'milhane13130@gmail.com';
  try { await navigator.clipboard.writeText(mail); out.textContent = 'Adresse copiée : ' + mail; }
  catch (e) { out.textContent = mail; }
  setTimeout(() => { out.textContent = ''; }, 3500);
});
})();

/* ---------- v4 : éclat qui suit le curseur, tilt des cartes, cascade ---------- */
(() => {
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('.miss, .flow, .two, .chips, .cvbox').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--k', i)));
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const g = document.createElement('div');
  g.className = 'glow'; g.setAttribute('aria-hidden', 'true');
  document.body.append(g);
  let tx = innerWidth / 2, ty = innerHeight / 3, cx = tx, cy = ty;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function f() {
    cx += (tx - cx) * .12; cy += (ty - cy) * .12;
    g.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    requestAnimationFrame(f);
  })();
})();
