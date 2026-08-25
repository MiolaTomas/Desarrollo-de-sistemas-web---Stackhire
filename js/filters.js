// ============================================================
// filters.js — Filtros de la búsqueda (checkboxes, rangos, orden)
// Depende de: data.js (JOBS), state.js (state), jobs-render.js (renderJobs/renderChips/updateBadge/fmt)
// ============================================================

// ── Filter helpers ─────────────────────────
const LABEL = {
  remota: "Remota",
  hibrida: "Híbrida",
  presencial: "Presencial",
  "full time": "Full time",
  "part time": "Part time",
  indefinido: "Indefinido",
  "por proyecto": "Por proyecto",
};

function getUnique(key) {
  return [...new Set(JOBS.map((j) => j[key]))].sort();
}

function buildFilters() {
  buildCheckboxes("filter-modalidad", "modalidad", getUnique("modalidad"));
  buildCheckboxes("filter-jornada", "jornada", getUnique("jornada"));
  buildCheckboxes("filter-contrato", "tipoContrato", getUnique("tipoContrato"));
  buildCheckboxes("filter-provincia", "provincia", getUnique("provincia"));
}

function buildCheckboxes(id, key, values) {
  document.getElementById(id).innerHTML = values
    .map((v) => {
      const c = JOBS.filter((j) => j[key] === v).length;
      return `<div class="filter-option">
      <input type="checkbox" id="f-${key}-${v.replace(/ /g, "-")}" value="${v}" onchange="toggleFilter('${key}','${v}')">
      <label for="f-${key}-${v.replace(/ /g, "-")}">${LABEL[v] || v}</label>
      <span class="cnt">${c}</span>
    </div>`;
    })
    .join("");
}

function toggleFilter(key, value) {
  if (state[key].has(value)) state[key].delete(value);
  else state[key].add(value);
  renderJobs();
  renderChips();
  updateBadge();
}

function updateExpLabel() {
  const v = parseInt(document.getElementById("exp-range").value);
  state.expMax = v;
  document.getElementById("exp-label").textContent =
    v >= 10 ? "Todos" : v + " años";
}
function updateSalaryLabel() {
  const v = parseInt(document.getElementById("salary-range").value);
  state.salaryMin = v;
  document.getElementById("salary-label").textContent =
    v === 0 ? "Sin mínimo" : fmt(v) + " mín.";
}

function clearAllFilters() {
  state.modalidad.clear();
  state.jornada.clear();
  state.contrato.clear();
  state.provincia.clear();
  state.expMax = 10;
  state.salaryMin = 0;
  document.getElementById("exp-range").value = 10;
  document.getElementById("salary-range").value = 0;
  document.getElementById("exp-label").textContent = "Todos";
  document.getElementById("salary-label").textContent = "Sin mínimo";
  document
    .querySelectorAll(".filter-option input")
    .forEach((cb) => (cb.checked = false));
  renderJobs();
  renderChips();
  updateBadge();
}

// ── Filter + sort ──────────────────────────
function getFiltered() {
  const q = state.query.toLowerCase();
  return JOBS.filter((j) => {
    if (q) {
      const hay = [
        j.tituloOferta,
        j.empresa,
        j.ciudad,
        j.provincia,
        ...j.tecnologias,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (state.modalidad.size && !state.modalidad.has(j.modalidad)) return false;
    if (state.jornada.size && !state.jornada.has(j.jornada)) return false;
    if (state.contrato.size && !state.contrato.has(j.tipoContrato))
      return false;
    if (state.provincia.size && !state.provincia.has(j.provincia)) return false;
    if (state.expMax < 10 && j.añosExperiencia > state.expMax) return false;
    if (state.salaryMin > 0 && j.salarioMin < state.salaryMin) return false;
    return true;
  });
}

function getSorted(jobs) {
  const s = document.getElementById("sort-select").value;
  const a = [...jobs];
  if (s === "salario-desc") a.sort((x, y) => y.salarioMax - x.salarioMax);
  else if (s === "salario-asc") a.sort((x, y) => x.salarioMin - y.salarioMin);
  else if (s === "experiencia-asc")
    a.sort((x, y) => x.añosExperiencia - y.añosExperiencia);
  else if (s === "recientes") a.sort((x, y) => y.id - x.id);
  return a;
}
