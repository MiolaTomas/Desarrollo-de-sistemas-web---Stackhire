// Dashboard home widgets and per-candidate favorite persistence.
function candidateFavoritesStorageKey() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  return 'stackhire-candidate-favorites:' + (email || 'demo-candidate');
}
function loadCandidateFavorites() {
  try {
    const ids = JSON.parse(localStorage.getItem(candidateFavoritesStorageKey()) || '[]');
    savedJobs.clear();
    if (Array.isArray(ids)) ids.forEach(id => { const n = Number(id); if (JOBS.some(job => job.id === n)) savedJobs.add(n); });
  } catch (error) { savedJobs.clear(); }
}
function persistCandidateFavorites() {
  try { localStorage.setItem(candidateFavoritesStorageKey(), JSON.stringify([...savedJobs])); } catch (error) {}
}
function getDashboardProfile() {
  try { return JSON.parse(localStorage.getItem(candidateProfileStorageKey) || '{}'); } catch (error) { return {}; }
}
function calculateCandidateProfileCompletion(profile) {
  const sections = [
    Boolean(profile.firstName && profile.lastName && profile.email),
    Boolean(profile.province && profile.city),
    Array.isArray(profile.education) && profile.education.some(item => item.institution && item.level),
    Array.isArray(profile.experience) && profile.experience.some(item => item.position && item.company),
    Array.isArray(profile.languages) && profile.languages.some(item => item.name && item.level),
    Array.isArray(profile.certifications) && profile.certifications.some(item => item.name && item.issuer),
    Array.isArray(profile.skills) && profile.skills.some(item => typeof item === 'string' ? item.trim() : item && item.name && item.name.trim())
  ];
  return Math.round(sections.filter(Boolean).length / sections.length * 100);
}
function renderCandidateDashboardHome() {
  const percentElement = document.getElementById('dashboard-profile-percent');
  if (!percentElement) return;
  const percent = calculateCandidateProfileCompletion(getDashboardProfile());
  percentElement.textContent = percent + '%';
  document.getElementById('dashboard-profile-progress').setAttribute('aria-valuenow', String(percent));
  document.getElementById('dashboard-profile-progress-bar').style.width = percent + '%';
  document.getElementById('dashboard-profile-summary').textContent = percent === 100
    ? 'Tu curriculum tiene todas las secciones principales completas.'
    : percent === 0 ? 'Completa las secciones principales de tu curriculum.'
    : 'Vas por buen camino: completa las secciones que faltan de tu curriculum.';
  const applications = getCandidateApplications();
  const counts = { postulado: 0, visto: 0, en_progreso: 0, finalista: 0 };
  applications.forEach(application => { if (Object.prototype.hasOwnProperty.call(counts, application.status)) counts[application.status]++; });
  Object.entries(counts).forEach(([status,count]) => { document.getElementById('dashboard-count-' + status).textContent = String(count); });
  document.getElementById('dashboard-applications-total').textContent = applications.length + (applications.length === 1 ? ' postulacion' : ' postulaciones');
  document.getElementById('dashboard-favorites-count').textContent = String(savedJobs.size);
  const recent = [...applications].sort((a,b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0)).slice(0,3);
  const list = document.getElementById('dashboard-recent-activity');
  if (!recent.length) { list.innerHTML = '<p class="dashboard-activity-empty">Todavia no tienes postulaciones. Cuando te postules a una oferta, aparecera aqui.</p>'; return; }
  list.innerHTML = recent.map(application => {
    const job = JOBS.find(item => item.id === Number(application.jobId));
    if (!job) return '';
    const status = applicationStatuses[application.status] || applicationStatuses.postulado;
    const date = application.appliedAt ? new Date(application.appliedAt) : null;
    const dateLabel = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('es-MX',{day:'numeric',month:'short'}) : '';
    return '<button type="button" class="dashboard-activity-item" onclick="showCandidateApplications()"><span class="dashboard-activity-mark" aria-hidden="true">&#8599;</span><span class="dashboard-activity-job"><strong>' + job.tituloOferta + '</strong><small>' + job.empresa + (dateLabel ? ' &middot; ' + dateLabel : '') + '</small></span><span class="application-status application-status-' + application.status + '">' + status + '</span></button>';
  }).filter(Boolean).join('');
}
function openApplicationsWithFilter(status) {
  showCandidateApplications();
  document.getElementById('applications-status-filter').value = status;
  renderCandidateApplications();
}