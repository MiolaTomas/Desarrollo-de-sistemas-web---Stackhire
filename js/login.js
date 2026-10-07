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

function signInLocalAccount(account) {
  if (!account || (account.type !== 'candidate' && account.type !== 'company')) return;
  setAuthenticatedAccount(account.type, account.email, account.name || '');
  loginEmail.value = account.email;
  loginPassword.value = '';
  if (typeof syncCompanyOffersToJobCatalog === 'function') syncCompanyOffersToJobCatalog();
  state.query = '';
  state.jobsPage = 1;
  state.modalidad.clear();
  state.jornada.clear();
  state.contrato.clear();
  state.provincia.clear();
  state.expMax = 10;
  state.salaryMin = 0;
  document.getElementById('results-search').value = '';
  if (typeof buildFilters === 'function') buildFilters();
  if (typeof renderJobs === 'function') renderJobs();
  if (account.type === 'candidate') {
    showCandidateDashboard(getCandidateDisplayName(account.name || ''));
  } else {
    showCompanyDashboard();
  }
}

loginForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateLogin()) return;
  const accountEmail = loginEmail.value.trim().toLowerCase();
  if (accountEmail === demoAccountEmails.candidate && loginPassword.value === 'demo123') {
    signInLocalAccount({ type: 'candidate', email: accountEmail, name: 'Tomás' });
    return;
  }
  if (accountEmail === demoAccountEmails.company && loginPassword.value === 'demo123') {
    signInLocalAccount({ type: 'company', email: accountEmail, name: 'Mercado Libre' });
    return;
  }
  const account = authenticateLocalAccount(accountEmail, loginPassword.value);
  if (account) {
    signInLocalAccount(account);
    return;
  }
  loginStatus.textContent = 'El correo o la contraseña no son correctos.';
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

function getSavedAccountDisplayName(account) {
  if (account.type === 'candidate') {
    const profile = getCandidateProfileByEmail(account.email);
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ') || account.name;
  }
  if (typeof getCompanyProfileByEmail === 'function') {
    const profile = getCompanyProfileByEmail(account.email);
    if (profile.name) return profile.name;
  }
  return account.name;
}

function renderSavedAccountShortcuts() {
  const list = document.querySelector('.demo-account-list');
  if (!list) return;
  list.querySelectorAll('[data-local-account-shortcut]').forEach(button => button.remove());
  readLocalAccounts().forEach(account => {
    const name = getSavedAccountDisplayName(account);
    const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
    const isCompany = account.type === 'company';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'demo-account';
    button.dataset.localAccountShortcut = 'true';
    button.setAttribute('aria-label', `Usar cuenta ${isCompany ? 'de empresa' : 'de candidato'} ${name}`);

    const avatar = document.createElement('span');
    avatar.className = `demo-account-avatar ${isCompany ? 'company-avatar-demo' : 'candidate-avatar'}`;
    avatar.textContent = initials;
    const copy = document.createElement('span');
    copy.className = 'demo-account-copy';
    const title = document.createElement('strong');
    title.textContent = name;
    const type = document.createElement('small');
    type.textContent = isCompany ? 'Empresa' : 'Candidato';
    copy.append(title, type);
    button.append(avatar, copy);
    button.addEventListener('click', () => selectSavedAccountShortcut(account.email));
    list.append(button);
  });
}

function selectSavedAccountShortcut(email) {
  const account = readLocalAccounts().find(item => item.email === String(email).trim().toLowerCase());
  if (!account) {
    renderSavedAccountShortcuts();
    return;
  }
  loginEmail.value = account.email;
  loginPassword.value = account.password;
  loginPassword.type = 'password';
  const toggle = document.getElementById('toggle-password');
  toggle.textContent = 'Mostrar';
  toggle.setAttribute('aria-label', 'Mostrar contraseña');
  clearLoginErrors();
}
