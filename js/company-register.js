// ============================================================
// company-register.js — Validación local del registro de empresa
// ============================================================

const companyForm = document.getElementById('company-register-form');
const companyPassword = document.getElementById('company-password');
const companyPasswordConfirm = document.getElementById('company-password-confirm');
const companyStatus = document.getElementById('company-register-status');

function clearCompanyErrors() {
  document.querySelectorAll('#company-register-form .register-form-error').forEach(error => { error.textContent = ''; });
  companyStatus.textContent = '';
}

function validateCompanyForm() {
  clearCompanyErrors();
  let isValid = true;
  const requiredFields = [
    ['company-name', 'company-name-error', 'Ingresá el nombre de la empresa.'],
    ['company-email', 'company-email-error', 'Ingresá un email corporativo válido.'],
    ['company-cuit', 'company-cuit-error', 'Ingresá un CUIT válido.']
  ];

  requiredFields.forEach(([fieldId, errorId, message]) => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim() || (field.type === 'email' && !field.validity.valid)) {
      document.getElementById(errorId).textContent = message;
      isValid = false;
    }
  });
  const website = document.getElementById('company-website');
  if (website.value && !website.validity.valid) {
    document.getElementById('company-website-error').textContent = 'Ingresá una URL válida.';
    isValid = false;
  }
  const cuit = document.getElementById('company-cuit');
  if (!/^\d{11}$/.test(cuit.value.replace(/-/g, ''))) {
    document.getElementById('company-cuit-error').textContent = 'El CUIT debe tener 11 dígitos.';
    isValid = false;
  }
  if (companyPassword.value.length < 6) {
    document.getElementById('company-password-error').textContent = 'Usá al menos 6 caracteres.';
    isValid = false;
  }
  if (companyPasswordConfirm.value !== companyPassword.value) {
    document.getElementById('company-password-confirm-error').textContent = 'Las contraseñas no coinciden.';
    isValid = false;
  }
  if (!document.getElementById('company-terms').checked) {
    document.getElementById('company-terms-error').textContent = 'Aceptá los términos para continuar.';
    isValid = false;
  }
  return isValid;
}

companyForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateCompanyForm()) return;
  const profile = {
    name: document.getElementById('company-name').value.trim(),
    email: document.getElementById('company-email').value.trim().toLowerCase(),
    website: document.getElementById('company-website').value.trim(),
    cuit: document.getElementById('company-cuit').value.trim()
  };
  const account = createLocalAccount('company', profile, companyPassword.value);
  if (!account.ok) {
    companyStatus.textContent = account.reason === 'exists'
      ? 'Ya existe una cuenta con ese correo. Iniciá sesión para continuar.'
      : 'No se pudo guardar la cuenta en este navegador. Libera espacio e inténtalo de nuevo.';
    return;
  }
  try {
    localStorage.setItem(getAccountStorageKey('stackhire-company-profile', 'company', profile.email), JSON.stringify(profile));
  } catch (error) {
    const remaining = readLocalAccounts().filter(item => item.id !== account.account.id);
    try { localStorage.setItem(localAccountsStorageKey, JSON.stringify(remaining)); } catch (rollbackError) {}
    companyStatus.textContent = 'No se pudo guardar el perfil en este navegador. Libera espacio e inténtalo de nuevo.';
    return;
  }
  companyForm.reset();
  signInLocalAccount(account.account);
});

document.querySelectorAll('#company-register-form .candidate-password-toggle').forEach(button => {
  button.addEventListener('click', event => {
    const password = document.getElementById(event.currentTarget.dataset.target);
    const isPassword = password.type === 'password';
    password.type = isPassword ? 'text' : 'password';
    event.currentTarget.textContent = isPassword ? 'Ocultar' : 'Mostrar';
    event.currentTarget.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
});

companyForm.querySelectorAll('input, select').forEach(input => input.addEventListener('input', clearCompanyErrors));
