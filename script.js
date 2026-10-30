/* ============================================
   PORTFOLIO OUSSAMA KHIATI — script.js
   Rôle : injection, i18n, thème, animations
   ============================================ */

/* ============================================
   HELPERS
   ============================================ */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const $create = (tag, className = "", html = "") => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html) el.innerHTML = html;
  return el;
};

// Exact aliases keep Git/GitHub and JavaScript/Java distinct.
const TECH_LOGOS = {
  html: "html5", html5: "html5",
  css: "css3", css3: "css3",
  js: "javascript", javascript: "javascript",
  ts: "typescript", typescript: "typescript",
  php: "php", python: "python",
  react: "react", reactjs: "react",
  laravel: "laravel", jquery: "jquery",
  node: "nodejs", nodejs: "nodejs",
  mysql: "mysql", mysqlworkbench: "mysql", mongodb: "mongodb", mongo: "mongodb",
  vscode: "vscode", visualstudiocode: "vscode",
  git: "git", github: "github",
};

const TECH_SYMBOLS = {
  uml: "diagram-project", merise: "sitemap", scrum: "list-check",
  api: "plug", fetch: "download", localstorage: "hard-drive",
};
const LANGUAGE_FLAGS = {
  arabe: "ma", arabic: "ma", francais: "fr", french: "fr",
  anglais: "gb", english: "gb", italien: "it", italienb1: "it", italian: "it",
};

function technologyIcon(item) {
  const key = String(item).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "");
  if (Object.hasOwn(LANGUAGE_FLAGS, key)) {
    return `<img class="tech-logo tech-flag" src="assets/tech-icons/flag-${LANGUAGE_FLAGS[key]}.svg" width="29" height="22" alt="" aria-hidden="true" decoding="async">`;
  }
  if (Object.hasOwn(TECH_LOGOS, key)) {
    const logo = TECH_LOGOS[key];
    const detail = key === "mysqlworkbench"
      ? `<span class="tech-logo-detail">${Portfolio.icon("gear")}</span>` : "";
    return `<span class="tech-logo-wrap" aria-hidden="true"><img class="tech-logo tech-logo-${logo}" src="assets/tech-icons/${logo}.svg" width="28" height="28" alt="" decoding="async">${detail}</span>`;
  }
  const symbol = Object.hasOwn(TECH_SYMBOLS, key) ? TECH_SYMBOLS[key] : "code";
  return Portfolio.icon(symbol);
}

function technologyBadge(item) {
  return `<li class="tech-badge skill-badge" tabindex="0" title="${escapeHtml(item)}" aria-label="${escapeHtml(item)}">${technologyIcon(item)}<span class="sr-only">${escapeHtml(item)}</span></li>`;
}

function refreshIcons() {
  $$("[data-fa-icon]").forEach((slot) => {
    const name = slot.dataset.faIcon;
    if (slot.dataset.iconRendered === name) return;
    slot.innerHTML = Portfolio.icon(name);
    slot.dataset.iconRendered = name;
  });
}

function applyAdminPreview() {
  const saved = Portfolio.storage.getItem("portfolioConfig");
  if (!saved) return;
  try {
    const preview = JSON.parse(saved);
    Object.assign(CONFIG, Portfolio.migrateJourney(preview));
  } catch (error) {
    console.warn("Configuration locale de prévisualisation invalide.");
  }
}
applyAdminPreview();

function escapeHtml(str) {
  str = String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// URLs dynamiques
const waUrl = (msg = "") =>
  `https://wa.me/${CONFIG.whatsapp}${msg ? "?text=" + encodeURIComponent(msg) : ""}`;
const liUrl = `https://www.linkedin.com/in/${CONFIG.linkedin}`;
const ghUrl = `https://github.com/${CONFIG.github}`;

/* ============================================
   1. THÈME CLAIR / SOMBRE
   ============================================ */
(function initTheme() {
  const html = document.documentElement;
  const toggle = $("theme-toggle");
  html.classList.toggle("dark", Portfolio.storage.getItem("theme") !== "light");
  const update = () => {
    const dark = html.classList.contains("dark");
    if ($("theme-icon")) $("theme-icon").innerHTML = Portfolio.icon(dark ? "sun" : "moon");
    toggle?.setAttribute("aria-pressed", String(dark));
  };
  update();
  toggle?.addEventListener("click", () => {
    html.classList.toggle("dark");
    Portfolio.storage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
    update();
  });
})();

/* ============================================
   2. i18n — INTERNATIONALISATION
   ============================================ */
const I18N = {
  current: "fr",
  flags: { fr: "fr", en: "gb", ar: "ma" },
  codes: { fr: "FR", en: "EN", ar: "AR" },

  init() {
    const saved = Portfolio.storage.getItem("langue");
    const browser = navigator.language.substring(0, 2);
    const detected = CONFIG.languesDisponibles.includes(browser)
      ? browser
      : CONFIG.langue;
    this.current = saved || detected;
    this.apply(this.current);
    this.bindEvents();
  },

  apply(lang) {
    if (!TRANSLATIONS[lang]) {
      console.warn(`Langue "${lang}" introuvable → fallback FR`);
      lang = "fr";
    }
    this.current = lang;
    Portfolio.storage.setItem("langue", lang);

    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    // Traduire tous les éléments [data-i18n]
    $$("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      const t = TRANSLATIONS[lang][key];
      if (t) {
        if (el.dataset.i18nHtml === "true") el.innerHTML = t;
        else if (el.classList.contains("mobile-link") && el.querySelector(":scope > span")) {
          el.querySelector(":scope > span").textContent = t;
        } else el.textContent = t;
      }
    });

    // Traduire les placeholders
    $$("[data-i18n-placeholder]").forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      const t = TRANSLATIONS[lang][key];
      if (t) el.placeholder = t;
    });

    // Mettre à jour le bouton de langue
    const flag = $("lang-flag");
    const code = $("lang-code");
    if (flag) flag.innerHTML = `<img src="assets/tech-icons/flag-${this.flags[lang]}.svg" width="20" height="15" alt="" aria-hidden="true">`;
    if (code) code.textContent = this.codes[lang];

    // Fermer le dropdown
    $("lang-dropdown")?.classList.add("hidden");
    $("lang-btn")?.setAttribute("aria-expanded", "false");

    // Re-render du contenu dynamique
    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { lang } }),
    );
  },

  t(key) {
    return TRANSLATIONS[this.current]?.[key] || key;
  },

  bindEvents() {
    const btn = $("lang-btn");
    const dd = $("lang-dropdown");
    if (!btn || !dd) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !dd.classList.contains("hidden");
      dd.classList.toggle("hidden", open);
      btn.setAttribute("aria-expanded", String(!open));
    });

    $$(".lang-option").forEach((o) => {
      o.addEventListener("click", () => this.apply(o.dataset.lang));
    });

    document.addEventListener("click", (e) => {
      if (!$("lang-selector")?.contains(e.target)) {
        dd.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        dd.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  },
};

/* ============================================
   3. INJECTION — IDENTITÉ
   ============================================ */
function injectIdentity() {
  document.title = `${CONFIG.nom} | ${CONFIG.titre}`;
  ["hero-nom", "footer-nom", "code-name"].forEach(id => { if ($(id)) $(id).textContent = CONFIG.nom; });
  if ($("footer-titre")) $("footer-titre").textContent = CONFIG.titre;
  if ($("code-location")) $("code-location").textContent = `${CONFIG.ville}, ${CONFIG.pays}`;
  if ($("about-location")) $("about-location").textContent = `${CONFIG.ville}, ${CONFIG.pays}`;
  if ($("code-available")) $("code-available").textContent = String(Boolean(CONFIG.disponible));
  if ($("availability-badge")) $("availability-badge").hidden = !CONFIG.disponible;
  if ($("hero-github")) $("hero-github").href = ghUrl;
  if ($("hero-linkedin")) $("hero-linkedin").href = liUrl;
  if ($("year")) $("year").textContent = new Date().getFullYear();
}

/* ============================================
   4. INJECTION — WHATSAPP (tous les liens)
   ============================================ */
function injectWhatsApp() {
  const msg = `Bonjour ${CONFIG.prenom}, je suis intéressé par ton profil !`;
  [
    "nav-whatsapp",
    "mobile-whatsapp",
    "hero-whatsapp",
    "cta-whatsapp",
    "float-whatsapp",
  ].forEach((id) => {
    const el = $(id);
    if (el) el.href = waUrl(msg);
  });
}

/* ============================================
   5. INJECTION — CV
   ============================================ */
function injectCV() {
  const cv = $("hero-cv");
  if (cv && CONFIG.cv) {
    cv.href = Portfolio.url(CONFIG.cv);
    cv.setAttribute("download", CONFIG.cv);
  }
}

/* ============================================
   6. INJECTION — BIO À PROPOS
   ============================================ */
function injectBio() {
  const container = $("about-bio");
  if (!container) return;
  container.innerHTML = "";
  CONFIG.bio.forEach((p) => {
    container.appendChild($create("p", "", escapeHtml(p)));
  });
  // Lien LinkedIn
  const link = $create(
    "a",
    "inline-flex items-center gap-2 text-accent hover:text-accent-light font-semibold mt-4 group",
    `${Portfolio.icon("linkedin-in")} ${I18N.t("contact_linkedin_desc")} ${Portfolio.icon("arrow-up-right-from-square")}`,
  );
  link.href = liUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  container.appendChild(link);
}

/* ============================================
   7. INJECTION — STATS + COMPTEURS
   ============================================ */
function injectStats() {
  const dl = $("hero-stats");
  if (!dl) return;
  dl.innerHTML = "";

  CONFIG.stats.forEach((s) => {
    const label = TRANSLATIONS[I18N.current]?.[s.labelKey] || s.labelKey;
    const div = $create("div", "");
    div.innerHTML = `
      <dt>${escapeHtml(label)}</dt>
      <dd>
        <span class="counter" data-target="${s.valeur}" data-suffix="${escapeHtml(s.suffixe || "")}" data-duration="2000">0</span>
      </dd>
    `;
    dl.appendChild(div);
  });

  initCounters();
}

/* ============================================
   8. COMPTEURS ANIMÉS
   ============================================ */
function initCounters() {
  const counters = $$(".counter");
  if (!counters.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    counters.forEach((c) => {
      c.textContent = c.dataset.target + (c.dataset.suffix || "");
    });
    return;
  }

  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const animate = (counter) => {
    const target = parseFloat(counter.dataset.target) || 0;
    const suffix = counter.dataset.suffix || "";
    const duration = parseInt(counter.dataset.duration) || 2000;
    const start = performance.now();
    const isDecimal = target % 1 !== 0;

    counter.classList.add("animating");

    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutExpo(progress);
      const val = target * eased;
      counter.textContent =
        (isDecimal ? val.toFixed(1) : Math.floor(val)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
        setTimeout(() => counter.classList.remove("animating"), 600);
      }
    };
    requestAnimationFrame(update);
  };

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animate(e.target);
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((c) => obs.observe(c));
}

/* ============================================
   9. INJECTION — COMPÉTENCES (avec barres)
   ============================================ */
function injectSkills() {
  const grid = $("skills-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const categoryIcons = ["code", "layer-group", "database", "diagram-project", "screwdriver-wrench", "globe"];
  const configuredIcons = {code: "code", layers: "layer-group", database: "database", grid: "diagram-project", tools: "screwdriver-wrench", globe: "globe"};
  CONFIG.competences.forEach((category, index) => {
    const level = Math.max(0, Math.min(100, Number(category.niveau) || 0));
    const symbol = Object.hasOwn(configuredIcons, category.icone) ? configuredIcons[category.icone] : categoryIcons[index % categoryIcons.length];
    grid.appendChild($create("article", "skill-card reveal", `
      <div class="skill-card-top"><span class="skill-category-icon">${Portfolio.icon(symbol)}</span><span class="mono">/${String(index + 1).padStart(2, "0")}</span></div>
      <h3>${escapeHtml(category.titre)}</h3>
      <ul class="technology-list">${category.items.map(technologyBadge).join("")}</ul>
      <div class="skill-level"><span>${I18N.t("skill_level")}</span><span>${level}%</span></div>
      <div class="skill-bar" role="meter" aria-label="${escapeHtml(category.titre)}" aria-valuenow="${level}" aria-valuemin="0" aria-valuemax="100"><div class="skill-fill" data-width="${level}%"></div></div>
    `));
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target.querySelector(".skill-fill");
      if (fill) fill.style.width = fill.dataset.width;
      observer.unobserve(entry.target);
    });
  }, {threshold: .3});
  grid.querySelectorAll(".skill-bar").forEach(bar => observer.observe(bar));
}

/* ============================================
   10. INJECTION — TIMELINE
   ============================================ */
function injectTimeline() {
  [["timeline", CONFIG.experiences], ["formation-timeline", CONFIG.formations]].forEach(([id, entries]) => {
    const timeline = $(id);
    if (!timeline) return;
    timeline.innerHTML = "";
    entries.forEach(exp => {
      const missions = exp.missions.length ? `<ul>${exp.missions.map(m => `<li>${escapeHtml(m)}</li>`).join("")}</ul>` : "";
      timeline.appendChild($create("li", "experience-item reveal", `
        <time class="experience-date" datetime="${escapeHtml(exp.date.split('/')[0])}">${escapeHtml(exp.dateLabel)}</time>
        <div class="experience-content"><h3>${escapeHtml(exp.titre)}</h3>
        ${exp.entreprise ? `<p class="experience-company">${escapeHtml(exp.entreprise)}</p>` : ""}
        ${missions}</div>
      `));
    });
  });
}

/* ============================================
   11. INJECTION — PROJETS
   ============================================ */
function injectProjects() {
  const grid = $("projects-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const symbols = ["cart-shopping", "list-check", "cloud-sun"];
  CONFIG.projets.forEach((project, index) => {
    const isImage = project.icone && /^(data:image|https?:)/.test(project.icone);
    const visual = isImage
      ? `<div class="project-preview is-image"><img src="${escapeHtml(Portfolio.url(project.icone, true))}" alt="${escapeHtml(project.titre)}" width="400" height="230" loading="lazy" decoding="async"></div>`
      : `<div class="project-preview" aria-hidden="true"><div class="preview-top"><span>~/projects/${String(index + 1).padStart(2, "0")}</span>${Portfolio.icon("folder-open")}</div><div class="preview-illustration"><span class="preview-bracket">{</span>${Portfolio.icon(symbols[index % symbols.length])}<span class="preview-bracket">}</span></div><div class="preview-footer"><span></span><span></span><span></span></div></div>`;
    grid.appendChild($create("article", "project-card reveal", `${visual}<div class="project-body">
      <h3>${escapeHtml(project.titre)}</h3><p>${escapeHtml(project.description)}</p>
      <ul class="technology-list">${project.technos.map(technologyBadge).join("")}</ul>
      <div class="project-actions"><a href="${escapeHtml(Portfolio.url(project.lien))}" target="_blank" rel="noopener noreferrer">${Portfolio.icon("github")} GitHub</a></div>
    </div>`));
  });
  if ($("projects-all-link")) $("projects-all-link").href = ghUrl;
}

/* ============================================
   12. INJECTION — TÉMOIGNAGES
   ============================================ */
function injectTestimonials() {
  const grid = $("temoignages-grid");
  if (!grid) return;
  grid.innerHTML = "";

  CONFIG.temoignages.filter(t => t.nom !== "Nouveau nom" && t.citation !== "Citation à remplir...").forEach((t) => {
    t = { ...t, note: Math.max(0, Math.min(5, Math.round(Number(t.note) || 0))) };
    const etoiles = t.note
      ? `<div class="flex gap-0.5 mb-3" aria-label="Note : ${t.note} sur 5">
           ${"★"
             .repeat(t.note)
             .split("")
             .map(() => `<span class="text-yellow-400 text-sm">★</span>`)
             .join("")}
           ${"☆"
             .repeat(5 - t.note)
             .split("")
             .map(
               () =>
                 `<span class="text-slate-300 dark:text-slate-600 text-sm">☆</span>`,
             )
             .join("")}
         </div>`
      : "";

    const linkedin = t.linkedin
      ? `<a href="https://www.linkedin.com/in/${encodeURIComponent(t.linkedin)}" target="_blank" rel="noopener noreferrer" class="ml-auto text-slate-400 hover:text-accent text-sm font-bold" aria-label="LinkedIn de ${escapeHtml(t.nom)}">in</a>`
      : "";

    grid.appendChild(
      $create(
        "article",
        "relative p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-accent/50 transition reveal",
        `<div class="absolute top-4 right-6 text-6xl font-serif text-accent/10 select-none" aria-hidden="true">"</div>
       ${etoiles}
       <blockquote class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 relative z-10">
         "${escapeHtml(t.citation)}"
       </blockquote>
       <div class="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
       <div class="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-cyan flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">           ${escapeHtml(t.initiales || t.nom.substring(0, 2).toUpperCase())}
         </div>
         <div class="flex-1">
           <p class="font-display font-semibold text-sm text-slate-900 dark:text-white">${escapeHtml(t.nom)}</p>
           <p class="text-xs text-slate-500">
             ${escapeHtml(t.poste)}${t.entreprise ? " · " + escapeHtml(t.entreprise) : ""}
           </p>
         </div>
         ${linkedin}
       </div>`,
      ),
    );
  });
  const section = grid.closest("section");
  if (section) section.hidden = grid.children.length === 0;
  document.querySelectorAll('a[href="#temoignages"]').forEach(link => { (link.closest('li') || link).hidden = grid.children.length === 0; });
}

/* ============================================
   13. INJECTION — CONTACT
   ============================================ */
function injectContact() {
  const container = $("contact-links");
  if (!container) return;
  const links = [
    {icon: "whatsapp", title: I18N.t("contact_whatsapp"), description: "WhatsApp", url: waUrl(`Bonjour ${CONFIG.prenom}`)},
    {icon: "envelope", title: I18N.t("contact_email"), description: CONFIG.email, url: `mailto:${CONFIG.email}`},
    {icon: "linkedin-in", title: I18N.t("contact_linkedin"), description: I18N.t("contact_linkedin_desc"), url: liUrl},
    {icon: "github", title: "GitHub", description: "@" + CONFIG.github, url: ghUrl},
  ];
  container.innerHTML = "";
  links.forEach(link => {
    const anchor = $create("a", "contact-card", `<span class="contact-icon">${Portfolio.icon(link.icon)}</span><div><h3>${escapeHtml(link.title)}</h3><p>${escapeHtml(link.description)}</p></div>${Portfolio.icon("arrow-up-right-from-square")}`);
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    container.appendChild(anchor);
  });
}

/* ============================================
   14. INJECTION — MARQUEE
   ============================================ */
function injectMarquee() {
  const m = $("marquee");
  if (!m) return;

  const group = (duplicate = false) => `<div class="marquee-group"${duplicate ? ' aria-hidden="true"' : ''}>${CONFIG.technosMarquee.map(t =>
    `<span class="tech-badge"${duplicate ? '' : ' tabindex="0"'} title="${escapeHtml(t)}">${technologyIcon(t)}<span class="sr-only">${escapeHtml(t)}</span></span>`
  ).join("")}</div>`;

  m.innerHTML = group() + group(true);
  refreshIcons();
}

/* ============================================
   15. TYPING EFFECT
   ============================================ */
let typingTimeout = null;

function initTyping() {
  const el = $("typing");
  if (!el) return;

  // Annuler un éventuel ancien typing
  if (typingTimeout) clearTimeout(typingTimeout);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = CONFIG.motsAnimes[0] || CONFIG.titre; return; }
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const current = CONFIG.motsAnimes[wordIndex] || CONFIG.titre;

    if (deleting) {
      el.textContent = current.substring(0, --charIndex);
    } else {
      el.textContent = current.substring(0, ++charIndex);
    }

    let speed = deleting ? 40 : 90;

    if (!deleting && charIndex === current.length) {
      speed = 1800;
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % CONFIG.motsAnimes.length;
      speed = 300;
    }

    typingTimeout = setTimeout(type, speed);
  };

  type();
}

/* ============================================
   16. NAVBAR AU SCROLL
   ============================================ */
function initNavbarScroll() {
  const nav = $("navbar");
  if (!nav) return;
  const update = () => nav.classList.toggle("is-scrolled", window.scrollY > 30);
  update();
  window.addEventListener("scroll", update, {passive: true});
}

/* ============================================
   17. MENU MOBILE
   ============================================ */
function initMobileMenu() {
  const burger = $("burger");
  const menu = $("mobile-menu");
  const closeButton = $("mobile-menu-close");
  if (!burger || !menu) return;

  const closeMenu = ({ restoreFocus = true } = {}) => {
    menu.classList.add("translate-x-full");
    menu.setAttribute("aria-hidden", "true");
    menu.inert = true;
    burger.setAttribute("aria-expanded", "false");
    burger.innerHTML = Portfolio.icon("bars");
    burger.setAttribute("aria-label", "Ouvrir le menu");
    document.body.style.overflow = "";
    if (restoreFocus) burger.focus({ preventScroll: true });
  };

  const openMenu = () => {
    menu.classList.remove("translate-x-full");
    menu.setAttribute("aria-hidden", "false");
    menu.inert = false;
    burger.setAttribute("aria-expanded", "true");
    burger.innerHTML = Portfolio.icon("xmark");
    burger.setAttribute("aria-label", "Fermer le menu");
    document.body.style.overflow = "hidden";
    closeButton?.focus({ preventScroll: true });
  };

  // Utiliser des fonctions explicites évite les états désynchronisés après un retour navigateur.
  burger.addEventListener("click", () => {
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu();
    else openMenu();
  });

  closeButton?.addEventListener("click", () => closeMenu());

  $$(".mobile-link, #mobile-whatsapp").forEach((l) => {
    l.addEventListener("click", () => closeMenu({ restoreFocus: false }));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 951px)").matches) closeMenu({ restoreFocus: false });
  });

  window.addEventListener("pageshow", () => closeMenu({ restoreFocus: false }));
  closeMenu({ restoreFocus: false });
}

/* ============================================
   18. CURSEUR LUMINEUX
   ============================================ */
function initCursor() {
  const glow = $('cursor-glow');
  if (!glow) return;
  
  // Désactiver sur mobile ET si l'utilisateur préfère les mouvements réduits
  if (!window.matchMedia('(min-width: 769px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    glow.remove();
    return;
  }

  // Utiliser requestAnimationFrame pour éviter le lag
  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });
  
  function animateGlow() {
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;
    glow.style.transform = `translate(${currentX - 200}px, ${currentY - 200}px)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

/* ============================================
   19. SCROLL REVEAL
   ============================================ */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  $$(".reveal").forEach((el) => observer.observe(el));
}

/* ============================================
   20. FORMULAIRE CONTACT (démo)
   ============================================ */
function initForm() {
  const form = $("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
   const formData = new FormData(form);
   const name = String(formData.get("name") || "").trim();
   const email = String(formData.get("email") || "").trim();
   const message = String(formData.get("message") || "").trim();
   if (!name || !message || !form.reportValidity()) return;
   const subject = encodeURIComponent(`Portfolio — message de ${name}`);
   const body = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\n${message}`);

   const status = $("form-status");
   if (status) {
     status.textContent = "Ouverture de votre application e-mail...";
   }
   window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
 });
}

/* ============================================
   21. INIT GLOBALE
   ============================================ */
function init() {
  I18N.init();
  injectIdentity();
  injectWhatsApp();
  injectCV();
  injectBio();
  injectStats();
  injectSkills();
  injectTimeline();
  injectProjects();
  injectTestimonials();
  injectContact();
  injectMarquee();
  initTyping();
  initNavbarScroll();
  initMobileMenu();
  initCursor();
  initReveal();
  initForm();
  refreshIcons();
}

/* ============================================
   22. RÉACTION AU CHANGEMENT DE LANGUE
   ============================================ */
document.addEventListener("languageChanged", () => {
  injectStats();
  injectSkills();
  injectTimeline();
  injectProjects();
  injectTestimonials();
  injectContact();
  initReveal();
});

/* ============================================
   23. LANCEMENT
   ============================================ */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
