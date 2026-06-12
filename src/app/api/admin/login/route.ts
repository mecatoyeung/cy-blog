import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  hasAdminPasswordConfigured,
  validateAdminPassword,
} from "@/lib/admin-auth";

type LoginRequest = {
  password?: unknown;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as LoginRequest;

  if (!hasAdminPasswordConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured." },
      { status: 500 }
    );
  }

  if (typeof payload.password !== "string") {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  if (!validateAdminPassword(payload.password)) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
