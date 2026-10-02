# Portfolio — plan & decisions

These are the decisions from the first planning session (2026-10-01), which ran in the SmartRoomThing repo by mistake. Everything decided so far is recorded here. The real Astro site now exists (2026-10-02): Phase 1 is done and the home page is built (most of Phase 3). `mockups/` is kept only as the design reference.

## Goal and audience
- A personal portfolio for **full-time recruiters**. The owner is looking for **entry-level SWE roles** and graduates in May 2027.
- Recruiters skim for about 30 seconds, so every page needs a quick skim layer and an optional deep layer.
- The site is ongoing work, not a one-shot build. The owner has 4–5 projects with deep stories and will keep adding and editing them.

## Decided
| Area | Decision |
|---|---|
| Framework | **Astro**. The owner knows React and Next.js and wants to learn Astro. React islands only where interactivity is needed. |
| Styling | **Tailwind and daisyUI v5**, with a custom `creme` theme (below). |
| Content | **MDX with a schema-checked frontmatter block**, in Astro content collections. Edited in a code editor and pushed to git; no CMS for now. |
| Projects | 4–5 projects. **Every project has photos and video.** |
| Résumé | A dedicated résumé page built from `resume.yaml`, with a print stylesheet for the PDF. |
| Dark mode | **No.** Creme only. |
| Repo | Public on GitHub: https://github.com/sevensrig/portfolio (`main`). |
| Domain | Later. It'll come from the GitHub Student Pack (.me or .tech). Check the renewal price, since the free offer covers only year one. |
| Hosting | Vercel (recommended; the MongoDB driver works well in Vercel's Node functions). |
| Video | Not stored in git. Use **Cloudflare R2** (10 GB free, no bandwidth charges). An ffmpeg script compresses clips to MP4 and WebM and grabs poster frames. Images stay in the repo and Astro optimizes them at build time. |
| MongoDB and analytics | Later extras, and **never for storing content**. Ideas: per-project view counts, a public /stats page, Plausible or Umami. |

## Visual direction
- **Minimalist, boxy and sharp.** Square corners everywhere, thin 1px hairline borders, flat surfaces. The first mockup was too busy, and the owner asked for it simpler. Neo-brutalism was tried and then dropped (2026-10-01).
- **Colours:** creme, white and black, with orange accents.
- **Font:** **Work Sans**. Headlines use **SemiBold (600)** with tight letter-spacing (about −0.04em). JetBrains Mono for small metadata like dates and stack. Satoshi was rejected.
- **No shadows at all** (neither hard nor soft), and no gradients, glass effects or rounded corners. Media has a faint 1px border; on hover it dims slightly. Buttons are flat rectangles.
- **Orange is used only for:** the full stops ending headlines ("Let's talk."), link underlines, the primary button, the active work filter, and and Hubert's beak, feather and legs.
- **Rejected or removed after feedback:** the pulsing "open to work" badge, the vertical icon menu, the scroll-progress line, the scrolling thumbnail strip, the stats box, the status and tag badges, the outlined number callouts, the live clock, the big orange-ringed logo, the small power-icon logo, and the neo-brutalist offset shadows and thick borders.
- **References the owner likes:**
  - The Brand Appart agency site: huge tightly spaced headline, creme background, a single orange mark.
  - The Next.js blog-starter example: big title, large hero image, two-column title/meta and summary below it.

### daisyUI theme
```css
[data-theme="creme"] {            /* in the real build: @plugin "daisyui/theme" { name: "creme"; ... } */
  --color-base-100: #FAF7EE;  --color-base-200: #F1ECDD;  --color-base-300: #E4DCC6;
  --color-base-content: #141414;
  --color-primary: #FF5A1F;   --color-primary-content: #141414;
  --color-neutral: #141414;   --color-neutral-content: #FAF7EE;
  --radius-selector: 0; --radius-field: 0; --radius-box: 0;
  --border: 1px; --depth: 0; --noise: 0;
}
```

## Content model (draft)
Each project gets its own folder holding its text and media:
```
src/content/projects/<slug>/
  index.mdx      # frontmatter + the story
  cover.jpg
  *.jpg          # gallery images (optimized by Astro)
```
```yaml
title: SmartRoomThing
tagline: A modded Spotify Car Thing that runs my room
status: active            # shipped | active | archived | abandoned
period: { start: 2025-06, end: null }
role: Solo — hardware, backend
stack: [Python, Flask, Raspberry Pi, Google Cast]
featured: true
order: 2
links: { github: ..., demo: ... }
tldr:                     # the 30-second card at the top of the project page
  problem: ...
  built: ...
  outcome: ...
media:
  hero: ./cover.jpg
  loop: { src: r2:smartroomthing/loop.mp4, poster: ./loop-poster.jpg }   # muted autoplay
  gallery:
    - { src: ./teardown.jpg, caption: "..." }
    - { type: video, src: r2:smartroomthing/demo.mp4, poster: ./demo.jpg, caption: "..." }
```
- The MDX body is the long-form story. It can use custom components: `<Gallery>`, `<Video>`, `<Callout type="broke">`, `<Timeline>`, `<BeforeAfter>`.
- A schema check fails the build if a field is missing or malformed.
- **Project page layout:** a hero image, a TL;DR card generated from frontmatter (Problem / Built / Stack / Outcome), then the story.
- **`resume.yaml`:** experience, education and skills. Its projects section references project slugs, so a project is described in one place only.

## Home page (as in the mockup)
1. **Header:** name (text only, no logo) on the left; Work, Experience and the Résumé button on the right.
2. **Hero (centred, full width, about one screen tall):** an animated WebGL background sits behind it: the creme base with a faint orange glow (three soft blobs drifting slowly on looping paths) and a film-grain overlay. It replaced a 21st.dev dithering shader. Settings are at the top of `src/scripts/shader-background.ts`. It draws a still frame under `prefers-reduced-motion`. In Astro this is a plain `<script>` in a component, not a React island. Then a SemiBold headline ("Shipping web apps, AI agents and the occasional hardware hack." chosen 2026-10-02 over a four-item list that felt less punchy), one line of context, a "See the work" button, and GitHub and LinkedIn links.
3. **Selected work:** filter buttons sit to the right of the heading (All, Full-stack, Backend, AI, Hardware), as plain text with an orange underline on the active one. Each project has `data-tags`; in the real build these come from a `categories` field in the project frontmatter. Below that: one large featured project (a 16:9 media block, then two columns: title and meta on the left, summary and "Read the story →" on the right), followed by a two-up grid.
4. **Experience:** a plain table of company, role and year, plus a résumé PDF link.
5. **Contact:** "Let's talk." and the email address.
6. **Footer:** © and "Boston, MA".
7. **Guide character, Hubert:** a tiny minimal square bird fixed to the bottom-right corner, drawn in the same style as the earlier robot: a black square body, two small creme rectangle eyes that follow the cursor and blink, a small orange triangle beak, a single slanted orange feather on top, small black triangle wings, and orange stick legs, with a gentle idle bob. On hover his feather wiggles and his wings flap. Clicking him opens a menu of shortcuts (All projects, AI work, Full-stack work, Experience, Résumé, Get in touch) that scroll to the section and set the work filter; then he hops, flaps and replies in a speech bubble. He talks in a speech bubble above his head (sharp corners, 1px border, a small tail pointing down at him, a quick pop-in). It says "Need a hand finding something?" every time the page opens and stays until clicked; his replies after a shortcut fade after a few seconds or on click. Motion is disabled under reduced motion, and Esc or clicking outside closes the menu. A more detailed bird (big eyes, wings, belly) was tried and dropped as too detailed. Mockup code is in `mockups/guide.js`; in Astro it becomes a component with a plain `<script>`.

## Projects (candidates; final list still to be chosen)
- **$20 Blind Draft:** a full-stack web game, Aug 2026–present. Server-authoritative remote play on Supabase (4 Deno Edge Functions, 6 Postgres migrations, row-level security so the shuffled deck stays on the server, conflict handling for simultaneous moves). 190+ tests across Vitest, real-Chromium component tests and Playwright E2E. A randomized simulation plays 840 full drafts per run, with 100% line coverage on the game engine. CI runs 4 parallel GitHub Actions jobs against a live Supabase stack, plus axe-core accessibility checks.
- **SmartRoomThing:** a modded Spotify Car Thing that controls the volume of three Google Cast devices through a Flask server on a Raspberry Pi 2. Code is in `~/SmartRoomThing`, which has rich history and failure stories, and has hardware photos available. A good pilot case study.
- **Zoom → Jira agent:** won SimpliSafe's company-wide AI hackathon. An agentic pipeline turns Zoom transcripts into Jira ticket updates, using Ollama and a Jira Cloud API integration layer.
- 1–2 more still to be chosen.

## Résumé data (from Sriganesh_Srinivasan_Resume.pdf; phone number left out on purpose)
- **Contact:** Boston, MA · ganeshvasan14@gmail.com · GitHub · LinkedIn · available to start May 2027
- **Education:** Northeastern University, BS in Computer Science, concentration in AI. Expected May 2027. GPA 3.67.
- **Fenwick & West, Business Innovation Intern (Jun–Aug 2026)**
  - Built 9 AI automations by connecting 5 service APIs through LLM-driven orchestration.
  - Cut the expense-reporting automation's run time by 50% (API parallelization, reusable schema references).
  - Created test seeds and views across 10+ Databricks tables (20k+ rows each) for integration testing.
  - Built a Python ETL pipeline over 3 data sources with custom scoring signals, surfacing $5M+ in cross-sell opportunities.
  - Built an LLM email agent using multi-source RAG to write client-specific legal case summaries, with 2-minute response times.
- **SimpliSafe, Software Engineer Co-op (Jan–Jun 2026)**
  - Front-end platform team for the e-commerce site (52k visits a day). Stack: React, TypeScript, Vite, i18n, Chromatic, Tailwind, TanStack, AWS.
  - Completed the migration from Gatsby to React Router: CI/CD build times down 30%, 17,000+ lines of code removed.
  - Led the design-system work: 3 components and 100+ icons, built with designers.
  - Maintained GitHub Actions CI/CD, build tooling, unit and E2E tests, and AWS infrastructure via Terraform across 4 repos.
  - Won the company-wide AI hackathon (the Zoom → Jira agent).
- **Northeastern ITS, Salesforce Developer Co-op (Jan–Jun 2025)**
  - Owned full-stack Lightning Web Component features for faculty appointment and student-request apps serving 47,000+ students.
  - Cleared 300+ items of database debt, including fields referenced by over 1M records.
  - Migrated 20+ legacy Salesforce Classic customizations to Lightning flows and components.
- **Scalable Design Participation Lab, Research Assistant (Feb 2025–present)**
  - Designing and building full-stack user management and auth with Firebase Identity and Access Management.
  - 15+ reusable Vue/TypeScript components and composables in Nuxt.
- **Skills**
  - Languages: Java, Python, TypeScript, JavaScript, CSS, HTML, SQL, Apex, SOQL
  - DevOps and cloud: Google Cloud, AWS, Firebase, GitHub Actions, Terraform, Grafana, Vitest, Playwright, Docker, Supabase
  - Frameworks and tools: React, Nuxt, Vue, MySQL, REST, Flask, WordPress, Netlify, Jira, Salesforce, Scrum, Vite
  - AI/ML: Ollama, Roboflow, RAG, Claude Code, Cursor, Weights & Biases, prompt engineering

## Phases
1. ✅ Scaffold Astro, Tailwind and daisyUI. Add the creme theme and Work Sans. Define the project and résumé schemas.
2. Build the project page with SmartRoomThing as the pilot (TL;DR card, MDX story, gallery, video). Write the R2 media script. *(A basic project page exists: title, hero, TL;DR grid, MDX body.)*
3. ✅ Build the home page from the mockup. ⬜ Deploy to Vercel.
4. Build the résumé page and print PDF.
5. Migrate the remaining projects.
6. Later: domain, analytics, MongoDB view counts, OG images, RSS.

## Codebase map (2026-10-02)
- `src/content.config.ts`: the `projects` and `resume` collections and their Zod schemas. The `CATEGORIES` list here drives the work filters.
- `src/content/projects/<slug>/index.mdx`: one folder per project. Frontmatter adds `summary` (home page blurb) and `categories` to the draft model above. `media.hero` is optional until photos exist; cards show a grey placeholder without it.
- `src/data/resume.yaml`: contact, education, experience, project slugs and skills.
- `src/layouts/Base.astro`: the page shell (head, header, footer, Hubert).
- `src/components/`: `Hero`, `ShaderBackground`, `WorkSection`, `ProjectCard`, `ProjectMedia`, `ExperienceList`, `Contact`, `Hubert`, `Header`, `Footer`.
- `src/scripts/`: browser code bundled by Astro (`shader-background.ts`, `work-filters.ts`, `hubert.ts`). There are no React islands; everything is plain `<script>`.
- `src/pages/index.astro` and `src/pages/projects/[slug].astro`.
- Fonts are self-hosted through Fontsource (Work Sans Variable, JetBrains Mono 400), not Google Fonts.
- `/?filter=<category>#work` opens the home page with a filter applied; Hubert uses it from other pages.

## Placeholders to fill in
- `public/resume.pdf` (the Résumé button and "Full résumé" link point to it).
- SmartRoomThing `tldr.problem` / `tldr.outcome`, and the Zoom → Jira `role`. Check the drafted Blind Draft `tldr.problem` and `role` too.
- Project cover photos (`media.hero`) and the long-form stories.
- `site` in `astro.config.mjs` once the domain exists.

## Open questions
- ~~GitHub repo name and visibility~~ Done: public at https://github.com/sevensrig/portfolio (2026-10-02).
- Which 4–5 projects are final, and in what order?
- Is there footage for every project, or do some need recording or a polished fallback?
