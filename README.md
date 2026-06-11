# Resume + Blog (Next.js + shadcn-style UI + SQLite)

This project is a static Next.js site with two sections:

- Resume page
- Blog with post detail pages

Content is stored in SQLite and read during build time so output pages are static.

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

## Build static site

```bash
npm run build
```

During build:

1. `prebuild` runs `npm run db:setup`.
2. SQLite data is seeded into `data/content.db`.
3. Next.js statically generates routes and exports HTML.

Exported files are written to `out/`.

## Data model

Seed script: `scripts/setup-db.mjs`

Tables:

- `resume`
- `experience`
- `posts`

## Routes

- `/` landing page
- `/resume`
- `/blog`
- `/blog/[slug]` generated with `generateStaticParams`
