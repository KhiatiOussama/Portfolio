/* ============================================
   ÉTUDES DE CAS — Logique
   ============================================ */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);
const $create = (tag, className = '', html = '') => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html) el.innerHTML = html;
  return el;
};
function escapeHtml(str) {
  if (typeof str !== 'string') return str ?? '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Année
$('year').textContent = new Date().getFullYear();

// CTA WhatsApp
const ctaWa = $('cta-whatsapp');
if (ctaWa) ctaWa.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Bonjour Oussama, je souhaite discuter d\'un projet.')}`;

// Thème
(function initTheme() {
  const html = document.documentElement;
  const toggle = $('theme-toggle');
  const icon = $('theme-icon');
  const saved = localStorage.getItem('theme');
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'light' || (!saved && !sysDark)) {
    html.classList.remove('dark');
    if (icon) icon.textContent = '☀️';
  }
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isDark = html.classList.toggle('dark');
      if (icon) icon.textContent = isDark ? '🌙' : '☀️';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
})();

// i18n simple (pour les titres)
(function initI18n() {
  const lang = localStorage.getItem('langue') || 'fr';
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  $$('[data-i18n]').forEach(el => {
    const t = TRANSLATIONS[lang]?.[el.dataset.i18n];
    if (t) el.textContent = t;
  });
})();

// Sommaire
const toc = $('toc');
if (toc && CONFIG.projets) {
  CONFIG.projets.forEach((p, i) => {
    if (!p.etudeDeCas) return;
    const a = $create('a',
      'px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-accent hover:text-white text-sm font-medium transition-all',
      `${p.icone} ${escapeHtml(p.titre)}`
    );
    a.href = `#projet-${i}`;
    toc.appendChild(a);
  });
}

// Rendu des études de cas
const container = $('case-studies-container');
if (container && CONFIG.projets) {
  CONFIG.projets.forEach((p, i) => {
    if (!p.etudeDeCas) return;
    const cs = p.etudeDeCas;

    const tags = p.technos.map(t =>
      `<span class="px-2.5 py-1 rounded-md text-xs font-medium bg-accent/10 text-accent-light">${escapeHtml(t)}</span>`
    ).join('');

    const solutions = cs.solution.map((s, idx) => `
      <div class="relative pl-12 pb-8 border-l-2 border-accent/30 last:border-transparent last:pb-0">
        <div class="absolute left-0 top-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm -translate-x-[17px]">
          ${idx + 1}
        </div>
        <h4 class="font-display font-semibold text-lg mb-2 text-slate-900 dark:text-white">${escapeHtml(s.titre)}</h4>
        <p class="text-slate-600 dark:text-slate-400 mb-3">${escapeHtml(s.description)}</p>
        <div class="flex flex-wrap gap-2">
          ${s.outils.map(o => `<span class="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">${escapeHtml(o)}</span>`).join('')}
        </div>
      </div>
    `).join('');

    const resultats = cs.resultats.map(r => `
      <div class="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-cyan/10 border border-accent/20">
        <div class="font-display font-bold text-3xl md:text-4xl gradient-text mb-1">${escapeHtml(r.valeur)}</div>
        <div class="text-sm text-slate-600 dark:text-slate-400">${escapeHtml(r.label)}</div>
      </div>
    `).join('');

    const meta = `
      <div class="flex flex-wrap gap-6 text-sm mb-6">
        ${cs.role ? `<div><span class="text-slate-500">Rôle :</span> <span class="font-medium">${escapeHtml(cs.role)}</span></div>` : ''}
        ${cs.duree ? `<div><span class="text-slate-500">Durée :</span> <span class="font-medium">${escapeHtml(cs.duree)}</span></div>` : ''}
      </div>
    `;

    const liens = `
      <div class="flex flex-wrap gap-3">
        ${cs.demoUrl ? `<a href="${cs.demoUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-cyan text-white font-semibold px-5 py-2.5 rounded-lg hover:scale-105 transition">🚀 Voir la démo</a>` : ''}
        ${cs.githubUrl ? `<a href="${cs.githubUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 border border-slate-300 dark:border-white/20 hover:border-accent px-5 py-2.5 rounded-lg transition">⌥ Voir le code</a>` : ''}
      </div>
    `;

    const article = $create('article', 'scroll-mt-24', `
      <div id="projet-${i}"></div>

      <header class="mb-10">
        <div class="flex items-start gap-4 mb-4">
          <div class="text-5xl">${p.icone}</div>
          <div>
            <h2 class="font-display font-bold text-3xl md:text-4xl text-slate-900 dark:text-white">${escapeHtml(p.titre)}</h2>
            <p class="text-slate-600 dark:text-slate-400 mt-1">${escapeHtml(p.description)}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mb-4">${tags}</div>
        ${meta}
      </header>

      <section class="mb-10">
        <h3 class="flex items-center gap-2 font-display font-bold text-xl mb-3 text-slate-900 dark:text-white">
          <span class="text-accent" aria-hidden="true">🎯</span> Le contexte
        </h3>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">${escapeHtml(cs.contexte)}</p>
      </section>

      <section class="mb-10 p-6 rounded-2xl bg-red-500/5 border-l-4 border-red-500">
        <h3 class="flex items-center gap-2 font-display font-bold text-xl mb-3 text-slate-900 dark:text-white">
          <span class="text-red-500" aria-hidden="true">⚡</span> Le défi
        </h3>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">${escapeHtml(cs.defi)}</p>
      </section>

      <section class="mb-10">
        <h3 class="flex items-center gap-2 font-display font-bold text-xl mb-5 text-slate-900 dark:text-white">
          <span class="text-accent" aria-hidden="true">🛠️</span> Ma solution
        </h3>
        ${solutions}
      </section>

      <section class="mb-10">
        <h3 class="flex items-center gap-2 font-display font-bold text-xl mb-5 text-slate-900 dark:text-white">
          <span class="text-green-400" aria-hidden="true">📊</span> Les résultats
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-${Math.min(cs.resultats.length, 3)} gap-4">
          ${resultats}
        </div>
      </section>

      <section class="mb-10 p-6 rounded-2xl bg-accent/5 border-l-4 border-accent">
        <h3 class="flex items-center gap-2 font-display font-bold text-xl mb-3 text-slate-900 dark:text-white">
          <span class="text-accent" aria-hidden="true">💡</span> Ce que j'ai appris
        </h3>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">${escapeHtml(cs.lecons)}</p>
      </section>

      <div class="mb-8">${liens}</div>

      <hr class="border-slate-200 dark:border-white/10">
    `);

    container.appendChild(article);
  });
}