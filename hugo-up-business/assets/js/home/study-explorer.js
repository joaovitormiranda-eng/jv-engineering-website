// Study explorer (S31) — the site's single explorer, now inside the hero.
// Replaces the S26B section explorer (same file, same data-* contract).
//
// Progressive enhancement. Without this script every study is listed in
// sequence and the selector stays hidden. With it:
//  - the selector becomes an ARIA tablist (WAI-ARIA APG tabs, automatic
//    activation): arrows move between studies, Home/End jump, Tab leaves to
//    the panel; links keep working as #anchors;
//  - selecting crossfades the outgoing and incoming study in the same place
//    (panels are stacked in one grid cell, so the hero never changes height),
//    the incoming figure travels in from the direction of selection;
//  - one indicator slides under the selected tab (transform only);
//  - a horizontal swipe on the study moves to the previous/next study;
//  - nothing changes on its own (no autoplay), and nothing touches the URL.
// prefers-reduced-motion: instant switch, no indicator slide.

const SWIPE_MIN = 48 // px of horizontal travel
const SWIPE_RATIO = 1.4 // horizontal must dominate vertical (page scroll stays native)

function enhance(root) {
  const tabs = Array.from(root.querySelectorAll('[data-explorer-tab]'))
  const panels = Array.from(root.querySelectorAll('[data-explorer-panel]'))
  if (tabs.length === 0 || tabs.length !== panels.length) return

  const nav = root.querySelector('[data-explorer-nav]')
  const list = root.querySelector('[data-explorer-tabs]')
  const indicator = root.querySelector('[data-explorer-indicator]')
  const count = root.querySelector('[data-explorer-count]')
  const swipeArea = root.querySelector('[data-explorer-swipe]')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const pad = (n) => String(n).padStart(2, '0')

  list.setAttribute('role', 'tablist')
  list.setAttribute('aria-orientation', 'horizontal')
  for (const li of list.children) li.setAttribute('role', 'presentation')
  tabs.forEach((tab, i) => {
    const panel = panels[i]
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-controls', panel.id)
    panel.setAttribute('role', 'tabpanel')
    panel.setAttribute('aria-labelledby', tab.id)
  })

  const placeIndicator = () => {
    const tab = tabs[current]
    if (!indicator || !tab) return
    // Width via scaleX of a 100px box: the indicator moves with transform only.
    indicator.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${tab.offsetWidth / 100})`
  }

  let current = -1
  let leaving = null
  const finishLeave = () => {
    if (!leaving) return
    leaving.classList.remove('is-leaving')
    leaving.hidden = true
    leaving = null
  }

  const select = (index, { focus = false, animate = true } = {}) => {
    if (index === current) { if (focus) tabs[index].focus(); return }
    const previous = current
    const dir = previous < 0 || index > previous ? 'next' : 'prev'
    const motion = animate && !reduceMotion.matches && previous >= 0
    finishLeave()

    tabs.forEach((tab, i) => {
      const on = i === index
      tab.setAttribute('aria-selected', String(on))
      tab.tabIndex = on ? 0 : -1
    })
    panels.forEach((panel, i) => {
      panel.classList.remove('is-entering')
      if (i === index) panel.hidden = false
      else if (!(motion && i === previous)) panel.hidden = true
    })

    const incoming = panels[index]
    root.dataset.dir = dir
    if (motion) {
      // The outgoing study stays rendered (inert, out of the a11y tree) while it
      // fades, so both overlap in the same cell: a real crossfade, no gap.
      leaving = panels[previous]
      leaving.inert = true
      leaving.classList.add('is-leaving')
      leaving.addEventListener('animationend', function done(e) {
        if (e.target !== leaving) return
        leaving.removeEventListener('animationend', done)
        leaving.inert = false
        finishLeave()
      })
      void incoming.offsetWidth // restart the entrance animation
      incoming.classList.add('is-entering')
    }

    current = index
    if (count) count.textContent = pad(index + 1)
    placeIndicator()
    if (focus) tabs[index].focus()
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault()
      select(i)
    })
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1
      let next = null
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = i === last ? 0 : i + 1
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = i === 0 ? last : i - 1
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = last
      else if (event.key === ' ') { event.preventDefault(); select(i); return }
      if (next === null) return
      event.preventDefault()
      select(next, { focus: true })
    })
  })

  // Swipe: pointer events, touch only, page scroll untouched (touch-action: pan-y).
  // A swipe that changes the study suppresses the click that would open it.
  if (swipeArea) {
    let start = null
    let swallowUntil = 0 // only the click that ends this swipe is suppressed
    swipeArea.addEventListener('pointerdown', (e) => {
      start = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY } : null
      swallowUntil = 0
    })
    swipeArea.addEventListener('pointerup', (e) => {
      if (!start) return
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      start = null
      if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO) return
      const last = tabs.length - 1
      const next = dx < 0 ? (current === last ? 0 : current + 1) : (current === 0 ? last : current - 1)
      swallowUntil = performance.now() + 500
      select(next)
    })
    swipeArea.addEventListener('pointercancel', () => { start = null })
    swipeArea.addEventListener('click', (e) => {
      if (performance.now() > swallowUntil) return
      swallowUntil = 0
      e.preventDefault()
      e.stopPropagation()
    }, true)
  }

  if ('ResizeObserver' in window && nav) new ResizeObserver(placeIndicator).observe(nav)
  document.fonts?.ready.then(placeIndicator)

  root.classList.add('is-enhanced')
  // A deep link to one study (#estudo-…) opens on it; otherwise the first one.
  const fromHash = panels.findIndex((p) => '#' + p.id === decodeURIComponent(location.hash))
  select(fromHash >= 0 ? fromHash : 0, { animate: false })
  // Enable the indicator transition only after its first placement (no initial slide).
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')))
}

function init() {
  document.querySelectorAll('[data-study-explorer]').forEach(enhance)
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
else init()
