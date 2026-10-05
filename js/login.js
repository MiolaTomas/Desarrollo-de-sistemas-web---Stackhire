// ============================================================
// login.js — Validación local del formulario de inicio de sesión
// ============================================================

const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginStatus = document.getElementById('login-status');

function clearLoginErrors() {
  document.getElementById('login-email-error').textContent = '';
  document.getElementById('login-password-error').textContent = '';
  loginStatus.textContent = '';
}

function validateLogin() {
  clearLoginErrors();
  let isValid = true;
  const emailError = document.getElementById('login-email-error');
  const passwordError = document.getElementById('login-password-error');

  if (!loginEmail.value.trim()) {
    emailError.textContent = 'Ingresá tu email.';
    isValid = false;
  } else if (!loginEmail.validity.valid) {
    emailError.textContent = 'Ingresá un email válido.';
    isValid = false;
  }
  if (!loginPassword.value) {
    passwordError.textContent = 'Ingresá tu contraseña.';
    isValid = false;
  } else if (loginPassword.value.length < 6) {
    passwordError.textContent = 'Debe tener al menos 6 caracteres.';
    isValid = false;
  }
  return isValid;
}

loginForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateLogin()) return;
  const accountEmail = loginEmail.value.trim().toLowerCase();
  if (accountEmail === 'tomasmiola@gmail.com') {
    showCandidateDashboard('Tom\u00e1s');
    return;
  }
  if (accountEmail === 'mercadolibre@gmail.com') {
    showCompanyDashboard();
    return;
  }
  loginStatus.textContent = 'Datos válidos. Conectando...';
});

document.getElementById('toggle-password').addEventListener('click', event => {
  const isPassword = loginPassword.type === 'password';
  loginPassword.type = isPassword ? 'text' : 'password';
  event.currentTarget.textContent = isPassword ? 'Ocultar' : 'Mostrar';
  event.currentTarget.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
});

[loginEmail, loginPassword].forEach(input => input.addEventListener('input', clearLoginErrors));
function selectDemoAccount(type) {
  const accounts = {
    candidate: { email: 'tomasmiola@gmail.com', password: 'demo123' },
    company: { email: 'mercadolibre@gmail.com', password: 'demo123' }
  };
  const account = accounts[type];
  if (!account) return;
  loginEmail.value = account.email;
  loginPassword.value = account.password;
  loginPassword.type = 'password';
  const toggle = document.getElementById('toggle-password');
  toggle.textContent = 'Mostrar';
  toggle.setAttribute('aria-label', 'Mostrar contrase�a');
  clearLoginErrors();
}