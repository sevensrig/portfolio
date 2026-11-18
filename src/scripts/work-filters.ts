// Work filters: buttons with data-filter="<category>" show only the projects
// whose data-categories list contains it. "all" shows everything.
// A ?filter=<category> query on load pre-selects one (Hubert uses this when
// he sends someone to the home page from another page).

export function setWorkFilter(category: string) {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-filter]")
  if (![...buttons].some((b) => b.dataset.filter === category)) category = "all"
  buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === category)))
  let shown = 0
  document.querySelectorAll<HTMLElement>("[data-categories]").forEach((p) => {
    const match = category === "all" || p.dataset.categories!.split(" ").includes(category)
    p.hidden = !match
    if (match) shown++
  })
  const empty = document.querySelector<HTMLElement>("[data-filter-empty]")
  if (empty) empty.hidden = shown > 0
  moveBar()
}

// The orange underline under the selected filter: one bar that slides between
// buttons (and follows them when the row wraps on a phone).
let bar: HTMLElement | null = null
function moveBar() {
  const active = document.querySelector<HTMLElement>('[data-filter][aria-pressed="true"]')
  if (!bar || !active) return
  bar.style.width = `${active.offsetWidth}px`
  bar.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop + active.offsetHeight + 4}px)`
}

export function initWorkFilters() {
  const group = document.querySelector<HTMLElement>(".work-filters")
  if (group) {
    bar = document.createElement("span")
    bar.className = "work-filter-bar"
    bar.setAttribute("aria-hidden", "true")
    // Place it before turning on the slide, so it doesn't fly in on page load.
    bar.style.transition = "none"
    group.append(bar)
    group.classList.add("has-slider")
    moveBar()
    requestAnimationFrame(() => requestAnimationFrame(() => bar && (bar.style.transition = "")))
    new ResizeObserver(moveBar).observe(group)
  }
  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => setWorkFilter(b.dataset.filter!)),
  )
  const initial = new URLSearchParams(location.search).get("filter")
  if (initial) setWorkFilter(initial)
}
