# Deployment

## 1. Hosting

| Piece | Host | Notes |
|---|---|---|
| Public site (static Astro) | **Cloudflare Pages** | Plain static build, no adapter, no Functions |
| Issue form | Hosted form provider | See `architecture.md` §9 |

Any static host works if you'd rather not use Cloudflare.

## 2. Cloudflare Pages setup

- Connect the Git repo. Framework preset: Astro.
- Build command: `npm run build` (runs `astro build`, which validates the
  JSON); output directory: `dist`.
- Set `NODE_VERSION` to the version in `package.json` `engines` / `.nvmrc`.
- No `nodejs_compat` flag needed (there are no Functions).
- Every PR/branch gets an automatic preview deployment; `main` deploys to
  production.

## 3. Content update flow

1. Owner edits JSON in `src/data/` (locally or on GitHub) and commits.
2. Push to `main` (or open a PR and review the preview, recommended once
   more than one person edits).
3. Pages rebuilds. If validation fails, the build fails and **the
   previous deployment stays live**; the error names the file, item, and
   field.
4. Live in about 1-2 minutes.

## 4. Environment variables

| Variable | Purpose |
|---|---|
| `PUBLIC_SITE_URL` | Absolute base URL for canonical/OG/sitemap/RSS (`seo.md`) |
| `PUBLIC_ISSUE_FORM_ENDPOINT` | Hosted form endpoint the issue form posts to |

Both are public by nature. Keep a `.env.example` with placeholders; set
real values in the Pages dashboard per environment (production / preview).

## 5. CI

On PR: `astro check` → `vitest run` → `astro build`. Cloudflare Pages'
Git integration handles preview and production deploys, so no deploy step
is needed in CI. Lighthouse CI / `axe-core` can be added later against
`dist/`.

## 6. Environments

- `local`: `npm run dev` (Astro dev server); set the two env vars in
  `.env`.
- `preview`: Pages preview deployments per PR/branch.
- `production`: `main`, real domain, TLS provided by Pages.

## 7. Domains & DNS

Attach the custom domain in the Pages dashboard (simplest if DNS is
already on Cloudflare). Redirect the `www`/apex variant you don't use to
the one you do, so there's a single canonical host.

## 8. Monitoring

- **Cloudflare Web Analytics** (free, cookieless).
- Pages build logs; enable failure notifications so a failed content build
  doesn't go unnoticed.
- Check the form provider's dashboard/email delivery periodically. A
  broken form fails silently for visitors otherwise.

## 9. Backups

The Git repo (content, images, code) is the backup. Keep it on a hosted
remote with 2FA. There is no database to back up.