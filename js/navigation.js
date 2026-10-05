// ============================================================
// navigation.js — Mostrar/ocultar secciones (SPA sin router) y buscador
// Depende de: state.js (variable 'state')
// ============================================================

// ── Page toggle ────────────────────────────
let candidateDashboardView = 'home';
const ALL_SECTIONS = ['landing-page','login-section','register-choice-section','candidate-register-section','company-register-section','search-results-section','empresas-section','detalle-section','candidate-dashboard','company-dashboard'];
function toggleDashboardMenu(button) {
  const sidebar = button.closest('.dashboard-sidebar');
  if (!sidebar) return;
  const open = sidebar.classList.toggle('is-menu-open');
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Cerrar menu' : 'Abrir menu');
}
function closeDashboardMenu(sidebar) {
  if (!sidebar) return;
  sidebar.classList.remove('is-menu-open');
  const button = sidebar.querySelector('.dashboard-menu-toggle');
  if (button) {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Abrir menu');
  }
}
document.addEventListener('click', event => {
  const navItem = event.target.closest('.dashboard-side-nav .dashboard-nav-item');
  if (navItem) closeDashboardMenu(navItem.closest('.dashboard-sidebar'));
  document.querySelectorAll('.dashboard-sidebar.is-menu-open').forEach(sidebar => {
    if (!sidebar.contains(event.target)) closeDashboardMenu(sidebar);
  });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelectorAll('.dashboard-sidebar.is-menu-open').forEach(closeDashboardMenu);
});
function hideAll() { restoreCandidateDetail(); restoreCandidateOffers(); ALL_SECTIONS.forEach(id => document.getElementById(id).classList.add('page-hidden')); document.body.classList.remove('dashboard-mode'); }

function showLanding() {
  hideAll();
  document.getElementById('landing-page').classList.remove('page-hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showLogin() {
  hideAll();
  document.getElementById('login-section').classList.remove('page-hidden');
  window.scrollTo({ top: 0 });
  document.getElementById('login-email').focus();
}
function showRegisterChoice() {
  hideAll();
  document.getElementById('register-choice-section').classList.remove('page-hidden');
  window.scrollTo({ top: 0 });
}
function showCandidateRegister() {
  hideAll();
  document.getElementById('candidate-register-section').classList.remove('page-hidden');
  window.scrollTo({ top: 0 });
  document.getElementById('candidate-name').focus();
}
function showCompanyRegister() {
  hideAll();
  document.getElementById('company-register-section').classList.remove('page-hidden');
  window.scrollTo({ top: 0 });
  document.getElementById('company-name').focus();
}
function selectRegistrationType(type) {
  const typeLabel = type === 'candidato' ? 'candidato' : 'empresa';
  document.getElementById('register-choice-status').textContent = `Elegiste registrarte como ${typeLabel}. Próximamente podrás completar tu perfil.`;
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
  if (document.body.classList.contains('dashboard-mode')) {
    if (candidateDashboardView === 'favorites') showCandidateFavorites();
    else showCandidateOffers();
    return;
  }
  hideAll();
  document.getElementById('search-results-section').classList.remove('page-hidden');
  window.scrollTo({ top: 0 });
}// ── Search trigger ─────────────────────────
function triggerSearch() {
  const q = document.getElementById('hero-search').value.trim();
  state.query = q;
  state.jobsPage = 1;
  document.getElementById('results-search').value = q;
  buildFilters();
  renderJobs();
  showResults();
}

function onSearchInput() {
  state.query = document.getElementById('results-search').value.trim();
  state.jobsPage = 1;
  renderJobs();
}

document.getElementById('hero-search').addEventListener('keydown', e => { if (e.key === 'Enter') triggerSearch(); });

function showCandidateDashboard(name = 'Tom\u00e1s') {
  hideAll();
  currentAuthenticatedUserType = 'candidate';
  document.getElementById('candidate-dashboard').classList.remove('page-hidden');
  document.body.classList.add('dashboard-mode');
  const displayName = getCandidateDisplayName(name);
  document.getElementById('dashboard-user-name').textContent = displayName;
  document.getElementById('dashboard-welcome-title').textContent = `Bienvenido, ${displayName}`;
  loadCandidateFavorites();
  renderCandidateDashboardHome();
  updateCandidateNotificationBadge();
  document.getElementById('dashboard-page-title').textContent = 'Panel de control';
  document.getElementById('dashboard-home-content').classList.remove('hidden');
  document.getElementById('dashboard-offers-slot').classList.add('hidden');
  document.getElementById('dashboard-detail-slot').classList.add('hidden');
  document.getElementById('dashboard-favorites-slot').classList.add('hidden');
  document.getElementById('dashboard-applications-slot').classList.add('hidden');
  document.getElementById('dashboard-notifications-slot').classList.add('hidden');
  document.getElementById('dashboard-curriculum-slot').classList.add('hidden');
  candidateDashboardView = 'home';
  document.querySelectorAll('#candidate-dashboard .dashboard-nav-item').forEach(button => button.classList.remove('active'));
  document.getElementById('dashboard-home-link').classList.add('active');
  window.scrollTo({ top: 0 });
}

function logoutCandidate() {
  currentAuthenticatedUserType = null;
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  showLanding();
}
function restoreCandidateOffers() {
  const section = document.getElementById('search-results-section');
  const placeholder = document.getElementById('search-results-placeholder');
  if (section && placeholder && section.parentElement !== placeholder.parentElement) {
    placeholder.parentElement.insertBefore(section, placeholder.nextSibling);
  }
  const label = document.getElementById('results-back-label');
  if (label) label.textContent = 'Volver al inicio';
}

function showCandidateOffers() {
  if (!document.body.classList.contains('dashboard-mode')) return;
  restoreCandidateDetail();
  const section = document.getElementById('search-results-section');
  const slot = document.getElementById('dashboard-offers-slot');
  document.getElementById('dashboard-home-content').classList.add('hidden');
  document.getElementById('dashboard-detail-slot').classList.add('hidden');
  document.getElementById('dashboard-favorites-slot').classList.add('hidden');
  document.getElementById('dashboard-applications-slot').classList.add('hidden');
  document.getElementById('dashboard-notifications-slot').classList.add('hidden');
  document.getElementById('dashboard-curriculum-slot').classList.add('hidden');
  candidateDashboardView = 'offers';
  slot.classList.remove('hidden');
  slot.appendChild(section);
  section.classList.remove('page-hidden');
  document.getElementById('dashboard-page-title').textContent = 'Ofertas Laborales';
  document.getElementById('results-back-label').textContent = 'Volver al panel';
  document.querySelectorAll('#candidate-dashboard .dashboard-nav-item').forEach(button => button.classList.remove('active'));
  document.getElementById('dashboard-offers-link').classList.add('active');
  renderJobs();
  window.scrollTo({ top: 0 });
}
function backFromResults() {
  if (document.body.classList.contains('dashboard-mode')) showCandidateDashboard();
  else showLanding();
}
function restoreCandidateDetail() {
  const section = document.getElementById('detalle-section');
  const placeholder = document.getElementById('detail-section-placeholder');
  if (section && placeholder && section.parentElement !== placeholder.parentElement) {
    placeholder.parentElement.insertBefore(section, placeholder.nextSibling);
    section.classList.add('page-hidden');
  }
}
function showCandidateFavorites() {
  if (!document.body.classList.contains('dashboard-mode')) return;
  restoreCandidateDetail();
  document.getElementById('dashboard-home-content').classList.add('hidden');
  document.getElementById('dashboard-offers-slot').classList.add('hidden');
  document.getElementById('dashboard-detail-slot').classList.add('hidden');
  document.getElementById('dashboard-curriculum-slot').classList.add('hidden');
  document.getElementById('dashboard-applications-slot').classList.add('hidden');
  document.getElementById('dashboard-notifications-slot').classList.add('hidden');
  document.getElementById('dashboard-favorites-slot').classList.remove('hidden');
  document.getElementById('dashboard-page-title').textContent = 'Favoritos';
  candidateDashboardView = 'favorites';
  document.querySelectorAll('#candidate-dashboard .dashboard-nav-item').forEach(button => button.classList.remove('active'));
  document.getElementById('dashboard-favorites-link').classList.add('active');
  renderFavoriteJobs();
  window.scrollTo({ top: 0 });
}
function showCandidateCurriculum() {
  if (!document.body.classList.contains('dashboard-mode')) return;
  restoreCandidateDetail();
  document.getElementById('dashboard-home-content').classList.add('hidden');
  document.getElementById('dashboard-offers-slot').classList.add('hidden');
  document.getElementById('dashboard-detail-slot').classList.add('hidden');
  document.getElementById('dashboard-favorites-slot').classList.add('hidden');
  document.getElementById('dashboard-applications-slot').classList.add('hidden');
  document.getElementById('dashboard-notifications-slot').classList.add('hidden');
  document.getElementById('dashboard-curriculum-slot').classList.remove('hidden');
  document.getElementById('dashboard-page-title').textContent = 'Mi Curriculum';
  candidateDashboardView = 'curriculum';
  document.querySelectorAll('#candidate-dashboard .dashboard-nav-item').forEach(button => button.classList.remove('active'));
  document.getElementById('dashboard-curriculum-link').classList.add('active');
  loadCandidateCurriculum();
  window.scrollTo({ top: 0 });
}
function showCandidateNotifications() {
  if (!document.body.classList.contains('dashboard-mode')) return;
  restoreCandidateDetail();
  ['dashboard-home-content','dashboard-offers-slot','dashboard-detail-slot','dashboard-favorites-slot','dashboard-curriculum-slot','dashboard-applications-slot'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById('dashboard-notifications-slot').classList.remove('hidden');
  document.getElementById('dashboard-page-title').textContent = 'Notificaciones';
  candidateDashboardView = 'notifications';
  document.querySelectorAll('#candidate-dashboard .dashboard-nav-item').forEach(button => button.classList.remove('active'));
  document.getElementById('dashboard-notifications-link').classList.add('active');
  markCandidateNotificationsRead();
  renderCandidateNotifications();
  window.scrollTo({ top: 0 });
}
function showCandidateApplications() {
  if (!document.body.classList.contains('dashboard-mode')) return;
  restoreCandidateDetail();
  document.getElementById('dashboard-home-content').classList.add('hidden');
  document.getElementById('dashboard-offers-slot').classList.add('hidden');
  document.getElementById('dashboard-detail-slot').classList.add('hidden');
  document.getElementById('dashboard-favorites-slot').classList.add('hidden');
  document.getElementById('dashboard-curriculum-slot').classList.add('hidden');
  document.getElementById('dashboard-applications-slot').classList.remove('hidden');
  document.getElementById('dashboard-notifications-slot').classList.add('hidden');
  document.getElementById('dashboard-page-title').textContent = 'Mis Postulaciones';
  candidateDashboardView = 'applications';
  document.querySelectorAll('#candidate-dashboard .dashboard-nav-item').forEach(button => button.classList.remove('active'));
  document.getElementById('dashboard-applications-link').classList.add('active');
  renderCandidateApplications();
  window.scrollTo({ top: 0 });
}
