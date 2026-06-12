import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deletePortfolioProjectBySlug,
  replacePortfolioMediaByProjectSlug,
  updatePortfolioProjectBySlug,
} from "@/lib/db";
import { parseDraftRawContent, toDraftRawStorageValue } from "@/lib/rich-text";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type PortfolioUpdateRequest = {
  title?: unknown;
  description?: unknown;
  tags?: unknown;
  sort_order?: unknown;
  media?: unknown;
};

type PortfolioMediaPayload = {
  type: "image" | "video";
  url: string;
  alt: string;
  sort_order: number;
};

function normalizeMediaPayload(input: unknown): PortfolioMediaPayload[] | null {
  if (typeof input === "undefined") {
    return null;
  }

  if (!Array.isArray(input)) {
    return null;
  }

  const normalized: PortfolioMediaPayload[] = [];

  for (const item of input) {
    if (
      typeof item !== "object" ||
      item === null ||
      ((item as { type?: unknown }).type !== "image" &&
        (item as { type?: unknown }).type !== "video") ||
      typeof (item as { url?: unknown }).url !== "string" ||
      typeof (item as { alt?: unknown }).alt !== "string"
    ) {
      return null;
    }

    const url = (item as { url: string }).url.trim();
    if (!url) {
      return null;
    }

    normalized.push({
      type: (item as { type: "image" | "video" }).type,
      url,
      alt: (item as { alt: string }).alt.trim(),
      sort_order: normalized.length,
    });
  }

  return normalized;
}

export async function PUT(request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json()) as PortfolioUpdateRequest;

  if (
    typeof payload.title !== "string" ||
    typeof payload.description !== "string" ||
    typeof payload.tags !== "string" ||
    typeof payload.sort_order !== "number"
  ) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (
    parseDraftRawContent(payload.description) === null &&
    payload.description.trim().startsWith("{")
  ) {
    return NextResponse.json(
      { error: "Description must be valid Draft.js raw JSON or plain text." },
      { status: 400 }
    );
  }

  const normalizedMedia = normalizeMediaPayload(payload.media);
  if (typeof payload.media !== "undefined" && normalizedMedia === null) {
    return NextResponse.json({ error: "Invalid media payload." }, { status: 400 });
  }

  const { slug } = await context.params;
  const updated = updatePortfolioProjectBySlug(slug, {
    title: payload.title.trim(),
    description: toDraftRawStorageValue(payload.description),
    tags: payload.tags.trim(),
    sort_order: Math.max(0, Math.floor(payload.sort_order)),
  });

  if (!updated) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (normalizedMedia !== null) {
    const mediaSaved = replacePortfolioMediaByProjectSlug(slug, normalizedMedia);
    if (!mediaSaved) {
      return NextResponse.json({ error: "Unable to save project media." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slug } = await context.params;
  const deleted = deletePortfolioProjectBySlug(slug);

  if (!deleted) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
