// ============================================================
// jobs-render.js — Armado de las tarjetas de empleo y la lista de resultados
// Depende de: data.js (JOBS), state.js (state), filters.js (getFiltered/getSorted)
// ============================================================

function fmt(n) { return '$' + (n/1000000).toFixed(1).replace('.0','') + 'M'; }
function fmtRange(a,b) { return fmt(a) + ' – ' + fmt(b); }

const modalidadBadge = m => ({ remota:'<span class="badge badge-remote">Remota</span>', hibrida:'<span class="badge badge-hibrida">Híbrida</span>', presencial:'<span class="badge badge-presencial">Presencial</span>' }[m] || '');
const jornadaBadge   = j => j === 'part time' ? '<span class="badge badge-parttime">Part time</span>' : '<span class="badge badge-fulltime">Full time</span>';
const contratoBadge  = c => ({ indefinido:'<span class="badge badge-indefinido">Indefinido</span>', temporal:'<span class="badge badge-temporal">Temporal</span>', pasantia:'<span class="badge badge-pasantia">Pasant\u00eda</span>', contractor:'<span class="badge badge-contractor">Contractor</span>', 'por proyecto':'<span class="badge badge-proyecto">Por proyecto</span>' }[c] || '');

function cardHTML(j, showFavoriteRemove = false) {
  return `<div class="job-card" onclick="showDetalle(${j.id})">
    <div class="flex items-start gap-4">
      <div class="company-logo-sm" style="background:${j.logoColor};color:${j.logoText}">${j.logo}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 class="font-semibold text-gray-900 text-base leading-snug">${j.tituloOferta}</h3>
            <p class="text-gray-400 text-sm mt-0.5">${j.empresa} · ${j.ciudad}, ${j.provincia}</p>
          </div>
          <div class="job-card-actions flex-shrink-0">
            <div class="job-card-primary-action">
              <span class="text-gray-400 text-xs whitespace-nowrap">hace ${(DIAS[j.id-1] ?? 0)} d&#237;as</span>
              <button class="btn-primary px-5 py-2 text-sm rounded-lg" onclick="event.stopPropagation();openApplyModalForId(${j.id})">Postularse</button>
            </div>
            ${showFavoriteRemove ? `<button type="button" class="favorite-remove" onclick="event.stopPropagation();removeFavoriteJob(${j.id})"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg><span>Quitar de favoritos</span></button>` : ''}
          </div>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed mt-2 mb-3">${j.descripcion}</p>
        <div class="flex flex-wrap gap-1.5 mb-2">
          ${modalidadBadge(j.modalidad)} ${jornadaBadge(j.jornada)} ${contratoBadge(j.tipoContrato)}
        </div>
        <div class="flex flex-wrap gap-1 mb-3">
          ${j.tecnologias.map(t=>`<span class="badge badge-tech">${t}</span>`).join('')}
        </div>
        <div class="flex items-center justify-between border-t border-gray-100 pt-3">
          <p class="font-bold text-gray-900 text-sm">${fmtRange(j.salarioMin,j.salarioMax)} <span class="font-normal text-gray-400">/mes</span></p>
          <p class="text-gray-400 text-xs">${j.añosExperiencia} ${j.añosExperiencia===1?'año':'años'} de experiencia · ${j.horarioEntrada}–${j.horarioSalida}</p>
        </div>
      </div>
    </div>
  </div>`;
}

function renderJobs() {
  const filtered = getFiltered();
  const sorted = getSorted(filtered);
  const list = document.getElementById('jobs-list');
  const empty = document.getElementById('empty-state');
  const countEl = document.getElementById('results-count');
  const queryEl = document.getElementById('results-query');
  const pagination = document.getElementById('jobs-pagination');
  const pageSize = 10;
  const totalPages = Math.ceil(sorted.length / pageSize);
  state.jobsPage = Math.min(Math.max(state.jobsPage || 1, 1), Math.max(totalPages, 1));
  const start = (state.jobsPage - 1) * pageSize;
  const visibleJobs = sorted.slice(start, start + pageSize);

  countEl.textContent = sorted.length + (sorted.length === 1 ? ' oferta' : ' ofertas');
  queryEl.textContent = state.query ? ` para "${state.query}"` : ' disponibles';

  if (sorted.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    pagination.innerHTML = '';
  } else {
    empty.classList.add('hidden');
    list.innerHTML = visibleJobs.map(job => cardHTML(job)).join('');
    renderJobsPagination(sorted.length, totalPages, start, pageSize);
  }

  renderChips();
  updateBadge();
}

function renderJobsPagination(totalItems, totalPages, start, pageSize) {
  const pagination = document.getElementById('jobs-pagination');
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  const end = Math.min(start + pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  pagination.innerHTML = `
    <span class="jobs-pagination-summary">Mostrando ${start + 1}-${end} de ${totalItems}</span>
    <div class="jobs-pagination-controls">
      <button type="button" class="pagination-btn" onclick="goToJobsPage(${state.jobsPage - 1})" ${state.jobsPage === 1 ? 'disabled' : ''}>Anterior</button>
      ${pages.map(page => `<button type="button" class="pagination-page ${page === state.jobsPage ? 'active' : ''}" onclick="goToJobsPage(${page})" aria-label="Ir a pagina ${page}" ${page === state.jobsPage ? 'aria-current="page"' : ''}>${page}</button>`).join('')}
      <button type="button" class="pagination-btn" onclick="goToJobsPage(${state.jobsPage + 1})" ${state.jobsPage === totalPages ? 'disabled' : ''}>Siguiente</button>
    </div>`;
}

function goToJobsPage(page) {
  const totalPages = Math.ceil(getSorted(getFiltered()).length / 10);
  if (page < 1 || page > totalPages) return;
  state.jobsPage = page;
  renderJobs();
  document.getElementById('jobs-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function renderChips() {
  const chips = document.getElementById('active-chips');
  const parts = [];
  ['modalidad','jornada','contrato','provincia'].forEach(key => {
    state[key].forEach(v => {
      const safeId = `f-${key}-${v.replace(/ /g,'-')}`;
      parts.push(`<span class="chip">${LABEL[v]||v}<span class="chip-x" onclick="toggleFilter('${key}','${v}');var el=document.getElementById('${safeId}');if(el)el.checked=false">×</span></span>`);
    });
  });
  if (state.expMax < 10) parts.push(`<span class="chip">Exp ≤ ${state.expMax} años<span class="chip-x" onclick="document.getElementById('exp-range').value=10;state.expMax=10;document.getElementById('exp-label').textContent='Todos';renderJobs()">×</span></span>`);
  if (state.salaryMin > 0) parts.push(`<span class="chip">Salario ≥ ${fmt(state.salaryMin)}<span class="chip-x" onclick="document.getElementById('salary-range').value=0;state.salaryMin=0;document.getElementById('salary-label').textContent='Sin mínimo';renderJobs()">×</span></span>`);
  chips.innerHTML = parts.join('');
}

function updateBadge() {
  const n = state.modalidad.size+state.jornada.size+state.contrato.size+state.provincia.size+(state.expMax<10?1:0)+(state.salaryMin>0?1:0);
  const el = document.getElementById('filter-badge');
  el.textContent = n; el.style.display = n > 0 ? 'flex' : 'none';
}

// ── Mobile sidebar ─────────────────────────
function openSidebar() {
  document.getElementById('filter-sidebar').classList.add('open');
  document.getElementById('sidebar-backdrop').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('filter-sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').classList.add('hidden');
  document.body.style.overflow = '';
}


// ── Companies ──────────────────────────────

function renderFavoriteJobs() {
  const list = document.getElementById('favorites-list');
  const favorites = [...savedJobs].map(id => JOBS.find(job => job.id === id)).filter(job => job && isJobVisibleToCandidates(job));
  if (!favorites.length) {
    list.innerHTML = '<div class="favorites-empty"><h2>Todav&#237;a no guardaste ofertas</h2><p>Entra al detalle de una oferta y pulsa &laquo;Guardar oferta&raquo; para encontrarla aqu&#237;.</p></div>';
    return;
  }
  list.innerHTML = favorites.map(job => `<div class="favorite-entry">${cardHTML(job, true)}</div>`).join('');
}
function removeFavoriteJob(id) {
  savedJobs.delete(id);
  persistCandidateFavorites();
  renderFavoriteJobs();
}