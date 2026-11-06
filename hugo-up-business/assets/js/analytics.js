// Basic consent: this local module never loads Google until explicit, stored consent.
const configNode = document.getElementById('analytics-config');
if (configNode) {
  const config = JSON.parse(configNode.textContent);
  const panel = document.getElementById('analytics-consent');
  const preferences = document.querySelector('[data-analytics-preferences]');
  const status = document.getElementById('analytics-status');
  const key = `jveng.analytics.consent.v1:${config.cookiePath}`;
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const disabledKey = `ga-disable-${config.id}`;
  const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  let choice = 'unknown';
  let started = false;
  let ready = false;
  let reconciled = false;
  let expiryTimer;
  let opener;
  let lastOutsideFocus;
  const storageAvailable = () => {
    try {
      const probe = `${key}.probe`;
      localStorage.setItem(probe, '1'); localStorage.removeItem(probe);
      return true;
    } catch { return false; }
  };
  const readChoice = () => {
    if (!storageAvailable()) return null;
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value?.version === 1 && ['accepted', 'denied'].includes(value.choice) &&
        Number.isFinite(value.expires) && value.expires > Date.now() && value.expires <= Date.now() + lifetime
        ? value : null;
    } catch { return null; }
  };
  const saveChoice = value => {
    try {
      if (!storageAvailable()) return null;
      const record = { version: 1, choice: value, expires: Date.now() + lifetime };
      localStorage.setItem(key, JSON.stringify(record));
      return record;
    } catch { return null; }
  };
  function setPanel(open, focus = false) {
    panel.hidden = !open;
    preferences.setAttribute('aria-expanded', String(open));
    if (focus && open) document.getElementById('analytics-consent-title').focus();
    if (focus && !open) (opener || lastOutsideFocus)?.focus({ preventScroll: true });
  }
  function clearCookies() {
    // Only this site's prefixed cookies, never cookies belonging to other Pages sites.
    document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(n => /^jveng_ga(?:_|$)/.test(n)).forEach(name => {
      document.cookie = `${name}=; Max-Age=0; Path=${config.cookiePath}; SameSite=Lax; Secure`;
    });
  }
  function stop() {
    choice = 'denied'; ready = false;
    window[disabledKey] = true;
    clearTimeout(expiryTimer);
    clearCookies();
    // Removing a script element does not unload third-party code. Reload into
    // a denied document; do not issue advanced-mode cookieless consent pings.
    if (started) location.reload();
  }
  function scheduleExpiry(record) {
    clearTimeout(expiryTimer);
    expiryTimer = setTimeout(() => {
      if (Date.now() >= record.expires) { stop(); if (!started) setPanel(true); }
      else scheduleExpiry(record);
    }, Math.min(record.expires - Date.now(), 2147483647));
  }
  function start(record) {
    if (started) { scheduleExpiry(record); return; }
    choice = 'accepted'; started = true; window[disabledKey] = false;
    window.dataLayer = window.dataLayer || [];
    const gtag = function () { window.dataLayer.push(arguments); };
    window.gtag = gtag;
    gtag('consent', 'default', denied);
    gtag('consent', 'update', { ...denied, analytics_storage: 'granted' });
    gtag('js', new Date());
    let referrer = '';
    try { referrer = new URL(document.referrer).origin + '/'; } catch { /* direct visit */ }
    gtag('config', config.id, {
      send_page_view: false,
      page_location: config.page, page_title: config.title, page_referrer: referrer,
      allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_domain: 'none', cookie_path: config.cookiePath, cookie_prefix: 'jveng',
      cookie_flags: 'SameSite=Lax;Secure',
      cookie_expires: 15552000, cookie_update: false
    });
    gtag('event', 'page_view', { page_location: config.page, page_title: config.title, page_referrer: referrer });
    const loadTag = () => {
      if (choice !== 'accepted' || window[disabledKey] || readChoice()?.choice !== 'accepted') return;
      const tag = document.createElement('script');
      tag.referrerPolicy = 'no-referrer';
      tag.fetchPriority = 'low';
      tag.async = true; tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.id)}`;
      tag.onload = () => { ready = choice === 'accepted'; };
      tag.onerror = () => { ready = false; };
      document.head.append(tag);
    };
    const afterLoad = () => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(loadTag, { timeout: 1500 });
      else setTimeout(loadTag, 0);
    };
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });
    scheduleExpiry(record);
  }
  preferences.hidden = false;
  preferences.addEventListener('click', () => {
    opener = preferences;
    status.textContent = choice === 'accepted' ? 'Analytics autorizado. Você pode desativar a medição abaixo.' : 'Analytics não está autorizado.';
    setPanel(panel.hidden, true);
  });
  panel.querySelector('[data-analytics-close]').addEventListener('click', () => setPanel(false, true));
  document.addEventListener('focusin', event => {
    if (!panel.contains(event.target)) lastOutsideFocus = event.target;
  });
  document.addEventListener('keydown', event => {
    const navigationOpen = document.querySelector('[data-navigation-toggle]')?.getAttribute('aria-expanded') === 'true';
    if (event.key === 'Escape' && !event.defaultPrevented && !panel.hidden && !navigationOpen) {
      event.preventDefault(); setPanel(false, panel.contains(document.activeElement));
    }
  });
  for (const button of panel.querySelectorAll('[data-analytics-choice]')) {
    button.addEventListener('click', () => {
      const next = button.dataset.analyticsChoice;
      const record = saveChoice(next);
      if (next === 'denied') {
        if (!record) { try { localStorage.removeItem(key); } catch { /* next load fails closed */ } }
        stop(); setPanel(false, true);
      } else if (record) {
        start(record); setPanel(false, true);
      } else {
        status.textContent = 'Não foi possível salvar sua escolha. Analytics permanece desativado; você pode usar todo o site.';
      }
    });
  }
  function reconcile() {
    const record = readChoice();
    if (started && record?.choice !== 'accepted') stop();
    else if (!started && record?.choice === 'accepted') { start(record); setPanel(false); }
    else if (!started && record?.choice === 'denied') { choice = 'denied'; setPanel(false); }
    else if (!started && !reconciled) setPanel(true);
    reconciled = true;
  }
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) reconcile(); });
  window.addEventListener('pageshow', reconcile);
  window.addEventListener('focus', reconcile);
  window[disabledKey] = true;
  if (readChoice()?.choice !== 'accepted') clearCookies();
  reconcile();
  function contact(event) {
    if (!event.isTrusted || event.defaultPrevented || (event.type === 'auxclick' && event.button !== 1) || (event.type === 'click' && event.button !== 0)) return;
    if (choice !== 'accepted' || !ready || readChoice()?.choice !== 'accepted') return;
    const anchor = event.target.closest?.('a[href]');
    if (!anchor) return;
    let target, authorized;
    try { target = new URL(anchor.href); authorized = new URL(config.contact); } catch { return; }
    if (target.origin !== authorized.origin || target.pathname !== authorized.pathname) return;
    let location = 'page_content';
    if (anchor.closest('footer')) location = 'footer';
    else if (anchor.closest('[data-navigation]')) location = 'header';
    else if (anchor.closest('#hero')) location = 'hero';
    else if (anchor.closest('#services')) location = 'home_services';
    else if (anchor.closest('#about')) location = 'about';
    else if (anchor.closest('#portfolio')) location = 'home_portfolio';
    else if (anchor.closest('#testimonials')) location = 'approach';
    else if (anchor.closest('main section > div > header')) location = 'service_intro';
    else if (anchor.closest('section[aria-labelledby="conversar"]')) location = 'service_end';
    else if (config.pageType === 'home') location = 'home_cta';
    const componentService = anchor.closest('[data-contact-service]')?.dataset.contactService;
    const service = ['matlab', 'python'].includes(componentService) ? componentService : config.serviceType;
    window.gtag('event', 'contact_click', {
      contact_method: 'whatsapp', cta_location: location,
      page_type: config.pageType, service_type: service
    });
  }
  document.addEventListener('click', contact);
  document.addEventListener('auxclick', contact);
}
