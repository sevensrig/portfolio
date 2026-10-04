// Social preview images (the card LinkedIn, Slack and iMessage show for a link).
// satori lays out a tiny element tree into SVG with real fonts; sharp turns it
// into a PNG. Rendered once at build time by src/pages/og/[slug].png.ts.
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import satori from "satori"
import sharp from "sharp"

const require = createRequire(import.meta.url)
const font = (pkg: string, file: string) => readFileSync(require.resolve(`${pkg}/files/${file}`))
const fonts = [
  { name: "Work Sans", data: font("@fontsource/work-sans", "work-sans-latin-400-normal.woff"), weight: 400 as const },
  { name: "Work Sans", data: font("@fontsource/work-sans", "work-sans-latin-600-normal.woff"), weight: 600 as const },
  { name: "JetBrains Mono", data: font("@fontsource/jetbrains-mono", "jetbrains-mono-latin-400-normal.woff"), weight: 400 as const },
]

const INK = "#141414"
const CREME = "#FAF7EE"
const ORANGE = "#FF5A1F"

// Hubert, the same drawing as the site's corner guide.
const hubert = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 58"><polygon points="21,12 25,2 29,4 26,12" fill="${ORANGE}"/><polygon points="5,28 0,37 5,39" fill="${INK}"/><polygon points="43,28 48,37 43,39" fill="${INK}"/><rect x="4" y="12" width="40" height="38" fill="${INK}"/><rect x="14" y="24" width="6" height="9" fill="${CREME}"/><rect x="28" y="24" width="6" height="9" fill="${CREME}"/><polygon points="20,37 28,37 24,43" fill="${ORANGE}"/><g fill="${ORANGE}"><rect x="15" y="50" width="2" height="5"/><rect x="12" y="54" width="8" height="2"/><rect x="31" y="50" width="2" height="5"/><rect x="28" y="54" width="8" height="2"/></g></svg>`,
)}`

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } }
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style: { display: "flex", ...style }, children, ...extra },
})

export interface OgContent {
  kicker: string // small mono line above the title, e.g. "PROJECT"
  title: string // big headline; gets the orange full stop
  subtitle?: string
  footer: string // mono line at the bottom, e.g. "2026 · SvelteKit · Supabase"
}

export async function renderOg({ kicker, title, subtitle, footer }: OgContent): Promise<Buffer> {
  const size = title.length > 40 ? 64 : title.length > 18 ? 76 : 96
  // One item per word so lines wrap between words, with the orange full stop
  // glued to the last word (a separate item would wrap onto its own line).
  const words = title.split(" ")
  const titleWords = words.map((w, i) =>
    i < words.length - 1
      ? h("span", { marginRight: size * 0.24 }, w)
      : h("span", {}, [h("span", {}, w), h("span", { color: ORANGE }, ".")]),
  )
  const tree = h(
    "div",
    {
      width: 1200,
      height: 630,
      padding: "64px 72px",
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: CREME,
      backgroundImage: `radial-gradient(circle at 0% 100%, rgba(255,138,87,.55), rgba(250,247,238,0) 55%), radial-gradient(circle at 100% 0%, rgba(251,217,191,.9), rgba(250,247,238,0) 50%)`,
      fontFamily: "Work Sans",
      color: INK,
    },
    [
      h("div", { justifyContent: "space-between", alignItems: "flex-start" }, [
        h("div", { fontFamily: "JetBrains Mono", fontSize: 24, letterSpacing: 3, color: "rgba(20,20,20,.55)" }, "SRIG.TECH"),
        h("img", { width: 72, height: 87 }, undefined, { src: hubert, width: 72, height: 87 }),
      ]),
      h("div", { flexDirection: "column" }, [
        h("div", { fontFamily: "JetBrains Mono", fontSize: 22, letterSpacing: 3, color: "rgba(20,20,20,.55)" }, kicker.toUpperCase()),
        h("div", { marginTop: 18, fontSize: size, fontWeight: 600, letterSpacing: -size * 0.04, lineHeight: 1.05, flexWrap: "wrap" }, titleWords),
        subtitle ? h("div", { marginTop: 22, fontSize: 32, color: "rgba(20,20,20,.7)", lineHeight: 1.3, maxWidth: 980 }, subtitle) : null,
      ].filter(Boolean)),
      h("div", { justifyContent: "space-between", alignItems: "baseline", fontSize: 26 }, [
        h("div", { fontWeight: 600 }, "Sriganesh Srinivasan"),
        h("div", { fontFamily: "JetBrains Mono", fontSize: 20, color: "rgba(20,20,20,.55)" }, footer),
      ]),
    ],
  )
  const svg = await satori(tree as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts })
  return sharp(Buffer.from(svg)).png().toBuffer()
}
