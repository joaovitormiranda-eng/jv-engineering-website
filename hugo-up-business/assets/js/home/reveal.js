// One-shot entry choreography for [data-reveal] groups (the Método sequence).
// Content is never hidden without JS: .is-pending is only added here, only for
// groups that start below the viewport, and only when motion is allowed.
// Each group animates once, then the observer lets go of it.

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
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 })

  for (const group of groups) {
    // Already on screen (deep link, reload mid-page): leave it as is.
    if (group.getBoundingClientRect().top < window.innerHeight) continue
    group.classList.add('is-pending')
    observer.observe(group)
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
else init()
