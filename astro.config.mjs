// @ts-check
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import rehypeExternalLinks from "rehype-external-links"

export default defineConfig({
  site: "https://srig.tech",
  integrations: [
    mdx({
      // Links in project stories that leave the site open in a new tab.
      rehypePlugins: [[rehypeExternalLinks, { target: "_blank", rel: ["noopener"] }]],
    }),
    // /sitemap-index.xml for search engines (linked from public/robots.txt).
    sitemap({ filter: (page) => !page.includes("/404") }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
