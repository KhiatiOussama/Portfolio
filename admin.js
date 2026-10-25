/* ============================================
   ADMIN — Panneau d'administration
   ============================================ */
let state = JSON.parse(JSON.stringify(CONFIG));

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

function saveState() {
  try {
    localStorage.setItem('portfolioConfig', JSON.stringify(state));
    updateSizeWarning();
  } catch (e) {
    alert('⚠️ Espace localStorage dépassé. Exporte et nettoie tes images.');
  }
}
function loadState() {
  const saved = localStorage.getItem('portfolioConfig');
  if (saved) {
    try { state = JSON.parse(saved); } catch (e) {}
  }
}
function escapeHtml(str) {
  if (typeof str !== 'string') return str ?? '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function createCard(html) {
  const div = document.createElement('div');
  div.className = 'p-4 bg-white/[0.03] border border-white/10 rounded-xl';
  div.innerHTML = html;
  return div;
}
function updateSizeWarning() {
  const size = new Blob([JSON.stringify(state)]).size / 1024;
  const w = $('size-warning'), v = $('size-value');
  if (v) v.textContent = Math.round(size);
  if (w) w.classList.toggle('hidden', size < 500);
}
function handleImageUpload(file, cb, maxKB = 500) {
  if (!file.type.startsWith('image/')) { alert('❌ Ce n\'est pas une image'); return; }
  if (file.size > maxKB * 1024) { alert(`⚠️ Image trop lourde (${Math.round(file.size/1024)} Ko). Max ${maxKB} Ko.`); return; }
  const reader = new FileReader();
  reader.onload = (e) => cb(e.target.result);
  reader.readAsDataURL(file);
}

function initSimpleFields() {
  $$('[data-key]').forEach(input => {
    const key = input.dataset.key;
    const type = input.dataset.type;
    let value = state[key];
    if (type === 'array-string') input.value = Array.isArray(value) ? value.join('\n') : '';
    else input.value = value ?? '';
    input.addEventListener('input', () => {
      if (type === 'array-string') state[key] = input.value.split('\n').map(s => s.trim()).filter(Boolean);
      else state[key] = input.value;
      saveState();
    });
  });
}

function renderStats() {
  const c = $('stats-container');
  c.innerHTML = '';
  state.stats.forEach((s, i) => {
    c.appendChild(createCard(`
      <div class="grid grid-cols-3 gap-2">
        <input class="input-base" placeholder="Valeur" value="${escapeHtml(String(s.valeur))}" onchange="state.stats[${i}].valeur = parseFloat(this.value)||0; saveState();">
        <input class="input-base" placeholder="Suffixe (+)" value="${escapeHtml(s.suffixe||'')}" onchange="state.stats[${i}].suffixe = this.value; saveState();">
        <input class="input-base" placeholder="Clé i18n" value="${escapeHtml(s.labelKey||'')}" onchange="state.stats[${i}].labelKey = this.value; saveState();">
      </div>
      <button onclick="removeStat(${i})" class="mt-2 text-red-400 text-sm">🗑️ Supprimer</button>
    `));
  });
}
function addStat() { state.stats.push({ valeur: 0, suffixe: '', labelKey: 'stats_years' }); saveState(); renderStats(); }
function removeStat(i) { state.stats.splice(i,1); saveState(); renderStats(); }

function renderCompetences() {
  const c = $('competences-container');
  c.innerHTML = '';
  state.competences.forEach((cat, i) => {
    c.appendChild(createCard(`
      <div class="grid grid-cols-[60px_1fr_80px] gap-2 mb-2">
        <input class="input-base text-center" value="${escapeHtml(cat.icone)}" onchange="state.competences[${i}].icone = this.value; saveState();">
        <input class="input-base" value="${escapeHtml(cat.titre)}" onchange="state.competences[${i}].titre = this.value; saveState();">
        <input class="input-base text-center" type="number" value="${cat.niveau||80}" onchange="state.competences[${i}].niveau = parseInt(this.value); saveState();">
      </div>
      <textarea class="input-base" rows="2" onchange="state.competences[${i}].items = this.value.split('\\n').map(s=>s.trim()).filter(Boolean); saveState();">${cat.items.join('\n')}</textarea>
      <button onclick="removeCompetence(${i})" class="mt-2 text-red-400 text-sm">🗑️ Supprimer</button>
    `));
  });
}
function addCompetence() { state.competences.push({ icone:'🛠️', titre:'Nouvelle catégorie', niveau:80, items:[] }); saveState(); renderCompetences(); }
function removeCompetence(i) { state.competences.splice(i,1); saveState(); renderCompetences(); }

function renderExperiences() {
  const c = $('experiences-container');
  c.innerHTML = '';
  state.experiences.forEach((exp, i) => {
    c.appendChild(createCard(`
      <div class="grid md:grid-cols-2 gap-2 mb-2">
        <input class="input-base" placeholder="2024-08" value="${escapeHtml(exp.date)}" onchange="state.experiences[${i}].date = this.value; saveState();">
        <input class="input-base" placeholder="Août 2024 — Présent" value="${escapeHtml(exp.dateLabel)}" onchange="state.experiences[${i}].dateLabel = this.value; saveState();">
      </div>
      <input class="input-base mb-2" value="${escapeHtml(exp.titre)}" onchange="state.experiences[${i}].titre = this.value; saveState();">
      <input class="input-base mb-2" value="${escapeHtml(exp.entreprise)}" onchange="state.experiences[${i}].entreprise = this.value; saveState();">
      <textarea class="input-base" rows="3" onchange="state.experiences[${i}].missions = this.value.split('\\n').map(s=>s.trim()).filter(Boolean); saveState();">${exp.missions.join('\n')}</textarea>
      <button onclick="removeExperience(${i})" class="mt-2 text-red-400 text-sm">🗑️ Supprimer</button>
    `));
  });
}
function addExperience() { state.experiences.push({ date: new Date().toISOString().slice(0,7), dateLabel: 'Date', titre: 'Nouveau poste', entreprise: '', missions: [] }); saveState(); renderExperiences(); }
function removeExperience(i) { state.experiences.splice(i,1); saveState(); renderExperiences(); }

function renderProjets() {
  const c = $('projets-container');
  c.innerHTML = '';
  state.projets.forEach((p, i) => {
    const isImg = p.icone && (p.icone.startsWith('data:image') || p.icone.startsWith('http'));
    const preview = isImg
      ? `<img src="${p.icone}" class="max-h-20 mx-auto mb-2 rounded-lg">`
      : `<div class="text-3xl text-center mb-2">${escapeHtml(p.icone)}</div>`;
    c.appendChild(createCard(`
      <div class="grid md:grid-cols-2 gap-2 mb-2">
        <input class="input-base" value="${escapeHtml(p.titre)}" onchange="state.projets[${i}].titre = this.value; saveState();">
        <input class="input-base" placeholder="https://github.com/..." value="${escapeHtml(p.lien)}" onchange="state.projets[${i}].lien = this.value; saveState();">
      </div>
      <textarea class="input-base mb-2" rows="2" onchange="state.projets[${i}].description = this.value; saveState();">${escapeHtml(p.description)}</textarea>
      <input class="input-base mb-2" placeholder="React, Laravel" value="${p.technos.join(', ')}" onchange="state.projets[${i}].technos = this.value.split(',').map(s=>s.trim()).filter(Boolean); saveState();">
      <div class="mb-2">
        ${preview}
        <div class="drop-zone" data-index="${i}">
          <p class="text-sm text-slate-400">📁 Glisse une image ou clique</p>
          <input type="file" accept="image/*" class="hidden" data-index="${i}">
        </div>
      </div>
      <button onclick="removeProjet(${i})" class="text-red-400 text-sm">🗑️ Supprimer</button>
    `));
  });

  $$('.drop-zone').forEach(zone => {
    const i = parseInt(zone.dataset.index);
    const input = zone.querySelector('input[type="file"]');
    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault(); zone.classList.remove('drag-over');
      const f = e.dataTransfer.files[0];
      if (f) handleImageUpload(f, (b64) => { state.projets[i].icone = b64; saveState(); renderProjets(); });
    });
    input.addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) handleImageUpload(f, (b64) => { state.projets[i].icone = b64; saveState(); renderProjets(); });
    });
  });
}
function addProjet() { state.projets.push({ icone: '🚀', titre: 'Nouveau projet', description: '', technos: [], lien: '' }); saveState(); renderProjets(); }
function removeProjet(i) { state.projets.splice(i,1); saveState(); renderProjets(); }

// Tabs
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-content').forEach(c => c.classList.add('hidden'));
    btn.classList.add('active');
    $('tab-' + btn.dataset.tab).classList.remove('hidden');
  });
});

// Export
$('btn-export').addEventListener('click', () => {
  const str = `/* CONFIGURATION GÉNÉRÉE LE ${new Date().toLocaleString('fr-FR')} */\n\nconst CONFIG = ${JSON.stringify(state, null, 2)};\n`;
  const blob = new Blob([str], { type: 'text/javascript' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'config.js';
  a.click();
  const btn = $('btn-export');
  btn.textContent = '✅ Téléchargé !';
  setTimeout(() => btn.textContent = '📥 Exporter config.js', 2000);
});

$('btn-save').addEventListener('click', () => {
  saveState();
  const btn = $('btn-save');
  btn.textContent = '✅ Sauvegardé !';
  setTimeout(() => btn.textContent = '💾 Sauvegarder', 1500);
});

$('btn-preview').addEventListener('click', () => {
  saveState();
  window.open('index.html', '_blank');
});
/* ============================================
   TÉMOIGNAGES / AVIS
   ============================================ */
function renderTemoignages() {
  const container = $('temoignages-container');
  if (!container) return;
  container.innerHTML = '';

  if (!state.temoignages) state.temoignages = [];

  state.temoignages.forEach((t, i) => {
    const linkedinPreview = t.linkedin
      ? `<p class="text-xs text-cyan-400 mt-1">🔗 linkedin.com/in/${escapeHtml(t.linkedin)}</p>`
      : '';

    container.appendChild(createCard(`
      <div class="grid md:grid-cols-2 gap-2 mb-2">
        <div>
          <label class="label-base">Nom</label>
          <input class="input-base" 
                 placeholder="Issam El Jaouhari" 
                 value="${escapeHtml(t.nom || '')}" 
                 onchange="state.temoignages[${i}].nom = this.value; saveState();">
        </div>
        <div>
          <label class="label-base">Initiales</label>
          <input class="input-base" 
                 placeholder="IJ" 
                 maxlength="2"
                 value="${escapeHtml(t.initiales || '')}" 
                 onchange="state.temoignages[${i}].initiales = this.value.toUpperCase(); saveState();">
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-2 mb-2">
        <div>
          <label class="label-base">Poste</label>
          <input class="input-base" 
                 placeholder="Full-Stack Developer" 
                 value="${escapeHtml(t.poste || '')}" 
                 onchange="state.temoignages[${i}].poste = this.value; saveState();">
        </div>
        <div>
          <label class="label-base">Entreprise</label>
          <input class="input-base" 
                 placeholder="GoToDev" 
                 value="${escapeHtml(t.entreprise || '')}" 
                 onchange="state.temoignages[${i}].entreprise = this.value; saveState();">
        </div>
      </div>

      <div class="mb-2">
        <label class="label-base">Citation</label>
        <textarea class="input-base" 
                  rows="3" 
                  placeholder="Oussama est un développeur rigoureux..."
                  onchange="state.temoignages[${i}].citation = this.value; saveState();">${escapeHtml(t.citation || '')}</textarea>
      </div>

      <div class="grid md:grid-cols-2 gap-2 mb-2">
        <div>
          <label class="label-base">Note (1 à 5)</label>
          <div class="flex gap-1 mt-1">
            ${[1,2,3,4,5].map(star => `
              <button type="button" 
                      onclick="setNote(${i}, ${star})" 
                      class="text-2xl transition-transform hover:scale-125 ${star <= (t.note || 5) ? 'text-yellow-400' : 'text-slate-600'}"
                      title="${star} étoile${star > 1 ? 's' : ''}">
                ★
              </button>
            `).join('')}
            <span class="ml-2 text-sm text-slate-400 self-center">${t.note || 5}/5</span>
          </div>
        </div>
        <div>
          <label class="label-base">LinkedIn (slug)</label>
          <input class="input-base" 
                 placeholder="issameljaouhari" 
                 value="${escapeHtml(t.linkedin || '')}" 
                 onchange="state.temoignages[${i}].linkedin = this.value; saveState();">
          ${linkedinPreview}
        </div>
      </div>

      <div class="flex justify-end">
        <button onclick="removeTemoignage(${i})" 
                class="text-red-400 text-sm hover:text-red-300">
          🗑️ Supprimer cet avis
        </button>
      </div>
    `));
  });

  if (state.temoignages.length === 0) {
    container.innerHTML = `<p class="text-center text-slate-500 py-6">Aucun avis pour le moment. Clique sur "+ Ajouter un avis".</p>`;
  }
}

function addTemoignage() {
  if (!state.temoignages) state.temoignages = [];
  state.temoignages.push({
    nom: 'Nouveau nom',
    poste: 'Poste',
    entreprise: '',
    citation: 'Citation à remplir...',
    initiales: 'NN',
    linkedin: '',
    note: 5
  });
  saveState();
  renderTemoignages();
}

function removeTemoignage(i) {
  if (!confirm('Supprimer cet avis ?')) return;
  state.temoignages.splice(i, 1);
  saveState();
  renderTemoignages();
}

function setNote(i, note) {
  state.temoignages[i].note = note;
  saveState();
  renderTemoignages();
}
/* ============================================
   BONUS — Modèle de demande d'avis
   ============================================ */
function showRequestTemplate() {
  const template = `Bonjour,

J'espère que tu vas bien. Je suis en train de finaliser mon portfolio et je serais très honoré si tu pouvais me laisser une courte recommandation.

Voici quelques questions pour t'aider :
- Dans quel contexte avons-nous collaboré ?
- Qu'est-ce que j'ai apporté concrètement ?
- Un point fort que tu retiens ?

Merci d'avance, ça m'aiderait beaucoup !

Oussama`;
  
  navigator.clipboard.writeText(template).then(() => {
    alert('✅ Modèle copié dans le presse-papiers !\n\nColle-le dans LinkedIn ou un email.');
  }).catch(() => {
    prompt('Copie ce texte :', template);
  });
}

// Init
loadState();
initSimpleFields();
renderStats();
renderCompetences();
renderExperiences();
renderProjets();
renderTemoignages();
updateSizeWarning();