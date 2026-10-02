# Security

With no backend, no accounts, and no database, the attack surface is
small. This doc covers what remains.

## 1. What we don't have

No login, sessions, tokens, database, file uploads, or server code. There
are no secrets in the repo: the only environment values are public
(`PUBLIC_SITE_URL`, `PUBLIC_ISSUE_FORM_ENDPOINT`, `PUBLIC_POLITICIAN_EMAIL`,
`deployment.md` §4).

## 2. Issue form

- The browser validates name, email, and tole for visitor feedback; the
  Google Apps Script validates all submitted values again before it writes
  to the Sheet.
- **Honeypot** field (must be empty) + **minimum 3 seconds** between page
  load and submit run in both places. The public endpoint remains a spam
  risk; add Cloudflare Turnstile before high-traffic use.
- Field bounds: description 20-2000 chars, tole 1-100 chars, name 0-100
  chars, email 0-254 chars.
- The endpoint receives optional name and email, which are personal data.
  Limit access to the Google Sheet and disclose this handling in the
  privacy note.
- The site uses an opaque browser request to Google Apps Script, so the
  success notice confirms that the browser sent the data; monitor the
  Sheet to confirm delivery during setup.

## 3. Content integrity (reputational risk)

A fabricated quote, invented statistic, or misattributed claim is a real
exposure for a public figure.
- `press` updates always show a clear, distinct attribution to the
  third-party source (`design_system.md`), never presented as the
  politician's own words.
- **Whoever has write access to the repo is the editorial control**,
  since there is no review step in the JSON workflow. Limit collaborator
  access, use 2FA on the Git host, and consider branch protection on
  `main` (pull request required) once more than one person edits.
- Git history is the audit trail and the undo button.

## 4. Rendering & links

- Markdown from JSON is rendered at build time with raw HTML **escaped**
  (`content.md` §2). Don't enable HTML passthrough.
- External links (`externalUrl`, social links) use `rel="noopener
  noreferrer"`; press links open in a new tab.
- Validate URL protocol in the schema (`http`/`https` only).

## 5. Headers

Add a `public/_headers` file (Cloudflare Pages) with at least
`X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, and a `frame-ancestors 'none'` CSP
directive. Tighten a full CSP once the form endpoint origin is known.

## 6. Dependency hygiene

Keep the list tiny (`coding_style.md` §5). Every runtime dependency runs
at build time; the browser ships only vanilla scripts. No new dependency
without checking it's actively maintained. Keep lockfile committed.