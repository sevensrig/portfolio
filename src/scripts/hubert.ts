// Behaviour for src/components/Hubert.astro: the menu, speech bubble, blinking,
// eyes that follow the pointer, flying to where he sends you, and easter eggs.
import { setWorkFilter } from "./work-filters"

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Where an element's text will sit once the page finishes scrolling it into view
// (sections stop 2.5rem below the top; see [id] in global.css), so Hubert can
// take off at the same moment the scroll starts.
function landingRect(el: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(el)
  const now = range.getBoundingClientRect()
  const section = el.closest<HTMLElement>("[id]") ?? el
  const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0
  const maxScroll = document.documentElement.scrollHeight - innerHeight
  const finalScroll = Math.min(Math.max(scrollY + section.getBoundingClientRect().top - margin, 0), maxScroll)
  const shift = scrollY - finalScroll
  return { right: now.right, bottom: now.bottom + shift }
}

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
  const hush = () => {
    clearTimeout(bubbleTimer)
    bubble.hidden = true
  }
  bubble.addEventListener("click", hush)

  const flash = (cls: string, ms: number) => {
    root.classList.add(cls)
    setTimeout(() => root.classList.remove(cls), ms)
  }

  // Easter egg: between 10 pm and 6 am (the visitor's time) he's sleepy until woken.
  const hour = new Date().getHours()
  const sleepy = hour >= 22 || hour < 6
  if (sleepy) root.classList.add("sleepy")
  const wake = () => root.classList.remove("sleepy")

  function open() {
    hush()
    wake()
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

  // Fly to a section's heading, perch there while saying something, fly home.
  let flying = false
  async function flyTo(section: HTMLElement, reply?: string) {
    if (flying) return
    if (reducedMotion) {
      if (reply) say(reply, 3500)
      return
    }
    flying = true

    // Perch at the end of the heading's text, feet on its baseline.
    const heading = section.matches("h1, h2, h3, a")
      ? section
      : (section.querySelector<HTMLElement>("h1, h2, h3") ?? section)
    const text = landingRect(heading)
    const home = root.getBoundingClientRect()
    const left = Math.min(Math.max(text.right + 16, 8), innerWidth - home.width - 8)
    const top = Math.min(Math.max(text.bottom - home.height + 6, 8), innerHeight - home.height - 8)
    const dx = left - home.left
    const dy = top - home.top
    const at = (x: number, y: number) => ({ transform: `translate(${x}px, ${y}px)` })
    const flight = { duration: 900, easing: "ease-in-out", fill: "forwards" as const }

    hush()
    root.classList.add("flying")
    await root.animate([at(0, 0), at(dx / 2, dy / 2 - 90), at(dx, dy)], flight).finished
    root.classList.remove("flying")
    root.classList.add("perched")

    // While perched he's glued to the heading: if the page moves (the smooth
    // scroll still settling, or the visitor scrolling), he moves with it
    // instead of hanging in the same spot on screen.
    const textBottom = () => {
      const range = document.createRange()
      range.selectNodeContents(heading)
      return range.getBoundingClientRect().bottom
    }
    // Offsets are measured from where the heading was predicted to land, so
    // if the scroll is still settling when he arrives, he settles with it.
    let py = dy
    let queued = false
    const follow = () => {
      queued = false
      py = dy + (textBottom() - text.bottom)
      root.style.transform = `translate(${dx}px, ${py}px)`
    }
    const onScroll = () => {
      if (!queued) requestAnimationFrame(follow)
      queued = true
    }
    root.getAnimations().forEach((a) => a.cancel())
    follow()
    addEventListener("scroll", onScroll, { passive: true })

    if (reply) say(reply)
    await wait(1800)
    hush()
    removeEventListener("scroll", onScroll)

    root.classList.remove("perched")
    root.classList.add("flying")
    root.style.transform = ""
    await root.animate([at(dx, py), at(dx / 2, py / 2 - 90), at(0, 0)], flight).finished
    root.getAnimations().forEach((a) => a.cancel())
    root.classList.remove("flying")
    flash("happy", 500)
    flying = false
  }

  // Easter egg: five quick clicks make him dizzy.
  let clicks: number[] = []
  button.addEventListener("click", () => {
    if (flying) return
    const now = Date.now()
    clicks = [...clicks.filter((t) => now - t < 2000), now]
    if (clicks.length >= 5) {
      clicks = []
      close()
      flash("dizzy", 900)
      say("Whoa… I'm seeing two of you.", 2500)
      return
    }
    if (panel.hidden) open()
    else close()
  })

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
    close()
    // The work filters just scroll and answer from the corner; everything else gets a flight.
    if (target === "work") {
      section.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" })
      say(reply!, 3500)
      flash("happy", 600)
    } else {
      flyTo(section, reply) // measures before the scroll moves anything
      section.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" })
    }
  })

  // In-page links (the header's Experience, for example) send him too, except to
  // the work section, which he only points at from the corner.
  document.addEventListener("click", (e) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>("a[href*='#']")
    if (!link || root.contains(link) || link.target === "_blank") return
    const url = new URL(link.href)
    if (url.pathname !== location.pathname || !url.hash) return
    const section = document.getElementById(url.hash.slice(1))
    if (!section || section.id === "work") return
    // Say what his menu would say for the same section.
    const reply = panel.querySelector<HTMLButtonElement>(`[data-target="${section.id}"]`)?.dataset.reply
    flyTo(section, reply)
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) close({ refocus: true })
  })
  document.addEventListener("pointerdown", (e) => {
    if (!panel.hidden && !root.contains(e.target as Node)) close()
  })

  // Easter egg: hovering the bird feeder project gets a chirp, once per visit.
  document.querySelector('a[href="/projects/bird-feeder/"]')?.addEventListener(
    "pointerenter",
    () => {
      if (flying || !panel.hidden || !bubble.hidden) return
      wake()
      flash("happy", 600)
      say("A fellow bird!", 2500)
    },
    { once: true },
  )

  // Eyes follow the pointer, but only a little: up to 1.5px sideways or up,
  // and less than 1px down so they never slide toward his beak.
  window.addEventListener(
    "pointermove",
    (e) => {
      const r = button.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const d = Math.hypot(dx, dy) || 1
      const y = dy / d
      eyes.style.transform = `translate(${(dx / d) * 1.5}px, ${y * (y > 0 ? 0.75 : 1.5)}px)`
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
      if (panel.hidden) say(sleepy ? "*yawn* Need a hand finding something?" : "Need a hand finding something?")
    }, 800)
  }
}
