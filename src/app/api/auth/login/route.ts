import { NextResponse } from "next/server";

import { shouldUseSecureCookies } from "@/lib/admin-auth";
import {
  USER_SESSION_COOKIE,
  createUserSessionToken,
  hasUserPasswordConfigured,
  validateUserPassword,
} from "@/lib/user-auth";

type LoginRequest = {
  password?: unknown;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as LoginRequest;

  if (!hasUserPasswordConfigured()) {
    return NextResponse.json(
      { error: "USER_PASSWORD is not configured." },
      { status: 500 }
    );
  }

  if (typeof payload.password !== "string") {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  if (!validateUserPassword(payload.password)) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: USER_SESSION_COOKIE,
    value: createUserSessionToken(),
    httpOnly: true,
    secure: shouldUseSecureCookies(request),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}