import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  USER_SESSION_COOKIE,
  hasUserPasswordConfigured,
  isValidUserSessionToken,
} from "@/lib/user-auth";

export function proxy(request: NextRequest) {
  if (!hasUserPasswordConfigured()) {
    return NextResponse.next();
  }

  const token = request.cookies.get(USER_SESSION_COOKIE)?.value;
  if (token && isValidUserSessionToken(token)) {
    return NextResponse.next();
  }

  const unlockUrl = new URL("/unlock", request.url);
  unlockUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: ["/", "/blog/:path*", "/portfolio/:path*", "/resume", "/contact"],
};