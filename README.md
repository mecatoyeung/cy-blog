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

Create a local environment file before using the admin area:

```bash
# .env.local
ADMIN_PASSWORD=your-strong-password
```

## Build production app

```bash
npm run build
```

During build:

1. `prebuild` runs `npm run db:setup`.
2. SQLite data is seeded into `data/content.db`.
3. Next.js compiles routes for runtime rendering.

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
