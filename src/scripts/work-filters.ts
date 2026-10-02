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
}

export function initWorkFilters() {
  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => setWorkFilter(b.dataset.filter!)),
  )
  const initial = new URLSearchParams(location.search).get("filter")
  if (initial) setWorkFilter(initial)
}
