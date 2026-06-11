import path from "node:path";

import Database from "better-sqlite3";

const dbPath = path.join(process.cwd(), "data", "content.db");

export type ResumeRecord = {
  name: string;
  title: string;
  summary: string;
  email: string;
  location: string;
  website: string;
};

export type ExperienceRecord = {
  company: string;
  role: string;
  period: string;
  highlights: string;
};

export type PostRecord = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  published_at: string;
  tags: string;
};

export type PortfolioProjectRecord = {
  id: number;
  slug: string;
  title: string;
  description: string;
  tags: string;
  sort_order: number;
};

export type PortfolioMediaRecord = {
  id: number;
  project_id: number;
  type: "image" | "video";
  url: string;
  alt: string;
  sort_order: number;
};

export type PortfolioProjectWithMedia = PortfolioProjectRecord & {
  media: PortfolioMediaRecord[];
};

function openDb() {
  return new Database(dbPath, { readonly: true });
}

export function getResume() {
  const db = openDb();
  const resume = db
    .prepare("SELECT name, title, summary, email, location, website FROM resume WHERE id = 1")
    .get() as ResumeRecord | undefined;
  db.close();
  return resume;
}

export function getExperiences() {
  const db = openDb();
  const experiences = db
    .prepare("SELECT company, role, period, highlights FROM experience ORDER BY id DESC")
    .all() as ExperienceRecord[];
  db.close();
  return experiences;
}

export function getPosts() {
  const db = openDb();
  const posts = db
    .prepare(
      "SELECT slug, title, excerpt, body, published_at, tags FROM posts ORDER BY date(published_at) DESC"
    )
    .all() as PostRecord[];
  db.close();
  return posts;
}

export function getPostBySlug(slug: string) {
  const db = openDb();
  const post = db
    .prepare("SELECT slug, title, excerpt, body, published_at, tags FROM posts WHERE slug = ?")
    .get(slug) as PostRecord | undefined;
  db.close();
  return post;
}

export function getPortfolioProjects(): PortfolioProjectWithMedia[] {
  const db = openDb();
  const projects = db
    .prepare(
      "SELECT id, slug, title, description, tags, sort_order FROM portfolio_projects ORDER BY sort_order ASC"
    )
    .all() as PortfolioProjectRecord[];

  const getMedia = db.prepare(
    "SELECT id, project_id, type, url, alt, sort_order FROM portfolio_media WHERE project_id = ? ORDER BY sort_order ASC"
  );

  const result = projects.map((project) => ({
    ...project,
    media: getMedia.all(project.id) as PortfolioMediaRecord[],
  }));

  db.close();
  return result;
}
