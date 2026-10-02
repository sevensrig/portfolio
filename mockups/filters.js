// Project filters: buttons with data-filter="<tag>" show only the projects
// whose data-tags list contains that tag. "all" shows everything.

const buttons = document.querySelectorAll("[data-filter]")
const projects = document.querySelectorAll("[data-tags]")
const empty = document.querySelector("[data-filter-empty]")

export function setFilter(tag) {
  buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === tag)))
  let shown = 0
  projects.forEach((p) => {
    const match = tag === "all" || p.dataset.tags.split(" ").includes(tag)
    p.hidden = !match
    if (match) shown++
  })
  if (empty) empty.hidden = shown > 0
}

buttons.forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)))
