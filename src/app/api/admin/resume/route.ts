import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { replaceExperiences, updateResume } from "@/lib/db";

type ResumeExperiencePayload = {
  company?: unknown;
  role?: unknown;
  period?: unknown;
  highlights?: unknown;
};

type ResumeUpdateRequest = {
  name?: unknown;
  title?: unknown;
  summary?: unknown;
  email?: unknown;
  location?: unknown;
  website?: unknown;
  experiences?: unknown;
};

export async function PUT(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json()) as ResumeUpdateRequest;

  if (
    typeof payload.name !== "string" ||
    typeof payload.title !== "string" ||
    typeof payload.summary !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.location !== "string" ||
    typeof payload.website !== "string" ||
    !Array.isArray(payload.experiences)
  ) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const normalizedExperiences = payload.experiences.map((item) => {
    const entry = item as ResumeExperiencePayload;

    if (
      typeof entry.company !== "string" ||
      typeof entry.role !== "string" ||
      typeof entry.period !== "string" ||
      typeof entry.highlights !== "string"
    ) {
      return null;
    }

    return {
      company: entry.company.trim(),
      role: entry.role.trim(),
      period: entry.period.trim(),
      highlights: entry.highlights.trim(),
    };
  });

  if (normalizedExperiences.some((item) => item === null)) {
    return NextResponse.json({ error: "Invalid experiences payload." }, { status: 400 });
  }

  const resumeUpdated = updateResume({
    name: payload.name.trim(),
    title: payload.title.trim(),
    summary: payload.summary.trim(),
    email: payload.email.trim(),
    location: payload.location.trim(),
    website: payload.website.trim(),
  });

  if (!resumeUpdated) {
    return NextResponse.json({ error: "Unable to update resume." }, { status: 500 });
  }

  const experiencesUpdated = replaceExperiences(
    normalizedExperiences.filter((item): item is NonNullable<typeof item> => item !== null)
  );

  if (!experiencesUpdated) {
    return NextResponse.json({ error: "Unable to update experiences." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}