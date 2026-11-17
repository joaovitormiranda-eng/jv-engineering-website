// One-shot entry choreography for [data-reveal] groups (S30: any page).
// Content is never hidden without JS: .is-pending is only added here, only for
// groups that start below the viewport, and only when motion is allowed.
// Children get a --i index for a short stagger (CSS). Each group animates once,
// then the observer lets go of it. Only transform/opacity are animated.

import { elementForHash } from '../shared/fragment'

function init() {
  const groups = Array.from(document.querySelectorAll('[data-reveal]'))
  if (groups.length === 0 || !('IntersectionObserver' in window)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.remove('is-pending')
      entry.target.classList.add('is-revealed')
      observer.unobserve(entry.target)
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 })

  for (const group of groups) {
    Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', String(Math.min(i, 6))))
    // Already on screen (deep link, reload mid-page): leave it as is.
    if (group.getBoundingClientRect().top < window.innerHeight) continue
    group.classList.add('is-pending')
    observer.observe(group)
  }

  // Printing or a hash jump must never leave a group hidden.
  const revealAll = () => groups.forEach((g) => { g.classList.remove('is-pending'); g.classList.add('is-revealed') })
  window.addEventListener('beforeprint', revealAll)
  window.addEventListener('hashchange', () => {
    const g = elementForHash(location.hash)?.closest('[data-reveal]')
    if (g) { g.classList.remove('is-pending'); g.classList.add('is-revealed') }
  })
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
else init()
