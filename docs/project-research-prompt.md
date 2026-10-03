# Project research prompt

Paste everything below the line into the agent session where a project was built. Bring its full reply back to the portfolio session, which turns it into `src/content/projects/<slug>/index.mdx`.

---

I'm adding this project to my portfolio website, which is aimed at recruiters hiring entry-level software engineers. Each project gets a page with a 30-second summary and a longer case study. Please gather everything needed for that page.

Along with what it does, I want the specific choices I made (and why) and the problems I ran into. Look in commit messages, code comments (TODO, FIXME, HACK, "workaround"), docs, and what we discussed in this session.

**Ground rules**
- Use only what you can verify: this repo's code, its git history (`git log --stat --format='%n=== %h %ad%n%B' --date=short`, all branches), its docs, and what we did together in this session.
- Mark anything you're inferring with **(inferred)**. Never invent numbers; if a number isn't measured anywhere, say so.
- Don't modify, install or run anything unless I ask.
- Answer in a single markdown reply using exactly the sections below.

## 1. Summary fields
- **title:** the project's display name.
- **tagline:** under about 60 characters; what it is in plain English.
- **summary:** 1–2 sentences for the home page card. Lead with what it does, then the most impressive concrete result.
- **status:** one of shipped / active / archived / abandoned.
- **period:** start and end as YYYY-MM (end empty if ongoing), from git dates.
- **role:** solo or team. If it was a team, give the team size and exactly which parts *I* built, by commit authorship if possible.
- **stack:** languages, frameworks, services and hardware, most important first.
- **categories:** any of fullstack, frontend, backend, ai, hardware. Suggest a new one if none fit.
- **links:** GitHub URL and whether the repo is public; any live demo URL.

## 2. TL;DR (one or two sentences each)
- **problem:** what was wrong or missing before this existed, and for whom.
- **built:** what I built and how it works at a high level.
- **outcome:** results: what it does now, numbers, awards, users, accuracy, speed.

## 3. Story material
- **What it does:** how someone uses it, step by step.
- **How it works:** the main pieces and how data flows between them. Name key libraries, models, APIs or hardware. Include rough sizes (files, lines, endpoints, tests).
- **Timeline:** 3–6 dated milestones from git history.
- **Decisions I made:** the notable choices (framework, libraries, services, hardware, architecture, test strategy and so on). For each, give what I chose, the alternatives, and my reason. If the reason isn't written down anywhere, say **(inferred)**.
- **Problems I ran into:** 2–4 real bugs, failed approaches or dead ends. For each, give the symptom, how I tracked it down, the fix, and what it taught me. Quote short phrases from commit messages where they help.
- **Numbers worth citing:** every concrete, verifiable metric (accuracy, latency, dataset size, test counts, coverage, cost), each with where it comes from.
- **What's next:** unfinished work, known limits, ideas.

## 4. Media
- List every existing image, screenshot, diagram, video or demo recording in the repo or referenced by it, with paths.
- Suggest the 2–3 screens or moments that would make the best screenshots or short clips. Explain how to show each one locally, ideally without real credentials, hardware or paid APIs (a mock or sample-data mode, fixtures, a script, or which page to open with which test data). Give exact commands and ports.
- If it's hardware, describe what a good photo would show.

## 5. Keep out of the public write-up
List anything that must not appear publicly, with where it appears:
- secrets, API keys or tokens
- IP addresses or hostnames
- home location or anything that hints at it
- personal names other than mine
- private repos or data
- employer-confidential details
- AI co-author trailers in commits (so I can decide how to talk about them)
