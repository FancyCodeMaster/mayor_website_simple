# Deployment

## 1. Hosting

| Piece | Host | Notes |
|---|---|---|
| Public site (static Astro) | **Cloudflare Pages** | Plain static build, no adapter, no Functions |
| Issue form | Google Apps Script Web App + Google Sheets | See `architecture.md` §9 |

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
| `PUBLIC_ISSUE_FORM_ENDPOINT` | Google Apps Script Web App `/exec` URL that receives issue submissions |
| `PUBLIC_POLITICIAN_EMAIL` | Public fallback reply-to address for confirmation emails sent to submitters; actual sender is configured in Apps Script |

These values are public by nature. Keep a `.env.example` with placeholders;
set real values in the Pages dashboard per environment (production / preview).
Changing `PUBLIC_POLITICIAN_EMAIL` and rebuilding changes the address used by
new confirmation emails. Google Apps Script sends the message through the
Google account that owns the deployment; `replyTo` directs replies to the
configured politician address.

### Google Apps Script setup

1. Create a Google Sheet owned by the Gmail account that will send visitor
   confirmations, then copy its ID from the Sheet URL.
2. Create an Apps Script project under that same account and paste
   `google-apps-script/Code.gs` into it.
3. In **Project Settings → Script properties**, set `ISSUE_SHEET_ID` to the
   Sheet ID. Set `POLITICIAN_EMAIL` to the reply-to Gmail address and optionally
   set `POLITICIAN_NAME` and `ISSUE_SHEET_NAME` (defaults to `Issues`).
4. Run `doGet` once from the Apps Script editor and approve the Google Sheets permission. The first
   submission with an email address also requires Google Mail authorization for the account executing the web app.
5. Deploy as a Web App that executes as the politician's Gmail account and accepts requests from
   anyone. Copy the deployment's `/exec` URL into `PUBLIC_ISSUE_FORM_ENDPOINT`. After deployment,
   opening that URL in a browser should return `{ "ok": true, "sheet": "Issues" }`.
6. After every Code.gs change, create a new Web App version and update the deployment to that
   version. The public `/exec` URL otherwise continues running the old code.
7. Share the Sheet with `email` if that address needs to
   review the submissions. Do not place Gmail addresses or Sheet IDs in the
   public site environment file.

### Email deliverability

- Gmail decides inbox versus spam; Apps Script cannot force inbox placement.
- Do not use the sender's own address as the only test recipient. Gmail often
  places self-sent automated messages in Spam; test with an independent address
  and choose **Not spam** once if needed.
- For a custom-domain sender, publish SPF and DKIM records and add a DMARC
  policy. The Web App must execute as the authenticated mailbox for that domain.
- Keep the sender name, reply-to address, and website identity consistent. Do
  not repeatedly resend identical test messages.

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