import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deletePostBySlug, updatePostBySlug } from "@/lib/db";
import { parseDraftRawContent, toDraftRawStorageValue } from "@/lib/rich-text";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type PostUpdateRequest = {
  title?: unknown;
  excerpt?: unknown;
  body?: unknown;
  published_at?: unknown;
  tags?: unknown;
};

export async function PUT(request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json()) as PostUpdateRequest;

  if (
    typeof payload.title !== "string" ||
    typeof payload.excerpt !== "string" ||
    typeof payload.body !== "string" ||
    typeof payload.published_at !== "string" ||
    typeof payload.tags !== "string"
  ) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (parseDraftRawContent(payload.body) === null && payload.body.trim().startsWith("{")) {
    return NextResponse.json({ error: "Body must be valid Draft.js raw JSON or plain text." }, { status: 400 });
  }

  const { slug } = await context.params;
  const updated = updatePostBySlug(slug, {
    title: payload.title.trim(),
    excerpt: payload.excerpt.trim(),
    body: toDraftRawStorageValue(payload.body),
    published_at: payload.published_at.trim(),
    tags: payload.tags.trim(),
  });

  if (!updated) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slug } = await context.params;
  const deleted = deletePostBySlug(slug);

  if (!deleted) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
