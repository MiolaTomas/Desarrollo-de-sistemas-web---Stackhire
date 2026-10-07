// ============================================================
// navigation.js — Mostrar/ocultar secciones (SPA sin router) y buscador
// Depende de: state.js (variable 'state')
// ============================================================

// ── Page toggle ────────────────────────────
let candidateDashboardView = 'home';
let pendingLogoutType = null;
let pendingAccountDeletion = null;
const ALL_SECTIONS = ['landing-page','login-section','register-choice-section','candidate-register-section','company-register-section','search-results-section','empresas-section','detalle-section','candidate-dashboard','company-dashboard'];
function toggleDashboardMenu(button) {
  const sidebar = button.closest('.dashboard-sidebar');
  if (!sidebar) return;
  const open = sidebar.classList.toggle('is-menu-open');
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Cerrar menu' : 'Abrir menu');
}
function toggleLandingMenu() {
  const nav = document.getElementById('landing-navbar');
  const button = document.getElementById('landing-menu-toggle');
  const menu = document.getElementById('landing-mobile-menu');
  const isOpen = nav.classList.toggle('is-mobile-menu-open');
  button.setAttribute('aria-expanded', String(isOpen));
  button.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  menu.setAttribute('aria-hidden', String(!isOpen));
  document.body.classList.toggle('landing-menu-open', isOpen);
  if (isOpen) menu.querySelector('.landing-mobile-nav-link').focus();
}
function closeLandingMenu() {
  const nav = document.getElementById('landing-navbar');
  const button = document.getElementById('landing-menu-toggle');
  const menu = document.getElementById('landing-mobile-menu');
  if (!nav || !button || !menu) return;
  const wasOpen = nav.classList.contains('is-mobile-menu-open');
  nav.classList.remove('is-mobile-menu-open');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Abrir menú');
  menu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('landing-menu-open');
  if (wasOpen) button.focus();
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
  if (event.key === 'Escape') {
    document.querySelectorAll('.dashboard-sidebar.is-menu-open').forEach(closeDashboardMenu);
    closeLandingMenu();
  }
});
function hideAll() { restoreCandidateDetail(); restoreCandidateOffers(); ALL_SECTIONS.forEach(id => document.getElementById(id).classList.add('page-hidden')); document.body.classList.remove('dashboard-mode'); }

function showLanding() {
  hideAll();
  document.getElementById('landing-page').classList.remove('page-hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showLogin() {
  hideAll();
  renderSavedAccountShortcuts();
  document.getElementById('login-section').classList.remove('page-hidden');
  window.scrollTo({ top: 0 });
  document.getElementById('login-email').focus();
}
function showLogoutConfirmation(type) {
  if (type !== 'candidate' && type !== 'company') return;
  pendingLogoutType = type;
  const dialog = document.getElementById('logout-confirmation-modal');
  if (!dialog.open) dialog.showModal();
}
function cancelLogoutConfirmation() {
  pendingLogoutType = null;
  const dialog = document.getElementById('logout-confirmation-modal');
  if (dialog.open) dialog.close();
}
document.getElementById('logout-confirmation-modal').addEventListener('cancel', () => {
  pendingLogoutType = null;
});
function confirmLogout() {
  const type = pendingLogoutType;
  if (type !== 'candidate' && type !== 'company') return;
  pendingLogoutType = null;
  const dialog = document.getElementById('logout-confirmation-modal');
  if (dialog.open) dialog.close();
  if (type === 'candidate') logoutCandidate();
  else logoutCompany();
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
  setAuthenticatedAccount('candidate', currentAuthenticatedUserEmail || demoAccountEmails.candidate, currentAuthenticatedUserName || name);
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
  clearAuthenticatedAccount();
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
function showCandidateSettings() {
  if (!document.body.classList.contains('dashboard-mode')) return;
  document.querySelectorAll('#candidate-dashboard .dashboard-nav-item').forEach(button => button.classList.remove('active'));
  document.getElementById('dashboard-settings-link').classList.add('active');
  showAccountSettings('candidate');
}

function showAccountSettings(type) {
  if (currentAuthenticatedUserType !== type) return;
  const email = getCurrentAccountEmail(type);
  const account = readLocalAccounts().find(item => item.email === email && item.type === type);
  const name = type === 'candidate' ? getCandidateDisplayName(currentAuthenticatedUserName) : companyDisplayName();
  const dialog = document.getElementById('account-settings-modal');
  document.getElementById('account-settings-heading').textContent = 'Configuración de ' + (type === 'candidate' ? 'candidato' : 'empresa');
  document.getElementById('account-settings-description').textContent = `${name} · ${email}`;
  document.getElementById('account-settings-delete-button').disabled = !account;
  document.getElementById('account-settings-note').textContent = account
    ? 'La cuenta y sus datos guardados localmente se eliminarán de este navegador.'
    : 'Las cuentas de demostración incluidas no se pueden eliminar.';
  document.getElementById('account-settings-edit-button').textContent = type === 'candidate' ? 'Editar currículum' : 'Editar perfil de empresa';
  if (!dialog.open) dialog.showModal();
}

function closeAccountSettings() {
  const dialog = document.getElementById('account-settings-modal');
  if (dialog.open) dialog.close();
}

function openAccountProfileEditor() {
  const type = currentAuthenticatedUserType;
  closeAccountSettings();
  if (type === 'candidate') showCandidateCurriculum();
  else if (type === 'company') showCompanyProfile();
}

function showAccountDeletionConfirmation() {
  const type = currentAuthenticatedUserType;
  const email = getCurrentAccountEmail(type);
  const account = readLocalAccounts().find(item => item.email === email && item.type === type);
  if (!account) return;
  pendingAccountDeletion = { type, email };
  closeAccountSettings();
  document.getElementById('account-delete-confirmation-message').textContent = `Se eliminarán la cuenta de ${account.name} y sus datos guardados en este navegador. Esta acción no se puede deshacer.`;
  document.getElementById('account-delete-confirmation-status').textContent = '';
  document.getElementById('account-delete-confirmation-modal').showModal();
}

function cancelAccountDeletion() {
  pendingAccountDeletion = null;
  const dialog = document.getElementById('account-delete-confirmation-modal');
  if (dialog.open) dialog.close();
}

function confirmAccountDeletion() {
  if (!pendingAccountDeletion || pendingAccountDeletion.email !== getCurrentAccountEmail(pendingAccountDeletion.type)) return;
  const result = deleteLocalAccount(pendingAccountDeletion.type, pendingAccountDeletion.email);
  if (!result.ok) {
    document.getElementById('account-delete-confirmation-status').textContent = 'No se pudo eliminar la cuenta. Inténtalo de nuevo.';
    return;
  }
  pendingAccountDeletion = null;
  const dialog = document.getElementById('account-delete-confirmation-modal');
  if (dialog.open) dialog.close();
  if (currentAuthenticatedUserType === 'candidate') savedJobs.clear();
  clearAuthenticatedAccount();
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  syncCompanyOffersToJobCatalog();
  buildFilters();
  renderJobs();
  showLanding();
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
