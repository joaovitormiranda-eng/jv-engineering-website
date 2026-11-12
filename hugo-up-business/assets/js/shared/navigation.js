const navigation = document.querySelector('[data-navigation]')

if (navigation) {
  const toggle = navigation.querySelector('[data-navigation-toggle]')
  const panel = navigation.querySelector('[data-navigation-panel]')
  const desktop = window.matchMedia('(min-width: 80rem)')
  let open = false

  function setOpen(next, restoreFocus = false) {
    open = !desktop.matches && next
    panel.inert = !desktop.matches && !open
    panel.dataset.open = String(open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação')
    if (open) updateAvailableHeight()
    if (restoreFocus && !desktop.matches) toggle.focus({ preventScroll: true })
  }

  function updateAvailableHeight() {
    const viewport = window.visualViewport
    const bottom = navigation.getBoundingClientRect().bottom
    // Measure the actual dropdown top: its gap grows with text enlargement.
    const top = open ? panel.getBoundingClientRect().top : bottom + 8
    const available = (viewport?.height || innerHeight) - Math.max(0, top - (viewport?.offsetTop || 0)) - 12
    navigation.style.setProperty('--navigation-panel-height', `${Math.max(0, Math.floor(available))}px`)
  }

  function updateCurrentLink() {
    for (const link of panel.querySelectorAll('.navigation-link')) {
      const url = new URL(link.href, location.href)
      const current = url.origin === location.origin && url.pathname === location.pathname &&
        url.hash === (location.hash || '#hero')
      if (current) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    }
  }

  toggle.addEventListener('click', () => setOpen(!open))

  document.addEventListener('pointerdown', (event) => {
    if (open && !navigation.contains(event.target)) setOpen(false)
  })

  document.addEventListener('keydown', (event) => {
    if (open && event.key === 'Escape') {
      event.preventDefault()
      setOpen(false, true)
    }
  })

  // Tab follows the document order; this disclosure does not trap focus.
  document.addEventListener('focusin', (event) => {
    if (open && !panel.contains(event.target) && !toggle.contains(event.target)) setOpen(false)
  })

  panel.addEventListener('click', (event) => {
    const link = event.target.closest('a')
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return

    const url = new URL(link.href, window.location.href)
    let target
    if (link.target !== '_blank' && url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) {
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))) }
      catch { /* Leave malformed fragments to the browser. */ }
    }

    if (target) {
      event.preventDefault()
      setOpen(false)
      if (location.hash !== url.hash) history.pushState(null, '', url.href)
      const focusTarget = target.querySelector('h1, h2, h3') || target
      if (!focusTarget.hasAttribute('tabindex')) {
        focusTarget.setAttribute('tabindex', '-1')
        focusTarget.addEventListener('blur', () => focusTarget.removeAttribute('tabindex'), { once: true })
      }
      focusTarget.focus({ preventScroll: true })
      target.scrollIntoView({ block: 'start' })
      updateCurrentLink()
    } else if (!desktop.matches) {
      setOpen(false, link.target === '_blank')
    }
  })

  function syncBreakpoint() {
    const active = document.activeElement
    const wasInPanel = panel.contains(active)
    setOpen(false)
    if (!desktop.matches && wasInPanel) toggle.focus({ preventScroll: true })
    else if (desktop.matches && active === toggle) panel.querySelector('ul a').focus({ preventScroll: true })
    updateAvailableHeight()
  }

  function syncNavigation() {
    setOpen(false, panel.contains(document.activeElement))
    updateCurrentLink()
  }

  desktop.addEventListener('change', syncBreakpoint)
  window.addEventListener('hashchange', syncNavigation)
  window.addEventListener('popstate', syncNavigation)
  window.addEventListener('pageshow', syncNavigation)
  window.addEventListener('pagehide', () => setOpen(false))
  window.visualViewport?.addEventListener('resize', updateAvailableHeight)
  window.visualViewport?.addEventListener('scroll', updateAvailableHeight)
  syncBreakpoint()
  updateCurrentLink()

  // The dropdown is out of flow; only the unchanged header sets anchor offsets.
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--navigation-offset', Math.ceil(navigation.getBoundingClientRect().height + 16) + 'px')
    updateAvailableHeight()
  }).observe(navigation)
}
