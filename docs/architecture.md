# Architecture

## 1. Why one static site

The earlier design existed so non-technical staff could edit content
through a UI. That's out of scope now: the owner edits repository content
directly and the priority is a good public UI, shipped quickly.

**Decided: one Astro project, fully static, content from Astro Content
Collections in the repo.** No server, database, or second app. Routes,
components, and UI are unchanged.

Accepted trade-off: a content change needs a rebuild/deploy (about 1-2
minutes) and repo access. Nothing else changes for visitors.

## 2. Rendering: static

**Decided: `output: 'static'`.** Every page is prerendered from the Content
Collections, so crawlers get full content in the HTML (`seo.md` §1). Dynamic
routes (`work/[...slug].astro`, `updates/[...slug].astro`, and the `en/`
mirrors) use `getStaticPaths()`: `slug: undefined` for the list page, one
entry per non-draft item for detail pages. No SSR adapter needed.

No client-side content fetching (`AGENTS.md` §4 rule 4).

## 3. Project structure

```
astro-site/
├── src/
│   ├── content.config.ts             # Astro collection loaders and schemas
│   ├── content/                      # bilingual work/update Markdown
│   │   ├── work/{slug}/{en,np}.md
│   │   └── updates/{slug}/{en,np}.md
│   ├── data/                         # remaining owner-editable JSON
│   │   ├── profile.json
│   │   ├── municipalities.json
│   │   ├── issue-categories.json
│   │   └── homepage.json             # homepage work/update selections
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
│   │   ├── schema.ts                # zod schemas for all content
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

`src/content/{work,updates}/{slug}/{en,np}.md` → `content.config.ts`
(collection schemas) → `lib/content.ts` (merge locales, validate, drop
drafts, sort, resolve homepage selections, resolve locale with fallback) → pages/components.
Remaining JSON data follows the same schema/content loader path. Components
never import source content directly; `lib/content.ts` is the one place that
knows content locations and page-facing shapes.

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
| `IssueForm` | Municipality → ward dropdown, client validation, Google Apps Script submission, and success notice (§9) |
| `SocialMomentsSection` | Shows three or more JSON-configured local video previews; the centered item plays for its configured 5–10 seconds and optionally links back to social media. |

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

## 9. Issue form (Google Apps Script)

The form posts from the browser to a **Google Apps Script Web App**
(`PUBLIC_ISSUE_FORM_ENDPOINT`, `deployment.md` §4). The site remains static;
the Apps Script is a separate, owner-managed integration.

- Municipality/ward options come from `municipalities.json`, embedded at
  build time and read by the `IssueForm` script.
- The form validates fields before submission and displays a success notice
  after the browser sends the request. It sends URL-encoded form data because
  Apps Script's `e.parameter` parser does not reliably handle multipart
  `FormData` requests.
- `google-apps-script/Code.gs` validates the request again, appends it to a
  configured Google Sheet, and sends a confirmation only when the visitor
  supplied an email address. The confirmation is addressed to the submitter,
  with the configured politician address as `replyTo`. `MailApp` sends from
  the Google account that owns the Web App deployment.
- The Apps Script runs under the Google account that authorized it, so that
  account sends any confirmation email. It is not a separate backend hosted
  by this site.

## 10. Deliberately left out

SSR, backend/API, database, admin app, auth, image storage, UI framework.
None are needed to ship the portfolio; `content.md` §9 keeps the door open.