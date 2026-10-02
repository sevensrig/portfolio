// @ts-check
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  // TODO: set to the real domain once it's bought (see docs/PLAN.md → Domain).
  site: "https://example.com",
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
})
