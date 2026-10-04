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
| Projects | **6–8 projects** (changed from 4–5 on 2026-10-03). **Every project has photos and video.** The home page shows one featured project, then the rest in a two-up grid; the filters matter more at this count. |
| Résumé | `public/resume.pdf` opens in the browser's built-in PDF viewer in a new tab (no forced download). Later: a dedicated résumé page built from `resume.yaml`, with a print stylesheet for the PDF. |
| Dark mode | **No.** Creme only. |
| Repo | Public on GitHub: https://github.com/sevensrig/portfolio (`main`). |
| Live site | https://srig.tech (Vercel, auto-deploys from `main`; also at portfolio-srig.vercel.app). |
| Domain | **srig.tech** (registered 2026-10-03 via the GitHub Student Pack's .tech offer; renews 2027-10-04, so check the year-two price). Nameservers on Cloudflare. `srig.tech` → Vercel (A record, DNS only); `www` → redirects to the apex; `media.srig.tech` → the R2 bucket (custom domain). |
| Hosting | Vercel (recommended; the MongoDB driver works well in Vercel's Node functions). |
| Video and media | Not stored in git. Cloudflare R2 is live (set up 2026-10-03), served from `https://media.srig.tech`. Akamai/Linode Object Storage was considered and passed on (paid, enterprise-oriented CDN). `npm run media -- <file> <slug> [name]` (scripts/media.mjs) works with any S3-compatible bucket: it compresses video to MP4 + WebM (max 1280 px, audio stripped unless `--keep-audio`), saves a poster next to the project's MDX, and uploads with year-long cache headers. Settings live in `.env` (template: `.env.example`); `PUBLIC_MEDIA_BASE` must also be set in Vercel. In MDX, `<Video src="r2:<slug>/<name>">` serves WebM with an MP4 fallback. Cards always show the still cover (owner's choice, 2026-10-03); the loop plays only on the project page, and stays paused on the poster under reduced motion. Project images stay in the repo for now so Astro optimizes them at build time. |
| MongoDB and analytics | Later extras, and **never for storing content**. Ideas: per-project view counts, a public /stats page, Plausible or Umami. |

## Visual direction
- **Minimalist, boxy and sharp.** Square corners everywhere, thin 1px hairline borders, flat surfaces. The first mockup was too busy, and the owner asked for it simpler. Neo-brutalism was tried and then dropped (2026-10-01).
- **Colours:** creme, white and black, with orange accents.
- **Font:** **Work Sans**. Headlines use **SemiBold (600)** with tight letter-spacing (about −0.04em). JetBrains Mono for small metadata like dates and stack. Satoshi was rejected.
- **No shadows at all** (neither hard nor soft), and no gradients, glass effects or rounded corners. Media has a faint 1px border; on hover it dims slightly. Buttons are flat rectangles.
- **Orange is used only for:** the full stops ending headlines ("Contact me."), link underlines, the primary button, the active work filter, and and Hubert's beak, feather and legs.
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
2. **Hero (centred, full width, about one screen tall):** an animated WebGL background sits behind it: the creme base with a faint orange glow (three soft blobs drifting slowly on looping paths) and a film-grain overlay. It replaced a 21st.dev dithering shader. Settings are at the top of `src/scripts/shader-background.ts`. It draws a still frame under `prefers-reduced-motion`. In Astro this is a plain `<script>` in a component, not a React island. Then a SemiBold headline ("Shipping web apps, AI agents, and the occasional Raspberry Pi hack." chosen 2026-10-03, serial comma added 2026-10-04; earlier "…hardware hack", and before that a four-item list), one line of context, a "See the work" button and a white "Experience" button (added 2026-10-04), and GitHub and LinkedIn links (they wrap below the buttons on phones).
3. **Selected work:** filter buttons sit to the right of the heading (All, Full-stack, Backend, AI, Hardware), as plain text with an orange underline on the active one. Each project has `data-tags`; in the real build these come from a `categories` field in the project frontmatter. Below that: one large featured project (a 16:9 media block, then two columns: title and meta on the left, summary and "Read the story →" on the right), followed by a two-up grid.
4. **Experience:** a table of company, role and year, plus a résumé PDF link. Each row opens (native `<details>`, + / −) to show an optional one-line `summary` and the role's bullets from resume.yaml (curated 2026-10-04: portfolio-safe, no internal business metrics, security details, repo names or client specifics).
4b. **Leadership and community** (added 2026-10-04): same expandable rows as Experience, from `community:` in resume.yaml. Scout (Northeastern's student design studio: videographer 2024 → project lead 2025 → director of media 2026), Northeastern Habitat for Humanity (vice president), Srigmadeit (freelance videography 2020–2023, links srigmadeit.com/videos), Ekal Vidyalaya USA (volunteer since 2015). Roles can carry an optional `link`. Enriched 2026-10-04 from the owner's award write-up (Scout mid-project leadership story, Habitat co-director work, EYL = Ekal Youth Leadership). Not yet used from that write-up: GPA 3.68 (resume.yaml says 3.67), Dean's List, coursework, Circle K, and the Hair For You project (`~/hair-for-you`, a scheduling app for a local barber) as a project candidate.
4c. **Testimonial** (added 2026-10-04; heading pluralizes with more than one): each quote in a white speech bubble (Hubert's bubble style) whose tail points at an initials badge and the person's name. Testimonials from `testimonials:` in resume.yaml, quoted exactly, shown after Experience. First: Jonathan Tseng, Software Engineering Manager at SimpliSafe, who managed Srig directly (LinkedIn recommendation, July 2026).
5. **Contact:** a headshot (src/assets/headshot.jpg, 4:5, metadata stripped; beside the text on desktop, above it on phones), then "Contact me." (was "Let's talk." until 2026-10-04) and the email address. The hero stays photo-free on purpose: it is purely typographic.
6. **Footer:** © and "Boston, MA".
7. **Guide character, Hubert:** a tiny minimal square bird fixed to the bottom-right corner, drawn in the same style as the earlier robot: a black square body, two small creme rectangle eyes that follow the cursor and blink, a small orange triangle beak, a single slanted orange feather on top, small black triangle wings, and orange stick legs, with a gentle idle bob. On hover his feather wiggles and his wings flap. Clicking him opens a menu of shortcuts (All projects, AI work, Full-stack work, Experience, Résumé, Get in touch) that scroll to the section and set the work filter; then he hops, flaps and replies in a speech bubble. He talks in a plain white speech bubble above his head (his menu panel is white too) (sharp corners, 1px border, a small tail pointing down at him, a quick pop-in). It says "Need a hand finding something?" every time the home page opens (never on project pages) and stays until clicked. He talks about Srig in the third person ("Here's where Srig worked."); his replies after a shortcut fade after a few seconds or on click. Motion is disabled under reduced motion, and Esc or clicking outside closes the menu. A more detailed bird (big eyes, wings, belly) was tried and dropped as too detailed. Mockup code is in `mockups/guide.js`; in Astro it becomes a component with a plain `<script>`.
   - **Flying (2026-10-03):** choosing Experience, Résumé or Get in touch from his menu (or an in-page link to those sections, like the header's Experience) launches him at the same moment the page starts scrolling; he aims for where the heading will land, flies in an arc to the section heading, perches at the end of its text with his reply in a bubble below him (`.perched` flips the bubble), and flies back after about 2 s. He never flies to the work section: the work filters (All projects, AI work, Full-stack work) and "See the work" just scroll and he answers from the corner. Reduced motion: no flight, just the reply.
   - **Easter eggs:** five clicks within 2 s → dizzy spin ("Whoa… I'm seeing two of you."); 10 pm–6 am local → sleepy (droopy eyes, floating z's, "*yawn*" greeting) until his menu is opened; hovering the Bird Feeder card → "A fellow bird!" once per visit.
   - **404 page** (`src/pages/404.astro`): a big, still Hubert (slight puzzled tilt, no animation) holding a map, "This page flew the coop." The corner Hubert is hidden there (`<Base hubert={false}>`).

## Projects (candidates; final list still to be chosen)
- **$20 Blind Draft:** ✅ case study written 2026-10-03 (cover is a composite of three real phone screens captured with Playwright from a local run). Corrections vs. the résumé: only 1 of the 4 CI jobs boots Supabase, and concurrency is "optimistic versioning" (no test fires two moves at once). A full-stack web game, Aug 2026–present. Server-authoritative remote play on Supabase (4 Deno Edge Functions, 6 Postgres migrations, row-level security so the shuffled deck stays on the server, conflict handling for simultaneous moves). 190+ tests across Vitest, real-Chromium component tests and Playwright E2E. A randomized simulation plays 840 full drafts per run, with 100% line coverage on the game engine. CI runs 4 parallel GitHub Actions jobs against a live Supabase stack, plus axe-core accessibility checks.
- **SmartRoomThing:** ✅ case study written 2026-10-03. a modded Spotify Car Thing that controls the volume of three Google Cast devices through a Flask server on a Raspberry Pi 2. Code is in `~/SmartRoomThing`, which has rich history and failure stories, and has hardware photos available. A good pilot case study.
- **Zoom → Jira agent:** won SimpliSafe's company-wide AI hackathon. An agentic pipeline turns Zoom transcripts into Jira ticket updates, using Ollama and a Jira Cloud API integration layer.
- **tv-ambilight** ✅ (no LED strip: the owner uses room lights, so the page says "Govee light" even though the code calls it a strip) case study written 2026-10-03 (`~/tv-ambilight`, github.com/sevensrig/tv-ambilight, Sep 2026). Cover and the majority-vs-average figure come from running the repo's real `dominant_color` code on a generated sample frame. Its Govee fixes are uncommitted in that repo; the write-up describes them. Videos (2026-10-03): `room` (landscape, looping hero; its poster is the card cover) and `wall` (portrait, in the story; it shows the light next to the TV) live in R2 under `tv-ambilight/`; the generated sunset frame moved into the story as `sample-frame.png`.
- **Bird Feeder Detector** ✅ written 2026-10-03 (slug `bird-feeder`; repo github.com/sevensrig/Bird_Id). Material from the owner's own agent session plus the repo: validation metrics come from the checkpoints themselves (V1 Mar 7: P 0.71 / R 0.65 / mAP50 0.65; V2 Mar 27: P 0.80 / R 0.61 / mAP50 0.67), and live-session numbers from the local W&B run summaries. 8 classes. Cover is a YOLO training-batch mosaic the owner supplied; the pipeline diagram sits in "How it works". Period shown as 2025–2026; no "next steps" or "smaller ones" sections, by request. Never use the W&B sample-detection image: it shows the owner's face and room. The public repo only has the first commit; capture.py and the W&B inference changes are uncommitted there.
- **Tech Trends News Agent** ✅ written 2026-10-04 (slug `tech-trends-agent`), short on purpose. Hero is the 50 s silent demo (R2 `tech-trends-agent/demo`, poster at 20 s for the card); the pipeline diagram is in "How it works". CS 4100 (AI) final project, team of 2 with Divya Thoppae; links Srig's copy, github.com/sevensrig/CS4100_Project. Cover is the pipeline diagram. That repo's public notebook contains a NewsAPI key and an ngrok auth token; the owner was told to revoke both.
- **SimpliSync (Zoom → Jira Agent)** ✅ written 2026-10-03 (slug `zoom-jira-agent`). From the hackathon deck and demo video; team of 3. The deck is marked "Strictly Confidential", so none of its images are used; the diagram is redrawn. The demo (sandbox Jira with toy tickets) is in R2, trimmed before the final Google Slides frames; it shows teammates' first names in the sample transcript. Owner to add which parts they built.
- **VitalLink** ✅ written 2026-10-03. Verizon Smart Campus Competition (2025–26) winner, team of 3 (with Divya Thoppae and Aran Dharma, named on the poster). A design and pitch, not shipped software: latency figures are design targets. Cover is a photo of the team presenting in the final round; the dashboard mockup from the deck is in "The design", and a team photo (Aran, Srig, Divya at the event) closes the story. Owner presented the impact and "why Verizon" sections.
- **srig.tech (this site)** ✅ written 2026-10-03 (slug `portfolio`): design choices (orange = favorite color and curiosity; minimal over neo-brutalist; Hubert for skimming recruiters, a bird because the owner loves birds), why Astro, the media pipeline with measured cache timings (first byte 124–149 ms uncached vs 60–73 ms cached, 7-run medians from Boston), and two failure stories. Cover is a capture of the home hero.
- SmartRoomThing has a 27 s demo clip (portrait, audio kept on purpose so the volume changes are audible; the music is incidental) in R2 at `smartroomthing/demo`. Its cover is now a real photo of the Car Thing (metadata stripped, cropped to 4:3, `heroPosition: center 80%` for the wide banner).
- More to come (target 6–8). Other candidates seen in the home folder: wifi-sensing, ESP32-CSI-Tool, NowPlayingRasPi, Deep-Sea-Exploration.
- **Gathering material:** paste `docs/project-research-prompt.md` into the agent session where a project was built, then bring the reply here. For repos without such a session, a research agent reads the repo directly (as done for SmartRoomThing and Blind Draft).

## Résumé data (from Sriganesh_Srinivasan_Resume.pdf; the phone number stays off the site pages, though public/resume.pdf includes it by choice)
- **Contact:** Boston, MA · ganeshvasan14@gmail.com · GitHub · LinkedIn · available to start May 2027
- **Education:** Northeastern University, BS in Computer Science, concentration in AI. Expected May 2027. GPA 3.67.
- **Fenwick & West, Business Innovation Intern (Jun–Aug 2026)**
  - Built 9 AI automations by connecting 5 service APIs through LLM-driven orchestration.
  - Cut the expense-reporting automation's run time by 50% (API parallelization, reusable schema references).
  - Created test seeds and views across 10+ Databricks tables (20k+ rows each) for integration testing.
  - Built a Python ETL pipeline over 3 data sources with custom scoring signals, surfacing $5M+ in cross-sell opportunities.
  - Built an LLM email agent using multi-source RAG to write client-specific legal case summaries, with 2-minute response times.
- **Northeastern CAMD, Website Designer, part-time (Apr–Jun 2025, and again Apr–Jun 2026)** — added 2026-10-04; not on the PDF résumé.
  - Built and populated 50+ university web pages in WordPress.
  - Collected and normalized content with students and faculty; standardized formatting and edited CSS for consistency.
  - Second term: trained the replacement for the following year. (resume.yaml stores the second term under `returned`.)
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
2. Build the project page with SmartRoomThing as the pilot (TL;DR card, MDX story, gallery, video). Write the R2 media script. *(Done 2026-10-03: page layout (title → meta → hero video or image → TL;DR grid → story → next project) and the story components `Callout` (types broke / lesson / note), `Figure`, `Gallery`, `Video` and `Timeline`, available in every MDX file without imports. SmartRoomThing's story is drafted from its repo history. SmartRoomThing has screenshots of its mixer and Now Playing screens, rendered from the real web app with sample data (the Now Playing one is the cover for now). Still to do: real photos and video for SmartRoomThing, R2 setup with `PUBLIC_MEDIA_BASE`, and the media script.)*
3. ✅ Build the home page from the mockup. ✅ Deployed to Vercel (portfolio-srig.vercel.app).
4. Build the résumé page and print PDF.
5. Migrate the remaining projects.
6. Later: analytics, MongoDB view counts, RSS. (Domain ✅ srig.tech. Social preview images ✅ 2026-10-04.)

## Codebase map (2026-10-02)
- `src/content.config.ts`: the `projects` and `resume` collections and their Zod schemas. The `CATEGORIES` list here drives the work filters.
- `src/content/projects/<slug>/index.mdx`: one folder per project. Frontmatter adds `summary` (home page blurb) and `categories` to the draft model above. `media.hero` is optional until photos exist; cards show a grey placeholder without it.
- `src/data/resume.yaml`: contact, education, experience, project slugs and skills.
- `src/layouts/Base.astro`: the page shell (head, header, footer, Hubert).
- `src/components/`: `Hero`, `ShaderBackground`, `WorkSection`, `ProjectCard`, `ProjectMedia`, `RoleList` (Experience and Leadership and community), `Contact`, `Hubert`, `Header`, `Footer`.
- `src/components/story/`: the MDX story components (passed to `<Content components={…}>` in the project page).
- `src/components/diagrams/`: hand-drawn SVG architecture diagrams, one per project, styled by the `.dg` classes in `global.css` (creme, sharp 1px boxes, mono labels, black lines, orange dots where data leaves a component). Wrapped in the story `Diagram` component, which scrolls sideways on phones instead of shrinking labels.
- `scripts/media.mjs`: compresses and uploads media to the bucket (see Video and media).
- `src/lib/og.ts` + `src/pages/og/[slug].png.ts`: social preview images (1200×630), rendered at build with satori (layout → SVG with real fonts) and sharp (→ PNG): `/og/home.png` plus one per project, generated automatically for new projects. `Base` takes an `og` prop; project pages pass their slug. Fonts come from `@fontsource/work-sans` and `@fontsource/jetbrains-mono` .woff files (satori can't read woff2).
- `src/lib/media.ts`: resolves `r2:<path>` video sources using the `PUBLIC_MEDIA_BASE` env var.
- `src/scripts/`: browser code bundled by Astro (`shader-background.ts`, `work-filters.ts`, `hubert.ts`). There are no React islands; everything is plain `<script>`.
- `src/pages/index.astro` and `src/pages/projects/[slug].astro`.
- Fonts are self-hosted through Fontsource (Work Sans Variable, JetBrains Mono 400), not Google Fonts.
- Links that leave the site (GitHub, LinkedIn, Live link, Code, résumé PDF, and external links inside MDX stories via `rehype-external-links`) open in a new tab; links within the site don't.
- `/?filter=<category>#work` opens the home page with a filter applied; Hubert uses it from other pages.

## Placeholders to fill in
- Review the drafted SmartRoomThing story (especially the "why"). Keep private details out: no IPs, Spotify secrets, usernames, or the dashboard branch's location data. Fill in the Zoom → Jira `role`. Check the drafted Blind Draft `tldr.problem` and `role` too.
- Project cover photos (`media.hero`) and the long-form stories.
- `site` in `astro.config.mjs` once the domain exists.

## Open questions
- ~~GitHub repo name and visibility~~ Done: public at https://github.com/sevensrig/portfolio (2026-10-02).
- Which 6–8 projects are final, and in what order?
- Is there footage for every project, or do some need recording or a polished fallback?
