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
let currentAuthenticatedUserEmail = null;
let currentAuthenticatedUserName = null;
const savedJobs = new Set();

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

// Local demo accounts live only in this browser. The existing demo profiles keep
// using their original storage keys so current sample data remains available.
const localAccountsStorageKey = 'stackhire-local-accounts';
const demoAccountEmails = { candidate: 'tomasmiola@gmail.com', company: 'mercadolibre@gmail.com' };

function readLocalAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(localAccountsStorageKey) || '[]');
    return Array.isArray(accounts) ? accounts : [];
  } catch (error) { return []; }
}

function createLocalAccount(type, profile, password) {
  const email = String(profile.email || '').trim().toLowerCase();
  const accounts = readLocalAccounts();
  if (accounts.some(account => account.email === email)
    || Object.values(demoAccountEmails).includes(email)) return { ok: false, reason: 'exists' };

  const account = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    email,
    password,
    name: profile.name || profile.firstName || email.split('@')[0],
    createdAt: new Date().toISOString()
  };
  try {
    accounts.push(account);
    localStorage.setItem(localAccountsStorageKey, JSON.stringify(accounts));
    return { ok: true, account };
  } catch (error) { return { ok: false, reason: 'storage' }; }
}

function authenticateLocalAccount(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return readLocalAccounts().find(account => account.email === normalizedEmail && account.password === password) || null;
}

function setAuthenticatedAccount(type, email, name = '') {
  currentAuthenticatedUserType = type;
  currentAuthenticatedUserEmail = String(email || '').trim().toLowerCase();
  currentAuthenticatedUserName = name;
}

function clearAuthenticatedAccount() {
  currentAuthenticatedUserType = null;
  currentAuthenticatedUserEmail = null;
  currentAuthenticatedUserName = null;
}

function getCurrentAccountEmail(type = currentAuthenticatedUserType) {
  if (currentAuthenticatedUserEmail && (!type || currentAuthenticatedUserType === type)) return currentAuthenticatedUserEmail;
  const field = document.getElementById('login-email');
  return field ? field.value.trim().toLowerCase() : '';
}

function getAccountStorageKey(baseKey, type, email = getCurrentAccountEmail(type)) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || normalizedEmail === demoAccountEmails[type]) return baseKey;
  return `${baseKey}:${normalizedEmail}`;
}

function getCandidateProfileStorageKey(email = getCurrentAccountEmail('candidate')) {
  return getAccountStorageKey('stackhire-candidate-profile', 'candidate', email);
}

function getCandidateProfileByEmail(email) {
  try {
    const profile = JSON.parse(localStorage.getItem(getCandidateProfileStorageKey(email)) || '{}');
    return profile && typeof profile === 'object' ? profile : {};
  }
  catch (error) { return {}; }
}

function deleteLocalAccount(type, email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const accounts = readLocalAccounts();
  const account = accounts.find(item => item.type === type && item.email === normalizedEmail);
  if (!account) return { ok: false, reason: 'demo' };

  const userKey = (baseKey, userType = type) => getAccountStorageKey(baseKey, userType, normalizedEmail);
  const applicationPrefix = 'stackhire-candidate-applications:';
  const favoritePrefix = 'stackhire-candidate-favorites:';

  try {
    if (type === 'candidate') {
      localStorage.removeItem(userKey('stackhire-candidate-profile'));
      localStorage.removeItem(`${favoritePrefix}${normalizedEmail}`);
      localStorage.removeItem(`${applicationPrefix}${normalizedEmail}`);
    } else if (type === 'company') {
      const offerKey = userKey('stackhire-company-offers', 'company');
      let offerIds = [];
      try {
        const offers = JSON.parse(localStorage.getItem(offerKey) || '[]');
        if (Array.isArray(offers)) offerIds = offers.map(offer => Number(offer.id)).filter(Number.isFinite);
      } catch (error) {}
      ['stackhire-company-profile', 'stackhire-company-offers', 'stackhire-company-offer-statuses', 'stackhire-company-offer-overrides', 'stackhire-company-offer-deleted']
        .forEach(key => localStorage.removeItem(userKey(key, 'company')));

      if (offerIds.length) {
        const offerIdSet = new Set(offerIds);
        const applicationKeys = [];
        const favoritesKeys = [];
        for (let index = 0; index < localStorage.length; index++) {
          const key = localStorage.key(index);
          if (key && key.startsWith(applicationPrefix)) applicationKeys.push(key);
          if (key && key.startsWith(favoritePrefix)) favoritesKeys.push(key);
        }
        applicationKeys.forEach(key => {
          try {
            const applications = JSON.parse(localStorage.getItem(key) || '[]');
            if (!Array.isArray(applications)) return;
            const remaining = applications.filter(application => !offerIdSet.has(Number(application.jobId)));
            if (remaining.length) localStorage.setItem(key, JSON.stringify(remaining));
            else localStorage.removeItem(key);
          } catch (error) {}
        });
        favoritesKeys.forEach(key => {
          try {
            const favorites = JSON.parse(localStorage.getItem(key) || '[]');
            if (!Array.isArray(favorites)) return;
            const remaining = favorites.filter(id => !offerIdSet.has(Number(id)));
            if (remaining.length) localStorage.setItem(key, JSON.stringify(remaining));
            else localStorage.removeItem(key);
          } catch (error) {}
        });
      }
    } else return { ok: false, reason: 'invalid-type' };

    localStorage.setItem(localAccountsStorageKey, JSON.stringify(accounts.filter(item => item.id !== account.id)));
    return { ok: true };
  } catch (error) { return { ok: false, reason: 'storage' }; }
}
