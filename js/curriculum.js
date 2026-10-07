const candidateProfileStorageKey = 'stackhire-candidate-profile';
const ARGENTINA_LOCATIONS = {
  'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bah\u00eda Blanca', 'Tandil', 'San Nicol\u00e1s de los Arroyos'],
  'Ciudad Aut\u00f3noma de Buenos Aires': ['Ciudad Aut\u00f3noma de Buenos Aires'],
  'Catamarca': ['San Fernando del Valle de Catamarca', 'Bel\u00e9n', 'Andalgal\u00e1', 'Tinogasta', 'Santa Mar\u00eda'],
  'Chaco': ['Resistencia', 'Presidencia Roque S\u00e1enz Pe\u00f1a', 'Villa \u00c1ngela', 'Charata', 'General Jos\u00e9 de San Mart\u00edn'],
  'Chubut': ['Comodoro Rivadavia', 'Trelew', 'Puerto Madryn', 'Rawson', 'Esquel'],
  'C\u00f3rdoba': ['C\u00f3rdoba', 'R\u00edo Cuarto', 'Villa Mar\u00eda', 'San Francisco', 'Villa Carlos Paz'],
  'Corrientes': ['Corrientes', 'Goya', 'Paso de los Libres', 'Mercedes', 'Curuz\u00fa Cuati\u00e1'],
  'Entre R\u00edos': ['Paran\u00e1', 'Concordia', 'Gualeguaych\u00fa', 'Concepci\u00f3n del Uruguay', 'Villaguay'],
  'Formosa': ['Formosa', 'Clorinda', 'Piran\u00e9', 'El Colorado', 'Las Lomitas'],
  'Jujuy': ['San Salvador de Jujuy', 'San Pedro', 'Libertador General San Mart\u00edn', 'Palpal\u00e1', 'Perico'],
  'La Pampa': ['Santa Rosa', 'General Pico', 'Toay', 'General Acha', 'Eduardo Castex'],
  'La Rioja': ['La Rioja', 'Chilecito', 'Chamical', 'Aimogasta', 'Chepes'],
  'Mendoza': ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Guaymall\u00e9n', 'Las Heras'],
  'Misiones': ['Posadas', 'Ober\u00e1', 'Eldorado', 'Puerto Iguaz\u00fa', 'Ap\u00f3stoles'],
  'Neuqu\u00e9n': ['Neuqu\u00e9n', 'San Mart\u00edn de los Andes', 'Cutral C\u00f3', 'Zapala', 'Plottier'],
  'R\u00edo Negro': ['San Carlos de Bariloche', 'General Roca', 'Cipolletti', 'Viedma', 'Villa Regina'],
  'Salta': ['Salta', 'San Ram\u00f3n de la Nueva Or\u00e1n', 'Tartagal', 'Met\u00e1n', 'Cafayate'],
  'San Juan': ['San Juan', 'Rawson', 'Rivadavia', 'Caucete', 'San Jos\u00e9 de J\u00e1chal'],
  'San Luis': ['San Luis', 'Villa Mercedes', 'Merlo', 'La Toma', 'Quines'],
  'Santa Cruz': ['R\u00edo Gallegos', 'Caleta Olivia', 'El Calafate', 'Pico Truncado', 'Puerto Deseado'],
  'Santa Fe': ['Rosario', 'Santa Fe', 'Rafaela', 'Reconquista', 'Venado Tuerto', 'Gálvez'],
  'Santiago del Estero': ['Santiago del Estero', 'La Banda', 'Termas de R\u00edo Hondo', 'Fr\u00edas', 'A\u00f1atuya'],
  'Tierra del Fuego, Ant\u00e1rtida e Islas del Atl\u00e1ntico Sur': ['Ushuaia', 'R\u00edo Grande', 'Tolhuin'],
  'Tucum\u00e1n': ['San Miguel de Tucum\u00e1n', 'Taf\u00ed Viejo', 'Yerba Buena', 'Concepci\u00f3n', 'Banda del R\u00edo Sal\u00ed']
};
function populateCurriculumLocations(savedProvince = '', savedCity = '') {
  const provinceSelect = document.getElementById('curriculum-province');
  provinceSelect.replaceChildren(new Option('Selecciona una provincia', ''));
  Object.keys(ARGENTINA_LOCATIONS).forEach(province => provinceSelect.add(new Option(province, province)));
  if (savedProvince && !Object.prototype.hasOwnProperty.call(ARGENTINA_LOCATIONS, savedProvince)) provinceSelect.add(new Option(savedProvince, savedProvince));
  provinceSelect.value = savedProvince;
  updateCurriculumCities(savedCity);
}

function updateCurriculumCities(savedCity = '') {
  const province = document.getElementById('curriculum-province').value;
  const citySelect = document.getElementById('curriculum-city');
  const cities = ARGENTINA_LOCATIONS[province] || [];
  citySelect.replaceChildren(new Option(province ? 'Selecciona una ciudad' : 'Primero selecciona una provincia', ''));
  cities.forEach(city => citySelect.add(new Option(city, city)));
  if (savedCity && !cities.includes(savedCity)) citySelect.add(new Option(savedCity, savedCity));
  citySelect.disabled = !province;
  citySelect.value = savedCity && (cities.includes(savedCity) || !cities.length) ? savedCity : '';
}
let candidateCurriculumPhoto = '';
let candidateCurriculumPhotoName = '';

function loadCandidateCurriculum() {
  let profile = {};
  try {
    profile = JSON.parse(localStorage.getItem(getCandidateProfileStorageKey()) || '{}');
  } catch (error) {
    profile = {};
  }
  const name = document.getElementById('dashboard-user-name').textContent.trim();
  document.getElementById('curriculum-first-name').value = profile.firstName || name;
  document.getElementById('curriculum-last-name').value = profile.lastName || '';
  document.getElementById('curriculum-phone').value = profile.phone || '';
  document.getElementById('curriculum-email').value = profile.email || document.getElementById('login-email').value.trim();
  document.getElementById('curriculum-linkedin').value = profile.linkedin || '';
  document.getElementById('curriculum-website').value = profile.website || '';
  document.getElementById('curriculum-github').value = profile.github || '';
  populateCurriculumLocations(profile.province || '', profile.city || '');

  renderCurriculumEntries('education', profile.education || []);
  renderCurriculumEntries('experience', profile.experience || []);
  renderCurriculumExtras('languages', profile.languages || []);
  renderCurriculumExtras('certifications', profile.certifications || []);
  renderCurriculumExtras('skills', profile.skills || []);
  candidateCurriculumPhoto = profile.photo || '';
  candidateCurriculumPhotoName = profile.photoName || '';
  updateCurriculumPhotoPreview();
  document.getElementById('curriculum-status').textContent = '';
}

function loadCandidateCurriculumDemo() {
  const profile = CANDIDATE_CURRICULUM_DEMO_DATA;
  document.getElementById('curriculum-first-name').value = profile.firstName;
  document.getElementById('curriculum-last-name').value = profile.lastName;
  document.getElementById('curriculum-phone').value = profile.phone;
  document.getElementById('curriculum-email').value = profile.email;
  document.getElementById('curriculum-linkedin').value = profile.linkedin;
  document.getElementById('curriculum-website').value = profile.website;
  document.getElementById('curriculum-github').value = profile.github;
  document.getElementById('curriculum-province').value = profile.province;
  updateCurriculumCities(profile.city);
  renderCurriculumEntries('education', profile.education);
  renderCurriculumEntries('experience', profile.experience);
  renderCurriculumExtras('languages', profile.languages);
  renderCurriculumExtras('certifications', profile.certifications);
  renderCurriculumExtras('skills', profile.skills);
  clearCurriculumPhoto();
  document.getElementById('curriculum-status').textContent = '';
  document.getElementById('curriculum-demo-status').textContent = 'Datos de prueba cargados. Guarda el currículum para conservarlos.';
}

function previewCurriculumPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('curriculum-status');
  if (!file.type.startsWith('image/')) {
    status.textContent = 'Selecciona un archivo de imagen.';
    event.target.value = '';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    status.textContent = 'La imagen supera el l\u00edmite de 2 MB.';
    event.target.value = '';
    return;
  }
  const previousName = candidateCurriculumPhotoName;
  candidateCurriculumPhotoName = file.name;
  document.getElementById('curriculum-photo-upload-title').textContent = 'Cargando foto...';
  document.getElementById('curriculum-photo-upload-hint').textContent = file.name;
  status.textContent = '';
  const reader = new FileReader();
  reader.onload = () => {
    candidateCurriculumPhoto = reader.result;
    updateCurriculumPhotoPreview();
    status.textContent = '';
  };
  reader.onerror = () => {
    candidateCurriculumPhotoName = previousName;
    updateCurriculumPhotoPreview();
    status.textContent = 'No se pudo leer la imagen. Intenta con otro archivo.';
  };
  reader.readAsDataURL(file);
}

function updateCurriculumPhotoPreview() {
  const image = document.getElementById('curriculum-photo-preview');
  const placeholder = document.getElementById('curriculum-photo-placeholder');
  const clearButton = document.getElementById('curriculum-photo-clear');
  const uploadTitle = document.getElementById('curriculum-photo-upload-title');
  const uploadHint = document.getElementById('curriculum-photo-upload-hint');
  const uploadAction = document.getElementById('curriculum-photo-upload-action');
  if (candidateCurriculumPhoto) {
    image.src = candidateCurriculumPhoto;
    image.classList.remove('hidden');
    placeholder.classList.add('hidden');
    clearButton.classList.remove('hidden');
    uploadTitle.textContent = 'Foto seleccionada';
    uploadHint.textContent = candidateCurriculumPhotoName || 'Tu foto esta guardada en este navegador.';
    uploadAction.textContent = 'Cambiar foto';
  } else {
    image.removeAttribute('src');
    image.classList.add('hidden');
    placeholder.classList.remove('hidden');
    clearButton.classList.add('hidden');
    uploadTitle.textContent = 'Subir foto de perfil';
    uploadHint.textContent = 'JPG, PNG o similar \u00b7 hasta 2 MB';
    uploadAction.textContent = 'Elegir foto';
  }
}

function clearCurriculumPhoto() {
  candidateCurriculumPhoto = '';
  candidateCurriculumPhotoName = '';
  document.getElementById('curriculum-photo-input').value = '';
  updateCurriculumPhotoPreview();
}
async function saveCandidateCurriculum(event) {
  event.preventDefault();
  document.getElementById('curriculum-status').textContent = 'Guardando...';
  const pendingFileReads = Array.from(document.querySelectorAll('#curriculum-certifications-list .curriculum-entry-card'))
    .map(card => card._fileReadPromise)
    .filter(Boolean);
  await Promise.all(pendingFileReads);
  const profile = {
    firstName: document.getElementById('curriculum-first-name').value.trim(),
    lastName: document.getElementById('curriculum-last-name').value.trim(),
    phone: document.getElementById('curriculum-phone').value.trim(),
    email: document.getElementById('curriculum-email').value.trim(),
    linkedin: document.getElementById('curriculum-linkedin').value.trim(),
    website: document.getElementById('curriculum-website').value.trim(),
    github: document.getElementById('curriculum-github').value.trim(),
    province: document.getElementById('curriculum-province').value.trim(),
    city: document.getElementById('curriculum-city').value.trim(),
    education: collectCurriculumEntries('education'),
    experience: collectCurriculumEntries('experience'),
    languages: collectCurriculumExtras('languages'),
    certifications: collectCurriculumExtras('certifications'),
    skills: collectCurriculumExtras('skills'),
    photo: candidateCurriculumPhoto,
    photoName: candidateCurriculumPhotoName
  };
  try {
    localStorage.setItem(getCandidateProfileStorageKey(), JSON.stringify(profile));
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    document.getElementById('dashboard-user-name').textContent = fullName;
    document.getElementById('dashboard-welcome-title').textContent = `Bienvenido, ${fullName}`;
    document.getElementById('curriculum-status').textContent = 'Tu curr\u00edculum se guard\u00f3 en este navegador.';
    renderCandidateDashboardHome();
  } catch (error) {
    document.getElementById('curriculum-status').textContent = 'No se pudo guardar. Prueba con una imagen m\u00e1s peque\u00f1a.';
  }
}
function getCandidateDisplayName(fallback) {
  try {
    const profile = JSON.parse(localStorage.getItem(getCandidateProfileStorageKey()) || '{}');
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
    return fullName || fallback;
  } catch (error) {
    return fallback;
  }
}
function addCurriculumEntry(type, value = {}) {
  const list = document.getElementById(type === 'education' ? 'curriculum-education-list' : 'curriculum-experience-list');
  const card = document.createElement('div');
  card.className = 'curriculum-entry-card' + (type === 'skills' ? ' curriculum-skill-entry' : '');
  const fields = type === 'education'
    ? [['institution', 'Centro educativo', 'text'], ['level', 'Nivel de estudios', 'select'], ['career', 'Carrera', 'text'], ['startDate', 'Desde', 'date'], ['endDate', 'Hasta', 'date']]
    : [['position', 'Cargo o puesto ocupado', 'text'], ['company', 'Nombre de la empresa', 'text'], ['description', 'Descripci\u00f3n', 'textarea'], ['startDate', 'Desde', 'date'], ['endDate', 'Hasta', 'date']];
  const grid = document.createElement('div');
  grid.className = 'curriculum-form-grid' + (type === 'skills' ? ' curriculum-skill-grid' : '');
  fields.forEach(([key, label, kind]) => {
    const wrap = document.createElement('label');
    wrap.textContent = label;
    let input;
    if (kind === 'language') {
      input = document.createElement('select');
      const languages = ['Espa\u00f1ol', 'Ingl\u00e9s', 'Portugu\u00e9s', 'Franc\u00e9s', 'Alem\u00e1n', 'Italiano', 'Mandar\u00edn', 'Hindi', '\u00c1rabe', 'Ruso', 'Japon\u00e9s', 'Coreano', 'Bengal\u00ed', 'Urdu', 'Indonesio', 'Punjabi'];
      if (value[key] && !languages.includes(value[key])) languages.push(value[key]);
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Selecciona un idioma';
      input.appendChild(placeholder);
      languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        input.appendChild(option);
      });
    } else if (kind === 'select') {
      input = document.createElement('select');
      input.innerHTML = '<option value="">Selecciona un nivel</option><option>Primario</option><option>Secundario</option><option>Terciario</option><option>Universitario</option>';
    } else if (kind === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 3;
    } else {
      input = document.createElement('input');
      input.type = kind;
    }
    input.dataset.field = key;
    input.value = value[key] || '';
    wrap.appendChild(input);
    grid.appendChild(wrap);
  });
  const currentLabel = document.createElement('label');
  currentLabel.className = 'curriculum-current-toggle';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.dataset.field = 'current';
  checkbox.checked = Boolean(value.current);
  currentLabel.append(checkbox, document.createTextNode(type === 'education' ? 'Actualmente cursando' : 'Actualmente trabajando'));
  grid.appendChild(currentLabel);
  const endInput = grid.querySelector('[data-field="endDate"]');
  const endLabel = endInput.closest('label');
  const syncEndDate = () => {
    endLabel.hidden = checkbox.checked;
    if (checkbox.checked) endInput.value = '';
  };
  checkbox.addEventListener('change', syncEndDate);
  syncEndDate();
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'curriculum-remove-entry';
  setCurriculumTrashButton(remove, 'Eliminar entrada');
  remove.addEventListener('click', () => card.remove());
  card.append(grid, remove);
  list.appendChild(card);
}

function renderCurriculumEntries(type, entries) {
  const list = document.getElementById(type === 'education' ? 'curriculum-education-list' : 'curriculum-experience-list');
  list.replaceChildren();
  if (entries.length) entries.forEach(entry => addCurriculumEntry(type, entry));
  else addCurriculumEntry(type);
}

function collectCurriculumEntries(type) {
  const list = document.getElementById(type === 'education' ? 'curriculum-education-list' : 'curriculum-experience-list');
  return Array.from(list.querySelectorAll('.curriculum-entry-card')).map(card => {
    const entry = {};
    card.querySelectorAll('[data-field]').forEach(field => {
      entry[field.dataset.field] = field.type === 'checkbox' ? field.checked : field.value.trim();
    });
    if (entry.current) entry.endDate = '';
    return entry;
  });
}
function addCurriculumExtra(type, value = {}) {
  const list = document.getElementById('curriculum-' + type + '-list');
  if (type === 'skills') list.classList.add('curriculum-skills-list');
  const card = document.createElement('div');
  card.className = 'curriculum-entry-card' + (type === 'skills' ? ' curriculum-skill-entry' : '');
  const grid = document.createElement('div');
  grid.className = 'curriculum-form-grid' + (type === 'skills' ? ' curriculum-skill-grid' : '');
  const fields = type === 'languages'
    ? [['name', 'Idioma', 'language'], ['level', 'Nivel', 'select']]
    : type === 'certifications'
      ? [['name', 'Nombre de la certificaci\u00f3n', 'text'], ['description', 'Descripci\u00f3n', 'textarea'], ['issuer', 'Empresa emisora', 'text']]
      : [['name', 'Habilidad', 'text']];
  fields.forEach(([key, label, kind]) => {
    const wrap = document.createElement('label');
    wrap.textContent = label;
    let input;
    if (kind === 'language') {
      input = document.createElement('select');
      const languages = ['Espa\u00f1ol', 'Ingl\u00e9s', 'Portugu\u00e9s', 'Franc\u00e9s', 'Alem\u00e1n', 'Italiano', 'Mandar\u00edn', 'Hindi', '\u00c1rabe', 'Ruso', 'Japon\u00e9s', 'Coreano', 'Bengal\u00ed', 'Urdu', 'Indonesio', 'Punjabi'];
      if (value[key] && !languages.includes(value[key])) languages.push(value[key]);
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Selecciona un idioma';
      input.appendChild(placeholder);
      languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        input.appendChild(option);
      });
    } else if (kind === 'select') {
      input = document.createElement('select');
      input.innerHTML = '<option value="">Selecciona un nivel</option><option>Principiante</option><option>Intermedio</option><option>Avanzado</option>';
    } else if (kind === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 3;
    } else {
      input = document.createElement('input');
      input.type = 'text';
    }
    input.dataset.field = key;
    input.value = value[key] || '';
    wrap.appendChild(input);
    grid.appendChild(wrap);
  });
  if (type === 'certifications') {
    const fileWrap = document.createElement('label');
    fileWrap.className = 'curriculum-certificate-file';
    const uploadIcon = document.createElement('span');
    uploadIcon.className = 'curriculum-upload-icon';
    uploadIcon.setAttribute('aria-hidden', 'true');
    uploadIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 17v-6m-3 3 3-3 3 3"/></svg>';
    const uploadCopy = document.createElement('span');
    uploadCopy.className = 'curriculum-upload-copy';
    const uploadTitle = document.createElement('strong');
    uploadTitle.textContent = 'Adjunta tu certificado';
    const uploadHint = document.createElement('small');
    uploadHint.textContent = 'PDF o imagen \u00b7 hasta 1 MB';
    uploadCopy.append(uploadTitle, uploadHint);
    const uploadAction = document.createElement('span');
    uploadAction.className = 'curriculum-upload-action';
    uploadAction.textContent = 'Elegir archivo';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.className = 'curriculum-certificate-input';
    fileInput.accept = '.pdf,image/*';
    fileInput.dataset.fileInput = 'true';
    fileWrap.append(uploadIcon, uploadCopy, uploadAction, fileInput);
    grid.appendChild(fileWrap);
    const fileStatus = document.createElement('div');
    fileStatus.className = 'curriculum-file-status';
    card._attachment = value.attachment || null;
    const showAttachment = () => {
      fileStatus.replaceChildren();
      uploadTitle.textContent = card._attachment ? 'Certificado adjunto' : 'Adjunta tu certificado';
      uploadHint.textContent = card._attachment ? card._attachment.name : 'PDF o imagen \u00b7 hasta 1 MB';
      uploadAction.textContent = card._attachment ? 'Cambiar archivo' : 'Elegir archivo';
      if (!card._attachment) return;
      if (card._attachment.type.startsWith('image/')) {
        const preview = document.createElement('img');
        preview.className = 'curriculum-certificate-preview';
        preview.src = card._attachment.data;
        preview.alt = 'Vista previa de ' + card._attachment.name;
        fileStatus.appendChild(preview);
      } else if (card._attachment.type === 'application/pdf') {
        const preview = document.createElement('object');
        preview.className = 'curriculum-certificate-preview curriculum-certificate-pdf-preview';
        preview.type = 'application/pdf';
        preview.data = card._attachment.data;
        preview.setAttribute('aria-label', 'Vista previa de ' + card._attachment.name);
        fileStatus.appendChild(preview);
      }
      const link = document.createElement('a');
      link.href = card._attachment.data;
      link.download = card._attachment.name;
      link.textContent = 'Descargar ' + card._attachment.name;
      fileStatus.appendChild(link);
      const clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'curriculum-remove-entry';
      setCurriculumTrashButton(clear, 'Eliminar archivo del certificado');
      clear.addEventListener('click', () => {
        card._attachment = null;
        fileInput.value = '';
        showAttachment();
      });
      fileStatus.appendChild(clear);
    };
    showAttachment();
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const status = document.getElementById('curriculum-status');
      if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) {
        status.textContent = 'Adjunta un archivo PDF o una imagen.';
        fileInput.value = '';
        return;
      }
      if (file.size > 1024 * 1024) {
        status.textContent = 'El archivo supera el l\u00edmite de 1 MB.';
        fileInput.value = '';
        return;
      }
      uploadTitle.textContent = 'Cargando certificado...';
      uploadHint.textContent = file.name;
      status.textContent = '';
      card._fileReadPromise = new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          card._attachment = { name: file.name, type: file.type, data: reader.result };
          showAttachment();
          status.textContent = '';
          resolve();
        };
        reader.onerror = () => {
          showAttachment();
          status.textContent = 'No se pudo leer el certificado.';
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });
    card.append(grid, fileStatus);
  } else {
    card.appendChild(grid);
  }
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'curriculum-remove-entry';
  setCurriculumTrashButton(remove, 'Eliminar entrada');
  remove.addEventListener('click', () => card.remove());
  card.appendChild(remove);
  list.appendChild(card);
}

function renderCurriculumExtras(type, entries) {
  const list = document.getElementById('curriculum-' + type + '-list');
  if (type === 'skills') list.classList.add('curriculum-skills-list');
  list.replaceChildren();
  if (entries.length) entries.forEach(entry => addCurriculumExtra(type, entry));
  else addCurriculumExtra(type);
}

function collectCurriculumExtras(type) {
  const list = document.getElementById('curriculum-' + type + '-list');
  return Array.from(list.querySelectorAll('.curriculum-entry-card')).map(card => {
    const entry = {};
    card.querySelectorAll('[data-field]').forEach(field => {
      entry[field.dataset.field] = field.value.trim();
    });
    if (type === 'certifications') entry.attachment = card._attachment || null;
    return entry;
  });
}
function setCurriculumTrashButton(button, label) {
  button.className = 'curriculum-remove-entry curriculum-trash-button';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>';
}
