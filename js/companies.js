// ============================================================
// companies.js — Página "Empresas" (agrupa empleos por empresa)
// Depende de: data.js (JOBS), navigation.js (showResults), filters.js/navigation.js
// ============================================================

function renderCompanies() {
  // Aggregate job counts per company
  const companyMap = {};
  JOBS.filter(isJobVisibleToCandidates).forEach(j => {
    if (!companyMap[j.empresa]) {
      companyMap[j.empresa] = { empresa: j.empresa, logo: j.logo, logoColor: j.logoColor, logoText: j.logoText, roles: 0, tecnologias: new Set(), provincias: new Set(), modalidades: new Set() };
    }
    companyMap[j.empresa].roles++;
    j.tecnologias.forEach(t => companyMap[j.empresa].tecnologias.add(t));
    companyMap[j.empresa].provincias.add(j.provincia);
    companyMap[j.empresa].modalidades.add(j.modalidad);
  });

  // Sort by roles desc, take top 10
  const sorted = Object.values(companyMap).sort((a,b) => b.roles - a.roles).slice(0, 10);

  // Industry labels per company
  const INDUSTRIES = {
    'Mercado Libre':'E-commerce', 'Globant':'Consultoría IT', 'Auth0':'Ciberseguridad',
    'Despegar':'Travel Tech', 'Naranja X':'Fintech', 'Uala':'Fintech',
    'Santander Tech':'Banca Digital', 'Banco Galicia':'Banca Digital', 'Ualá':'Fintech',
    'OLX':'Marketplace', 'Frávega Tech':'Retail Tech', 'MercadoPago':'Fintech',
    'Softtek':'Consultoría IT', 'Accenture':'Consultoría IT', 'Prisma':'Fintech',
    'Pomelo':'Fintech', 'La Anónima':'Retail Tech', 'Telecom':'Telecomunicaciones',
    'PedidosYa':'Delivery Tech'
  };

  // Descriptions per company
  const DESCS = {
    'Mercado Libre':'El ecosistema de comercio y pagos más grande de América Latina.',
    'Globant':'Empresa global de tecnología enfocada en transformación digital.',
    'Accenture':'Consultoría líder en tecnología, estrategia y operaciones.',
    'Auth0':'Plataforma líder de autenticación e identidad para developers.',
    'Despegar':'La plataforma de viajes online más grande de Latinoamérica.',
    'Naranja X':'Fintech que democratiza el acceso a servicios financieros.',
    'Uala':'Billetera digital y plataforma de servicios financieros.',
    'Santander Tech':'Centro tecnológico global del Grupo Santander.',
    'Banco Galicia':'Banco digital líder en transformación tecnológica.',
    'Ualá':'App financiera con millones de usuarios en LATAM.',
    'OLX':'Marketplace de compraventa con presencia en todo el país.',
    'Frávega Tech':'Brazo tecnológico del retailer de electrónica más grande del país.',
    'MercadoPago':'La plataforma de pagos digitales líder en Latinoamérica.',
    'Softtek':'Empresa global de servicios de TI y soluciones digitales.',
    'Prisma':'Empresa líder en medios de pago y tecnología financiera.',
    'Pomelo':'Infraestructura de emisión de tarjetas para fintechs.',
    'La Anónima':'Cadena de supermercados con fuerte inversión en tech.',
    'Telecom':'Empresa de telecomunicaciones líder en Argentina.',
    'PedidosYa':'La app de delivery más popular de Latinoamérica.'
  };

  // Top 3 get eco badge
  const ECO_COMPANIES = new Set(sorted.slice(0,3).map(c => c.empresa));

  const grid = document.getElementById('companies-grid');
  grid.innerHTML = sorted.map((c, i) => {
    const isEco = ECO_COMPANIES.has(c.empresa);
    const techs = [...c.tecnologias].slice(0,4);
    const modalList = [...c.modalidades].map(m => ({remota:'Remota',hibrida:'Híbrida',presencial:'Presencial'}[m]||m)).join(' · ');
    const provList = [...c.provincias].join(', ');
    return `
    <div class="company-card">
      ${isEco ? `<div class="eco-badge" title="Empresa certificada Eco Friendly">${ECO_SVG}</div>` : ''}
      <div class="flex items-center gap-4 mb-4" style="${isEco ? 'padding-right:60px' : ''}">
        <div class="company-big-logo" style="background:${c.logoColor};color:${c.logoText}">${c.logo}</div>
        <div>
          <h3 class="font-bold text-gray-900 text-base">${c.empresa}</h3>
          <span class="industry-tag">${INDUSTRIES[c.empresa]||'Tecnología'}</span>
        </div>
      </div>
      <p class="text-gray-500 text-sm leading-relaxed mb-4">${DESCS[c.empresa]||'Empresa tecnológica líder en el mercado.'}</p>
      <div class="flex flex-wrap gap-1 mb-4">
        ${techs.map(t => `<span class="badge badge-tech">${t}</span>`).join('')}
      </div>
      <div class="flex items-center justify-between text-xs text-gray-400 mb-5 border-t border-gray-100 pt-4">
        <span>📍 ${provList}</span>
        <span>🏢 ${modalList}</span>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">${c.roles}</span>
          <span class="text-gray-500 text-sm">${c.roles === 1 ? 'puesto abierto' : 'puestos abiertos'}</span>
        </div>
        <button onclick="searchByCompany('${c.empresa}')" class="open-roles-btn">
          Ver ofertas
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
}

function searchByCompany(nombre) {
  state.query = nombre;
  document.getElementById('results-search').value = nombre;
  document.getElementById('hero-search').value = nombre;
  buildFilters();
  renderJobs();
  showResults();
}
