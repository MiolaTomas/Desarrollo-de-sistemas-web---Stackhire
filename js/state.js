// ============================================================
// state.js — Estado global de la aplicación
// Variables que cambian mientras el usuario navega/filtra.
// ============================================================

// ── State ──────────────────────────────────
const state = {
  query: "",
  modalidad: new Set(),
  jornada: new Set(),
  contrato: new Set(),
  provincia: new Set(),
  expMax: 10,
  salaryMin: 0,
  jobsPage: 1,
};

// ── Estado de la página de detalle ──
let currentJobId = null;
let currentAuthenticatedUserType = null;
const savedJobs = new Set();
