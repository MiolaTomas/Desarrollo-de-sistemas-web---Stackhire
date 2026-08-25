// ============================================================
// apply-modal.js — Modal de "Postularme"
// Depende de: state.js (currentJobId), data.js (JOBS)
// ============================================================

function openApplyModal() { openApplyModalForId(currentJobId); }
function openApplyModalForId(id) {
  const j = JOBS.find(x => x.id === id);
  if (!j) return;
  currentJobId = id;
  document.getElementById('modal-job-title').textContent = j.tituloOferta + ' · ' + j.empresa;
  document.getElementById('modal-empresa-confirm').textContent = j.empresa;
  document.getElementById('modal-step-1').classList.remove('hidden');
  document.getElementById('modal-step-2').classList.add('hidden');
  document.getElementById('apply-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeApplyModal() {
  document.getElementById('apply-modal').classList.add('hidden');
  document.body.style.overflow = '';
}
function submitApplication() {
  document.getElementById('modal-step-1').classList.add('hidden');
  document.getElementById('modal-step-2').classList.remove('hidden');
}
