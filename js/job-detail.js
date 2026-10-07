// ============================================================
// job-detail.js — Página de detalle de un empleo (guardar, compartir, etc)
// Depende de: data.js, state.js (currentJobId, savedJobs)
// ============================================================

function showDetalle(id) {
  const j = JOBS.find(x => x.id === id);
  if (!j) return;
  currentJobId = id;

  // Hero
  const logo = document.getElementById('detail-logo');
  logo.style.background = j.logoColor; logo.style.color = j.logoText; logo.textContent = j.logo;
  document.getElementById('detail-titulo').textContent = j.tituloOferta;
  document.getElementById('detail-empresa').textContent = j.empresa;
  document.getElementById('detail-ubicacion').textContent = j.ciudad + ', ' + j.provincia;
  document.getElementById('detail-salario-hero').textContent = fmtRange(j.salarioMin, j.salarioMax);
  document.getElementById('detail-publicado').textContent = 'Publicado hace ' + (DIAS[j.id-1] ?? 0) + ' días';

  // Badges hero
  const bh = document.getElementById('detail-badges-hero');
  bh.innerHTML = modalidadBadge(j.modalidad) + jornadaBadge(j.jornada) + contratoBadge(j.tipoContrato);

  // Description
  document.getElementById('detail-desc').textContent = j.descripcion;
  const fullDescs = DESCS_FULL[j.empresa] || DESCS_FULL.default;
  document.getElementById('detail-desc-full').innerHTML = fullDescs.map(p => `<p>${p}</p>`).join('');

  // Requisitos
  const reqs = JOB_REQUISITOS[j.empresa] || JOB_REQUISITOS.default;
  const expReq = `${j.añosExperiencia}+ años de experiencia en roles similares`;
  document.getElementById('detail-requisitos').innerHTML = [expReq, ...reqs].map(r =>
    `<div class="req-item"><span class="req-dot"></span><span>${r}</span></div>`
  ).join('');

  // Responsabilidades
  const resp = JOB_RESPONSABILIDADES[j.empresa] || JOB_RESPONSABILIDADES.default;
  document.getElementById('detail-responsabilidades').innerHTML = resp.map(r =>
    `<div class="req-item"><span class="req-dot" style="background:#10b981"></span><span>${r}</span></div>`
  ).join('');

  // Beneficios
  document.getElementById('detail-beneficios').innerHTML = JOB_BENEFICIOS.map(b =>
    `<div class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"><span>${b.icon}</span><span>${b.text}</span></div>`
  ).join('');

  // Info rows
  const rows = [
    {icon:'🗓️', label:'Jornada', value: j.jornada === 'full time' ? 'Full time' : 'Part time'},
    {icon:'📍', label:'Modalidad', value: {remota:'Remota 100%',hibrida:'Híbrida',presencial:'Presencial'}[j.modalidad]},
    {icon:'📄', label:'Contrato', value: j.tipoContrato === 'por proyecto' ? 'Por proyecto' : 'Indefinido'},
    {icon:'🕐', label:'Horario', value: j.horarioEntrada + ' – ' + j.horarioSalida + ' (' + j.tipoTurno + ')'},
    {icon:'📈', label:'Experiencia', value: j.añosExperiencia + ' años mínimo'},
    {icon:'🏙️', label:'Ubicación', value: j.ciudad + ', ' + j.provincia},
  ];
  document.getElementById('detail-info-rows').innerHTML = rows.map(r =>
    `<div class="info-row"><div class="info-icon text-base">${r.icon}</div><div><p class="info-label">${r.label}</p><p class="info-value">${r.value}</p></div></div>`
  ).join('');

  // Techs
  document.getElementById('detail-techs').innerHTML = j.tecnologias.map(t =>
    `<span class="badge badge-tech text-sm px-3 py-1">${t}</span>`
  ).join('');

  // Company mini card
  document.getElementById('detail-company-info').innerHTML = `
    <div class="flex items-center gap-3 mb-3">
      <div style="width:40px;height:40px;border-radius:10px;background:${j.logoColor};color:${j.logoText};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0">${escapeHTML(j.logo)}</div>
      <div><p class="font-semibold text-gray-900 text-sm">${escapeHTML(j.empresa)}</p></div>
    </div>
    <p class="text-gray-500 text-xs leading-relaxed">${COMPANY_DESCS[j.empresa] || 'Empresa tecnológica de referencia en el mercado argentino.'}</p>
  `;
  document.getElementById('detail-ver-empresa-btn').onclick = () => searchByCompany(j.empresa);

  updateDetailApplicationActions();

  // Save button state
  updateSaveButtons();

  // Show the details inside the candidate dashboard when opened there.
  if (document.body.classList.contains('dashboard-mode')) {
    document.getElementById('dashboard-home-content').classList.add('hidden');
    document.getElementById('dashboard-offers-slot').classList.add('hidden');
    document.getElementById('dashboard-favorites-slot').classList.add('hidden');
    document.getElementById('dashboard-curriculum-slot').classList.add('hidden');
    document.getElementById('dashboard-applications-slot').classList.add('hidden');
    document.getElementById('dashboard-notifications-slot').classList.add('hidden');
    const detailSlot = document.getElementById('dashboard-detail-slot');
    detailSlot.classList.remove('hidden');
    detailSlot.appendChild(document.getElementById('detalle-section'));
    document.getElementById('detalle-section').classList.remove('page-hidden');
    document.getElementById('dashboard-page-title').textContent = 'Detalle de oferta';
    document.querySelectorAll('#candidate-dashboard .dashboard-nav-item').forEach(button => button.classList.remove('active'));
    document.getElementById(candidateDashboardView === 'favorites'
      ? 'dashboard-favorites-link'
      : candidateDashboardView === 'applications'
        ? 'dashboard-applications-link'
        : 'dashboard-offers-link').classList.add('active');
  } else {
    hideAll();
    document.getElementById('detalle-section').classList.remove('page-hidden');
  }
  window.scrollTo({ top: 0 });
}
function updateSaveButtons() {
  const saved = savedJobs.has(currentJobId);
  ['','- 2'].forEach(suffix => {
    const btn = document.getElementById('save-btn' + (suffix ? suffix : ''));
    const icon = document.getElementById('save-icon' + (suffix ? suffix : ''));
    const label = document.getElementById('save-label' + (suffix ? suffix : ''));
    if (!btn) return;
    if (saved) {
      btn.classList.add('saved'); icon.setAttribute('fill','#f59e0b'); label.textContent = 'Oferta guardada ★';
    } else {
      btn.classList.remove('saved'); icon.setAttribute('fill','none'); label.textContent = 'Guardar oferta';
    }
  });
}

function toggleSave() {
  if (!currentJobId) return;
  if (savedJobs.has(currentJobId)) savedJobs.delete(currentJobId);
  else savedJobs.add(currentJobId);
  persistCandidateFavorites();
  updateSaveButtons();
}

function shareJob() {
  const j = JOBS.find(x => x.id === currentJobId);
  if (!j) return;
  const text = `${j.tituloOferta} en ${j.empresa} — ${fmtRange(j.salarioMin,j.salarioMax)}/mes`;
  if (navigator.share) { navigator.share({title:'StackHire', text, url: window.location.href}); }
  else if (navigator.clipboard) { navigator.clipboard.writeText(text + ' | StackHire'); alert('¡Link copiado al portapapeles!'); }
}

// ── Apply modal ─────────────────────────────

function updateDetailApplicationActions() {
  const openedFromApplications = document.body.classList.contains('dashboard-mode')
    && candidateDashboardView === 'applications';
  const application = currentAuthenticatedUserType === 'candidate' && typeof getCandidateApplications === 'function'
    ? getCandidateApplications().find(item => Number(item.jobId) === Number(currentJobId))
    : null;
  const hasApplied = Boolean(application);
  const showApplicationProgress = openedFromApplications && hasApplied;
  document.getElementById('detail-actions-buttons').classList.toggle('hidden', showApplicationProgress);
  document.getElementById('detail-application-progress').classList.toggle('hidden', !showApplicationProgress);
  document.getElementById('detail-apply-card').classList.toggle('hidden', showApplicationProgress);
  document.getElementById('detail-apply-card').classList.toggle('application-already-submitted', showApplicationProgress);
  document.querySelectorAll('#detail-actions-buttons .btn-apply-big, #detail-apply-card .btn-apply-big').forEach(button => {
    button.classList.toggle('is-applied', hasApplied);
    button.textContent = hasApplied ? 'Ya postulado' : 'Postularme ahora';
  });
  if (!showApplicationProgress) return;
  const stages = ['postulado', 'visto', 'en_progreso', 'finalista'];
  const activeIndex = Math.max(stages.indexOf(application.status), 0);
  document.querySelectorAll('#detail-application-progress .application-progress-step').forEach((step, index) => {
    step.classList.toggle('is-complete', index < activeIndex);
    step.classList.toggle('is-current', index === activeIndex);
    const marker = step.querySelector('.application-progress-marker');
    marker.textContent = index < activeIndex ? '\u2713' : String(index + 1);
    if (index === activeIndex) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  });
}
