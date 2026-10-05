function getUnreadCandidateInterviewCount() {
  return getCandidateApplications().filter(application => application.interview?.scheduledAt && !application.interview.readAt).length;
}
function updateCandidateNotificationBadge() {
  const badge = document.getElementById('dashboard-notifications-count');
  if (!badge) return;
  const count = getUnreadCandidateInterviewCount();
  badge.textContent = count > 99 ? '99+' : String(count);
  badge.classList.toggle('hidden', count === 0);
  badge.setAttribute('aria-label', count + ' notificaciones pendientes');
}
function markCandidateNotificationsRead() {
  const applications = getCandidateApplications();
  const readAt = new Date().toISOString();
  let changed = false;
  applications.forEach(application => {
    if (application.interview?.scheduledAt && !application.interview.readAt) {
      application.interview.readAt = readAt;
      changed = true;
    }
  });
  if (changed) {
    try { localStorage.setItem(getCandidateApplicationsStorageKey(), JSON.stringify(applications)); } catch (error) {}
  }
  updateCandidateNotificationBadge();
}
function renderCandidateNotifications() {
  const list = document.getElementById('candidate-notifications-list');
  if (!list) return;
  const interviews = getCandidateApplications()
    .filter(application => application.interview && application.interview.scheduledAt)
    .map(application => ({ application, job: JOBS.find(job => Number(job.id) === Number(application.jobId)) }))
    .filter(item => item.job)
    .sort((a, b) => new Date(a.application.interview.scheduledAt) - new Date(b.application.interview.scheduledAt));
  if (!interviews.length) {
    list.innerHTML = '<div class="favorites-empty"><h2>Todav&iacute;a no tienes notificaciones</h2><p>Cuando una empresa coordine una entrevista, ver&aacute;s aqu&iacute; el d&iacute;a y el horario.</p></div>';
    return;
  }
  list.innerHTML = interviews.map(({ application, job }) => {
    const interview = application.interview;
    const date = new Date(interview.scheduledAt);
    const dateLabel = date.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    const timeLabel = date.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' });
    const escape = value => String(value || '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
    let meetLink = '';
    try {
      const parsedLink = new URL(interview.meetLink || '');
      if (parsedLink.protocol === 'https:' && parsedLink.hostname === 'meet.google.com') meetLink = parsedLink.href;
    } catch (error) {}
    const description = interview.description ? '<p class="candidate-notification-description">' + escape(interview.description) + '</p>' : '';
    const meet = meetLink ? '<a class="candidate-notification-meet-link" href="' + escape(meetLink) + '" target="_blank" rel="noopener noreferrer">Unirse a Google Meet</a>' : '';
    return '<article class="candidate-interview-notification"><span class="candidate-notification-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg></span><div class="candidate-notification-body"><div class="candidate-notification-heading"><span>Entrevista coordinada</span><time datetime="' + escape(interview.scheduledAt) + '">' + escape(dateLabel) + ' &middot; ' + timeLabel + '</time></div><h3>' + escape(interview.jobTitle || job.tituloOferta) + '</h3><p>Tu entrevista con <strong>' + escape(interview.companyName || job.empresa) + '</strong> est&aacute; coordinada para el ' + escape(dateLabel) + ' a las ' + timeLabel + '.</p>' + description + meet + '</div></article>';
  }).join('');
}