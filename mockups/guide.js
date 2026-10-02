// Hubert: a small square bird fixed to the bottom-right corner. Clicking it
// opens a short menu of shortcuts for recruiters (jump to a section, or filter
// the work by type). Builds its own markup, so the page only loads this file.

import { setFilter } from "./filters.js"

const NAME = "Hubert"
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches

// Each option: label in the menu, where to go, optional filter, and what Hubert
// says once it has taken you there.
const OPTIONS = [
  { label: "All projects", target: "#work", filter: "all", reply: "Here's everything." },
  { label: "AI work", target: "#work", filter: "ai", reply: "Here's the AI work." },
  { label: "Full-stack work", target: "#work", filter: "fullstack", reply: "Full-stack, coming up." },
  { label: "Experience", target: "#experience", reply: "Here's where I've worked." },
  { label: "Résumé (PDF)", target: "#resume", reply: "The résumé is right here." },
  { label: "Get in touch", target: "#contact", reply: "Say hi!" },
]

const style = document.createElement("style")
style.textContent = `
  .hubert { position: fixed; right: 16px; bottom: 16px; z-index: 50; font-family: var(--font-display, "Work Sans", sans-serif); }
  @media (min-width: 768px) { .hubert { right: 32px; bottom: 28px; } }
  .hubert-button { display: block; padding: 4px; background: none; border: 0; cursor: pointer; }
  .hubert-button:focus-visible { outline: 2px solid #FF5A1F; outline-offset: 2px; }
  .hubert-body { display: block; animation: hubert-bob 2.6s ease-in-out infinite; }
  .hubert-tuft { transform-box: fill-box; transform-origin: bottom center; }
  .hubert-button:hover .hubert-tuft { animation: hubert-wiggle .5s ease-in-out; }
  .hubert.happy .hubert-body { animation: hubert-hop .5s ease-out; }
  .hubert-wing { transform-box: fill-box; }
  .hubert-wing-l { transform-origin: top right; }
  .hubert-wing-r { transform-origin: top left; }
  .hubert-button:hover .hubert-wing-l, .hubert.happy .hubert-wing-l { animation: hubert-flap-l .22s ease-in-out 2; }
  .hubert-button:hover .hubert-wing-r, .hubert.happy .hubert-wing-r { animation: hubert-flap-r .22s ease-in-out 2; }
  .hubert-eyes { transition: transform .12s ease-out; }
  .hubert-eye { transform-box: fill-box; transform-origin: center; transition: transform .08s; }
  .hubert.blink .hubert-eye { transform: scaleY(.1); }
  .hubert-bubble, .hubert-panel { position: absolute; right: 0; bottom: calc(100% + 10px); background: #FAF7EE; border: 1px solid #141414; color: #141414; }
  .hubert-bubble { bottom: calc(100% + 14px); width: max-content; max-width: 220px; padding: 8px 12px; font: inherit; font-size: 14px; font-weight: 500; text-align: left; cursor: pointer; transform-origin: calc(100% - 28px) calc(100% + 8px); animation: hubert-pop .25s cubic-bezier(.3,1.4,.6,1); }
  /* Tail: a rotated square whose two bordered sides form a point at his head. */
  .hubert-bubble::after { content: ""; position: absolute; right: 23px; bottom: -6px; width: 10px; height: 10px; background: #FAF7EE; border-right: 1px solid #141414; border-bottom: 1px solid #141414; transform: rotate(45deg); }
  .hubert-bubble:focus-visible { outline: 2px solid #FF5A1F; outline-offset: 2px; }
  .hubert-panel { width: 248px; }
  .hubert-panel p { padding: 14px 16px 10px; font-size: 14px; line-height: 1.4; }
  .hubert-panel ul { border-top: 1px solid color-mix(in oklab, #141414 15%, transparent); }
  .hubert-panel li + li { border-top: 1px solid color-mix(in oklab, #141414 10%, transparent); }
  .hubert-panel li button { display: flex; width: 100%; justify-content: space-between; padding: 10px 16px; font-size: 14px; font-weight: 500; text-align: left; cursor: pointer; }
  .hubert-panel li button:hover, .hubert-panel li button:focus-visible { background: #F1ECDD; outline: none; }
  .hubert-panel li button span { color: color-mix(in oklab, #141414 40%, transparent); }
  .hubert [hidden] { display: none; }
  @keyframes hubert-bob { 50% { transform: translateY(-3px); } }
  @keyframes hubert-wiggle { 25% { transform: rotate(-12deg); } 75% { transform: rotate(12deg); } }
  @keyframes hubert-flap-l { 50% { transform: rotate(30deg); } }
  @keyframes hubert-flap-r { 50% { transform: rotate(-30deg); } }
  @keyframes hubert-pop { from { transform: scale(.6); opacity: 0; } }
  @keyframes hubert-hop { 30% { transform: translateY(-8px); } 60% { transform: translateY(0); } 80% { transform: translateY(-2px); } }
  @media (prefers-reduced-motion: reduce) { .hubert-body, .hubert-tuft, .hubert-wing, .hubert-bubble { animation: none !important; } }
`
document.head.append(style)

const root = document.createElement("div")
root.className = "hubert"
root.innerHTML = `
  <button type="button" class="hubert-bubble" aria-live="polite" title="Click to dismiss" hidden></button>
  <div class="hubert-panel" id="hubert-panel" role="dialog" aria-label="Page guide" hidden>
    <p>Hi, I'm ${NAME}! What are you looking for?</p>
    <ul>${OPTIONS.map((o, i) => `<li><button type="button" data-option="${i}">${o.label}<span>→</span></button></li>`).join("")}</ul>
  </div>
  <button type="button" class="hubert-button" aria-label="Open page guide" aria-expanded="false" aria-controls="hubert-panel">
    <svg class="hubert-body" width="48" height="58" viewBox="0 0 48 58" aria-hidden="true">
      <polygon class="hubert-tuft" points="21,12 25,2 29,4 26,12" fill="#FF5A1F"/>
      <polygon class="hubert-wing hubert-wing-l" points="5,28 0,37 5,39" fill="#141414"/>
      <polygon class="hubert-wing hubert-wing-r" points="43,28 48,37 43,39" fill="#141414"/>
      <rect x="4" y="12" width="40" height="38" fill="#141414"/>
      <g class="hubert-eyes">
        <rect class="hubert-eye" x="14" y="24" width="6" height="9" fill="#FAF7EE"/>
        <rect class="hubert-eye" x="28" y="24" width="6" height="9" fill="#FAF7EE"/>
      </g>
      <polygon points="20,37 28,37 24,43" fill="#FF5A1F"/>
      <g fill="#FF5A1F">
        <rect x="15" y="50" width="2" height="5"/><rect x="12" y="54" width="8" height="2"/>
        <rect x="31" y="50" width="2" height="5"/><rect x="28" y="54" width="8" height="2"/>
      </g>
    </svg>
  </button>
`
document.body.append(root)

const button = root.querySelector(".hubert-button")
const panel = root.querySelector(".hubert-panel")
const bubble = root.querySelector(".hubert-bubble")
const eyes = root.querySelector(".hubert-eyes")

let bubbleTimer = 0
// Show a speech bubble. It stays until clicked, or for ms milliseconds if given.
function say(text, ms) {
  clearTimeout(bubbleTimer)
  bubble.hidden = true
  bubble.textContent = text
  void bubble.offsetWidth // restart the pop-in animation
  bubble.hidden = false
  if (ms) bubbleTimer = setTimeout(() => (bubble.hidden = true), ms)
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
  panel.querySelector("li button").focus()
}
function close({ refocus = false } = {}) {
  panel.hidden = true
  button.setAttribute("aria-expanded", "false")
  button.setAttribute("aria-label", "Open page guide")
  if (refocus) button.focus()
}

button.addEventListener("click", () => (panel.hidden ? open() : close()))
panel.addEventListener("click", (e) => {
  const item = e.target.closest("[data-option]")
  if (!item) return
  const option = OPTIONS[item.dataset.option]
  if (option.filter) setFilter(option.filter)
  document.querySelector(option.target)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" })
  close()
  say(option.reply, 3500)
  root.classList.add("happy")
  setTimeout(() => root.classList.remove("happy"), 600)
})
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !panel.hidden) close({ refocus: true })
})
document.addEventListener("pointerdown", (e) => {
  if (!panel.hidden && !root.contains(e.target)) close()
})

// Eyes follow the pointer a couple of pixels.
window.addEventListener("pointermove", (e) => {
  const r = button.getBoundingClientRect()
  const dx = e.clientX - (r.left + r.width / 2)
  const dy = e.clientY - (r.top + r.height / 2)
  const d = Math.hypot(dx, dy) || 1
  eyes.style.transform = `translate(${(dx / d) * 2.5}px, ${(dy / d) * 2}px)`
}, { passive: true })

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

// Say hello every time the page opens; the bubble stays until clicked.
setTimeout(() => {
  if (panel.hidden) say("Need a hand finding something?")
}, 800)
