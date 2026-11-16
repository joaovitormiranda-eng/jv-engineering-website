// Home study explorer (S26B).
// Progressive enhancement: without this script every study plate stays visible
// in sequence and the selector/pager stay hidden.
// With it:
//  - the index becomes an ARIA tablist (WAI-ARIA APG tabs, automatic activation):
//    arrows move between studies, Home/End jump, Tab leaves to the panel;
//  - one indicator travels to the selected tab (vertical bar on desktop, filled
//    pill behind the chip on narrow screens);
//  - a prev/next pager lets readers continue without scrolling back up;
//  - plates enter from the direction of travel; the figure is "plotted" in.
// prefers-reduced-motion: no animation, no smooth scrolling.

const NARROW = '(max-width: 63.999rem)' // matches the CSS layout breakpoint

function enhance(root) {
  const tabs = Array.from(root.querySelectorAll('[data-explorer-tab]'))
  const panels = Array.from(root.querySelectorAll('[data-explorer-panel]'))
  if (tabs.length === 0 || tabs.length !== panels.length) return

  const nav = root.querySelector('.jv-explorer__nav')
  const list = root.querySelector('[data-explorer-tabs]')
  const indicator = root.querySelector('[data-explorer-indicator]')
  const pager = root.querySelector('[data-explorer-pager]')
  const prevBtn = root.querySelector('[data-explorer-prev]')
  const nextBtn = root.querySelector('[data-explorer-next]')
  const nextLabel = root.querySelector('[data-explorer-next-label]')
  const status = root.querySelector('[data-explorer-status]')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const narrow = window.matchMedia(NARROW)
  const pad = (n) => String(n).padStart(2, '0')
  const shortOf = (tab) => tab.querySelector('.jv-tab__short')?.textContent.trim() || ''
  const titleOf = (tab) => tab.querySelector('.jv-tab__title')?.textContent.trim() || ''

  list.setAttribute('role', 'tablist')
  for (const li of list.children) li.setAttribute('role', 'presentation')
  tabs.forEach((tab, i) => {
    const panel = panels[i]
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-controls', panel.id)
    panel.setAttribute('role', 'tabpanel')
    panel.setAttribute('aria-labelledby', tab.id)
    panel.setAttribute('tabindex', '0')
  })

  const syncOrientation = () => list.setAttribute('aria-orientation', narrow.matches ? 'horizontal' : 'vertical')

  const placeIndicator = () => {
    const tab = tabs[current]
    if (!indicator || !tab) return
    indicator.style.setProperty('--jv-ix', tab.offsetLeft + 'px')
    indicator.style.setProperty('--jv-iy', tab.offsetTop + 'px')
    indicator.style.setProperty('--jv-iw', tab.offsetWidth + 'px')
    indicator.style.setProperty('--jv-ih', tab.offsetHeight + 'px')
    // Sticky strip height, used by the plates' scroll-margin on narrow screens.
    root.style.setProperty('--jv-strip', narrow.matches ? nav.offsetHeight + 'px' : '0px')
  }

  // Keep the selected chip visible inside the horizontally scrolling strip.
  const revealChip = () => {
    if (!narrow.matches) return
    const tab = tabs[current]
    const left = tab.offsetLeft - 16
    const right = tab.offsetLeft + tab.offsetWidth + 16
    if (left < nav.scrollLeft || right > nav.scrollLeft + nav.clientWidth) {
      nav.scrollTo({ left: Math.max(0, left), behavior: reduceMotion.matches ? 'auto' : 'smooth' })
    }
  }

  // Bring the plate's top into view only when it is not already readable.
  // The target is computed from what actually covers the page top: the sticky
  // chip strip on narrow screens, the global header otherwise.
  const revealPlate = () => {
    const top = panels[current].getBoundingClientRect().top
    const header = document.querySelector('[data-navigation]')
    // Use the docked geometry (header + strip), not the strip's current position,
    // which is still in flow until the page scrolls past it.
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0
    const cover = headerBottom + (narrow.matches ? nav.offsetHeight : 0)
    const gap = 16
    if (top < cover + gap - 1 || top > window.innerHeight * 0.66) {
      window.scrollTo({ top: Math.max(0, window.scrollY + top - cover - gap), behavior: reduceMotion.matches ? 'auto' : 'smooth' })
    }
  }

  const updatePager = () => {
    if (!pager) return
    const last = tabs.length - 1
    status.innerHTML = `Estudo <strong>${pad(current + 1)}</strong> de ${pad(tabs.length)}`
    status.setAttribute('aria-label', `Estudo ${current + 1} de ${tabs.length}: ${titleOf(tabs[current])}`)
    const wasFocused = document.activeElement
    prevBtn.disabled = current === 0
    nextBtn.disabled = current === last
    if (current < last) {
      const short = shortOf(tabs[current + 1])
      nextLabel.textContent = short ? `Próximo: ${short}` : 'Próximo estudo'
      nextBtn.setAttribute('aria-label', `Próximo estudo: ${titleOf(tabs[current + 1])}`)
    } else {
      nextLabel.textContent = 'Próximo estudo'
      nextBtn.removeAttribute('aria-label')
    }
    // A button that became disabled cannot keep focus; hand it to its partner.
    if (wasFocused === prevBtn && prevBtn.disabled) nextBtn.focus()
    if (wasFocused === nextBtn && nextBtn.disabled) prevBtn.focus()
  }

  let current = -1
  const select = (index, { focus = false, animate = true, scroll = false } = {}) => {
    if (index === current) { if (focus) tabs[index].focus(); return }
    const dir = current < 0 || index > current ? 'next' : 'prev'
    tabs.forEach((tab, i) => {
      const on = i === index
      tab.setAttribute('aria-selected', String(on))
      tab.tabIndex = on ? 0 : -1
      panels[i].hidden = !on
    })
    const panel = panels[index]
    panel.classList.remove('is-entering')
    panel.dataset.dir = dir
    if (animate && !reduceMotion.matches) {
      void panel.offsetWidth // restart the entrance animation
      panel.classList.add('is-entering')
    }
    current = index
    placeIndicator()
    revealChip()
    updatePager()
    if (focus) tabs[index].focus()
    if (scroll) revealPlate()
    if (location.hash !== '#' + panel.id && animate) history.replaceState(null, '', '#' + panel.id)
  }

  const indexFromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1))
    return panels.findIndex((p) => p.id === id)
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault()
      select(i, { scroll: narrow.matches })
    })
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1
      let next = null
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = i === last ? 0 : i + 1
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = i === 0 ? last : i - 1
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = last
      else if (event.key === ' ') { event.preventDefault(); select(i); return }
      if (next === null) return
      event.preventDefault()
      select(next, { focus: true })
    })
  })

  prevBtn?.addEventListener('click', () => { if (current > 0) select(current - 1, { scroll: true }) })
  nextBtn?.addEventListener('click', () => { if (current < tabs.length - 1) select(current + 1, { scroll: true }) })

  window.addEventListener('hashchange', () => {
    const i = indexFromHash()
    if (i >= 0) select(i)
  })

  const onLayout = () => { syncOrientation(); placeIndicator(); revealChip() }
  narrow.addEventListener?.('change', onLayout)
  if ('ResizeObserver' in window) new ResizeObserver(() => placeIndicator()).observe(nav)
  // Inter's swap changes tab heights; re-place the indicator once fonts settle.
  document.fonts?.ready.then(placeIndicator)

  syncOrientation()
  root.classList.add('is-enhanced')
  if (pager) pager.hidden = false
  const initial = indexFromHash()
  select(initial >= 0 ? initial : 0, { animate: false })
  // Enable the indicator transition only after its first placement (no initial slide).
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')))
}

function init() {
  document.querySelectorAll('[data-study-explorer]').forEach(enhance)
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
else init()
