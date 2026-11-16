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
  let opener = null
  let level = 0

  const applyZoom = () => {
    const zoom = ZOOM_LEVELS[level]
    dialog.dataset.zoomLevel = String(zoom)
    zoomBtn.setAttribute('aria-pressed', zoom > 1 ? 'true' : 'false')
    zoomBtn.textContent = zoom > 1 ? 'Ajustar à tela' : 'Ampliar 2×'
    imgEl.style.width = `${zoom * 100}%`
  }

  const open = (figure, img, trigger) => {
    opener = trigger
    level = 0
    captionEl.textContent = captionText(figure) || img.alt
    imgEl.alt = img.alt
    // Same background the page gives the figure (e.g. white plot canvas).
    imgEl.style.backgroundColor = getComputedStyle(img).backgroundColor
    imgEl.src = figureSource(figure, img)
    stage.scrollTo(0, 0)
    applyZoom()
    dialog.showModal()
    zoomBtn.focus()
  }

  zoomBtn.addEventListener('click', () => {
    level = (level + 1) % ZOOM_LEVELS.length
    applyZoom()
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
    }
  })
  dialog.addEventListener('close', () => {
    imgEl.removeAttribute('src')
    if (opener && document.contains(opener)) opener.focus()
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
