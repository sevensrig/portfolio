// @ts-check
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import tailwindcss from "@tailwindcss/vite"
import rehypeExternalLinks from "rehype-external-links"

export default defineConfig({
  site: "https://srig.tech",
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
