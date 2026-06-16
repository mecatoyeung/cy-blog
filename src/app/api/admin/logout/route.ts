import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, shouldUseSecureCookies } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: shouldUseSecureCookies(request),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
