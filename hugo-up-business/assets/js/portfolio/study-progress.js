// Study reading aids: scroll-spy that marks the current section in the existing
// table of contents, plus a slim reading-progress bar. Progressive enhancement
// for portfolio study pages only — if the TOC or article body is absent, or the
// visitor prefers reduced motion for the progress bar, the page is unchanged.
//
// It enhances the TOC already rendered by layouts/portfolio/single.html; it does
// NOT create a second navigation. No dependencies.

import { decodeFragment } from '../shared/fragment'

function init() {
  const body = document.querySelector('.portfolio-study__body')
  if (!body) return

  // Desktop sticky TOC is the one we annotate with the active section.
  const toc = document.getElementById('TableOfContents')
  const headings = Array.from(body.querySelectorAll('h2[id], h3[id]'))

  setupProgressBar(body)

  if (!toc || headings.length === 0) return
  setupScrollSpy(toc, headings)
}

// --- Reading-progress bar ---------------------------------------------------
// Under reduced motion the CSS drops the fill transition; the bar still
// reflects the position, it just does not animate.
function setupProgressBar(body) {
  const bar = document.createElement('div')
  bar.className = 'portfolio-reading-progress'
  bar.setAttribute('aria-hidden', 'true') // decorative; mirrors scroll position
  const fill = document.createElement('span')
  bar.appendChild(fill)
  document.body.appendChild(bar)

  let ticking = false
  const update = () => {
    ticking = false
    const start = body.offsetTop
    const total = body.offsetHeight - window.innerHeight
    const scrolled = window.scrollY - start
    const ratio = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0
    fill.style.transform = `scaleX(${ratio})`
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    // rAF keeps this off the scroll critical path; no layout thrash.
    window.requestAnimationFrame(update)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  update()
}

// --- Scroll-spy -------------------------------------------------------------
function setupScrollSpy(toc, headings) {
  const links = new Map()
  toc.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = decodeFragment(a.getAttribute('href'))
    if (id) links.set(id, a)
  })
  if (links.size === 0) return

  // Only track headings that actually have a TOC entry.
  const tracked = headings.filter((h) => links.has(h.id))
  if (tracked.length === 0) return

  let currentId = null
  const setActive = (id) => {
    if (id === currentId) return
    currentId = id
    links.forEach((a, key) => {
      if (key === id) {
        a.classList.add('is-current')
        a.setAttribute('aria-current', 'location')
      } else {
        a.classList.remove('is-current')
        a.removeAttribute('aria-current')
      }
    })
  }

  // Active section = the last heading whose top is at or above an activation
  // line just below the sticky header. Robust for sections taller than the
  // viewport (no dependence on a heading sitting inside a narrow band).
  const recompute = () => {
    const navOffset =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--navigation-offset'
        )
      ) || 128
    const line = navOffset + 24
    let active = tracked[0]
    for (const h of tracked) {
      if (h.getBoundingClientRect().top <= line) active = h
      else break
    }
    setActive(active.id)
  }

  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    window.requestAnimationFrame(() => {
      ticking = false
      recompute()
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  recompute()

  // Clicking a TOC entry marks it immediately, before scrolling settles.
  toc.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    const id = decodeFragment(a.getAttribute('href'))
    if (links.has(id)) setActive(id)
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
