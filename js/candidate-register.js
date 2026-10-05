// ============================================================
// candidate-register.js — Validación local del registro de candidato
// ============================================================

const candidateForm = document.getElementById('candidate-register-form');
const candidatePassword = document.getElementById('candidate-password');
const candidatePasswordConfirm = document.getElementById('candidate-password-confirm');
const candidateStatus = document.getElementById('candidate-register-status');

function clearCandidateErrors() {
  document.querySelectorAll('#candidate-register-form .register-form-error').forEach(error => { error.textContent = ''; });
  candidateStatus.textContent = '';
}

function validateCandidateForm() {
  clearCandidateErrors();
  let isValid = true;
  const requiredFields = [
    ['candidate-name', 'candidate-name-error', 'Ingresá tu nombre completo.'],
    ['candidate-email', 'candidate-email-error', 'Ingresá un email válido.']
  ];

  requiredFields.forEach(([fieldId, errorId, message]) => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim() || (field.type === 'email' && !field.validity.valid)) {
      document.getElementById(errorId).textContent = message;
      isValid = false;
    }
  });
  if (candidatePassword.value.length < 6) {
    document.getElementById('candidate-password-error').textContent = 'Usá al menos 6 caracteres.';
    isValid = false;
  }
  if (candidatePasswordConfirm.value !== candidatePassword.value) {
    document.getElementById('candidate-password-confirm-error').textContent = 'Las contraseñas no coinciden.';
    isValid = false;
  }
  if (!document.getElementById('candidate-terms').checked) {
    document.getElementById('candidate-terms-error').textContent = 'Aceptá los términos para continuar.';
    isValid = false;
  }
  return isValid;
}

candidateForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateCandidateForm()) return;
  candidateStatus.textContent = 'Perfil validado. Ya podés empezar a buscar oportunidades.';
});

document.querySelectorAll('.candidate-password-toggle').forEach(button => {
  button.addEventListener('click', event => {
    const password = document.getElementById(event.currentTarget.dataset.target);
    const isPassword = password.type === 'password';
    password.type = isPassword ? 'text' : 'password';
    event.currentTarget.textContent = isPassword ? 'Ocultar' : 'Mostrar';
    event.currentTarget.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
});

candidateForm.querySelectorAll('input, select').forEach(input => input.addEventListener('input', clearCandidateErrors));