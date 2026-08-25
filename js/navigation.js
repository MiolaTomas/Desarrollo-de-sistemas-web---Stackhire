// ============================================================
// navigation.js — Mostrar/ocultar secciones (SPA sin router) y buscador
// Depende de: state.js (variable 'state')
// ============================================================

// ── Page toggle ────────────────────────────
const ALL_SECTIONS = ['landing-page','search-results-section','empresas-section','detalle-section'];
function hideAll() { ALL_SECTIONS.forEach(id => document.getElementById(id).classList.add('page-hidden')); }

function showLanding() {
  hideAll();
  document.getElementById('landing-page').classList.remove('page-hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showResults() {
  hideAll();
  document.getElementById('search-results-section').classList.remove('page-hidden');
  window.scrollTo({ top: 0 });
}
function showEmpresas() {
  hideAll();
  document.getElementById('empresas-section').classList.remove('page-hidden');
  renderCompanies();
  window.scrollTo({ top: 0 });
}
function backToResults() {
  hideAll();
  document.getElementById('search-results-section').classList.remove('page-hidden');
  window.scrollTo({ top: 0 });
}

// ── Search trigger ─────────────────────────
function triggerSearch() {
  const q = document.getElementById('hero-search').value.trim();
  state.query = q;
  document.getElementById('results-search').value = q;
  buildFilters();
  renderJobs();
  showResults();
}

function onSearchInput() {
  state.query = document.getElementById('results-search').value.trim();
  renderJobs();
}

document.getElementById('hero-search').addEventListener('keydown', e => { if (e.key === 'Enter') triggerSearch(); });
