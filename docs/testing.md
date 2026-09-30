# Testing

Small on purpose: the build is the main safety net, and unit tests cover
the pure logic.

## 1. Layers

| Layer | Tooling | Covers |
|---|---|---|
| Content validation | zod at build (`content.md` §7) | Every JSON file, on every build/deploy |
| Types | `astro check` | Components and `lib/` |
| Unit | Vitest | Pure functions in `lib/` |
| Manual pre-launch | checklist (§3) | Visual, both languages, both themes |
| Optional | Lighthouse CI, `axe-core`, Playwright smoke | Nice to have, not required for v1 |

## 2. What must always be tested (Vitest)

- **Locale fallback**: `pick()` returns the other language with
  `isFallback: true` when one is empty; not an empty string, not an error.
- **Content rules**: schema rejects duplicate slugs, a press item without
  `externalUrl`/`sourceName`, a non-press item with no body in either
  language, an image with no alt, `endDate` before `startDate`.
- **Draft filtering**: drafts never appear in lists, homepage previews,
  sitemap entries, or RSS items.
- **Ordering**: homepage previews return `featured` items in file order;
  `/work` sorts by `startDate` descending; `/updates` by `date` descending.
- **Locale-URL function**: `/work/x` ↔ `/en/work/x`, `/` ↔ `/en`, no
  double prefix, query/hash handling.
- **Ward validation**: rejects an out-of-range ward or unknown
  municipality.
- **Sitemap entries**: both locale URLs for every non-draft item, with
  hreflang alternates.

## 3. Pre-launch manual checklist

- Both locales on every route template; fallback note shows when a
  language is empty.
- Light and dark themes, no flash on load, toggle persists.
- Mobile, tablet, desktop layouts.
- Each status badge and each update type renders correctly (`press` shows
  clear third-party attribution).
- `ListFilter` works with JS on, and shows everything with JS off.
- Issue form: happy path, validation errors, honeypot/timing behavior,
  the email actually arrives.
- Per template: title, meta description, canonical, hreflang (both
  directions), correct JSON-LD.
- `robots.txt`, `sitemap.xml`, `updates.xml` load and look right.

## 4. CI

On PR: `astro check` → `vitest run` → `astro build` (this validates the
JSON). Lighthouse CI and `axe-core` may be added later against the built
`dist/`.

## 5. Practices

- New `lib/` function → unit test in the same PR.
- A bug fix ships with a regression test reproducing it first.
- A schema change gets a test update in the same change.