const navigation = document.querySelector('[data-navigation]')

if (navigation) {
  const toggle = navigation.querySelector('[data-navigation-toggle]')
  const panel = navigation.querySelector('[data-navigation-panel]')
  const closeButton = navigation.querySelector('[data-navigation-close]')
  const desktop = window.matchMedia('(min-width: 80rem)')
  const originalOverflow = document.body.style.overflow
  let open = false

  function setOpen(next, restoreFocus = false) {
    open = !desktop.matches && next
    panel.inert = !desktop.matches && !open
    panel.dataset.open = String(open)
    panel.classList.toggle('-translate-y-full', !open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação')
    document.body.style.overflow = open ? 'hidden' : originalOverflow

    if (restoreFocus && !desktop.matches) {
      toggle.focus({ preventScroll: true })
    }
  }

  toggle.addEventListener('click', () => {
    setOpen(!open)
    if (open) closeButton.focus({ preventScroll: true })
  })

  closeButton.addEventListener('click', () => setOpen(false, true))

  document.addEventListener('keydown', (event) => {
    if (open && event.key === 'Escape') {
      event.preventDefault()
      setOpen(false, true)
    }
  })

  // Disclosure navigation: leaving the panel closes it, without trapping focus.
  document.addEventListener('focusin', (event) => {
    if (open && !panel.contains(event.target)) setOpen(false)
  })

  panel.addEventListener('click', (event) => {
    const link = event.target.closest('a')
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return

    const url = new URL(link.href, window.location.href)
    let target
    if (link.target !== '_blank' && url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) {
      try {
        target = document.getElementById(decodeURIComponent(url.hash.slice(1)))
      } catch {
        // Leave malformed fragments to the browser's normal link behavior.
      }
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
    } else if (!desktop.matches) {
      setOpen(false, link.target === '_blank')
    }
  })

  function syncBreakpoint() {
    const active = document.activeElement
    const wasInPanel = panel.contains(active)
    const wasMobileControl = active === toggle || closeButton.parentElement.contains(active)
    setOpen(false)

    if (!desktop.matches && wasInPanel) {
      toggle.focus({ preventScroll: true })
    } else if (desktop.matches && wasMobileControl) {
      panel.querySelector('ul a').focus({ preventScroll: true })
    }
  }

  desktop.addEventListener('change', syncBreakpoint)
  syncBreakpoint()

  // Keep fragment destinations below the sticky header at every breakpoint.
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--navigation-offset', Math.ceil(navigation.getBoundingClientRect().height + 16) + 'px')
  }).observe(navigation)
}
