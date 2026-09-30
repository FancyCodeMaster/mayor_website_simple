# Coding Style

One codebase, a few principles: keep logic pure and testable, keep pages
thin, and don't add a dependency for something Astro or Tailwind already
covers.

## 1. Astro / TypeScript

- TypeScript strict mode; no `any` without a comment.
- Default to a plain `.astro` component. Add a `<script>` only for the
  behaviors listed in `architecture.md` §5.
- Content is read **only** through `lib/content.ts`. No inline JSON
  imports in components, no client-side fetching (`AGENTS.md` §4 rule 4).
- Pure logic (locale picking, locale-URL function, ward validation, sort/
  filter, sitemap entries) lives in `lib/` as plain functions so it's
  unit-testable without rendering.
- Locale strings come from `src/locales/*.json` via `lib/i18n.ts`; never
  hardcode visible UI text in a component.
- Frontmatter stays small: fetch, transform, render.

## 2. Tailwind 4

- Utilities in markup; tokens in `global.css` `@theme` only.
- No raw hex values or arbitrary colors in components.
- Extract a component (not an `@apply` blob) when markup repeats.

## 3. Client scripts

- Vanilla TS in the component's `<script>`, no framework.
- Feature-detect and degrade gracefully (JS off shows all content).
- No global state; each script owns its element via `data-` attributes.

## 4. Naming

- `camelCase` functions/variables, `PascalCase` components/types,
  `kebab-case` file names for pages and slugs.
- JSON keys are `camelCase`; bilingual pairs are `{ en, np }`
  (`content.md` §2).

## 5. Cross-cutting

- Commit messages: `type(scope): summary` (e.g. `feat(work): add status
  badge`, `content(updates): add press item`).
- One logical change per PR. Content-only edits are their own commits.
- No commented-out dead code.
- A JSON field, schema, or route change gets the matching doc update in
  the same change.
- New dependency? Check `architecture.md` and `AGENTS.md` §4 rule 7 first.
  Current allowed set: `astro`, `tailwindcss`, `@tailwindcss/vite`,
  `marked`, and dev tooling (`typescript`, `vitest`, `@astrojs/check`).