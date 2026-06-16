import { readdir } from "node:fs/promises";
import path from "node:path";

export type BlogPostFileRecord = {
  name: string;
  url: string;
};

export function sanitizeBlogPostSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getBlogPostImageDirectory(slug: string) {
  return path.join(process.cwd(), "public", "img", "blog", slug);
}

export function getBlogPostFileUrl(slug: string, fileName: string) {
  return `/img/blog/${slug}/${fileName}`;
}

export async function listBlogPostFiles(slug: string): Promise<BlogPostFileRecord[]> {
  const safeSlug = sanitizeBlogPostSlug(slug);
  if (!safeSlug) {
    return [];
  }

  try {
    const entries = await readdir(getBlogPostImageDirectory(safeSlug), { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => ({
        name: entry.name,
        url: getBlogPostFileUrl(safeSlug, entry.name),
      }))
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}