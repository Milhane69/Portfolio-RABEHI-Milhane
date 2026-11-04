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
    const on = a.getAttribute('href') === '#' + e.target.id;
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
  const toks = [['k', 'SELECT'], ['', ' impact, gouvernance, automatisation\n'], ['k', 'FROM'], ['', '   milhane_rabehi\n'], ['k', 'WHERE'], ['', '  role = '], ['s', '’Data Analytics Engineer’'], ['', '\n'], ['k', 'AND'], ['', '    org  = '], ['s', '’COJOP Alpes 2030’'], ['', ';']];
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

/* ---------- forme d’onde du projet en cours ---------- */
(() => {
  const wv = $('#wave');
  if (!wv) return;
  const n = matchMedia('(max-width: 480px)').matches ? 34 : 64;
  wv.innerHTML = Array.from({ length: n }, (_, i) => {
    const h = .22 + .78 * Math.abs(Math.sin(i * .5) * Math.cos(i * .19 + 1));
    return `<span style="--h:${h.toFixed(2)};--i:${i}"></span>`;
  }).join('');
})();

/* ---------- parcours : pipeline ---------- */
const P = [
  { i: 'E', n: 'Brenntag France', s: 'EXTRACT', w: 'Avril à août 2024', t: 'Data Engineer / SAP BI (stage)', d: 'Restructuration complète d’un cube MM (Materials Management) pour fiabiliser les flux de données et le reporting des achats.', u: ['Modélisation multidimensionnelle sous SAP BW pour réduire les temps de traitement', 'Reporting granulaire sur la performance des fournisseurs et les volumes d’achat', 'Fiabilisation des KPI d’approvisionnement pour la décision'], g: ['SAP BW', 'SAP FICO', 'Modélisation'] },
  { i: 'T', n: 'Annemasse Agglo', s: 'TRANSFORM', w: 'Septembre 2024 à 2025', t: 'Data Analyst / BI Engineer (alternance)', d: 'Système de reporting Power BI conçu de A à Z pour le suivi des abonnés au réseau d’eau potable, de l’ingénierie des données à la formation des utilisateurs.', u: ['Modèle décisionnel de plus de 750 tables et pipelines Oracle SQL en prévision de la télérelève (IoT)', 'Machine learning pour détecter doublons et incohérences', 'KPI d’abonnement, de facturation et de recouvrement', 'Site interne de gestion et chatbot d’orientation vers les rapports'], g: ['Power BI', 'Oracle SQL', 'Machine learning', 'RGPD'] },
  { i: 'M', n: 'Projet JADE', s: 'MODEL', w: '2025 à 2026 · UGA, CRJ et LJK', t: 'Justice Algorithmique des Élections', d: 'Pipeline ETL professionnel et solution de legal analytics pour le contentieux électoral, entre le CRJ (droit) et le LJK (informatique).', u: ['ETL en Python orienté objet, logs automatisés, PostgreSQL normalisé', 'Tests unitaires pytest et traitement strict des rejets', 'Modèle prédictif sans data leakage (GroupShuffleSplit)', 'Dashboard Streamlit pour explorer le corpus juridique'], g: ['Python', 'PostgreSQL', 'pytest', 'Streamlit'] },
  { i: 'L', n: 'COJOP Alpes 2030', s: 'LOAD', w: 'Depuis septembre 2026 · Lyon', t: 'Assistant Data Product Manager & Analytics Engineer', d: 'Architecture « Single Source of Truth » pour la planification des 4 pôles olympiques, automatisation cloud et dashboards de pilotage.', u: ['Gouvernance automatisée en TypeScript (Office Scripts)', 'Workflows JSON et API REST sous Power Automate : Excel, SharePoint, Teams, Smartsheet', 'Normalisation en Power Query M, dashboards Power BI de pilotage', 'Recueil de besoins auprès des directions métiers'], g: ['Power BI', 'Power Automate', 'Power Query', 'TypeScript'], go: '#cojop' }
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
Object.keys(S).forEach((k, i) => {
  const b = document.createElement('button');
  b.className = 'tab'; b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = k;
  b.addEventListener('click', () => {
    $$('.tab', tabs).forEach(t => { t.classList.toggle('on', t === b); t.setAttribute('aria-selected', t === b); });
    bub.innerHTML = S[k].map((s, j) => `<span class="bub" style="animation-delay:${j * 45}ms">${esc(s)}</span>`).join('');
  });
  tabs.append(b);
  if (!i) b.click();
});

/* ---------- projets ---------- */
const L = { all: 'Tout', pro: 'Expériences pro', rech: 'Recherche', acad: 'Académique', perso: 'Personnel' };
const Q = { all: '', pro: 'pro', rech: 'recherche', acad: 'académique', perso: 'personnel' };
const J = [
  { c: 'pro', t: 'COJOP Alpes 2030 · alternance', s: 'Single Source of Truth, automatisation cloud et dashboards de pilotage.', g: ['Power Automate', 'Power Query', 'Power BI', 'TypeScript'], b: ['Architecture « Single Source of Truth » centralisant les données de planification des 4 pôles olympiques', 'Gouvernance automatisée en TypeScript (Office Scripts) pour la qualité en temps réel', 'Workflows JSON et API REST (Power Automate) entre Excel, SharePoint, Teams et Smartsheet', 'Dashboards Power BI interactifs pour le pilotage, dont le Comité International Olympique', 'Recueil de besoins et facilitation digitale auprès des équipes transverses'], l: [['Voir la mission en détail', '#cojop']] },
  { c: 'rech', live: true, t: 'Benchmark de transcription automatique · conférences musicales', s: 'Recherche en cours : évaluer et comparer des modèles de reconnaissance de la parole sur les conférences de la Philharmonie de Paris.', g: ['Python', 'ASR', 'NER', 'WER · CER'], b: ['Contexte : la Philharmonie de Paris conserve des centaines d’heures de conférences sur la musique, transcrites automatiquement avec WhisperX', 'Problème : les erreurs de transcription touchent surtout les noms propres et le vocabulaire spécialisé, puis se propagent à la reconnaissance d’entités nommées et à la recherche d’extraits', 'Axe 1 : comparer des modèles de transcription open source ou open weights (dont Qwen3-ASR et Voxtral) à la baseline WhisperX, en WER et CER, y compris sur les entités nommées', 'Axe 2 : reconnaître les entités nommées pendant la transcription ou en post-correction', 'Axe 3 : enrichir le jeu d’évaluation grâce à la post-correction automatique', 'Technologies du sujet : Python, PyTorch, transformers, vLLM, Ollama, serveur de calcul GPU avec gestionnaire de jobs', 'Cadre : projet Music Graph RAG (Inria, Philharmonie de Paris), mené en parallèle de mes cours et de mon alternance, du semestre 10 jusqu’en juin. Le sujet comporte plusieurs axes, dont je traite une partie.'], l: [] },
  { c: 'rech', t: 'Projet JADE · Justice Algorithmique des Élections', s: 'ETL Python, ML sans data leakage et dashboard Streamlit pour le contentieux électoral.', g: ['Python', 'PostgreSQL', 'pytest', 'Streamlit'], b: ['Architecture ETL robuste en Python orienté objet, logs automatisés, PostgreSQL normalisé', 'Tests unitaires pytest et système strict de traitement des rejets', 'Modélisation prédictive avec résolution du data leakage (GroupShuffleSplit)', 'Dashboard Streamlit pour l’exploration du corpus juridique. Collaboration CRJ (droit) et LJK (informatique)'], l: [['Support de soutenance (PDF)', 'Support_soutenance_JADE.pdf']] },
  { c: 'pro', t: 'Annemasse Agglo · Data Analyst / BI Engineer', s: 'Reporting Power BI de A à Z pour le réseau d’eau potable, avec détection d’anomalies par ML.', g: ['Power BI', 'Oracle SQL', 'ML', 'RGPD'], b: ['Dashboards Power BI interactifs et distributions multicanales automatisées', 'Pipelines d’extraction Oracle SQL pour préparer la télérelève (IoT)', 'Machine learning pour détecter doublons et incohérences', 'KPI d’abonnement, de facturation et de recouvrement', 'Site interne de gestion, chatbot d’orientation et procédures de gouvernance RGPD'], l: [] },
  { c: 'pro', t: 'Brenntag France · Data Engineer / SAP BI', s: 'Refonte d’un cube SAP BW pour le reporting des achats.', g: ['SAP BW', 'Modélisation', 'BI'], b: ['Modélisation multidimensionnelle sous SAP BW pour réduire les temps de traitement', 'Cadre de reporting granulaire sur la performance fournisseurs et les volumes d’achat', 'Fiabilisation des KPI d’approvisionnement'], l: [] },
  { c: 'pro', t: 'Easy Dis · Gestion des commandes e-commerce', s: 'Système de gestion des commandes en PHP et MySQL.', g: ['PHP', 'MySQL'], b: [], l: [] },

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
  { c: 'perso', t: 'Portfolio personnel', s: 'Le site que vous êtes en train de parcourir, en HTML, CSS et JavaScript.', g: ['HTML', 'CSS', 'JavaScript'], b: ['Animations, thème clair et sombre, navigation pensée pour le mobile'], l: [] }
];
const ft = $('#ftabs'), gr = $('#grid'), dl = $('#dlg');
const href = h => /^(https?:|#)/.test(h) ? h : encodeURI(h);
function render(f) {
  const list = J.filter(p => f === 'all' || p.c === f);
  gr.innerHTML = '';
  list.forEach((p, i) => {
    const n = p.l.filter(l => l[1][0] !== '#').length;
    const card = document.createElement('button');
    card.className = 'card spot'; card.type = 'button';
    card.style.animationDelay = Math.min(i, 12) * 40 + 'ms';
    card.innerHTML = `<small>${p.live ? '<i class="dotl"></i>' : ''}${L[p.c]}${p.live ? ' · en cours' : ''}</small><h4>${esc(p.t)}</h4><p>${esc(p.s)}</p><div class="tags">${p.g.slice(0, 3).map(t => '<span class="tag">' + esc(t) + '</span>').join('')}</div><span class="more">Voir le détail${n ? ' · ' + n + ' livrable' + (n > 1 ? 's' : '') : ''}</span>`;
    card.addEventListener('click', () => open(p));
    gr.append(card);
  });
  $('#qline').textContent = f === 'all' ? 'SELECT * FROM projets;' : `SELECT * FROM projets WHERE type = ’${Q[f]}’;`;
  $('#qcount').textContent = list.length + ' résultat' + (list.length > 1 ? 's' : '');
}
function open(p) {
  dl.innerHTML = `<button class="x" type="button" aria-label="Fermer">✕</button><span class="tag">${L[p.c]}${p.live ? ' · en cours' : ''}</span><h3 id="dlgt">${esc(p.t)}</h3><p class="mut">${esc(p.s)}</p>${p.b.length ? '<ul>' + p.b.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : ''}<div class="tags">${p.g.map(t => '<span class="tag">' + esc(t) + '</span>').join('')}</div>${p.l.length ? '<div class="links2">' + p.l.map(l => l[1][0] === '#' ? `<a class="btn p" data-close href="${l[1]}">${esc(l[0])}</a>` : `<a class="btn g" href="${esc(href(l[1]))}" target="_blank" rel="noopener">${esc(l[0])} ↗</a>`).join('') + '</div>' : ''}`;
  $('.x', dl).addEventListener('click', () => dl.close());
  $$('[data-close]', dl).forEach(a => a.addEventListener('click', () => dl.close()));
  dl.showModal ? dl.showModal() : dl.setAttribute('open', '');
  dl.scrollTop = 0;
}
Object.keys(L).forEach((k, i) => {
  const b = document.createElement('button');
  b.className = 'tab' + (i ? '' : ' on'); b.type = 'button'; b.textContent = L[k]; b.setAttribute('aria-pressed', !i);
  b.addEventListener('click', () => {
    $$('.tab', ft).forEach(t => { t.classList.toggle('on', t === b); t.setAttribute('aria-pressed', t === b); });
    render(k);
  });
  ft.append(b);
});
render('all');
dl.addEventListener('click', e => { if (e.target === dl) dl.close(); });
$('#nowopen').addEventListener('click', () => open(J.find(p => p.live)));

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
