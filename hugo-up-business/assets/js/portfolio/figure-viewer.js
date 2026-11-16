// Figure viewer for study pages: opens the published figures in a native modal
// <dialog> so they can be read at a larger size, with a 2x zoom for dense plots.
//
// Progressive enhancement. Without JavaScript (or without <dialog>) nothing is
// added and the existing "Ampliar … (nova aba)" link in each caption still
// works. The viewer never alters the figure: it shows the same image the page
// already publishes (the SVG linked in the caption when there is one).
//
// Accessibility: the trigger is a real <button> with a descriptive name; the
// dialog is modal via showModal() (focus is trapped, background is inert,
// Escape closes natively); focus returns to the trigger on close; the caption
// names the dialog. Zoom is a toggle button, and the stage scrolls by touch,
// mouse or keyboard (tabindex=0 region) when zoomed.
//
// S31 gallery: inside the viewer the study's figures form a sequence. Previous
// / next buttons, ArrowLeft / ArrowRight and a horizontal swipe (at 1x) move
// between them; a counter ("Figura 2 de 5") is announced politely; the caption
// follows the figure. Same figures, same captions, nothing generated.

const ZOOM_LEVELS = [1, 2]

function textOf(node) {
  return (node ? node.textContent : '').replace(/\s+/g, ' ').trim()
}

function figureSource(figure, img) {
  // Prefer the vector the page already links for enlargement.
  const link = figure.querySelector('figcaption a[href$=".svg"]')
  return link ? link.href : img.currentSrc || img.src
}

function captionText(figure) {
  const cap = figure.querySelector('figcaption')
  if (!cap) return ''
  const clone = cap.cloneNode(true)
  clone.querySelectorAll('a').forEach((a) => a.remove())
  return textOf(clone)
}

function buildDialog() {
  const dialog = document.createElement('dialog')
  dialog.className = 'figure-viewer'
  dialog.setAttribute('aria-labelledby', 'figure-viewer-caption')
  dialog.innerHTML = `
    <div class="figure-viewer__bar">
      <p class="figure-viewer__caption" id="figure-viewer-caption"></p>
      <div class="figure-viewer__actions">
        <button type="button" class="figure-viewer__btn figure-viewer__btn--icon" data-prev aria-label="Figura anterior"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button>
        <p class="figure-viewer__count" data-count aria-live="polite"></p>
        <button type="button" class="figure-viewer__btn figure-viewer__btn--icon" data-next aria-label="Próxima figura"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>
        <button type="button" class="figure-viewer__btn" data-zoom aria-pressed="false">Ampliar 2×</button>
        <button type="button" class="figure-viewer__btn" data-close>Fechar</button>
      </div>
    </div>
    <div class="figure-viewer__stage" tabindex="0" role="region" aria-label="Figura ampliada (região rolável)">
      <img class="figure-viewer__img" alt="" decoding="async" />
    </div>`
  document.body.appendChild(dialog)
  return dialog
}

function init() {
  const roots = document.querySelectorAll('[data-figure-viewer]')
  if (!roots.length || typeof HTMLDialogElement !== 'function') return

  const figures = []
  roots.forEach((root) => {
    root.querySelectorAll('figure').forEach((figure) => {
      const img = figure.querySelector('img')
      if (img) figures.push({ figure, img })
    })
  })
  if (!figures.length) return

  const dialog = buildDialog()
  const captionEl = dialog.querySelector('.figure-viewer__caption')
  const imgEl = dialog.querySelector('.figure-viewer__img')
  const stage = dialog.querySelector('.figure-viewer__stage')
  const zoomBtn = dialog.querySelector('[data-zoom]')
  const prevBtn = dialog.querySelector('[data-prev]')
  const nextBtn = dialog.querySelector('[data-next]')
  const countEl = dialog.querySelector('[data-count]')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let opener = null
  let level = 0
  let index = -1
  const single = figures.length < 2
  if (single) { prevBtn.hidden = true; nextBtn.hidden = true; countEl.hidden = true }

  const applyZoom = () => {
    const zoom = ZOOM_LEVELS[level]
    dialog.dataset.zoomLevel = String(zoom)
    zoomBtn.setAttribute('aria-pressed', zoom > 1 ? 'true' : 'false')
    zoomBtn.textContent = zoom > 1 ? 'Ajustar à tela' : 'Ampliar 2×'
    fit()
  }

  // Size the image to the stage: the whole figure fits the area (width and
  // height) at 1x; 2x doubles that size and the stage scrolls. Rasters are not
  // enlarged past their natural size at 1x.
  const fit = () => {
    const zoom = ZOOM_LEVELS[level]
    const cs = getComputedStyle(stage)
    const aw = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    const ah = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
    const nw = imgEl.naturalWidth
    const nh = imgEl.naturalHeight
    if (!nw || !nh || aw <= 0 || ah <= 0) {
      imgEl.style.width = `${zoom * 100}%`
      return
    }
    let w = Math.min(aw, (ah * nw) / nh)
    if (!/\.svg(\?|$)/i.test(imgEl.currentSrc || imgEl.src)) w = Math.min(w, nw)
    imgEl.style.width = `${Math.round(w * zoom)}px`
  }
  imgEl.addEventListener('load', fit)
  window.addEventListener('resize', () => {
    if (dialog.open) fit()
  })

  // Show figure i in the open (or opening) dialog. dir: 'next' | 'prev' | null.
  const show = (i, dir = null) => {
    const { figure, img } = figures[i]
    index = i
    level = 0
    captionEl.textContent = captionText(figure) || img.alt
    imgEl.alt = img.alt
    // Same background the page gives the figure (e.g. white plot canvas).
    imgEl.style.backgroundColor = getComputedStyle(img).backgroundColor
    imgEl.src = figureSource(figure, img)
    stage.scrollTo(0, 0)
    applyZoom()
    if (!single) {
      countEl.innerHTML = `<span aria-hidden="true">${i + 1} / ${figures.length}</span><span class="jv-sr">Figura ${i + 1} de ${figures.length}</span>`
      prevBtn.disabled = i === 0
      nextBtn.disabled = i === figures.length - 1
    }
    stage.classList.remove('is-next', 'is-prev')
    if (dir && !reduceMotion.matches) {
      void stage.offsetWidth // restart the slide-in
      stage.classList.add(dir === 'next' ? 'is-next' : 'is-prev')
    }
  }

  const step = (delta) => {
    const i = index + delta
    if (i < 0 || i >= figures.length) return
    // A disabled button cannot keep focus; hand it to its partner.
    show(i, delta > 0 ? 'next' : 'prev')
    if (document.activeElement === prevBtn && prevBtn.disabled) nextBtn.focus()
    if (document.activeElement === nextBtn && nextBtn.disabled) prevBtn.focus()
  }

  const open = (figure, img, trigger) => {
    opener = trigger
    show(figures.findIndex((f) => f.figure === figure))
    dialog.showModal()
    fit() // stage has a size only once the dialog is open
    zoomBtn.focus()
  }

  prevBtn.addEventListener('click', () => step(-1))
  nextBtn.addEventListener('click', () => step(1))

  // Swipe between figures with touch, only at 1x (at 2x the stage pans).
  let touchStart = null
  stage.addEventListener('pointerdown', (e) => {
    touchStart = e.pointerType === 'touch' && ZOOM_LEVELS[level] === 1 ? { x: e.clientX, y: e.clientY } : null
  })
  stage.addEventListener('pointerup', (e) => {
    if (!touchStart || single) return
    const dx = e.clientX - touchStart.x
    const dy = e.clientY - touchStart.y
    touchStart = null
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1)
  })
  stage.addEventListener('pointercancel', () => { touchStart = null })

  // Zoom around the centre of what is on screen, so the figure does not jump to
  // its top-left corner when switching between 1x and 2x.
  zoomBtn.addEventListener('click', () => {
    const cx = (stage.scrollLeft + stage.clientWidth / 2) / Math.max(stage.scrollWidth, 1)
    const cy = (stage.scrollTop + stage.clientHeight / 2) / Math.max(stage.scrollHeight, 1)
    level = (level + 1) % ZOOM_LEVELS.length
    applyZoom()
    stage.scrollLeft = cx * stage.scrollWidth - stage.clientWidth / 2
    stage.scrollTop = cy * stage.scrollHeight - stage.clientHeight / 2
  })
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close())
  // Click on the backdrop (the dialog element itself) closes; clicks inside do not.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close()
  })
  // Escape closes natively, but other document-level Escape handlers (for
  // example the privacy panel) call preventDefault and would cancel that.
  // Handling it here, first, keeps Escape predictable while the viewer is open.
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      dialog.close()
      return
    }
    // Arrows browse figures, except while a zoomed stage has focus (they pan it).
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !single) {
      if (document.activeElement === stage && ZOOM_LEVELS[level] > 1) return
      e.preventDefault()
      step(e.key === 'ArrowRight' ? 1 : -1)
      return
    }
    // Keep Tab inside the dialog: some browsers let focus leave a modal
    // dialog at its ends (to the page start or the browser UI).
    if (e.key === 'Tab') {
      const items = [...dialog.querySelectorAll('button:not([hidden]):not([disabled])'), stage]
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  })
  dialog.addEventListener('close', () => {
    imgEl.removeAttribute('src')
    // Return to the figure the reader ended on (it may differ from the opener
    // after browsing), so the page context matches what was last seen.
    const back = (figures[index] && figures[index].button) || opener
    if (back && document.contains(back)) back.focus()
    opener = null
  })

  figures.forEach(({ figure, img }, i) => {
    const label = captionText(figure) || img.alt || `Figura ${i + 1}`
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'figure-zoom'
    button.setAttribute('aria-haspopup', 'dialog')
    button.setAttribute('aria-label', `Ampliar figura: ${label}`)
    button.innerHTML =
      '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg><span>Ampliar</span>'
    figure.classList.add('has-figure-zoom')
    figure.insertBefore(button, figure.firstChild)
    figures[i].button = button
    button.addEventListener('click', () => open(figure, img, button))
    // Mouse convenience only; keyboard and assistive tech use the button.
    img.addEventListener('click', () => open(figure, img, button))
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
