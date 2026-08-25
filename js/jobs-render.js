// ============================================================
// jobs-render.js — Armado de las tarjetas de empleo y la lista de resultados
// Depende de: data.js (JOBS), state.js (state), filters.js (getFiltered/getSorted)
// ============================================================

function fmt(n) { return '$' + (n/1000000).toFixed(1).replace('.0','') + 'M'; }
function fmtRange(a,b) { return fmt(a) + ' – ' + fmt(b); }

const modalidadBadge = m => ({ remota:'<span class="badge badge-remote">Remota</span>', hibrida:'<span class="badge badge-hibrida">Híbrida</span>', presencial:'<span class="badge badge-presencial">Presencial</span>' }[m] || '');
const jornadaBadge   = j => j === 'part time' ? '<span class="badge badge-parttime">Part time</span>' : '<span class="badge badge-fulltime">Full time</span>';
const contratoBadge  = c => c === 'por proyecto' ? '<span class="badge badge-proyecto">Por proyecto</span>' : '<span class="badge badge-indefinido">Indefinido</span>';

function cardHTML(j) {
  return `<div class="job-card" onclick="showDetalle(${j.id})">
    <div class="flex items-start gap-4">
      <div class="company-logo-sm" style="background:${j.logoColor};color:${j.logoText}">${j.logo}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 class="font-semibold text-gray-900 text-base leading-snug">${j.tituloOferta}</h3>
            <p class="text-gray-400 text-sm mt-0.5">${j.empresa} · ${j.ciudad}, ${j.provincia}</p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="text-gray-400 text-xs whitespace-nowrap">hace ${DIAS[j.id-1]} días</span>
            <button class="btn-primary px-5 py-2 text-sm rounded-lg" onclick="event.stopPropagation();openApplyModalForId(${j.id})">Postularse</button>
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
  const sorted   = getSorted(filtered);
  const list     = document.getElementById('jobs-list');
  const empty    = document.getElementById('empty-state');
  const countEl  = document.getElementById('results-count');
  const queryEl  = document.getElementById('results-query');

  countEl.textContent = sorted.length + (sorted.length === 1 ? ' oferta' : ' ofertas');
  queryEl.textContent = state.query ? ` para "${state.query}"` : ' disponibles';

  if (sorted.length === 0) { list.innerHTML = ''; empty.classList.remove('hidden'); }
  else { empty.classList.add('hidden'); list.innerHTML = sorted.map(cardHTML).join(''); }

  renderChips();
  updateBadge();
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
