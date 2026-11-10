import { NextRequest, NextResponse } from "next/server";
import {
  PROTECTED_PATH_PREFIXES,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "./lib/auth/constants";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isProtected = PROTECTED_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();

  const isServerAction = request.headers.has("next-action");
  if (token && !isServerAction) {
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
