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
  const name = document.getElementById('candidate-name').value.trim().replace(/\s+/g, ' ');
  const email = document.getElementById('candidate-email').value.trim().toLowerCase();
  const nameParts = name.split(' ');
  const account = createLocalAccount('candidate', { name, email }, candidatePassword.value);
  if (!account.ok) {
    candidateStatus.textContent = account.reason === 'exists'
      ? 'Ya existe una cuenta con ese correo. Iniciá sesión para continuar.'
      : 'No se pudo guardar la cuenta en este navegador. Libera espacio e inténtalo de nuevo.';
    return;
  }
  const profile = { firstName: nameParts.shift() || '', lastName: nameParts.join(' '), email };
  try {
    localStorage.setItem(getCandidateProfileStorageKey(email), JSON.stringify(profile));
  } catch (error) {
    const remaining = readLocalAccounts().filter(item => item.id !== account.account.id);
    try { localStorage.setItem(localAccountsStorageKey, JSON.stringify(remaining)); } catch (rollbackError) {}
    candidateStatus.textContent = 'No se pudo guardar el perfil en este navegador. Libera espacio e inténtalo de nuevo.';
    return;
  }
  candidateForm.reset();
  signInLocalAccount(account.account);
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
