import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authConfig, sessionCookieOptions } from "@/lib/auth/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(authConfig.session.cookieName)?.value;

  const isProtected = authConfig.protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!token && isProtected) {
    return NextResponse.redirect(new URL(authConfig.routes.login, request.url));
  }

  const response = NextResponse.next();

  const isServerAction = request.headers.has("next-action");
  if (token && !isServerAction) {
    response.cookies.set(
      authConfig.session.cookieName,
      token,
      sessionCookieOptions(),
    );
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
