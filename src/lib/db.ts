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

function openWritableDb() {
  return new Database(dbPath);
}

export type PostUpdateInput = {
  title: string;
  excerpt: string;
  body: string;
  published_at: string;
  tags: string;
};

export type PostCreateInput = PostUpdateInput & {
  slug: string;
};

export type PortfolioProjectUpdateInput = {
  title: string;
  description: string;
  tags: string;
  sort_order: number;
};

export type PortfolioProjectCreateInput = PortfolioProjectUpdateInput & {
  slug: string;
};

export type PortfolioMediaInput = {
  type: "image" | "video";
  url: string;
  alt: string;
  sort_order: number;
};

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

export function getPortfolioProjectBySlug(slug: string): PortfolioProjectWithMedia | undefined {
  const db = openDb();
  const project = db
    .prepare(
      "SELECT id, slug, title, description, tags, sort_order FROM portfolio_projects WHERE slug = ?"
    )
    .get(slug) as PortfolioProjectRecord | undefined;

  if (!project) {
    db.close();
    return undefined;
  }

  const media = db
    .prepare(
      "SELECT id, project_id, type, url, alt, sort_order FROM portfolio_media WHERE project_id = ? ORDER BY sort_order ASC"
    )
    .all(project.id) as PortfolioMediaRecord[];

  db.close();
  return {
    ...project,
    media,
  };
}

export function updatePostBySlug(slug: string, input: PostUpdateInput): boolean {
  const db = openWritableDb();
  const result = db
    .prepare(
      "UPDATE posts SET title = @title, excerpt = @excerpt, body = @body, published_at = @published_at, tags = @tags WHERE slug = @slug"
    )
    .run({
      slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      published_at: input.published_at,
      tags: input.tags,
    });

  db.close();
  return result.changes > 0;
}

export function deletePostBySlug(slug: string): boolean {
  const db = openWritableDb();
  const result = db.prepare("DELETE FROM posts WHERE slug = ?").run(slug);
  db.close();
  return result.changes > 0;
}

export function createPost(input: PostCreateInput): boolean {
  const db = openWritableDb();
  const result = db
    .prepare(
      "INSERT INTO posts (slug, title, excerpt, body, published_at, tags) VALUES (@slug, @title, @excerpt, @body, @published_at, @tags)"
    )
    .run({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      published_at: input.published_at,
      tags: input.tags,
    });

  db.close();
  return result.changes > 0;
}

export function updatePortfolioProjectBySlug(
  slug: string,
  input: PortfolioProjectUpdateInput
): boolean {
  const db = openWritableDb();
  const result = db
    .prepare(
      "UPDATE portfolio_projects SET title = @title, description = @description, tags = @tags, sort_order = @sort_order WHERE slug = @slug"
    )
    .run({
      slug,
      title: input.title,
      description: input.description,
      tags: input.tags,
      sort_order: input.sort_order,
    });

  db.close();
  return result.changes > 0;
}

export function createPortfolioProject(input: PortfolioProjectCreateInput): boolean {
  const db = openWritableDb();
  const result = db
    .prepare(
      "INSERT INTO portfolio_projects (slug, title, description, tags, sort_order) VALUES (@slug, @title, @description, @tags, @sort_order)"
    )
    .run({
      slug: input.slug,
      title: input.title,
      description: input.description,
      tags: input.tags,
      sort_order: input.sort_order,
    });

  db.close();
  return result.changes > 0;
}

export function deletePortfolioProjectBySlug(slug: string): boolean {
  const db = openWritableDb();
  const transaction = db.transaction((targetSlug: string) => {
    const project = db
      .prepare("SELECT id FROM portfolio_projects WHERE slug = ?")
      .get(targetSlug) as { id: number } | undefined;

    if (!project) {
      return false;
    }

    db.prepare("DELETE FROM portfolio_media WHERE project_id = ?").run(project.id);
    const result = db.prepare("DELETE FROM portfolio_projects WHERE slug = ?").run(targetSlug);
    return result.changes > 0;
  });

  const deleted = transaction(slug);
  db.close();
  return deleted;
}

export function replacePortfolioMediaByProjectSlug(
  slug: string,
  media: PortfolioMediaInput[]
): boolean {
  const db = openWritableDb();
  const transaction = db.transaction((targetSlug: string, nextMedia: PortfolioMediaInput[]) => {
    const project = db
      .prepare("SELECT id FROM portfolio_projects WHERE slug = ?")
      .get(targetSlug) as { id: number } | undefined;

    if (!project) {
      return false;
    }

    db.prepare("DELETE FROM portfolio_media WHERE project_id = ?").run(project.id);

    const insertMedia = db.prepare(
      "INSERT INTO portfolio_media (project_id, type, url, alt, sort_order) VALUES (@project_id, @type, @url, @alt, @sort_order)"
    );

    for (const item of nextMedia) {
      insertMedia.run({
        project_id: project.id,
        type: item.type,
        url: item.url,
        alt: item.alt,
        sort_order: item.sort_order,
      });
    }

    return true;
  });

  const replaced = transaction(slug, media);
  db.close();
  return replaced;
}
