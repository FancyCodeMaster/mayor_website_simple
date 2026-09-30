# Architecture

## 1. Why one static site

The earlier design existed so non-technical staff could edit content
through a UI. That's out of scope now: the owner edits JSON directly and
the priority is a good public UI, shipped quickly.

**Decided: one Astro project, fully static, content from JSON in the
repo.** No server, database, or second app. Routes, components, and UI
are unchanged.

Accepted trade-off: a content change needs a rebuild/deploy (about 1-2
minutes) and repo access. Nothing else changes for visitors.

## 2. Rendering: static

**Decided: `output: 'static'`.** Every page is prerendered from the JSON
files, so crawlers get full content in the HTML (`seo.md` §1). Dynamic
routes (`work/[...slug].astro`, `updates/[...slug].astro`, and the `en/`
mirrors) use `getStaticPaths()`: `slug: undefined` for the list page, one
entry per non-draft item for detail pages. No SSR adapter needed.

No client-side content fetching (`AGENTS.md` §4 rule 4).

## 3. Project structure

```
astro-site/
├── src/
│   ├── data/                        # owner-editable, see content.md
│   │   ├── work.json
│   │   ├── updates.json
│   │   ├── profile.json
│   │   └── municipalities.json
│   ├── pages/
│   │   ├── index.astro              # /
│   │   ├── en/index.astro           # /en
│   │   ├── work/[...slug].astro     # /work and /work/[slug]
│   │   ├── en/work/[...slug].astro
│   │   ├── updates/[...slug].astro
│   │   ├── en/updates/[...slug].astro
│   │   ├── updates.xml.ts
│   │   └── sitemap.xml.ts
│   ├── components/
│   │   ├── sections/                # Hero, WorkPreview, UpdatesPreview, Contact, IssueSection
│   │   ├── cards/                   # WorkCard, UpdateCard, StatusBadge
│   │   ├── interactive/             # NavScroll, MobileMenu, IssueForm, ListFilter, ThemeToggle, LanguageToggle
│   │   └── seo/                     # Meta.astro, JsonLd.astro, HreflangLinks.astro
│   ├── layouts/BaseLayout.astro
│   ├── lib/
│   │   ├── content.ts               # load, validate, filter, sort; locale pick with fallback
│   │   ├── schema.ts                # zod schemas for the four JSON files
│   │   ├── markdown.ts              # marked wrapper (build time)
│   │   └── i18n.ts                  # locale detection, UI strings, locale-URL function
│   ├── locales/{en,ne}.json         # fixed UI copy, i18n.md §5
│   └── styles/global.css            # Tailwind 4 import, @theme tokens, dark variant
├── public/
│   ├── images/{profile,work,updates}/
│   └── robots.txt
└── astro.config.mjs
```

## 4. Data flow

`src/data/*.json` → `lib/schema.ts` (validate) → `lib/content.ts` (drop
drafts, sort, resolve locale with fallback) → pages/components.
Components never import the JSON directly; `lib/content.ts` is the one
place that knows file locations and shapes.

## 5. Interactivity without a framework

The old Preact islands are plain `.astro` components with a small vanilla
`<script>` where needed.

| Component | Behavior |
|---|---|
| `ThemeToggle` | Flips `data-theme`, writes `localStorage` (§7) |
| `LanguageToggle` | A real `<a>` to the other locale's URL, computed at build time (`i18n.md` §2); a tiny script appends the current hash/query on click |
| `MobileMenu` | Opens/closes the nav drawer |
| `NavScroll` | Highlights the active homepage section |
| `ListFilter` | Shows/hides already-rendered cards via `data-category` / `data-status` / `data-type`; syncs selection to the query string. With JS off, all items show. |
| `IssueForm` | Municipality → ward dropdown, validation, submit (§9) |

If a component doesn't need JS, it has no `<script>`.

## 6. Images

Files in `public/images/...`, referenced by path in the JSON. No upload
pipeline or image CDN. Resize to the sizes in `seo.md` §7 before
committing (there's no build-time optimization for these).

## 7. Theme (dark/light)

**Decided: CSS custom properties + `data-theme` on `<html>`.** A small
blocking inline script in `BaseLayout.astro`'s `<head>` reads `theme` from
`localStorage`, falls back to `prefers-color-scheme`, and sets
`data-theme` before first paint. `ThemeToggle` flips it and stores the
value. No reload.

```css
/* src/styles/global.css */
@import "tailwindcss";
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
@theme { /* tokens from design_system.md §1 as --color-* */ }
```

## 8. Tailwind 4 setup

- Installed via `@tailwindcss/vite` in `astro.config.mjs`
  (`vite.plugins`). No `@astrojs/tailwind`, no `tailwind.config.js`, no
  PostCSS config.
- Tokens are defined once in `global.css`. Components use token-backed
  utilities, never raw hex values.

## 9. Issue form (no backend)

The form posts from the browser to a **hosted form endpoint**
(`PUBLIC_ISSUE_FORM_ENDPOINT`, `deployment.md` §4) that emails the office.

- Municipality/ward options come from `municipalities.json`, embedded at
  build time and read by the `IssueForm` script.
- Honeypot + minimum-time checks run client-side; a bot-like submission
  shows success without sending (`security.md` §2).
- Submissions aren't stored by the site.
- Upgrade path: one Cloudflare Pages Function (`functions/api/issue.ts`)
  that validates server-side and sends via an email API. That's the first
  own-server code and needs a doc update (`AGENTS.md` §4 rule 7).

## 10. Deliberately left out

SSR, backend/API, database, admin app, auth, image storage, UI framework.
None are needed to ship the portfolio; `content.md` §9 keeps the door open.