# AGENTS.md — Politician Promotional Website

Read this first, every session, before writing or changing code.

## 1. What this project is

A bilingual (Nepali / English), dark/light-aware public promotional and
civic-engagement website for a local politician. It is a **single static
Astro site**. All editable content lives in a few JSON files in the repo
(`src/data/`) that the owner edits by hand. There is no backend, no
database, and no admin panel. See `PRD.md`.

This supersedes the earlier three-part design (Astro SSR + React admin +
FastAPI/Postgres), dropped deliberately to ship quickly. **The public
pages, routes, and UI are unchanged.** The content shape is designed so a
backend/admin can be added later without rewriting the pages
(`content.md` §9).

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | Astro 5+, `output: 'static'` |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite`, CSS-first `@theme` tokens (no `tailwind.config.js`) |
| Interactivity | Plain Astro components + small vanilla `<script>` tags. No UI framework. |
| Content | JSON in `src/data/`, validated at build time with zod (`astro/zod`) |
| Markdown | `marked`, build time only |
| Issue form | Hosted form endpoint, no own backend (`architecture.md` §9) |
| i18n | Nepali (default, unprefixed) + English (`/en`), see `i18n.md` |
| Theme | Light/dark via CSS custom properties |
| Hosting | Cloudflare Pages, static (`deployment.md`) |
| Testing | Vitest (pure logic), `astro check`, build-time content validation |

Removed on purpose: FastAPI, PostgreSQL, Alembic, uv/Python, React admin,
Preact, R2, Resend, Fly.io, JWT auth.

## 3. Doc map

| File | Read it when you're... |
|---|---|
| `PRD.md` | implementing or changing a page, section, or user flow |
| `architecture.md` | adding a route, touching structure, client scripts, or the issue form |
| `content.md` | adding/changing a JSON file, field, or validation rule |
| `i18n.md` | touching bilingual content, the language toggle, or hreflang/URLs |
| `seo.md` | touching metadata, structured data, sitemap, or RSS |
| `design_system.md` | building or changing any UI |
| `coding_style.md` | writing any code |
| `testing.md` | writing or changing code |
| `security.md` | touching the issue form, external links, or headers |
| `deployment.md` | changing env vars, CI, or hosting |


## 4. Ground rules (non-negotiable)

1. **Never invent content.** No fabricated achievements, statistics,
   quotes, endorsements, dates, or claims. Sample data must be visibly
   placeholder text. Real reputational/legal risk for a public figure.
2. **All owner-editable content lives in `src/data/*.json`**, never
   hardcoded in components/pages. (Fixed UI copy lives in
   `src/locales/*.json`, `i18n.md` §5.)
3. **Every translatable field has both `en` and `np` keys**
   (`content.md` §2).
4. **The site stays static and crawlable.** All content is in the HTML
   at build time. No client-side content fetching. JS is progressive
   enhancement; pages read correctly with JS off (except the issue form).
5. **SEO is first-class.** A new public page ships with title, meta
   description, canonical, hreflang alternates, and structured data where
   `seo.md` calls for it, in the same change.
6. **Bad JSON fails the build, never the live site** (`content.md` §7).
   Don't loosen the schema to silence an error; fix the data or propose
   a schema change.
7. **Change management.** Before adding a library or pattern: explain
   why, check that Astro + Tailwind don't already cover it, prefer the
   simplest option, update `architecture.md` if architecture changes.
8. **Inspect before you build.** Read the relevant docs and code first.
   For architectural changes, explain the approach and wait for approval.
9. **Don't silently resolve an undocumented decision.** Ask or propose a
   doc addition.

## 5. Definition of done

Matches the relevant docs; passes `astro check` and the build (which
validates content); has unit tests if it touches pure logic; checked in
both languages and both themes; and if it changes a JSON field, the route
map, or a rule, `content.md` / `PRD.md` is updated in the same change.