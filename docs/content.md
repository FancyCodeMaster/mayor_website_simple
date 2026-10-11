# Content

Owner-editable work and update content uses Astro Content Collections. Each item
has one folder containing bilingual Markdown files:

```text
src/content/
├── work/{slug}/en.md
├── work/{slug}/np.md
├── updates/{slug}/en.md
└── updates/{slug}/np.md
```

Other owner-editable data remains in `src/data/`:

| File | Shape | Purpose |
|---|---|---|
| `profile.json` | object | Hero/About and Contact |
| `municipalities.json` | array | Issue-form dropdowns |
| `issue-categories.json` | array | Issue-form categories |

## 1. Owner workflow

1. Add or edit both `en.md` and `np.md` inside the item's folder (locally or in GitHub's web editor).
2. Keep the same `slug` in both frontmatter files; commit and push.
3. The host rebuilds. A mistake fails the build with a readable error and
   the live site keeps the previous version (§7).
4. Live in about 1-2 minutes.

## 2. Conventions

- **Bilingual fields** are `{ "en": "...", "np": "..." }`. Non-language
  fields (dates, URLs, enums, booleans, slugs) are plain values. Both keys
  must be present; an empty string means "not translated yet" (soft
  fallback, `i18n.md` §4).
- **Keys are camelCase.** Dates are ISO `YYYY-MM-DD`.
- **`slug`**: lowercase kebab-case, unique within its file, shared across
  languages (`/work/{slug}` and `/en/work/{slug}`). Treat as stable once
  published; changing it breaks existing links.
- **Body text** is the Markdown body of each locale file. Separate paragraphs,
  headings, and lists with blank lines. The loader exposes the same
  `body.en` / `body.np` string-array shape to pages as before.
- **Images** are files under `public/images/`, referenced by absolute
  path (`/images/work/example.jpg`). Every image object carries bilingual
  `alt`.
- **Homepage order** = position in the file among published items. The
  homepage displays the first three published items; the section page displays
  all published items. The `featured` field is retained for content metadata
  but does not limit homepage visibility. There is no `order` field.
- **List page order**: Work by `startDate` descending, Updates by `date`
  descending.
- **`draft: true`** items are excluded everywhere (pages, sitemap, RSS).
  New items should start as drafts.
- Examples below are **placeholders**. Never ship invented content.
- Work cover images are free-license illustrative references, not evidence that a
  pictured location or project is the ward's actual project. Source and license
  details are recorded in [`src/data/work-image-credits.json`](../src/data/work-image-credits.json).

## 3. Work items

Create `src/content/work/example-project/en.md` and `np.md`. Both files use
identical frontmatter; their Markdown bodies contain the English and Nepali
versions respectively.

```yaml
---
{
  "slug": "example-project",
  "title": { "en": "Example project", "np": "उदाहरण आयोजना" },
  "summary": { "en": "One or two sentences.", "np": "..." },
  "coverImage": { "src": "/images/work/example-project.jpg", "alt": { "en": "Describe the image", "np": "..." } },
  "category": "infrastructure",
  "status": "in_progress",
  "startDate": "2025-01-15",
  "endDate": null,
  "location": { "en": "Ward 3", "np": "वडा ३" },
  "featured": true,
  "draft": true
}
---
Paragraph for this locale.
```

| Field | Notes |
|---|---|
| `slug`, `title`, `summary`, `body` | required. `summary` doubles as the meta description (`seo.md` §3) |
| `coverImage` | optional; if present, `src` and at least one `alt` language required |
| `category` | `infrastructure` \| `education` \| `health` \| `other` |
| `status` | `planned` \| `in_progress` \| `completed` \| `stalled` |
| `startDate` / `endDate` | `endDate` may be `null`; if set, must be ≥ `startDate` |
| `location` | optional bilingual |
| `featured`, `draft` | booleans |

## 4. Update items

Create `src/content/updates/example-speech/en.md` and `np.md` with the same
frontmatter and a locale-specific Markdown body.

```yaml
---
{
  "slug": "example-speech",
  "type": "speech",
  "date": "2025-02-10",
  "summary": { "en": "...", "np": "..." },
  "coverImage": null,
  "externalUrl": null,
  "sourceName": null,
  "featured": false,
  "draft": true
}
---
Update body for this locale.
```

- `type`: `speech` \| `interview` \| `press` \| `activity`.
- **`press`**: `externalUrl` (valid URL) and `sourceName` (bilingual, at
  least one language filled) are required; `body` is unused.
- **Non-`press`**: at least one of `body.en` / `body.np` must have one or
  more blocks; `externalUrl` / `sourceName` are unused.
- `coverImage` follows the same rule as Work.

## 5. `profile.json`

```json
{
  "name":    { "en": "...", "np": "..." },
  "title":   { "en": "...", "np": "..." },
  "location": { "en": "...", "np": "..." },
  "tagline": { "en": "...", "np": "..." },
  "bio":     { "en": ["..."], "np": ["..."] },
  "heroImage": { "src": "/images/profile/hero.jpg", "alt": { "en": "...", "np": "..." } },
  "contactEmail": "office@example.com",
  "contactPhone": "+977-...",
  "officeAddress": { "en": "...", "np": "..." },
  "socialLinks": [
    { "platform": "facebook", "username": "...", "url": "https://...", "icon": "/images/facebook-social-icon.png" }
  ]
}
```

## 6. `municipalities.json`

```json
[
  { "id": "example-municipality", "name": { "en": "Example", "np": "उदाहरण" }, "wardCount": 9 }
]
```

- Wards are simply `1..wardCount`. File order = dropdown order.
- `id` is a unique kebab-case string; `wardCount` is a positive integer.

## 7. Validation (build-time)

`src/content.config.ts` defines Astro Content Collection schemas using the
zod schemas in `lib/schema.ts`. `lib/content.ts` loads both locale files,
reconstructs the page-facing shape, and validates it at build. The build
fails, with the file, item slug, and field named, on:

- invalid JSON syntax, missing required fields, wrong enum values
- a slug that isn't kebab-case, or a duplicate slug within a collection
- a required bilingual field with **both** languages empty
- an image with `src` but no alt text in either language
- `endDate` before `startDate`; invalid dates
- `press` missing `externalUrl` or `sourceName`; non-`press` with no body
  in either language
- invalid `externalUrl`; `wardCount` not a positive integer

Missing translations are **not** errors (soft fallback, `i18n.md` §4).

## 8. Picking a locale (used by every page)

`lib/content.ts` exposes `pick(field, locale)` → `{ value, isFallback }`.
If the requested language is empty it returns the other language with
`isFallback: true`, so the page can show a small "translation coming soon"
note instead of silently showing the wrong language.

## 9. Later migration path

Field names and shapes mirror the earlier database design, so moving to a
backend/admin later means replacing the loaders in `lib/content.ts`; the
pages and components don't change. Content Collection metadata remains
separate from locale-specific Markdown bodies.