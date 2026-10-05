// Apply flow and candidate application tracking for the frontend demo.
const candidateApplicationsBaseKey = 'stackhire-candidate-applications';
const applicationStatuses = { postulado: 'Postulado', visto: 'Visto', en_progreso: 'En progreso', finalista: 'Finalista' };

function getCandidateApplicationsStorageKey() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  return candidateApplicationsBaseKey + ':' + (email || 'demo-candidate');
}
function getCandidateApplications() {
  try {
    const applications = JSON.parse(localStorage.getItem(getCandidateApplicationsStorageKey()) || '[]');
    return Array.isArray(applications) ? applications : [];
  } catch (error) { return []; }
}
function openApplyModal() {
  if (currentJobId) openApplyModalForId(currentJobId);
}
function openApplyModalForId(id) {
  if (currentAuthenticatedUserType !== 'candidate') {
    showLogin();
    return;
  }
  const job = JOBS.find(item => item.id === Number(id));
  if (!job) return;
  if (!isJobVisibleToCandidates(job)) {
    showApplicationConfirmation('B\u00fasqueda inactiva', 'Esta oferta ya no est\u00e1 disponible para postularse.');
    return;
  }
  currentJobId = job.id;
  const applications = getCandidateApplications();
  const alreadyApplied = applications.some(application => Number(application.jobId) === job.id);
  if (!alreadyApplied) {
    applications.push({ jobId: job.id, status: 'postulado', appliedAt: new Date().toISOString() });
    try {
      localStorage.setItem(getCandidateApplicationsStorageKey(), JSON.stringify(applications));
    } catch (error) {
      showApplicationConfirmation('No se pudo guardar', 'Intenta nuevamente en unos momentos.');
      return;
    }
  }
  const heading = alreadyApplied ? 'Ya te postulaste a esta oferta' : '\u00a1Postulaci\u00f3n exitosa!';
  showApplicationConfirmation(heading, job.tituloOferta + ' \u00b7 ' + job.empresa);
}
function showApplicationConfirmation(heading, message) {
  const dialog = document.getElementById('apply-modal');
  document.getElementById('application-success-heading').textContent = heading;
  document.getElementById('application-success-message').textContent = message;
  if (!dialog.open) dialog.showModal();
}
function closeApplyModal() {
  const dialog = document.getElementById('apply-modal');
  if (dialog.open) dialog.close();
  document.body.style.overflow = '';
}
function withdrawCandidateApplication(jobId) {
  const remaining = getCandidateApplications().filter(application => Number(application.jobId) !== Number(jobId));
  try {
    localStorage.setItem(getCandidateApplicationsStorageKey(), JSON.stringify(remaining));
  } catch (error) {
    showApplicationConfirmation('No se pudo dar de baja', 'Intenta nuevamente en unos momentos.');
    return;
  }
  renderCandidateApplications();
}
function renderCandidateApplications() {
  const list = document.getElementById('applications-list');
  if (!list) return;
  const filter = document.getElementById('applications-status-filter').value;
  const applications = getCandidateApplications();
  const filtered = applications.filter(application => filter === 'all' || application.status === filter);
  if (!filtered.length) {
    list.innerHTML = applications.length
      ? '<div class="favorites-empty"><h2>No hay postulaciones en este estado</h2><p>Prueba con otro filtro para ver tus procesos.</p></div>'
      : '<div class="favorites-empty"><h2>Todav\u00eda no tienes postulaciones</h2><p>Cuando te postules a una oferta, podr\u00e1s seguir su estado aqu\u00ed.</p></div>';
    return;
  }
  list.innerHTML = filtered.map(application => {
    const job = JOBS.find(item => item.id === Number(application.jobId));
    if (!job) return '';
    const status = applicationStatuses[application.status] || applicationStatuses.postulado;
    const appliedDate = application.appliedAt ? new Date(application.appliedAt) : null;
    const appliedDateLabel = appliedDate && !Number.isNaN(appliedDate.getTime())
      ? appliedDate.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : 'Fecha no disponible';
    return '<article class="application-card"><div class="application-card-main">' +
      '<div class="application-card-title-row"><div><h3>' + job.tituloOferta + '</h3><p>' + job.empresa + ' \u00b7 ' + job.ciudad + ', ' + job.provincia + '</p></div><div class="application-status-group"><span class="application-status application-status-' + application.status + '">' + status + '</span><small class="application-applied-date">Postulado el ' + appliedDateLabel + '</small></div></div>' +
      '<p class="application-card-description">' + job.descripcion + '</p></div>' +
      '<div class="application-card-actions"><button type="button" class="application-view-button" onclick="showDetalle(' + job.id + ')">Ver oferta</button>' +
      '<button type="button" class="application-withdraw-button" onclick="withdrawCandidateApplication(' + job.id + ')">Dar de baja</button></div></article>';
  }).filter(Boolean).join('');
}
