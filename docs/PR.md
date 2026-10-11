# PRD — Politician Promotional Website

## 1. Goal

Give a local politician a fast, credible, bilingual public presence (who
he is, what he's done, what he's doing/saying now, how to reach him, and a
direct channel for constituents to report a local issue), with every page
fast and structured enough to rank well in **both Nepali and English**.
Content is kept current by editing a few JSON files (`content.md`).

## 2. Actors

- **Visitor**: the public. No account. Reads in either language; can
  submit an issue report.
- **Owner**: edits the JSON files in `src/data/` and pushes; the site
  rebuilds and redeploys. No login, no admin UI.

## 3. Site map (unchanged)

Nepali is the default, unprefixed locale; English uses `/en` (`i18n.md` §1).

| Route (Nepali) | Route (English) | Rendering | Purpose |
|---|---|---|---|
| `/` | `/en` | Static | Homepage: Hero, Work preview, Updates preview, Contact, Submit an Issue |
| `/work` | `/en/work` | Static | All work items, filterable by category and status |
| `/work/[slug]` | `/en/work/[slug]` | Static | Work item detail |
| `/updates` | `/en/updates` | Static | All updates, filterable by type |
| `/updates/[slug]` | `/en/updates/[slug]` | Static | Update detail |
| `/updates.xml` | none | Static XML | RSS feed, Nepali only (`seo.md` §8) |
| `/sitemap.xml` | none | Static XML | Sitemap, both locales (`seo.md` §4) |

Everything is generated at build time from the JSON files.

## 4. Core visitor journey (unchanged)

1. Lands on `/` or `/en` (direct, search, or a shared detail link).
2. Uses the sticky nav's **language toggle** and **theme toggle**
   (top-right, `design_system.md` §3); both persist.
3. Jumps between homepage sections via anchor nav.
4. Work preview: owner-selected slugs from `src/data/homepage.json`, with
   "View all projects" → `/work`.
5. `/work`: filters by category/status, opens `/work/[slug]` as a normal
   page navigation.
6. Same pattern for Updates.
7. Submits an issue via the homepage form; inline success/error, no
   redirect.

## 5. Feature requirements

### 5.1 Hero
Name, title, portrait, tagline, all bilingual, from `profile.json`.
The name is the page's single `<h1>` in the active locale. The hero links
into the homepage work section.

### 5.2 Work
- Fields: title, summary, body, cover image (+ alt), category
  (`infrastructure` / `education` / `health` / `other`), **status**
  (`planned` / `in_progress` / `completed` / `stalled`), start date,
  optional end date, optional location. All text bilingual.
- Status is shown as a colored badge with a text label on cards and detail
  pages (`design_system.md` §4).
- Homepage preview: up to three non-draft items selected, in order, by
  their folder slugs in `src/data/homepage.json`.
- `/work`: every non-draft item, newest start date first, filterable by
  category and status.

### 5.3 Updates
- `type` = `speech` / `interview` / `press` / `activity`. `press` items
  carry `externalUrl` + bilingual `sourceName` instead of original body.
- Same homepage selection / "View all" pattern. `/updates` lists
  non-draft items, newest date first.
- RSS at `/updates.xml`.

### 5.4 Contact
Office email, phone, address, social links from `profile.json`. Static
display, no separate contact form.

### 5.5 Submit an Issue
- Fields: **municipality** (dropdown, from `municipalities.json`),
  **ward** (dropdown, depends on the municipality's `wardCount`), **tole**
  (free text, 1-100 chars), **category** (`infrastructure` / `sanitation` /
  `safety` / `other`), **description** (required, 20-2000 chars, a
  multi-line comment-box textarea, `design_system.md` §5), optional
  name/email/phone.
- Validation is client-side only (there is no server of our own); the
  hosted endpoint's spam filtering is the second line (`security.md` §2).
- **On submit**: posted to a hosted form endpoint that emails the office
  (`architecture.md` §9). **Submissions are not stored by the site**; the
  inbox is the record. No `new/reviewed/resolved` workflow in this version.
- Spam: honeypot + minimum-time check.
- States: idle → submitting → success (inline, form clears) → error
  (inline, input retained).

## 6. Content management (replaces the admin panel)

- Owner edits the work/update content folders, `homepage.json`, `profile.json`,
  and `municipalities.json` (`content.md`), commits, pushes. Editing on
  GitHub's web editor is a supported workflow.
- Publish = `"draft": false`. Homepage order is the order of the selected
  folder slugs in `homepage.json`.
- A push triggers an automatic rebuild/deploy (about 1-2 minutes).
- A JSON mistake (bad syntax, missing field, duplicate slug) fails the
  build with a readable message; **the live site keeps serving the
  previous version**.

## 7. Open questions / confirm before build

- **JSON shape**: `content.md` defines it. If your existing `work.json` /
  `updates.json` differ, migrate them or adjust `content.md` + the schema.
- **Issue form provider**: not chosen yet; it receives constituents'
  optional contact details, so choose deliberately.
- **`profile.json` and `municipalities.json`** were added so nothing
  editable is hardcoded. Confirm this is wanted.
- **Municipality list and ward counts**: data entry before go-live.
- **Brand colors**: confirm hex values in `design_system.md` §1.
- **Fallback behavior** when one language is missing (`i18n.md` §4).

## 8. Non-goals (v1)

- No admin panel, backend, database, login, or roles.
- No stored issue submissions or status tracking.
- No image-upload UI (images are committed to `public/images/`).
- No visitor accounts, comments, or reactions.
- No donation/fundraising.
- No third language.
- No full-text search (category/status/type filtering only).