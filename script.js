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

function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
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
  const icon = $("theme-icon");

  const saved = localStorage.getItem("theme");
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Appliquer le thème initial
  if (saved === "light" || (!saved && !sysDark)) {
    html.classList.remove("dark");
    if (icon) icon.textContent = "☀️";
  } else {
    html.classList.add("dark");
    if (icon) icon.textContent = "🌙";
  }

  // Toggle au clic
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isDark = html.classList.toggle("dark");
      if (icon) icon.textContent = isDark ? "🌙" : "☀️";
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }
})();

/* ============================================
   2. i18n — INTERNATIONALISATION
   ============================================ */
const I18N = {
  current: "fr",
  flags: { fr: "🇫🇷", en: "🇬🇧", ar: "🇲🇦" },
  codes: { fr: "FR", en: "EN", ar: "AR" },

  init() {
    const saved = localStorage.getItem("langue");
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
    localStorage.setItem("langue", lang);

    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    // Traduire tous les éléments [data-i18n]
    $$("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      const t = TRANSLATIONS[lang][key];
      if (t) {
        if (el.dataset.i18nHtml === "true") el.innerHTML = t;
        else el.textContent = t;
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
    if (flag) flag.textContent = this.flags[lang];
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

  const heroNom = $("hero-nom");
  if (heroNom) heroNom.textContent = CONFIG.nom;

  const footerNom = $("footer-nom");
  if (footerNom) footerNom.textContent = CONFIG.nom;

  const footerTitre = $("footer-titre");
  if (footerTitre) footerTitre.textContent = CONFIG.titre;

  const logo = $("logo-nom");
  if (logo) {
    logo.innerHTML = `${CONFIG.prenom.substring(0, 2).toUpperCase()}<span class="text-accent">.</span>`;
  }

  const year = $("year");
  if (year) year.textContent = new Date().getFullYear();
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
    cv.href = CONFIG.cv;
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
    `Voir mon LinkedIn <span class="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>`,
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
      <dt class="text-xs md:text-sm text-slate-500">${escapeHtml(label)}</dt>
      <dd class="font-display font-bold text-2xl md:text-3xl text-slate-900 dark:text-white">
        <span class="counter" data-target="${s.valeur}" data-suffix="${s.suffixe || ""}" data-duration="2000">0</span>
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

  CONFIG.competences.forEach((c) => {
    const badges = c.items
      .map(
        (i) =>
          `<li class="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-light border border-accent/20">${escapeHtml(i)}</li>`,
      )
      .join("");

    const level = c.niveau || 80;

    grid.appendChild(
      $create(
        "article",
        "p-8 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-accent/50 transition reveal",
        `<div class="text-4xl mb-4" aria-hidden="true">${c.icone}</div>
       <h3 class="font-display font-semibold text-xl text-slate-900 dark:text-white mb-3">${escapeHtml(c.titre)}</h3>
       <ul class="flex flex-wrap gap-2 mb-4">${badges}</ul>
       <div class="skill-bar" aria-label="Niveau : ${level}%">
         <div class="skill-fill" data-width="${level}%"></div>
       </div>`,
      ),
    );
  });

  // Animer les barres au scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const fill = e.target.querySelector(".skill-fill");
          if (fill) fill.style.width = fill.dataset.width;
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 },
  );

  grid.querySelectorAll(".skill-bar").forEach((bar) => observer.observe(bar));
}

/* ============================================
   10. INJECTION — TIMELINE
   ============================================ */
function injectTimeline() {
  const timeline = $("timeline");
  if (!timeline) return;

  // Garder la ligne verticale
  const line = timeline.querySelector('div[aria-hidden="true"]');
  timeline.innerHTML = "";
  if (line) timeline.appendChild(line);

  const colors = ["bg-accent", "bg-cyan", "bg-green-400", "bg-purple-400"];

  CONFIG.experiences.forEach((exp, i) => {
    const missions = exp.missions.length
      ? `<ul class="text-slate-600 dark:text-slate-400 text-sm space-y-1.5 list-disc list-inside mt-2">
           ${exp.missions.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}
         </ul>`
      : "";

    timeline.appendChild(
      $create(
        "li",
        "relative mb-12 reveal",
        `<div class="absolute -left-8 md:-left-12 top-1 w-5 h-5 rounded-full ${colors[i % colors.length]} border-4 border-white dark:border-[#0a0a0f]" aria-hidden="true"></div>
       <time datetime="${exp.date}" class="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent-light text-xs font-semibold mb-3">
         ${escapeHtml(exp.dateLabel)}
       </time>
       <h3 class="font-display font-semibold text-xl text-slate-900 dark:text-white mb-1">${escapeHtml(exp.titre)}</h3>
       ${exp.entreprise ? `<p class="text-slate-500 text-sm mb-3">${escapeHtml(exp.entreprise)}</p>` : ""}
       ${missions}`,
      ),
    );
  });
}

/* ============================================
   11. INJECTION — PROJETS
   ============================================ */
function injectProjects() {
  const grid = $("projects-grid");
  if (!grid) return;
  grid.innerHTML = "";

  CONFIG.projets.forEach((p, i) => {
    const tags = p.technos
      .map(
        (t) =>
          `<li class="px-2.5 py-1 rounded-md text-xs font-medium bg-accent/10 text-accent-light">${escapeHtml(t)}</li>`,
      )
      .join("");

    const isImage =
      p.icone &&
      (p.icone.startsWith("data:image") || p.icone.startsWith("http"));
    const visual = isImage
      ? `<div class="h-44 overflow-hidden">
<img src="${p.icone}" alt="${escapeHtml(p.titre)}" width="400" height="300" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async">         </div>`
      : `<div class="h-44 bg-gradient-to-br from-accent/30 to-cyan/20 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500" aria-hidden="true">${p.icone}</div>`;

    const caseLink = p.etudeDeCas
      ? `<a href="etudes-de-cas.html#projet-${i}" class="text-sm font-semibold text-accent hover:text-accent-light">${I18N.t("projects_case_study")} →</a>`
      : "";

    grid.appendChild(
      $create(
        "article",
        "group rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-accent/50 transition reveal",
        `${visual}
       <div class="p-6">
         <h3 class="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">${escapeHtml(p.titre)}</h3>
         <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">${escapeHtml(p.description)}</p>
         <ul class="flex flex-wrap gap-2 mb-4">${tags}</ul>
         <div class="flex flex-wrap items-center gap-3">
           ${caseLink}
           <a href="${p.lien}" target="_blank" rel="noopener noreferrer" class="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">GitHub</a>
         </div>
       </div>`,
      ),
    );
  });

  // Lien "voir tous les projets"
  const allLink = $("projects-all-link");
  if (allLink) allLink.href = ghUrl;
}

/* ============================================
   12. INJECTION — TÉMOIGNAGES
   ============================================ */
function injectTestimonials() {
  const grid = $("temoignages-grid");
  if (!grid) return;
  grid.innerHTML = "";

  CONFIG.temoignages.forEach((t) => {
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
      ? `<a href="https://www.linkedin.com/in/${t.linkedin}" target="_blank" rel="noopener noreferrer" class="ml-auto text-slate-400 hover:text-accent text-sm font-bold" aria-label="LinkedIn de ${escapeHtml(t.nom)}">in</a>`
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
}

/* ============================================
   13. INJECTION — CONTACT
   ============================================ */
function injectContact() {
  const container = $("contact-links");
  if (!container) return;
  container.innerHTML = "";

  const links = [
    {
      icon: "💬",
      titre: I18N.t("contact_whatsapp"),
      desc: "WhatsApp",
      url: waUrl(`Bonjour ${CONFIG.prenom}`),
      color: "whatsapp",
    },
    {
      icon: "✉️",
      titre: I18N.t("contact_email"),
      desc: CONFIG.email,
      url: `mailto:${CONFIG.email}`,
      color: "accent",
    },
    {
      icon: "in",
      titre: I18N.t("contact_linkedin"),
      desc: I18N.t("contact_linkedin_desc"),
      url: liUrl,
      color: "cyan",
    },
    {
      icon: "⌥",
      titre: I18N.t("contact_github"),
      desc: "@" + CONFIG.github,
      url: ghUrl,
      color: "purple-400",
    },
  ];

  links.forEach((l) => {
    const a = $create(
      "a",
      "flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-accent transition",
      `<div class="w-12 h-12 rounded-xl bg-${l.color}/20 flex items-center justify-center text-2xl">${l.icon}</div>
       <div>
         <h3 class="font-semibold text-slate-900 dark:text-white">${escapeHtml(l.titre)}</h3>
         <p class="text-sm text-slate-500">${escapeHtml(l.desc)}</p>
       </div>`,
    );
    a.href = l.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    container.appendChild(a);
  });
}

/* ============================================
   14. INJECTION — MARQUEE
   ============================================ */
function injectMarquee() {
  const m = $("marquee");
  if (!m) return;

  const content = CONFIG.technosMarquee
    .map(
      (t) =>
        `<span class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-300">
      <span class="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true"></span>${escapeHtml(t)}
    </span>`,
    )
    .join("");

  m.innerHTML = content + content;
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

  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const current = CONFIG.motsAnimes[wordIndex];

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

  window.addEventListener(
    "scroll",
    () => {
      const isDark = document.documentElement.classList.contains("dark");
      if (window.scrollY > 50) {
        nav.classList.add("backdrop-blur-xl", "border-b");
        nav.classList.toggle("bg-white/80", !isDark);
        nav.classList.toggle("bg-[#0a0a0f]/80", isDark);
        nav.classList.toggle("border-slate-200", !isDark);
        nav.classList.toggle("border-white/10", isDark);
      } else {
        nav.classList.remove(
          "backdrop-blur-xl",
          "border-b",
          "bg-white/80",
          "bg-[#0a0a0f]/80",
          "border-slate-200",
          "border-white/10",
        );
      }
    },
    { passive: true },
  );
}

/* ============================================
   17. MENU MOBILE
   ============================================ */
function initMobileMenu() {
  const burger = $("burger");
  const menu = $("mobile-menu");
  if (!burger || !menu) return;

  burger.addEventListener("click", () => {
    const open = !menu.classList.toggle("translate-x-full");
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  $$(".mobile-link").forEach((l) => {
    l.addEventListener("click", () => {
      menu.classList.add("translate-x-full");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.classList.contains("translate-x-full")) {
      menu.classList.add("translate-x-full");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
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
    const status = $("form-status");
    if (status) {
      status.textContent = I18N.t("contact_form_success");
      setTimeout(() => (status.textContent = ""), 5000);
    }
    form.reset();
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
  // Le typing continue (pas besoin de relancer)
});

/* ============================================
   23. LANCEMENT
   ============================================ */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
