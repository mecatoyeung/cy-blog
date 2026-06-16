import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getBlogPostFileUrl,
  getBlogPostImageDirectory,
  listBlogPostFiles,
  sanitizeBlogPostSlug,
} from "@/lib/blog-post-files";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type DeleteFileRequest = {
  url?: unknown;
};

const ALLOWED_IMAGE_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/avif", ".avif"],
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

async function ensureAuthenticated() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}

async function resolveSafeSlug(context: RouteContext) {
  const { slug } = await context.params;
  const safeSlug = sanitizeBlogPostSlug(slug);

  if (!safeSlug) {
    return { error: NextResponse.json({ error: "Invalid post slug." }, { status: 400 }) };
  }

  return { safeSlug };
}

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext) {
  const authError = await ensureAuthenticated();
  if (authError) {
    return authError;
  }

  const slugResult = await resolveSafeSlug(context);
  if ("error" in slugResult) {
    return slugResult.error;
  }

  try {
    const files = await listBlogPostFiles(slugResult.safeSlug);
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ error: "Unable to load files." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const authError = await ensureAuthenticated();
  if (authError) {
    return authError;
  }

  const slugResult = await resolveSafeSlug(context);
  if ("error" in slugResult) {
    return slugResult.error;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 400 });
  }

  const extension = ALLOWED_IMAGE_TYPES.get(file.type);
  if (!extension) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }

  const blogImageDirectory = getBlogPostImageDirectory(slugResult.safeSlug);
  await mkdir(blogImageDirectory, { recursive: true });

  const originalFileName = path.basename(file.name).trim();
  const fileName = originalFileName || `upload${extension}`;
  const outputPath = path.join(blogImageDirectory, fileName);
  const bytes = await file.arrayBuffer();

  await writeFile(outputPath, Buffer.from(bytes));

  return NextResponse.json({
    ok: true,
    file: {
      name: fileName,
      url: getBlogPostFileUrl(slugResult.safeSlug, fileName),
    },
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const authError = await ensureAuthenticated();
  if (authError) {
    return authError;
  }

  const slugResult = await resolveSafeSlug(context);
  if ("error" in slugResult) {
    return slugResult.error;
  }

  const payload = (await request.json().catch(() => ({}))) as DeleteFileRequest;
  if (typeof payload.url !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const expectedPrefix = `/img/blog/${slugResult.safeSlug}/`;
  if (!payload.url.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  }

  const fileName = path.basename(payload.url);
  if (!fileName || fileName === "." || fileName === "..") {
    return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  }

  const filePath = path.join(getBlogPostImageDirectory(slugResult.safeSlug), fileName);

  try {
    await unlink(filePath);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code === "ENOENT") {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Unable to delete file." }, { status: 500 });
  }
}