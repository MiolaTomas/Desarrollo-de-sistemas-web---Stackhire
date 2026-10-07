// ============================================================
// accessibility.js — Preferencias de accesibilidad persistentes
// ============================================================

const accessibilityPanel = document.getElementById('accessibility-panel');
const accessibilityButton = document.getElementById('accessibility-button');
const accessibilityStorageKey = 'stackhire-accessibility-settings';
const accessibilityFontLevel = document.getElementById('accessibility-font-level');
const accessibilitySettings = [
  'high-contrast',
  'grayscale',
  'highlight-links',
  'extra-spacing',
  'large-cursor',
  'stop-animations'
];
const accessibilityFontTargets = 'h1,h2,h3,h4,h5,h6,p,a,button,label,input,textarea,select,option,li,small,strong,em,b,i,span,td,th,dt,dd,blockquote,legend,summary,figcaption,caption';
const accessibilityOriginalFonts = new WeakMap();
const accessibilityMinimumScale = 0.7;
const accessibilityMaximumScale = 1.5;
const accessibilityScaleStep = 0.1;
let accessibilityTextScale = 1;

function rememberAccessibilityFonts(root = document.body) {
  const elements = [];
  if (root instanceof Element && root.matches(accessibilityFontTargets)) elements.push(root);
  if (root.querySelectorAll) elements.push(...root.querySelectorAll(accessibilityFontTargets));

  elements.forEach(element => {
    if (accessibilityOriginalFonts.has(element)) return;
    const computedSize = parseFloat(getComputedStyle(element).fontSize);
    let inheritedFont = null;
    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const ancestorFont = accessibilityOriginalFonts.get(ancestor);
      if (!ancestorFont) continue;
      const ancestorSize = parseFloat(getComputedStyle(ancestor).fontSize);
      if (Number.isFinite(ancestorSize) && Math.abs(computedSize - ancestorSize) < 0.1) {
        inheritedFont = ancestorFont;
        break;
      }
    }
    // New elements that inherit a scaled ancestor use that ancestor's saved base size.
    const baseSize = inheritedFont ? inheritedFont.baseSize : computedSize;
    accessibilityOriginalFonts.set(element, {
      baseSize: Number.isFinite(baseSize) ? baseSize : 16,
      inlineSize: element.style.getPropertyValue('font-size'),
      inlinePriority: element.style.getPropertyPriority('font-size')
    });
  });
}

function applyAccessibilityTextScale(root = document.body) {
  rememberAccessibilityFonts(root);
  const elements = [];
  if (root instanceof Element && root.matches(accessibilityFontTargets)) elements.push(root);
  if (root.querySelectorAll) elements.push(...root.querySelectorAll(accessibilityFontTargets));
  elements.forEach(element => {
    const original = accessibilityOriginalFonts.get(element);
    if (!original) return;
    if (accessibilityTextScale === 1) {
      if (original.inlineSize) element.style.setProperty('font-size', original.inlineSize, original.inlinePriority);
      else element.style.removeProperty('font-size');
    } else {
      element.style.setProperty('font-size', `${original.baseSize * accessibilityTextScale}px`, 'important');
    }
  });
  if (root === document.body && accessibilityFontLevel) {
    const levelText = `Tamaño actual: ${Math.round(accessibilityTextScale * 100)}%`;
    if (accessibilityFontLevel.textContent !== levelText) accessibilityFontLevel.textContent = levelText;
  }
}

const accessibilityContentObserver = new MutationObserver(records => {
  if (accessibilityTextScale === 1) return;
  records.forEach(record => record.addedNodes.forEach(node => {
    if (node instanceof Element) applyAccessibilityTextScale(node);
  }));
});
accessibilityContentObserver.observe(document.body, { childList: true, subtree: true });

function toggleAccessibilityPanel() {
  const isOpen = accessibilityPanel.classList.toggle('open');
  accessibilityPanel.setAttribute('aria-hidden', String(!isOpen));
  accessibilityButton.setAttribute('aria-expanded', String(isOpen));
}

function setAccessibilityFont(direction) {
  const adjustment = direction === 'increase' ? accessibilityScaleStep : -accessibilityScaleStep;
  accessibilityTextScale = Math.min(accessibilityMaximumScale, Math.max(accessibilityMinimumScale, Math.round((accessibilityTextScale + adjustment) * 10) / 10));
  applyAccessibilityTextScale();
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
    scale: accessibilityTextScale,
    toggles: accessibilitySettings
      .filter(setting => document.body.classList.contains(`accessibility-${setting}`))
      .map(setting => `accessibility-${setting}`)
  };
  try { localStorage.setItem(accessibilityStorageKey, JSON.stringify(settings)); } catch (error) { /* Preferences still work for this session. */ }
}

function updateAccessibilityButtons() {
  document.querySelectorAll('.accessibility-option').forEach(button => {
    const action = button.dataset.action;
    const isToggle = accessibilitySettings.includes(action);
    const isActive = isToggle && document.body.classList.contains(`accessibility-${action}`);
    button.classList.toggle('active', isActive);
    if (isToggle) button.setAttribute('aria-pressed', String(isActive));
    else button.removeAttribute('aria-pressed');
  });
}

function resetAccessibilitySettings() {
  accessibilityTextScale = 1;
  document.body.classList.remove('accessibility-high-contrast', 'accessibility-grayscale', 'accessibility-highlight-links', 'accessibility-extra-spacing', 'accessibility-large-cursor', 'accessibility-stop-animations');
  applyAccessibilityTextScale();
  try { localStorage.removeItem(accessibilityStorageKey); } catch (error) { /* Ignore unavailable storage. */ }
  updateAccessibilityButtons();
}

function loadAccessibilitySettings() {
  rememberAccessibilityFonts();
  let settings = {};
  try {
    const savedSettings = JSON.parse(localStorage.getItem(accessibilityStorageKey) || '{}');
    if (savedSettings && typeof savedSettings === 'object') settings = savedSettings;
  } catch (error) { settings = {}; }
  if (Number.isFinite(settings.scale)) accessibilityTextScale = Math.min(accessibilityMaximumScale, Math.max(accessibilityMinimumScale, settings.scale));
  else if (settings.font === 'large') accessibilityTextScale = 1.2;
  else if (settings.font === 'xlarge') accessibilityTextScale = 1.4;
  else if (settings.font === 'small') accessibilityTextScale = 0.9;
  if (Array.isArray(settings.toggles)) {
    settings.toggles.forEach(setting => {
      if (typeof setting === 'string' && setting.startsWith('accessibility-')) {
        const name = setting.slice('accessibility-'.length);
        if (accessibilitySettings.includes(name)) document.body.classList.add(setting);
      }
    });
  }
  applyAccessibilityTextScale();
  updateAccessibilityButtons();
}

loadAccessibilitySettings();
