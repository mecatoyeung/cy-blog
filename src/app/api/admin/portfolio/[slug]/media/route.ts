import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const ALLOWED_IMAGE_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/avif", ".avif"],
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slug } = await context.params;
  const safeSlug = sanitizeSegment(slug);

  if (!safeSlug) {
    return NextResponse.json({ error: "Invalid project slug." }, { status: 400 });
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

  const projectDir = path.join(process.cwd(), "public", "img", "portfolio", safeSlug);
  await mkdir(projectDir, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
  const outputPath = path.join(projectDir, fileName);
  const bytes = await file.arrayBuffer();

  await writeFile(outputPath, Buffer.from(bytes));

  return NextResponse.json({
    ok: true,
    url: `/img/portfolio/${safeSlug}/${fileName}`,
  });
}
