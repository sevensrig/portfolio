// Builds one social preview PNG per page: /og/home.png and /og/<project>.png.
// Like a Next.js route handler, but run once at build time (static output).
import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { renderOg, type OgContent } from "../../lib/og"
import { yearRange } from "../../lib/format"

export async function getStaticPaths() {
  const projects = await getCollection("projects")
  const home: OgContent = {
    kicker: "Software engineer · Northeastern '27",
    title: "Shipping web apps, AI agents and the occasional Raspberry Pi hack",
    footer: "Projects · Experience · Résumé",
  }
  return [
    { params: { slug: "home" }, props: home },
    ...projects.map((p) => ({
      params: { slug: p.id },
      props: {
        kicker: "Project",
        title: p.data.title,
        subtitle: p.data.tagline,
        footer: [yearRange(p.data.period.start, p.data.period.end), ...p.data.stack.slice(0, 3)].join(" · "),
      } satisfies OgContent,
    })),
  ]
}

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderOg(props as OgContent)), { headers: { "Content-Type": "image/png" } })
