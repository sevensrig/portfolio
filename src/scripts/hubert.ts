// Behaviour for src/components/Hubert.astro: the menu, speech bubble, blinking,
// and eyes that follow the pointer.
import { setWorkFilter } from "./work-filters"

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches

export function initHubert(root: HTMLElement) {
  const button = root.querySelector<HTMLButtonElement>(".hubert-button")!
  const panel = root.querySelector<HTMLElement>(".hubert-panel")!
  const bubble = root.querySelector<HTMLButtonElement>(".hubert-bubble")!
  const eyes = root.querySelector<SVGGElement>(".hubert-eyes")!

  // Show a speech bubble. It stays until clicked, or for ms milliseconds if given.
  let bubbleTimer = 0
  function say(text: string, ms?: number) {
    clearTimeout(bubbleTimer)
    bubble.hidden = true
    bubble.textContent = text
    void bubble.offsetWidth // restart the pop-in animation
    bubble.hidden = false
    if (ms) bubbleTimer = window.setTimeout(() => (bubble.hidden = true), ms)
  }
  bubble.addEventListener("click", () => {
    clearTimeout(bubbleTimer)
    bubble.hidden = true
  })

  function open() {
    clearTimeout(bubbleTimer)
    bubble.hidden = true
    panel.hidden = false
    button.setAttribute("aria-expanded", "true")
    button.setAttribute("aria-label", "Close page guide")
    panel.querySelector<HTMLButtonElement>("li button")?.focus()
  }
  function close({ refocus = false } = {}) {
    panel.hidden = true
    button.setAttribute("aria-expanded", "false")
    button.setAttribute("aria-label", "Open page guide")
    if (refocus) button.focus()
  }

  button.addEventListener("click", () => (panel.hidden ? open() : close()))
  panel.addEventListener("click", (e) => {
    const item = (e.target as Element).closest<HTMLButtonElement>("[data-target]")
    if (!item) return
    const { target, filterTo, reply } = item.dataset
    const section = document.getElementById(target!)
    // Off the home page, go there instead and let the page apply the filter.
    if (!section) {
      const query = new URLSearchParams({ from: "hubert", ...(filterTo ? { filter: filterTo } : {}) })
      location.href = `/?${query}#${target}`
      return
    }
    if (filterTo) setWorkFilter(filterTo)
    section.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" })
    close()
    say(reply!, 3500)
    root.classList.add("happy")
    setTimeout(() => root.classList.remove("happy"), 600)
  })
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) close({ refocus: true })
  })
  document.addEventListener("pointerdown", (e) => {
    if (!panel.hidden && !root.contains(e.target as Node)) close()
  })

  // Eyes follow the pointer a couple of pixels.
  window.addEventListener(
    "pointermove",
    (e) => {
      const r = button.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const d = Math.hypot(dx, dy) || 1
      eyes.style.transform = `translate(${(dx / d) * 2.5}px, ${(dy / d) * 2}px)`
    },
    { passive: true },
  )

  // Blink every few seconds.
  ;(function blink() {
    setTimeout(() => {
      root.classList.add("blink")
      setTimeout(() => {
        root.classList.remove("blink")
        blink()
      }, 130)
    }, 2500 + Math.random() * 3000)
  })()

  // Say hello whenever the home page opens (not on project pages); the bubble
  // stays until clicked. Skip it when Hubert himself sent you here (?from=hubert).
  const params = new URLSearchParams(location.search)
  if (location.pathname === "/" && params.get("from") !== "hubert") {
    setTimeout(() => {
      if (panel.hidden) say("Need a hand finding something?")
    }, 800)
  }
}
