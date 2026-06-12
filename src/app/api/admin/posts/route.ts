import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createPost } from "@/lib/db";
import { parseDraftRawContent, toDraftRawStorageValue } from "@/lib/rich-text";

type PostCreateRequest = {
  slug?: unknown;
  title?: unknown;
  excerpt?: unknown;
  body?: unknown;
  published_at?: unknown;
  tags?: unknown;
};

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json()) as PostCreateRequest;

  if (
    typeof payload.slug !== "string" ||
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

  try {
    const created = createPost({
      slug: payload.slug.trim(),
      title: payload.title.trim(),
      excerpt: payload.excerpt.trim(),
      body: toDraftRawStorageValue(payload.body),
      published_at: payload.published_at.trim(),
      tags: payload.tags.trim(),
    });

    if (!created) {
      return NextResponse.json({ error: "Unable to create post." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const sqliteError = error as { code?: string };
    if (sqliteError.code?.startsWith("SQLITE_CONSTRAINT")) {
      return NextResponse.json(
        { error: "Slug already exists. Choose a unique slug." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Unable to create post." }, { status: 500 });
  }
}
