# SEO

## 1. Why the routing/rendering choices matter

Work/Update items are real per-item pages, the site is prerendered so the
HTML a crawler sees already contains the content, and each language has
its own URL (`i18n.md` §1), so both are independently indexable. Static
output also makes Core Web Vitals easy to hit.

## 2. Structured data (JSON-LD), locale-aware

Emitted per rendered locale:

| Page | Type | Notes |
|---|---|---|
| `/`, `/en` | `Person` | `name` / `jobTitle` in the active locale |
| `/work/[slug]` | `CreativeWork` | |
| `/updates/[slug]` (speech/interview/activity) | `NewsArticle` | |
| `/updates/[slug]` (press) | `NewsArticle`, clearly attributing the source | never claims authorship of third-party coverage |
| Listing pages | `BreadcrumbList` | |

## 3. Meta tags

`title`, meta description, canonical, OG, Twitter Card, rendered
per-locale. `summary.en` / `summary.np` double as the meta description.
If a page shows fallback content (`i18n.md` §4), the meta description
uses whatever text is actually on the page; never leave it empty and never
claim a language it isn't.

## 4. Sitemap & robots

`src/pages/sitemap.xml.ts` is a prerendered endpoint (no extra
dependency). At build it emits both locale URLs for every non-draft
work/update item plus the static routes, with `<xhtml:link
rel="alternate" hreflang="...">` entries per URL. Drafts are excluded.

`public/robots.txt` points crawlers to the canonical production domain:
```
User-agent: *
Allow: /

Sitemap: https://shyamsundardhimal.com.np/sitemap.xml
```

`astro.config.mjs` sets `https://shyamsundardhimal.com.np` as the canonical
site URL. The future `.com` domain should permanently redirect to `.com.np`
until the canonical domain is intentionally changed.

## 5. Heading structure & content hygiene

Exactly one `<h1>` per page (the name, or the item title, in the active
locale). Alt text on every image (`content.md` §7 enforces it when an
image is set). Slugs are lowercase kebab-case, shared across languages.

## 6. Performance budget (Core Web Vitals)

Targets: LCP < 2.5s, CLS < 0.1, INP < 200ms. Achieved by static HTML,
no UI framework, minimal vanilla JS, and properly sized images
(`architecture.md` §6). Set `width`/`height` on images to prevent CLS, use
`loading="lazy"` below the fold, and preload the hero image.

## 7. Image sizing guidance

Hero image ≥1600×1600px; work/update cover images ≥1600×900px (16:9).
Since images are committed by hand, resize and compress (JPEG/WebP) before
adding them to `public/images/`.

## 8. RSS

`/updates.xml` is generated at build by `updates.xml.ts`.
**Decided: Nepali content only**, non-draft updates, newest first.
Readers have no concept of picking a language, and the realistic audience
is Nepali-reading. An `/en/updates.xml` can be added later if there's
demand.