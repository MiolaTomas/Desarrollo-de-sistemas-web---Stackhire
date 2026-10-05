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
function hasProfileText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
function calculateCandidateProfileCompletion(profile) {
  profile = profile && typeof profile === 'object' ? profile : {};
  const checks = [];
  const addTextCheck = value => checks.push(hasProfileText(value));
  const getStartedEntries = entries => Array.isArray(entries) ? entries.filter(entry => entry && typeof entry === 'object' && Object.values(entry).some(value => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (value && typeof value === 'object') return Boolean(value.data || value.name);
    return value === true;
  })) : [];
  const addEntryChecks = (entries, requiredFields, completionChecks = []) => {
    const startedEntries = getStartedEntries(entries);
    checks.push(startedEntries.length > 0);
    startedEntries.forEach(entry => {
      requiredFields.forEach(field => addTextCheck(entry[field]));
      completionChecks.forEach(check => checks.push(Boolean(check(entry))));
    });
  };

  [profile.firstName, profile.lastName, profile.email, profile.phone, profile.province, profile.city].forEach(addTextCheck);
  addEntryChecks(profile.education, ['institution', 'level', 'career', 'startDate'], [item => item.current === true || hasProfileText(item.endDate)]);
  addEntryChecks(profile.experience, ['position', 'company', 'description', 'startDate'], [item => item.current === true || hasProfileText(item.endDate)]);
  addEntryChecks(profile.languages, ['name', 'level']);
  addEntryChecks(profile.certifications, ['name', 'issuer'], [item => Boolean(item.attachment && hasProfileText(item.attachment.data))]);

  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const startedSkills = skills.filter(skill => hasProfileText(typeof skill === 'string' ? skill : skill && skill.name));
  checks.push(startedSkills.length > 0);
  skills.filter(skill => !hasProfileText(typeof skill === 'string' ? skill : skill && skill.name)).forEach(() => checks.push(false));
  startedSkills.forEach(() => checks.push(true));

  return checks.length ? Math.round(checks.filter(Boolean).length / checks.length * 100) : 0;
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
