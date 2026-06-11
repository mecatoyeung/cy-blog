import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "content.db");

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS resume (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL,
    website TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    period TEXT NOT NULL,
    highlights TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    published_at TEXT NOT NULL,
    tags TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS portfolio_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS portfolio_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    alt TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
  );
`);

const seed = db.transaction(() => {
  db.prepare("DELETE FROM portfolio_media").run();
  db.prepare("DELETE FROM portfolio_projects").run();
  db.prepare("DELETE FROM experience").run();
  db.prepare("DELETE FROM posts").run();

  db.prepare(
    `INSERT INTO resume (id, name, title, summary, email, location, website)
     VALUES (1, @name, @title, @summary, @email, @location, @website)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       title = excluded.title,
       summary = excluded.summary,
       email = excluded.email,
       location = excluded.location,
       website = excluded.website`
  ).run({
    name: "Cat Yoeung",
    title: "Full-Stack Engineer",
    summary:
      "I design pragmatic web systems with strong data foundations and clear product thinking. I focus on developer experience, performance, and maintainable architecture.",
    email: "cat@example.com",
    location: "Bangkok, Thailand",
    website: "https://example.com",
  });

  const experiences = [
    {
      company: "Nord Dock Labs",
      role: "Senior Full-Stack Engineer",
      period: "2023 - Present",
      highlights:
        "Led migration from monolith to modular Next.js services; improved release speed by 30%. Built internal UI kit and SQLite-based edge cache strategy.",
    },
    {
      company: "Riverline Systems",
      role: "Software Engineer",
      period: "2020 - 2023",
      highlights:
        "Shipped analytics dashboard for 40k+ monthly users. Reduced p95 API latency from 480ms to 170ms with query profiling and indexing.",
    },
    {
      company: "Freelance",
      role: "Web Developer",
      period: "2018 - 2020",
      highlights:
        "Built portfolio, ecommerce, and CMS projects with modern React tooling. Established CI pipelines and performance budgets for client sites.",
    },
  ];

  const insertExperience = db.prepare(
    "INSERT INTO experience (company, role, period, highlights) VALUES (@company, @role, @period, @highlights)"
  );

  experiences.forEach((experience) => insertExperience.run(experience));

  const posts = [
    {
      slug: "sqlite-for-static-websites",
      title: "Using SQLite as a Source for Static Websites",
      excerpt:
        "How to keep content local, portable, and predictable by generating static pages from SQLite during build.",
      body:
        "SQLite is an underrated content source for static websites.\\n\\nBy reading from a local database during build, you can keep editorial workflows simple while still shipping pure static assets.\\n\\nThe key is deterministic builds: seed data first, then let generateStaticParams and static server components render the final HTML.",
      published_at: "2026-05-30",
      tags: "nextjs,sqlite,ssg",
    },
    {
      slug: "shadcn-design-principles",
      title: "Practical shadcn/ui Design Principles",
      excerpt:
        "A checklist for building expressive interfaces with shadcn patterns without falling into generic templates.",
      body:
        "shadcn/ui gives you composable building blocks, not a rigid design system.\\n\\nDefine your tokens first: radius, background layers, and accent colors.\\n\\nThen build pages with strong hierarchy and constrained motion so the interface feels intentional.",
      published_at: "2026-06-01",
      tags: "design,shadcn,frontend",
    },
    {
      slug: "build-time-data-pipelines",
      title: "Build-Time Data Pipelines in Next.js",
      excerpt:
        "Treat your build as a reliable data pipeline: ingest, normalize, and render static routes.",
      body:
        "Build-time data pipelines are about repeatability.\\n\\nIn this project, a seed script initializes SQLite, route params are generated from database rows, and each post page is emitted as static HTML.\\n\\nThat combination delivers fast pages and low hosting complexity.",
      published_at: "2026-06-08",
      tags: "nextjs,architecture,ssg",
    },
  ];

  const insertPost = db.prepare(
    "INSERT INTO posts (slug, title, excerpt, body, published_at, tags) VALUES (@slug, @title, @excerpt, @body, @published_at, @tags)"
  );

  posts.forEach((post) => insertPost.run(post));

  // ── Portfolio ──────────────────────────────────────────────────────────────
  const portfolioProjects = [
    {
      slug: "cy-blog",
      title: "Resume & Blog Website",
      description:
        "A static Next.js portfolio site backed by SQLite. Content is seeded at build time and exported as plain HTML — zero server required. UI uses a custom shadcn-style component library.",
      tags: "nextjs,sqlite,tailwind,static",
      sort_order: 1,
    },
    {
      slug: "analytics-dashboard",
      title: "Analytics Dashboard",
      description:
        "Real-time product analytics dashboard serving 40k+ monthly users. Built with React, TypeScript, and a Node.js backend. Includes custom chart components and a role-based access model.",
      tags: "react,typescript,node,charts",
      sort_order: 2,
    },
    {
      slug: "edge-cache-service",
      title: "Edge Cache Service",
      description:
        "A lightweight in-process caching layer for Next.js API routes using SQLite and a configurable TTL strategy. Reduced average API response time by 65% in production.",
      tags: "nextjs,sqlite,performance,caching",
      sort_order: 3,
    },
  ];

  const insertProject = db.prepare(
    "INSERT INTO portfolio_projects (slug, title, description, tags, sort_order) VALUES (@slug, @title, @description, @tags, @sort_order)"
  );

  const insertMedia = db.prepare(
    "INSERT INTO portfolio_media (project_id, type, url, alt, sort_order) VALUES (@project_id, @type, @url, @alt, @sort_order)"
  );

  const projectMedia = {
    "cy-blog": [
      { type: "image", url: "/media/cy-blog-home.png",    alt: "Homepage screenshot",       sort_order: 1 },
      { type: "image", url: "/media/cy-blog-resume.png",  alt: "Resume page screenshot",    sort_order: 2 },
      { type: "image", url: "/media/cy-blog-blog.png",    alt: "Blog list screenshot",      sort_order: 3 },
    ],
    "analytics-dashboard": [
      { type: "image", url: "/media/analytics-overview.png",  alt: "Overview dashboard",   sort_order: 1 },
      { type: "image", url: "/media/analytics-charts.png",    alt: "Charts view",          sort_order: 2 },
      { type: "video", url: "/media/analytics-demo.mp4",      alt: "Live demo walkthrough", sort_order: 3 },
    ],
    "edge-cache-service": [
      { type: "image", url: "/media/cache-architecture.png",  alt: "Architecture diagram", sort_order: 1 },
      { type: "image", url: "/media/cache-benchmark.png",     alt: "Benchmark results",    sort_order: 2 },
    ],
  };

  for (const project of portfolioProjects) {
    const result = insertProject.run(project);
    const projectId = result.lastInsertRowid;
    const media = projectMedia[project.slug] ?? [];
    for (const item of media) {
      insertMedia.run({ project_id: projectId, ...item });
    }
  }
});
seed();
db.close();

console.log(`Seeded SQLite content at ${dbPath}`);
