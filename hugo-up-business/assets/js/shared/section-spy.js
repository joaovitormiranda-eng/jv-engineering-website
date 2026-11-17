// In-page section index (S29). Enhances any <nav data-section-spy> whose links
// point to #ids on the same page: marks the section being read with
// aria-current="location" and keeps the active link visible when the strip
// scrolls horizontally (narrow screens). Without JS the links still work as
// plain anchors. No dependencies; rAF-throttled; no layout writes on scroll.

import { elementForHash } from './fragment'

function init() {
  document.querySelectorAll('[data-section-spy]').forEach(setup)
}

function setup(nav) {
  const links = []
  nav.querySelectorAll('a[href^="#"]').forEach((a) => {
    const el = elementForHash(a.getAttribute('href'))
    if (el) links.push({ a, el })
  })
  if (!links.length) return

  let current = null
  const activate = (item) => {
    if (item === current) return
    current = item
    for (const { a } of links) a.removeAttribute('aria-current')
    if (!item) return
    item.a.setAttribute('aria-current', 'location')
    // Keep the active link in view inside a horizontally scrolling strip only.
    if (nav.scrollWidth > nav.clientWidth) {
      const l = item.a.offsetLeft - nav.offsetLeft
      const r = l + item.a.offsetWidth
      if (l < nav.scrollLeft) nav.scrollLeft = l - 16
      else if (r > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = r - nav.clientWidth + 16
    }
  }

  const recompute = () => {
    const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navigation-offset')) || 96
    const line = offset + nav.offsetHeight + 24
    let active = null
    for (const item of links) {
      if (item.el.getBoundingClientRect().top <= line) active = item
    }
    activate(active)
  }

  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => { ticking = false; recompute() })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    const item = links.find((x) => x.a === a)
    if (item) activate(item)
  })
  recompute()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
else init()
