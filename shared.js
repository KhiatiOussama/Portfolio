/* Shared validation for local previews and URLs. No remote administration. */
const Portfolio = (() => {
  const storage = {
    getItem(key) { try { return window.localStorage.getItem(key); } catch { return null; } },
    setItem(key, value) { try { window.localStorage.setItem(key, value); } catch {} }
  };
  function validate(value, template) {
    if (Array.isArray(template)) {
      if (!Array.isArray(value) || value.length > 200) throw new Error('Invalid array');
      return value.map(item => validate(item, template[0]));
    }
    if (template && typeof template === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid object');
      const result = {};
      for (const key of Object.keys(template)) {
        result[key] = Object.hasOwn(value, key) ? validate(value[key], template[key]) : structuredClone(template[key]);
      }
      return result;
    }
    if (typeof value !== typeof template || (typeof value === 'number' && !Number.isFinite(value))) throw new Error('Invalid value');
    return value;
  }
  function migrateJourney(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
        Object.hasOwn(value, 'formations') || !Array.isArray(value.experiences)) return value;
    const formations = value.experiences.filter(entry => typeof entry?.date === 'string' && /^(19|20)\d{2}/.test(entry.date) && Number(entry.date.slice(0, 4)) < 2023);
    if (!formations.length) return value;
    return {...value, experiences: value.experiences.filter(entry => !formations.includes(entry)), formations};
  }
  function preview(defaults) {
    try {
      const raw = storage.getItem('portfolioConfig');
      return raw ? validate(migrateJourney(JSON.parse(raw)), defaults) : structuredClone(defaults);
    } catch { return structuredClone(defaults); }
  }
  function url(value, image = false) {
    if (typeof value !== 'string') return '#';
    if (image && /^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(value)) return value;
    try {
      const parsed = new URL(value, location.href);
      return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : '#';
    } catch { return '#'; }
  }
  const paths = {
    code: '<path d="m8 5-7 7 7 7m8-14 7 7-7 7m-3-18-2 22"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    tools: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18a2.1 2.1 0 0 0 3 3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.2 2.2-2.8-.6-.6-2.8Z"/><path d="m14 14 6 6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 6 9 7 9-7"/>',
    chat: '<path d="M21 11a9 9 0 0 1-13 8l-6 3 2-6A9 9 0 1 1 21 11Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    moon: '<path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z"/>'
  };
  const aliases = {layers: 'layer-group', grid: 'table-cells-large', tools: 'screwdriver-wrench', mail: 'envelope', chat: 'comment-dots'};
  const icon = name => window.FontAwesomeIcons
    ? window.FontAwesomeIcons.icon(aliases[name] || name)
    : `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.code}</svg>`;
  return { storage, preview, migrateJourney, url, icon };
})();

/* Keyboard navigation, mobile focus, active sections and reading progress. */
(() => {
 const start = () => {
  const toggle = document.getElementById('theme-toggle');
  const updateTheme = () => {
   const dark = document.documentElement.classList.contains('dark');
   const icon = document.getElementById('theme-icon');
   if(icon) icon.innerHTML = Portfolio.icon(dark ? 'sun' : 'moon');
   toggle?.setAttribute('aria-pressed', String(dark));
  };
  updateTheme(); toggle?.addEventListener('click', updateTheme);
  const contactHint = () => {
   const help = document.getElementById('email-help');
   if(help) help.textContent = ({fr:'Ce formulaire ouvre votre application e-mail pour envoyer le message.', en:'This form opens your email application to send the message.', ar:'يفتح هذا النموذج تطبيق البريد الإلكتروني لإرسال الرسالة.'})[document.documentElement.lang] || 'Ce formulaire ouvre votre application e-mail pour envoyer le message.';
  };
  contactHint(); document.addEventListener('languageChanged',contactHint);
  const menu = document.getElementById('mobile-menu');
  const burger = document.getElementById('burger');
  if(menu && burger) {

   document.addEventListener('keydown', e => {
    if(e.key !== 'Tab' || menu.inert) return;
    const nodes = [...menu.querySelectorAll('a, button')].filter(el => el.getClientRects().length);
    if(e.shiftKey && document.activeElement === nodes[0]) { e.preventDefault(); nodes.at(-1)?.focus(); }
    else if(!e.shiftKey && document.activeElement === nodes.at(-1)) { e.preventDefault(); nodes[0].focus(); }
   });
  }
  if(!document.getElementById('home')) return;
  const progress = document.createElement('div'); progress.id='scroll-progress'; progress.setAttribute('aria-hidden','true'); document.body.append(progress);
  const top = document.createElement('button'); top.id='back-top'; top.type='button'; top.innerHTML=Portfolio.icon('arrow-up'); top.setAttribute('aria-label','Retour en haut'); top.hidden=true;
  top.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})); document.body.append(top);
  let scheduled=false;
  const update = () => { const total=document.documentElement.scrollHeight-innerHeight; progress.style.width=`${total>0?100*scrollY/total:0}%`; top.hidden=scrollY<600; scheduled=false; };
  addEventListener('scroll',()=>{if(!scheduled) { scheduled=true; requestAnimationFrame(update); }},{passive:true}); update();
  const navLinks=[...document.querySelectorAll('#navbar nav a[href^="#"]')];
  const observer=new IntersectionObserver(entries=>{for(const entry of entries) if(entry.isIntersecting) navLinks.forEach(link=>{ if(link.hash===`#${entry.target.id}`) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });},{rootMargin:'-20% 0px -55% 0px',threshold:0});
  document.querySelectorAll('main section[id]').forEach(section=>observer.observe(section));
 };
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
