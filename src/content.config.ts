// Content collections: think of these as typed, build-time "tables".
// Each collection says where its files live (the loader) and what shape they
// must have (the Zod schema). A missing or malformed field fails the build.
import { defineCollection, reference } from "astro:content"
import { file, glob } from "astro/loaders"
import { z } from "astro/zod"
import { parse as parseYaml } from "yaml"

// Categories drive the work filters on the home page. Labels live here so the
// filter row and the project data can't drift apart.
export const CATEGORIES = {
  fullstack: "Full-stack",
  frontend: "Frontend",
  backend: "Backend",
  ai: "AI",
  hardware: "Hardware",
} as const
const category = z.enum(Object.keys(CATEGORIES) as [keyof typeof CATEGORIES, ...(keyof typeof CATEGORIES)[]])

// "2025-06" → first of that month. Keeps frontmatter short.
const month = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Use YYYY-MM")
  .transform((s) => new Date(`${s}-01T00:00:00Z`))

// Videos are stored on Cloudflare R2, not in git. "r2:<path>" for now; the
// media script (Phase 2) will resolve these to public URLs.
const r2 = z.string().regex(/^r2:.+/, 'Use "r2:<path>"')

const projects = defineCollection({
  // One folder per project: src/content/projects/<slug>/index.mdx (+ images).
  loader: glob({
    pattern: "*/index.mdx",
    base: "./src/content/projects",
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      summary: z.string(), // the 1–2 sentence blurb on the home page
      status: z.enum(["shipped", "active", "archived", "abandoned"]),
      period: z.object({ start: month, end: month.nullable() }),
      role: z.string(),
      stack: z.array(z.string()).min(1),
      categories: z.array(category).min(1),
      featured: z.boolean().default(false),
      order: z.number().int(),
      links: z
        .object({ github: z.url().optional(), demo: z.url().optional() })
        .default({}),
      tldr: z.object({ problem: z.string(), built: z.string(), outcome: z.string() }),
      media: z
        .object({
          // TODO: make hero required once every project has photos.
          hero: image().optional(),
          loop: z.object({ src: r2, poster: image() }).optional(),
          gallery: z
            .array(
              z.union([
                z.object({ type: z.literal("image").default("image"), src: image(), caption: z.string() }),
                z.object({ type: z.literal("video"), src: r2, poster: image(), caption: z.string() }),
              ]),
            )
            .default([]),
        })
        .default({ gallery: [] }),
    }),
})

const resume = defineCollection({
  // src/data/resume.yaml is one document; wrap it as a single entry "resume".
  loader: file("src/data/resume.yaml", {
    parser: (text) => ({ resume: parseYaml(text) }),
  }),
  schema: z.object({
    contact: z.object({
      name: z.string(),
      location: z.string(),
      email: z.email(),
      github: z.url(),
      linkedin: z.url(),
      availability: z.string(),
    }),
    education: z.array(
      z.object({
        school: z.string(),
        degree: z.string(),
        detail: z.string().optional(),
        graduation: z.string(),
        gpa: z.string().optional(),
      }),
    ),
    experience: z.array(
      z.object({
        company: z.string(),
        role: z.string(),
        start: month,
        end: month.nullable(),
        bullets: z.array(z.string()),
      }),
    ),
    projects: z.array(reference("projects")), // described once, in the project's own file
    skills: z.record(z.string(), z.array(z.string())),
  }),
})

export const collections = { projects, resume }
