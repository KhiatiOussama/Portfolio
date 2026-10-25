/* ============================================
   BLOG — Logique
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

$('year').textContent = new Date().getFullYear();

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

// i18n
(function initI18n() {
  const lang = localStorage.getItem('langue') || 'fr';
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  $$('[data-i18n]').forEach(el => {
    const t = TRANSLATIONS[lang]?.[el.dataset.i18n];
    if (t) el.textContent = t;
  });
})();

// Rendu des articles
const container = $('articles-container');
if (container && CONFIG.articles) {
  if (CONFIG.articles.length === 0) {
    container.innerHTML = `<div class="text-center py-12 text-slate-500">Aucun article pour le moment.</div>`;
  } else {
    CONFIG.articles.forEach((a) => {
      const tags = a.tags.map(t =>
        `<span class="px-2 py-1 rounded text-xs bg-accent/10 text-accent font-medium">${escapeHtml(t)}</span>`
      ).join('');

      const date = new Date(a.date).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      const card = $create('article',
        'p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-accent/50 transition-all cursor-pointer hover:-translate-y-1',
        `<div class="flex items-center gap-3 mb-3 flex-wrap">
           <time datetime="${a.date}" class="text-sm text-slate-500">${date}</time>
           <div class="flex gap-1 flex-wrap">${tags}</div>
         </div>
         <h2 class="font-display font-bold text-2xl mb-2 text-slate-900 dark:text-white">${escapeHtml(a.titre)}</h2>
         <p class="text-slate-600 dark:text-slate-400 mb-4">${escapeHtml(a.description)}</p>
         <span class="text-accent font-semibold text-sm">Lire l'article →</span>`
      );

      card.addEventListener('click', () => {
        alert(`📝 ${a.titre}\n\n${a.contenu || 'Contenu à rédiger...'}\n\n(Pour une vraie page article, crée article.html)`);
      });

      container.appendChild(card);
    });
  }
}