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
| `homepage.json` | object | Work and update slugs shown in the homepage previews |
| `social-moments.json` | object | Three ordered social video previews shown on the homepage |

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
- **Homepage selections** are controlled by [`src/data/homepage.json`](../src/data/homepage.json). Set `works` and `updates` to the folder slugs of the published items to show, in display order. Each list may contain up to three slugs; missing, draft, duplicate, or unknown slugs fail the build. The section pages display all published items. The `featured` field is retained for content metadata but does not control homepage visibility.
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

## 6. `homepage.json`

```json
{
  "works": ["example-project", "another-project"],
  "updates": ["example-speech", "example-event"]
}
```

Use the folder slug, not the title. The order in each list is the order shown on the homepage. Keep each list at three items or fewer.

## 7. `social-moments.json`

The homepage's Social Moments section reads three items in array order:

```json
{
  "items": [
    {
      "id": "social-moment-1",
      "title": { "en": "Verified title", "np": "प्रमाणित शीर्षक" },
      "videoUrl": "/videos/social-moment-1.mp4",
      "durationSeconds": 7,
      "socialUrl": "https://social.example/verified-post",
      "platform": "Facebook"
    }
  ]
}
```

The schema requires at least three items. `videoUrl` is required and must
point to a local file under `public/videos/`. `durationSeconds` must be between
5 and 10. `socialUrl` is optional: when present, the centered item reveals a
`See more` link after its configured preview duration; when absent, it shows a
localized play/pause control instead. The first frame is captured in the
browser as the video's poster.

## 8. `municipalities.json`

```json
[
  { "id": "example-municipality", "name": { "en": "Example", "np": "उदाहरण" }, "wardCount": 9 }
]
```

- Wards are simply `1..wardCount`. File order = dropdown order.
- `id` is a unique kebab-case string; `wardCount` is a positive integer.

## 8. Validation (build-time)

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

## 9. Picking a locale (used by every page)

`lib/content.ts` exposes `pick(field, locale)` → `{ value, isFallback }`.
If the requested language is empty it returns the other language with
`isFallback: true`, so the page can show a small "translation coming soon"
note instead of silently showing the wrong language.

## 10. Later migration path

Field names and shapes mirror the earlier database design, so moving to a
backend/admin later means replacing the loaders in `lib/content.ts`; the
pages and components don't change. Content Collection metadata remains
separate from locale-specific Markdown bodies.