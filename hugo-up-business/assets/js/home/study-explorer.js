// Home study explorer: upgrades the study index into an ARIA tablist.
// Progressive enhancement — without this script every study plate stays
// visible in sequence and the index links are plain in-page anchors.
// Keyboard: Arrow keys move between studies, Home/End jump, Enter/Space activate
// (automatic activation on arrow, per WAI-ARIA APG tabs pattern).

function enhance(root) {
  const tabs = Array.from(root.querySelectorAll('[data-explorer-tab]'))
  const panels = Array.from(root.querySelectorAll('[data-explorer-panel]'))
  if (tabs.length === 0 || tabs.length !== panels.length) return

  const list = root.querySelector('[data-explorer-tabs]')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const narrow = window.matchMedia('(max-width: 63.999rem)') // matches the CSS split breakpoint
  list.setAttribute('role', 'tablist')
  list.setAttribute('aria-orientation', 'vertical')
  // The <li> wrappers become presentational so tabs are direct tablist items.
  for (const li of list.children) li.setAttribute('role', 'presentation')

  tabs.forEach((tab, i) => {
    const panel = panels[i]
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-controls', panel.id)
    panel.setAttribute('role', 'tabpanel')
    panel.setAttribute('aria-labelledby', tab.id)
    panel.setAttribute('tabindex', '0')
  })

  let current = -1
  const select = (index, { focus = false, animate = true } = {}) => {
    if (index === current) { if (focus) tabs[index].focus(); return }
    tabs.forEach((tab, i) => {
      const on = i === index
      tab.setAttribute('aria-selected', String(on))
      tab.tabIndex = on ? 0 : -1
      panels[i].hidden = !on
    })
    const panel = panels[index]
    panel.classList.remove('is-entering')
    if (animate && !reduceMotion.matches) {
      void panel.offsetWidth // restart the entrance animation
      panel.classList.add('is-entering')
    }
    current = index
    if (focus) tabs[index].focus()
  }

  const indexFromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1))
    return panels.findIndex((p) => p.id === id)
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault()
      select(i)
      // Keep a shareable URL without jumping the page.
      if (location.hash !== '#' + panels[i].id) history.replaceState(null, '', '#' + panels[i].id)
      // In the stacked (narrow) layout the plate sits below the index: bring it
      // into view so the change is visible. Wide layouts show both side by side.
      if (narrow.matches) {
        panels[i].scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' })
      }
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

  window.addEventListener('hashchange', () => {
    const i = indexFromHash()
    if (i >= 0) select(i)
  })

  const initial = indexFromHash()
  root.classList.add('is-enhanced')
  select(initial >= 0 ? initial : 0, { animate: false })
}

function init() {
  document.querySelectorAll('[data-study-explorer]').forEach(enhance)
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
else init()
