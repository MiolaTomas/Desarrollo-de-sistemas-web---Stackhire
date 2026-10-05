// ============================================================
// accessibility.js — Preferencias de accesibilidad persistentes
// ============================================================

const accessibilityPanel = document.getElementById('accessibility-panel');
const accessibilityButton = document.getElementById('accessibility-button');
const accessibilityStorageKey = 'stackhire-accessibility-settings';
const accessibilitySettings = [
  'accessibility-high-contrast',
  'accessibility-grayscale',
  'accessibility-highlight-links',
  'accessibility-extra-spacing',
  'accessibility-large-cursor',
  'accessibility-stop-animations'
];

function toggleAccessibilityPanel() {
  const isOpen = accessibilityPanel.classList.toggle('open');
  accessibilityPanel.setAttribute('aria-hidden', String(!isOpen));
  accessibilityButton.setAttribute('aria-expanded', String(isOpen));
}

function setAccessibilityFont(size) {
  document.body.classList.remove('accessibility-font-small', 'accessibility-font-large', 'accessibility-font-xlarge');
  document.body.classList.add(`accessibility-font-${size}`);
  saveAccessibilitySettings();
  updateAccessibilityButtons();
}

function toggleAccessibilitySetting(setting) {
  document.body.classList.toggle(`accessibility-${setting}`);
  saveAccessibilitySettings();
  updateAccessibilityButtons();
}

function saveAccessibilitySettings() {
  const settings = {
    font: ['small', 'large', 'xlarge'].find(size => document.body.classList.contains(`accessibility-font-${size}`)) || '',
    toggles: accessibilitySettings.filter(setting => document.body.classList.contains(setting))
  };
  localStorage.setItem(accessibilityStorageKey, JSON.stringify(settings));
}

function updateAccessibilityButtons() {
  document.querySelectorAll('.accessibility-option').forEach(button => {
    const action = button.dataset.action;
    const isFontActive = action.startsWith('font-') && document.body.classList.contains(`accessibility-${action}`);
    const isToggleActive = document.body.classList.contains(`accessibility-${action}`);
    button.classList.toggle('active', isFontActive || isToggleActive);
    button.setAttribute('aria-pressed', String(isFontActive || isToggleActive));
  });
}

function resetAccessibilitySettings() {
  document.body.classList.remove('accessibility-font-small', 'accessibility-font-large', 'accessibility-font-xlarge', ...accessibilitySettings);
  localStorage.removeItem(accessibilityStorageKey);
  updateAccessibilityButtons();
}

function loadAccessibilitySettings() {
  const saved = localStorage.getItem(accessibilityStorageKey);
  if (saved) {
    const settings = JSON.parse(saved);
    if (settings.font) document.body.classList.add(`accessibility-font-${settings.font}`);
    (settings.toggles || []).forEach(setting => document.body.classList.add(setting));
  }
  updateAccessibilityButtons();
}

loadAccessibilitySettings();