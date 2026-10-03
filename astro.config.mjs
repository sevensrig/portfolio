// @ts-check
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import tailwindcss from "@tailwindcss/vite"
import rehypeExternalLinks from "rehype-external-links"

export default defineConfig({
  // Switch to the custom domain once it's connected (see docs/PLAN.md → Domain).
  site: "https://portfolio-srig.vercel.app",
  integrations: [
    mdx({
      // Links in project stories that leave the site open in a new tab.
      rehypePlugins: [[rehypeExternalLinks, { target: "_blank", rel: ["noopener"] }]],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
