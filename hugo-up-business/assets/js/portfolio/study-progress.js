// Study reading aids: scroll-spy that marks the current section in the existing
// table of contents, plus a slim reading-progress bar. Progressive enhancement
// for portfolio study pages only — if the TOC or article body is absent, or the
// visitor prefers reduced motion for the progress bar, the page is unchanged.
//
// It enhances the TOC already rendered by layouts/portfolio/single.html; it does
// NOT create a second navigation. No dependencies.

function init() {
  const body = document.querySelector('.portfolio-study__body')
  if (!body) return

  // Desktop sticky TOC is the one we annotate with the active section.
  const toc = document.getElementById('TableOfContents')
  const headings = Array.from(body.querySelectorAll('h2[id], h3[id]'))

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  setupProgressBar(body, reduceMotion)

  if (!toc || headings.length === 0) return
  setupScrollSpy(toc, headings)
}

// --- Reading-progress bar ---------------------------------------------------
function setupProgressBar(body, reduceMotion) {
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

  // Under reduced-motion the CSS already drops the fill transition; the bar
  // still reflects position (a static indicator), it just does not animate.
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  update()

  // If the preference changes mid-session, nothing to tear down: CSS handles
  // the transition, JS only writes the ratio.
  void reduceMotion
}

// --- Scroll-spy -------------------------------------------------------------
function setupScrollSpy(toc, headings) {
  const links = new Map()
  toc.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = decodeURIComponent(a.getAttribute('href').slice(1))
    if (id) links.set(id, a)
  })
  if (links.size === 0) return

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

  // Track which headings are in the activation band near the top of the
  // viewport; the last one past the top is the active section.
  const visible = new Set()
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      })
      pickActive(headings, visible, links, setActive)
    },
    {
      // Activation line sits just below the sticky header; bottom margin keeps
      // only the upper band active so the current section is the one being read.
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    }
  )
  headings.forEach((h) => observer.observe(h))

  // Clicking a TOC entry should mark it immediately, before scrolling settles.
  toc.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    const id = decodeURIComponent(a.getAttribute('href').slice(1))
    if (links.has(id)) setActive(id)
  })
}

function pickActive(headings, visible, links, setActive) {
  // Prefer the topmost heading currently in the activation band.
  let active = null
  for (const h of headings) {
    if (visible.has(h) && links.has(h.id)) {
      active = h
      break
    }
  }
  // None in band (e.g. a long section fills the viewport): keep the last
  // heading scrolled past the activation line.
  if (!active) {
    const line = window.innerHeight * 0.2
    for (const h of headings) {
      if (!links.has(h.id)) continue
      if (h.getBoundingClientRect().top <= line) active = h
      else break
    }
  }
  if (active) setActive(active.id)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
