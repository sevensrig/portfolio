// @ts-check
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  // Switch to the custom domain once it's connected (see docs/PLAN.md → Domain).
  site: "https://portfolio-srig.vercel.app",
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
})
