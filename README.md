# Resume + Blog + Admin (Next.js + shadcn-style UI + SQLite)

This project is a Next.js App Router site with three sections:

- Resume page
- Blog with post detail pages
- Admin area for editing blog and portfolio content

Content is stored in SQLite and read at request time so admin updates are reflected immediately.

## Stack

- Next.js App Router
- Tailwind CSS v4
- shadcn-style UI components (custom `ui` primitives)
- SQLite via `better-sqlite3`

## Run locally

```bash
npm run dev
```

The dev script seeds SQLite first, then starts Next.js.
The setup step creates the schema if needed and only seeds content when the database is empty.

Create a local environment file before using the admin area and public site protection:

```bash
# .env.local
ADMIN_PASSWORD=your-strong-password
USER_PASSWORD=your-site-password
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM=cyblog@catoyeung.com
CONTACT_TO_EMAIL=me@catoyeung.com
```

## Build production app

```bash
npm run build
```

During build:

1. `prebuild` runs `npm run db:setup`.
2. SQLite schema is created if needed, and seed data is only inserted when `data/content.db` is empty.
3. Next.js compiles routes for runtime rendering.

For GitHub Pages export, the workflow removes `src/app/admin` and `src/app/api` before running `next build` with `NEXT_OUTPUT_EXPORT=true`.

The contact form now sends email through Resend. That still requires the contact API route to run on a runtime host; GitHub Pages static export will not execute it.

To intentionally reset the database back to seed content:

```bash
npm run db:seed
```

## Data model

Seed script: `scripts/setup-db.mjs`

Tables:

- `resume`
- `experience`
- `posts`
- `portfolio_projects`
- `portfolio_media`

## Routes

- `/` landing page
- `/resume`
- `/portfolio`
- `/blog`
- `/blog/[slug]`
- `/admin`

## Admin authentication

- `/admin` is hidden from the navbar.
- Access requires `ADMIN_PASSWORD` from environment variables.
- Successful login sets an HTTP-only session cookie used by `/api/admin/*` routes.

## Public site protection

- `/`, `/blog`, `/portfolio`, `/resume`, and `/contact` are protected by `USER_PASSWORD`.
- Successful unlock stores a SHA-256 hash in `localStorage` and the public layout checks it client-side.
- This is compatible with static export, but it is client-side deterrence rather than server-enforced protection.

## Contact email

- Contact delivery uses Resend via `RESEND_API_KEY`.
- `RESEND_FROM` should be a verified sender in Resend.
- `CONTACT_TO_EMAIL` controls the recipient address.
