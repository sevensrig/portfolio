# Portfolio

Sriganesh's personal portfolio site, aimed at recruiters hiring for entry-level SWE roles.

**Read `docs/PLAN.md` first.** It holds every decision made so far (stack, visual direction, content model, résumé data, phases, open questions). Keep it up to date as decisions change.

- The stack is Astro, Tailwind and daisyUI v5 (custom `creme` theme), with MDX content collections. The user knows React and Next.js and is new to Astro, so explain Astro concepts in React terms when that helps.
- The design should be minimal. When unsure, remove things rather than add them; the user has already rejected busier versions.
- Run `npm run dev` for the site (`.claude/launch.json` has a `site` config on port 4330). `npm run build` runs `astro check` first, so type errors fail the build. The dev server often keeps serving stale content-collection data (new project folders, changed frontmatter): if a page looks out of date, compare with `npm run build` output and restart the dev server.
- `mockups/` holds the approved static mockups. It's a design reference only; the real code is in `src/`. `docs/PLAN.md` → Codebase map lists where things live.
