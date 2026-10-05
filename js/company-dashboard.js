const companyProfileStorageKey = 'stackhire-company-profile';
let companyProfilePhoto = '';
let companyProfilePhotoName = '';

function readCompanyProfile() {
  try { return JSON.parse(localStorage.getItem(companyProfileStorageKey) || '{}'); }
  catch (error) { return {}; }
}

function companyDisplayName(profile = readCompanyProfile()) {
  return profile.name || 'Mercado Libre';
}

function updateCompanyDashboardHeader(profile = readCompanyProfile()) {
  const name = companyDisplayName(profile);
  document.getElementById('company-dashboard-user-name').textContent = name;
  document.getElementById('company-dashboard-welcome-title').textContent = 'Bienvenido, ' + name;
  document.getElementById('company-dashboard-avatar').textContent = name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

function showCompanyDashboard() {
  hideAll();
  currentAuthenticatedUserType = 'company';
  document.getElementById('company-dashboard').classList.remove('page-hidden');
  document.body.classList.add('dashboard-mode');
  updateCompanyDashboardHeader();
  setCompanyDashboardView('company-dashboard-home', 'Inicio');
}

function showCompanyProfile() {
  if (!document.body.classList.contains('dashboard-mode') || document.getElementById('company-dashboard').classList.contains('page-hidden')) return;
  setCompanyDashboardView('company-dashboard-profile', 'Perfil');
  loadCompanyProfile();
}

function logoutCompany() {
  currentAuthenticatedUserType = null;
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  showLanding();
}

function loadCompanyProfile() {
  const profile = readCompanyProfile();
  document.getElementById('company-profile-name').value = profile.name || 'Mercado Libre';
  document.getElementById('company-profile-cuit').value = profile.cuit || '';
  document.getElementById('company-profile-industry').value = profile.industry || '';
  document.getElementById('company-profile-size').value = profile.size || '';
  document.getElementById('company-profile-description').value = profile.description || '';
  document.getElementById('company-profile-email').value = profile.email || 'mercadolibre@gmail.com';
  document.getElementById('company-profile-phone').value = profile.phone || '';
  document.getElementById('company-profile-website').value = profile.website || '';
  document.getElementById('company-profile-linkedin').value = profile.linkedin || '';
  document.getElementById('company-profile-address').value = profile.address || '';
  populateCompanyLocations(profile.province || '', profile.city || '');
  companyProfilePhoto = profile.photo || '';
  companyProfilePhotoName = profile.photoName || '';
  updateCompanyPhotoPreview();
  document.getElementById('company-profile-status').textContent = '';
}

function populateCompanyLocations(savedProvince = '', savedCity = '') {
  const provinceSelect = document.getElementById('company-profile-province');
  provinceSelect.replaceChildren(new Option('Selecciona una provincia', ''));
  Object.keys(ARGENTINA_LOCATIONS).forEach(province => provinceSelect.add(new Option(province, province)));
  if (savedProvince && !Object.prototype.hasOwnProperty.call(ARGENTINA_LOCATIONS, savedProvince)) provinceSelect.add(new Option(savedProvince, savedProvince));
  provinceSelect.value = savedProvince;
  updateCompanyCities(savedCity);
}

function updateCompanyCities(savedCity = '') {
  const province = document.getElementById('company-profile-province').value;
  const citySelect = document.getElementById('company-profile-city');
  const cities = ARGENTINA_LOCATIONS[province] || [];
  citySelect.replaceChildren(new Option(province ? 'Selecciona una ciudad' : 'Primero selecciona una provincia', ''));
  cities.forEach(city => citySelect.add(new Option(city, city)));
  if (savedCity && !cities.includes(savedCity)) citySelect.add(new Option(savedCity, savedCity));
  citySelect.disabled = !province;
  citySelect.value = savedCity && (cities.includes(savedCity) || !cities.length) ? savedCity : '';
}

function previewCompanyPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('company-profile-status');
  if (!file.type.startsWith('image/')) {
    status.textContent = 'Selecciona un archivo de imagen.';
    event.target.value = '';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    status.textContent = 'La imagen supera el l\u00edmite de 2 MB.';
    event.target.value = '';
    return;
  }
  const previousName = companyProfilePhotoName;
  companyProfilePhotoName = file.name;
  document.getElementById('company-photo-upload-title').textContent = 'Cargando imagen...';
  document.getElementById('company-photo-upload-hint').textContent = file.name;
  const reader = new FileReader();
  reader.onload = () => {
    companyProfilePhoto = reader.result;
    updateCompanyPhotoPreview();
  };
  reader.onerror = () => {
    companyProfilePhotoName = previousName;
    updateCompanyPhotoPreview();
    status.textContent = 'No se pudo leer la imagen.';
  };
  reader.readAsDataURL(file);
}

function updateCompanyPhotoPreview() {
  const image = document.getElementById('company-profile-photo-preview');
  const placeholder = document.getElementById('company-profile-photo-placeholder');
  const clearButton = document.getElementById('company-profile-photo-clear');
  if (companyProfilePhoto) {
    image.src = companyProfilePhoto;
    image.classList.remove('hidden');
    placeholder.classList.add('hidden');
    clearButton.classList.remove('hidden');
    document.getElementById('company-photo-upload-title').textContent = 'Imagen seleccionada';
    document.getElementById('company-photo-upload-hint').textContent = companyProfilePhotoName || 'Guardada en este navegador.';
    document.getElementById('company-photo-upload-action').textContent = 'Cambiar imagen';
  } else {
    image.removeAttribute('src');
    image.classList.add('hidden');
    placeholder.classList.remove('hidden');
    clearButton.classList.add('hidden');
    document.getElementById('company-photo-upload-title').textContent = 'Subir imagen de empresa';
    document.getElementById('company-photo-upload-hint').textContent = 'JPG, PNG o similar \u00b7 hasta 2 MB';
    document.getElementById('company-photo-upload-action').textContent = 'Elegir imagen';
  }
}

function clearCompanyPhoto() {
  companyProfilePhoto = '';
  companyProfilePhotoName = '';
  document.getElementById('company-profile-photo-input').value = '';
  updateCompanyPhotoPreview();
}

function saveCompanyProfile(event) {
  event.preventDefault();
  const form = document.getElementById('company-profile-form');
  if (!form.reportValidity()) return;
  const profile = Object.fromEntries(new FormData(form).entries());
  profile.photo = companyProfilePhoto;
  profile.photoName = companyProfilePhotoName;
  try {
    localStorage.setItem(companyProfileStorageKey, JSON.stringify(profile));
    updateCompanyDashboardHeader(profile);
    document.getElementById('company-profile-status').textContent = 'El perfil de tu empresa se guard\u00f3 en este navegador.';
  } catch (error) {
    document.getElementById('company-profile-status').textContent = 'No se pudo guardar. Prueba con una imagen m\u00e1s peque\u00f1a.';
  }
}

const companyOffersStorageKey = 'stackhire-company-offers';
const companyOfferStatusesKey = 'stackhire-company-offer-statuses';
const companyOfferOverridesKey = 'stackhire-company-offer-overrides';
const companyOfferDeletedKey = 'stackhire-company-offer-deleted';
let editingCompanyOfferId = null;

function readStoredCompanyValue(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value === null ? fallback : value;
  } catch (error) { return fallback; }
}
function readCompanyOffers() {
  const offers = readStoredCompanyValue(companyOffersStorageKey, []);
  return Array.isArray(offers) ? offers : [];
}
function readCompanyOfferStatuses() {
  const value = readStoredCompanyValue(companyOfferStatusesKey, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function readCompanyOfferOverrides() {
  const value = readStoredCompanyValue(companyOfferOverridesKey, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function readDeletedCompanyOfferIds() {
  const ids = readStoredCompanyValue(companyOfferDeletedKey, []);
  return Array.isArray(ids) ? ids.map(Number) : [];
}
function isCompanyOfferDeleted(id) {
  return readDeletedCompanyOfferIds().includes(Number(id));
}
function getCompanyOfferStatus(offer) {
  const statuses = readCompanyOfferStatuses();
  const key = String(offer.id);
  if (Object.prototype.hasOwnProperty.call(statuses, key)) return statuses[key] === 'active';
  return offer.active !== false;
}
function isJobVisibleToCandidates(job) {
  if (!job) return false;
  if (job.companyManaged || job.companySeed || job.empresa === 'Mercado Libre' || readCompanyOffers().some(offer => Number(offer.id) === Number(job.id))) {
    return !isCompanyOfferDeleted(job.id) && getCompanyOfferStatus(job);
  }
  return job.active !== false;
}
function getCompanySeedJobs() {
  return JOBS.filter(job => job.companySeed || (!job.companyManaged && job.empresa === 'Mercado Libre'));
}
function getCompanyOwnedOffers() {
  const companyName = companyDisplayName();
  const overrides = readCompanyOfferOverrides();
  const samples = getCompanySeedJobs()
    .filter(job => !isCompanyOfferDeleted(job.id))
    .map(job => ({ ...job, ...(overrides[String(job.id)] || {}), empresa: companyName, companyManaged: true, companySeed: true }));
  const created = readCompanyOffers()
    .filter(offer => !isCompanyOfferDeleted(offer.id))
    .map(offer => ({ ...offer, companyManaged: true }));
  return [...created, ...samples].map(offer => ({ ...offer, active: getCompanyOfferStatus(offer) }));
}
function syncCompanyOffersToJobCatalog() {
  const overrides = readCompanyOfferOverrides();
  getCompanySeedJobs().forEach(job => {
    Object.assign(job, overrides[String(job.id)] || {}, {
      empresa: companyDisplayName(), companyManaged: true, companySeed: true,
      active: getCompanyOfferStatus({ ...job, ...(overrides[String(job.id)] || {}) })
    });
  });
  readCompanyOffers().forEach(offer => {
    const normalized = { ...offer, companyManaged: true, active: getCompanyOfferStatus(offer), tecnologias: Array.isArray(offer.tecnologias) ? offer.tecnologias : [] };
    const index = JOBS.findIndex(job => Number(job.id) === Number(offer.id));
    if (index < 0) JOBS.push(normalized);
    else Object.assign(JOBS[index], normalized);
  });
}
function setCompanyDashboardView(view, title) {
  ['company-dashboard-home', 'company-dashboard-profile', 'company-dashboard-offers', 'company-dashboard-offer-form', 'company-dashboard-offer-detail']
    .forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(view).classList.remove('hidden');
  document.getElementById('company-dashboard-page-title').textContent = title;
  document.querySelectorAll('#company-dashboard .dashboard-nav-item').forEach(button => button.classList.remove('active'));
  const activeId = view === 'company-dashboard-home' ? 'company-dashboard-home-link'
    : view === 'company-dashboard-profile' ? 'company-dashboard-profile-link'
      : ['company-dashboard-offers', 'company-dashboard-offer-form', 'company-dashboard-offer-detail'].includes(view) ? 'company-dashboard-offers-link' : '';
  if (activeId) document.getElementById(activeId).classList.add('active');
  window.scrollTo({ top: 0 });
}
function showCompanyOffers() {
  if (!document.body.classList.contains('dashboard-mode') || document.getElementById('company-dashboard').classList.contains('page-hidden')) return;
  setCompanyDashboardView('company-dashboard-offers', 'Ofertas laborales');
  renderCompanyOffers();
}
function showCompanyOfferForm(id = null) {
  if (!document.body.classList.contains('dashboard-mode') || document.getElementById('company-dashboard').classList.contains('page-hidden')) return;
  const form = document.getElementById('company-offer-form');
  form.reset();
  editingCompanyOfferId = id === null ? null : Number(id);
  const offer = editingCompanyOfferId === null ? null : getCompanyOwnedOffers().find(item => Number(item.id) === editingCompanyOfferId);
  if (offer) {
    form.elements.namedItem('title').value = offer.tituloOferta || '';
    form.elements.namedItem('description').value = offer.descripcion || '';
    populateCompanyOfferLocations(offer.provincia || '', offer.ciudad || '');
    form.elements.namedItem('schedule').value = offer.jornada || '';
    form.elements.namedItem('contract').value = offer.tipoContrato || '';
    form.elements.namedItem('modality').value = offer.modalidad || '';
    form.elements.namedItem('shift').value = offer.tipoTurno || '';
    form.elements.namedItem('startTime').value = offer.horarioEntrada || '';
    form.elements.namedItem('endTime').value = offer.horarioSalida || '';
    form.elements.namedItem('experience').value = offer.añosExperiencia ?? '';
    form.elements.namedItem('salary').value = offer.salarioMin ?? offer.salary ?? '';
  } else { populateCompanyOfferLocations(); }
  document.getElementById('company-offer-form-title').textContent = offer ? 'Editar oferta laboral' : 'Crear oferta laboral';
  document.getElementById('company-offer-form-description').textContent = offer ? 'Actualiza los datos de esta oportunidad.' : 'Completa los datos para agregar una nueva oferta a tu empresa.';
  document.getElementById('company-offer-submit').textContent = offer ? 'Guardar cambios' : 'Guardar oferta';
  document.getElementById('company-offer-status').textContent = '';
  document.getElementById('company-offer-demo-status').textContent = '';
  setCompanyDashboardView('company-dashboard-offer-form', offer ? 'Editar oferta' : 'Crear oferta');
}
function companyOfferLogo(name) {
  return (name || 'ML').trim().split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase();
}
function escapeCompanyOfferText(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
}
function formatCompanyOfferSalary(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? '$' + amount.toLocaleString('es-AR') + ' /mes' : 'Sueldo a convenir';
}
function renderCompanyOffers() {
  const list = document.getElementById('company-offers-list');
  const offers = getCompanyOwnedOffers();
  if (!offers.length) {
    list.innerHTML = '<tr><td class="company-offers-empty-cell" colspan="6"><div class="company-offers-empty"><h2>Todav\u00eda no creaste ofertas</h2><p>Cuando agregues una oportunidad, aparecer\u00e1 aqu\u00ed.</p><button type="button" class="company-create-offer-button" onclick="showCompanyOfferForm()">Crear nueva oferta</button></div></td></tr>';
    return;
  }
  list.innerHTML = offers.map(offer => {
    const id = Number(offer.id);
    const active = getCompanyOfferStatus(offer);
    const title = escapeCompanyOfferText(offer.tituloOferta);
    const location = escapeCompanyOfferText([offer.ciudad, offer.provincia].filter(Boolean).join(', '));
    return '<tr><td><button type="button" class="company-offer-title-link" onclick="showCompanyOfferDetail(' + id + ')">' + title + '</button><small class="company-offer-company-name">' + escapeCompanyOfferText(offer.empresa) + '</small></td><td>' + location + '</td><td><button type="button" class="company-offer-table-button" onclick="showCompanyOfferDetail(' + id + ')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>Ver detalle</button></td><td><button type="button" class="company-offer-table-button" onclick="showCompanyOfferApplicants(' + id + ')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>Ver postulantes</button></td><td><select class="company-offer-status-select ' + (active ? 'is-active' : 'is-inactive') + '" aria-label="Estado de ' + title + '" onchange="updateCompanyOfferStatus(' + id + ', this.value)"><option value="active"' + (active ? ' selected' : '') + '>Activa</option><option value="inactive"' + (!active ? ' selected' : '') + '>Inactiva</option></select></td><td><div class="company-offer-row-actions"><button type="button" class="company-offer-icon-button" aria-label="Editar ' + title + '" title="Editar oferta" onclick="showCompanyOfferForm(' + id + ')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg></button><button type="button" class="company-offer-icon-button is-delete" aria-label="Eliminar ' + title + '" title="Eliminar oferta" onclick="deleteCompanyOffer(' + id + ')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6m4 4v6m4-6v6"/></svg></button></div></td></tr>';
  }).join('');
}
function getCompanyOfferApplicants(id) {
  const applicants = [];
  const prefix = 'stackhire-candidate-applications:';
  for (let index = 0; index < localStorage.length; index++) {
    const storageKey = localStorage.key(index);
    if (!storageKey || !storageKey.startsWith(prefix)) continue;
    try {
      const applications = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(applications)) continue;
      const application = applications.find(item => Number(item.jobId) === Number(id));
      if (!application) continue;
      const profile = readStoredCompanyValue('stackhire-candidate-profile', {});
      const email = storageKey.slice(prefix.length);
      const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || (email === 'tomasmiola@gmail.com' ? 'Tomás Miola' : email.split('@')[0]);
      applicants.push({ storageKey, email, name, application });
    } catch (error) {}
  }
  return applicants;
}
function showCompanyOfferApplicants(id) {
  const offer = getCompanyOwnedOffers().find(item => Number(item.id) === Number(id));
  if (!offer) return;
  document.getElementById('company-offer-applicants-heading').textContent = 'Postulantes';
  document.getElementById('company-offer-applicants-subtitle').textContent = offer.tituloOferta;
  renderCompanyOfferApplicants(id);
  document.getElementById('company-offer-applicants-modal').showModal();
}
let activeCompanyOfferApplicants = [];
let activeCompanyApplicantsOfferId = null;
function renderCompanyOfferApplicants(id) {
  const container = document.getElementById('company-offer-applicants-content');
  activeCompanyApplicantsOfferId = Number(id);
  activeCompanyOfferApplicants = getCompanyOfferApplicants(id);
  if (!activeCompanyOfferApplicants.length) {
    container.innerHTML = '<div class="company-applicants-empty"><span aria-hidden="true">&#128100;</span><h3>A&uacute;n no hay postulantes</h3><p>Cuando alguien se postule a esta oferta, aparecer&aacute; aqu&iacute;.</p></div>';
    return;
  }
  container.innerHTML = '<div class="company-applicants-table-wrap"><table class="company-applicants-table"><thead><tr><th>Candidato</th><th>Fecha</th><th>Estado</th><th>Perfil</th><th>Entrevista</th></tr></thead><tbody>' + activeCompanyOfferApplicants.map(({ storageKey, email, name, application }, index) => {
    const date = application.appliedAt ? new Date(application.appliedAt) : null;
    const dateLabel = date && !Number.isNaN(date.getTime()) ? date.toLocaleString('es-AR', { dateStyle:'short', timeStyle:'short' }) : 'No disponible';
    const status = applicationStatuses[application.status] ? application.status : 'postulado';
    const interviewDate = application.interview?.scheduledAt ? new Date(application.interview.scheduledAt) : null;
    const interviewLabel = interviewDate && !Number.isNaN(interviewDate.getTime()) ? interviewDate.toLocaleString('es-AR', { dateStyle:'short', timeStyle:'short' }) : '';
    return '<tr><td><strong>' + escapeCompanyOfferText(name) + '</strong><small>' + escapeCompanyOfferText(email) + '</small></td><td>' + dateLabel + '</td><td><select class="company-applicant-status-select application-status-' + status + '" aria-label="Estado de ' + escapeCompanyOfferText(name) + '" onchange="updateCompanyApplicantStatus(\'' + storageKey + '\',' + Number(id) + ',this.value)"><option value="postulado"' + (status === 'postulado' ? ' selected' : '') + '>Postulado</option><option value="visto"' + (status === 'visto' ? ' selected' : '') + '>Visto</option><option value="en_progreso"' + (status === 'en_progreso' ? ' selected' : '') + '>En proceso</option><option value="finalista"' + (status === 'finalista' ? ' selected' : '') + '>Finalista</option></select></td><td><button type="button" class="company-applicant-profile-button" onclick="showCompanyApplicantProfile(' + index + ')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>Ver perfil</button></td><td><button type="button" class="company-interview-button" onclick="showCompanyInterviewScheduler(' + index + ')"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>' + (interviewDate ? 'Reprogramar' : 'Coordinar entrevista') + '</button>' + (interviewLabel ? '<small class="company-interview-date">' + interviewLabel + '</small>' : '') + '</td></tr>';
  }).join('') + '</tbody></table></div>';
}
function showCompanyInterviewScheduler(index) {
  const applicant = activeCompanyOfferApplicants[index];
  if (!applicant) return;
  const offer = getCompanyOwnedOffers().find(item => Number(item.id) === activeCompanyApplicantsOfferId);
  if (!offer) return;
  const previous = applicant.application.interview?.scheduledAt ? new Date(applicant.application.interview.scheduledAt) : null;
  const savedInterview = applicant.application.interview || {};
  const previousValue = previous && !Number.isNaN(previous.getTime()) ? new Date(previous.getTime() - previous.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
  const minimum = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  document.getElementById('company-offer-applicants-heading').textContent = 'Coordinar entrevista';
  document.getElementById('company-offer-applicants-subtitle').textContent = applicant.name + ' - ' + offer.tituloOferta;
  document.getElementById('company-offer-applicants-content').innerHTML = '<form class="company-interview-form" onsubmit="saveCompanyInterview(event,' + index + ')"><label for="company-interview-datetime">Fecha y hora</label><input id="company-interview-datetime" name="scheduledAt" type="datetime-local" min="' + minimum + '" value="' + previousValue + '" required><label for="company-interview-description">Descripci&oacute;n <span>(opcional)</span></label><textarea id="company-interview-description" name="description" rows="4" maxlength="500" placeholder="Agrega detalles para el candidato">' + escapeCompanyOfferText(savedInterview.description || '') + '</textarea><label for="company-interview-meet-link">Link de Google Meet <span>(opcional)</span></label><input id="company-interview-meet-link" name="meetLink" type="text" inputmode="url" value="' + escapeCompanyOfferText(savedInterview.meetLink || '') + '" placeholder="https://meet.google.com/abc-defg-hij"><p class="company-interview-help">Selecciona el horario acordado y agrega los detalles que quieras compartir.</p><div class="company-interview-form-actions"><button type="button" class="company-delete-cancel-button" onclick="renderCompanyOfferApplicants(activeCompanyApplicantsOfferId)">Cancelar</button><button type="submit" class="company-interview-save-button">Aceptar</button></div></form>';
}
function saveCompanyInterview(event, index) {
  event.preventDefault();
  const applicant = activeCompanyOfferApplicants[index];
  const field = document.getElementById('company-interview-datetime');
  const meetField = document.getElementById('company-interview-meet-link');
  if (!applicant || !field || !meetField) return;
  const scheduledDate = new Date(field.value);
  if (!field.value || Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
    field.setCustomValidity('Selecciona una fecha y hora futura.');
    field.reportValidity();
    return;
  }
  field.setCustomValidity('');
  const rawMeetLink = meetField.value.trim().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[)\].,;]+$/, '');
  let meetLink = '';
  if (rawMeetLink) {
    try {
      const linkToParse = /^[a-z][a-z\d+.-]*:/i.test(rawMeetLink) ? rawMeetLink : 'https://' + rawMeetLink;
      const parsedLink = new URL(linkToParse);
      if (parsedLink.protocol !== 'https:' || parsedLink.hostname.toLowerCase() !== 'meet.google.com' || parsedLink.pathname === '/') throw new Error('Invalid Google Meet URL');
      meetLink = parsedLink.href;
    } catch (error) {
      meetField.setCustomValidity('Ingresa un link v&aacute;lido de Google Meet, como https://meet.google.com/abc-defg-hij.');
      meetField.reportValidity();
      return;
    }
  }
  meetField.setCustomValidity('');
  meetField.value = meetLink;
  try {
    const applications = JSON.parse(localStorage.getItem(applicant.storageKey) || '[]');
    const application = Array.isArray(applications) ? applications.find(item => Number(item.jobId) === activeCompanyApplicantsOfferId) : null;
    if (!application) return;
    const offer = getCompanyOwnedOffers().find(item => Number(item.id) === activeCompanyApplicantsOfferId);
    application.interview = { scheduledAt: scheduledDate.toISOString(), description: document.getElementById('company-interview-description').value.trim(), meetLink, companyName: companyDisplayName(), jobTitle: offer ? offer.tituloOferta : '', updatedAt: new Date().toISOString() };
    localStorage.setItem(applicant.storageKey, JSON.stringify(applications));
    renderCompanyOfferApplicants(activeCompanyApplicantsOfferId);
  } catch (error) {
    document.getElementById('company-offer-applicants-content').insertAdjacentHTML('beforeend', '<p class="company-interview-error">No se pudo guardar la entrevista. Intenta nuevamente.</p>');
  }
}
function showCompanyApplicantProfile(index) {
  const applicant = activeCompanyOfferApplicants[index];
  if (!applicant) return;
  const profile = readStoredCompanyValue('stackhire-candidate-profile', {});
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || applicant.name;
  const esc = escapeCompanyOfferText;
  const photo = typeof profile.photo === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,/i.test(profile.photo)
    ? '<img class="company-applicant-profile-photo" src="' + profile.photo + '" alt="Foto de ' + esc(name) + '">'
    : '<span class="company-applicant-profile-initials">' + esc(companyOfferLogo(name)) + '</span>';
  const section = (title, entries, renderEntry) => {
    const items = Array.isArray(entries) ? entries.filter(entry => entry && Object.values(entry).some(value => value && value !== false)) : [];
    return items.length ? '<section class="company-applicant-profile-section"><h3>' + title + '</h3><div>' + items.map(renderEntry).join('') + '</div></section>' : '';
  };
  const period = entry => [entry.startDate, entry.current ? 'Actualidad' : entry.endDate].filter(Boolean).map(esc).join(' - ');
  const item = (heading, detail, description = '') => '<article class="company-applicant-profile-item"><strong>' + esc(heading || '') + '</strong>' + (detail ? '<small>' + esc(detail) + '</small>' : '') + (description ? '<p>' + esc(description) + '</p>' : '') + '</article>';
  const certificationItem = entry => {
    const attachment = entry.attachment;
    const hasViewableAttachment = attachment && typeof attachment.data === 'string' && /^data:(application\/pdf|image\/(png|jpeg|webp|gif));base64,/i.test(attachment.data);
    return '<article class="company-applicant-profile-item"><strong>' + esc(entry.name || '') + '</strong>' + (entry.issuer ? '<small>' + esc(entry.issuer) + '</small>' : '') + (entry.description ? '<p>' + esc(entry.description) + '</p>' : '') + (hasViewableAttachment ? '<a class="company-applicant-certificate-link" href="' + esc(attachment.data) + '" target="_blank" rel="noopener noreferrer">Ver certificaci&oacute;n</a>' : '') + '</article>';
  };
  const skills = Array.isArray(profile.skills) ? profile.skills.map(entry => typeof entry === 'string' ? entry : entry.name).filter(Boolean) : [];
  document.getElementById('company-offer-applicants-heading').textContent = 'Perfil del candidato';
  document.getElementById('company-offer-applicants-subtitle').textContent = name;
  document.getElementById('company-offer-applicants-content').innerHTML =
    '<div class="company-applicant-profile"><button type="button" class="company-applicant-profile-back" onclick="renderCompanyOfferApplicants(activeCompanyApplicantsOfferId)">&#8592; Volver a postulantes</button>' +
    '<header class="company-applicant-profile-header">' + photo + '<div><h3>' + esc(name) + '</h3><p>' + esc([profile.city, profile.province].filter(Boolean).join(', ') || 'Ubicaci&oacute;n no especificada') + '</p></div></header>' +
    '<section class="company-applicant-profile-section"><h3>Contacto</h3><div class="company-applicant-contact-grid"><p><strong>Correo</strong><a href="mailto:' + esc(profile.email || applicant.email) + '">' + esc(profile.email || applicant.email) + '</a></p>' + (profile.phone ? '<p><strong>Tel&eacute;fono</strong><a href="tel:' + esc(profile.phone) + '">' + esc(profile.phone) + '</a></p>' : '') + '</div></section>' +
    '<section class="company-applicant-profile-section"><h3>Enlaces</h3><div class="company-applicant-contact-grid">' + (profile.linkedin ? '<p><strong>LinkedIn</strong><a href="' + esc(profile.linkedin) + '" target="_blank" rel="noopener noreferrer">Ver perfil</a></p>' : '') + (profile.website ? '<p><strong>Sitio web</strong><a href="' + esc(profile.website) + '" target="_blank" rel="noopener noreferrer">Abrir sitio</a></p>' : '') + (profile.github ? '<p><strong>GitHub</strong><a href="' + esc(profile.github) + '" target="_blank" rel="noopener noreferrer">Ver repositorios</a></p>' : '') + ((!profile.linkedin && !profile.website && !profile.github) ? '<p class="company-applicant-no-data">Sin enlaces agregados.</p>' : '') + '</div></section>' +
    section('Experiencia laboral', profile.experience, entry => item(entry.position, [entry.company, period(entry)].filter(Boolean).join(' · '), entry.description)) +
    section('Formaci&oacute;n acad&eacute;mica', profile.education, entry => item(entry.career || entry.level, [entry.institution, period(entry)].filter(Boolean).join(' · '))) +
    section('Idiomas', profile.languages, entry => item(entry.name, entry.level)) +
    section('Certificaciones', profile.certifications, certificationItem) +
    (skills.length ? '<section class="company-applicant-profile-section"><h3>Habilidades</h3><div class="company-applicant-skills">' + skills.map(skill => '<span>' + esc(skill) + '</span>').join('') + '</div></section>' : '') + '</div>';
}
function updateCompanyApplicantStatus(storageKey, jobId, status) {
  const allowed = ['postulado', 'visto', 'en_progreso', 'finalista'];
  if (!allowed.includes(status)) return;
  try {
    const applications = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const application = Array.isArray(applications) ? applications.find(item => Number(item.jobId) === Number(jobId)) : null;
    if (!application) return;
    application.status = status;
    localStorage.setItem(storageKey, JSON.stringify(applications));
    renderCompanyOfferApplicants(jobId);
  } catch (error) { renderCompanyOfferApplicants(jobId); }
}
function closeCompanyOfferApplicants() {
  const dialog = document.getElementById('company-offer-applicants-modal');
  if (dialog.open) dialog.close();
}
function showCompanyOfferDetail(id) {
  const offer = getCompanyOwnedOffers().find(item => Number(item.id) === Number(id));
  if (!offer) return;
  const schedule = offer.jornada === 'part time' ? 'Part time' : 'Full time';
  const modality = { presencial:'Presencial', remota:'Remoto', hibrida:'H\u00edbrida' }[offer.modalidad] || offer.modalidad || '';
  const contract = { indefinido:'Indefinido', temporal:'Temporal', pasantia:'Pasant\u00eda', contractor:'Contractor', 'por proyecto':'Por proyecto' }[offer.tipoContrato] || offer.tipoContrato || '';
  const salary = offer.salarioMin === offer.salarioMax || !offer.salarioMax
    ? formatCompanyOfferSalary(offer.salarioMin ?? offer.salary)
    : '$' + Number(offer.salarioMin).toLocaleString('es-AR') + ' - $' + Number(offer.salarioMax).toLocaleString('es-AR') + ' /mes';
  const experience = Number(offer.añosExperiencia ?? offer.experience ?? 0);
  document.getElementById('company-offer-detail-content').innerHTML =
    '<header class="company-offer-detail-header"><span class="company-offer-logo">' + escapeCompanyOfferText(offer.logo || companyOfferLogo(offer.empresa)) + '</span><div><p class="dashboard-eyebrow">' + escapeCompanyOfferText(offer.empresa) + '</p><h2>' + escapeCompanyOfferText(offer.tituloOferta) + '</h2><p>' + escapeCompanyOfferText(offer.ciudad) + ', ' + escapeCompanyOfferText(offer.provincia) + '</p></div><span class="company-offer-detail-status ' + (offer.active ? 'is-active' : 'is-inactive') + '">' + (offer.active ? 'Activa' : 'Inactiva') + '</span></header><p class="company-offer-detail-description">' + escapeCompanyOfferText(offer.descripcion) + '</p><div class="company-offer-detail-grid"><div><small>Jornada</small><strong>' + escapeCompanyOfferText(schedule) + '</strong></div><div><small>Contrato</small><strong>' + escapeCompanyOfferText(contract) + '</strong></div><div><small>Modalidad</small><strong>' + escapeCompanyOfferText(modality) + '</strong></div><div><small>Tipo de turno</small><strong>' + escapeCompanyOfferText(offer.tipoTurno) + '</strong></div><div><small>Horario</small><strong>' + escapeCompanyOfferText(offer.horarioEntrada) + ' - ' + escapeCompanyOfferText(offer.horarioSalida) + '</strong></div><div><small>Experiencia</small><strong>' + (experience === 1 ? '1 a\u00f1o' : experience + ' a\u00f1os') + '</strong></div><div><small>Sueldo acordado</small><strong>' + escapeCompanyOfferText(salary) + '</strong></div></div><button type="button" class="company-create-offer-button" onclick="showCompanyOfferForm(' + Number(offer.id) + ')">Editar oferta</button>';
  setCompanyDashboardView('company-dashboard-offer-detail', 'Detalle de oferta');
}
function updateCompanyOfferStatus(id, value) {
  const active = value === 'active';
  try {
    const offers = readCompanyOffers();
    const index = offers.findIndex(offer => Number(offer.id) === Number(id));
    if (index >= 0) {
      offers[index].active = active;
      localStorage.setItem(companyOffersStorageKey, JSON.stringify(offers));
    } else {
      const statuses = readCompanyOfferStatuses();
      statuses[String(id)] = active ? 'active' : 'inactive';
      localStorage.setItem(companyOfferStatusesKey, JSON.stringify(statuses));
    }
    syncCompanyOffersToJobCatalog();
    renderCompanyOffers();
    buildFilters();
  } catch (error) { renderCompanyOffers(); }
}
let pendingCompanyOfferDeletionId = null;
function deleteCompanyOffer(id) {
  const offer = getCompanyOwnedOffers().find(item => Number(item.id) === Number(id));
  if (!offer) return;
  pendingCompanyOfferDeletionId = Number(id);
  const message = document.getElementById('company-delete-offer-message');
  const dialog = document.getElementById('company-delete-offer-modal');
  message.textContent = '\u00bfEst\u00e1s seguro de que quieres eliminar "' + offer.tituloOferta + '"? Esta acci\u00f3n no se puede deshacer.';
  if (!dialog.open) dialog.showModal();
}
function cancelDeleteCompanyOffer() {
  pendingCompanyOfferDeletionId = null;
  const dialog = document.getElementById('company-delete-offer-modal');
  if (dialog.open) dialog.close();
}
function confirmDeleteCompanyOffer() {
  const id = pendingCompanyOfferDeletionId;
  if (id === null) return;
  pendingCompanyOfferDeletionId = null;
  const dialog = document.getElementById('company-delete-offer-modal');
  if (dialog.open) dialog.close();
  try {
    const offers = readCompanyOffers().filter(item => Number(item.id) !== id);
    localStorage.setItem(companyOffersStorageKey, JSON.stringify(offers));
    const deleted = readDeletedCompanyOfferIds();
    if (!deleted.includes(id)) deleted.push(id);
    localStorage.setItem(companyOfferDeletedKey, JSON.stringify(deleted));
    syncCompanyOffersToJobCatalog();
    renderCompanyOffers();
    buildFilters();
  } catch (error) { renderCompanyOffers(); }
}
document.getElementById('company-delete-offer-modal').addEventListener('cancel', () => {
  pendingCompanyOfferDeletionId = null;
});
function populateCompanyOfferLocations(savedProvince = '', savedCity = '') {
  const provinceSelect = document.getElementById('company-offer-province');
  provinceSelect.replaceChildren(new Option('Selecciona una provincia', ''));
  Object.keys(ARGENTINA_LOCATIONS).forEach(province => provinceSelect.add(new Option(province, province)));
  if (savedProvince && !Object.prototype.hasOwnProperty.call(ARGENTINA_LOCATIONS, savedProvince)) provinceSelect.add(new Option(savedProvince, savedProvince));
  provinceSelect.value = savedProvince;
  updateCompanyOfferCities(savedCity);
}
function updateCompanyOfferCities(savedCity = '') {
  const province = document.getElementById('company-offer-province').value;
  const citySelect = document.getElementById('company-offer-city');
  const cities = ARGENTINA_LOCATIONS[province] || [];
  citySelect.replaceChildren(new Option(province ? 'Selecciona una ciudad' : 'Primero selecciona una provincia', ''));
  cities.forEach(city => citySelect.add(new Option(city, city)));
  if (savedCity && !cities.includes(savedCity)) citySelect.add(new Option(savedCity, savedCity));
  citySelect.disabled = !province;
  citySelect.value = savedCity && (cities.includes(savedCity) || !cities.length) ? savedCity : '';
}
async function fillCompanyOfferWithDemoData() {
  const status = document.getElementById('company-offer-demo-status');
  const form = document.getElementById('company-offer-form');
  try {
    const offers = COMPANY_OFFER_DEMO_DATA;
    if (!Array.isArray(offers) || offers.length !== 5) throw new Error('El archivo de datos de prueba no tiene el formato esperado.');
    const offer = offers[Math.floor(Math.random() * offers.length)];
    form.elements.title.value = offer.title;
    form.elements.description.value = offer.description;
    form.elements.province.value = offer.province;
    updateCompanyOfferCities(offer.city);
    form.elements.schedule.value = offer.schedule;
    form.elements.contract.value = offer.contract;
    form.elements.modality.value = offer.modality;
    form.elements.shift.value = offer.shift;
    form.elements.startTime.value = offer.startTime;
    form.elements.endTime.value = offer.endTime;
    form.elements.experience.value = offer.experience;
    form.elements.salary.value = offer.salary;
    status.textContent = 'Oferta de prueba cargada. Puedes editarla antes de guardar.';
  } catch (error) {
    status.textContent = 'No se pudieron cargar los datos de prueba. Recarga la página e inténtalo de nuevo.';
  }
}
function saveCompanyOffer(event) {
  event.preventDefault();
  const form = document.getElementById('company-offer-form');
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form).entries());
  const previous = editingCompanyOfferId === null ? null : getCompanyOwnedOffers().find(item => Number(item.id) === editingCompanyOfferId);
  const id = editingCompanyOfferId === null ? Date.now() : editingCompanyOfferId;
  const fields = {
    id,
    tituloOferta: values.title.trim(),
    descripcion: values.description.trim(),
    provincia: values.province,
    ciudad: values.city,
    jornada: values.schedule,
    tipoContrato: values.contract,
    modalidad: values.modality,
    tipoTurno: values.shift,
    horarioEntrada: values.startTime,
    horarioSalida: values.endTime,
    añosExperiencia: Number(values.experience),
    salarioMin: Number(values.salary),
    salarioMax: Number(values.salary),
    salary: Number(values.salary),
    empresa: companyDisplayName(),
    logo: companyOfferLogo(companyDisplayName()),
    logoColor: '#dbeafe',
    logoText: '#1e40af',
    tecnologias: [],
    createdAt: previous?.createdAt || new Date().toISOString(),
    active: previous ? getCompanyOfferStatus(previous) : true,
    companyManaged: true
  };
  try {
    const sample = getCompanySeedJobs().some(job => Number(job.id) === id);
    if (editingCompanyOfferId === null || !sample) {
      const offers = readCompanyOffers();
      const index = offers.findIndex(item => Number(item.id) === id);
      if (index >= 0) offers[index] = { ...offers[index], ...fields };
      else offers.unshift(fields);
      localStorage.setItem(companyOffersStorageKey, JSON.stringify(offers));
    } else {
      const overrides = readCompanyOfferOverrides();
      overrides[String(id)] = fields;
      localStorage.setItem(companyOfferOverridesKey, JSON.stringify(overrides));
    }
    editingCompanyOfferId = null;
    syncCompanyOffersToJobCatalog();
    buildFilters();
    showCompanyOffers();
    document.getElementById('company-offer-success-message').textContent = fields.tituloOferta + ' se guardó correctamente.';
    document.getElementById('company-offer-success-modal').showModal();
  } catch (error) { document.getElementById('company-offer-status').textContent = 'No se pudo guardar la oferta en este navegador.'; }
}
syncCompanyOffersToJobCatalog();
