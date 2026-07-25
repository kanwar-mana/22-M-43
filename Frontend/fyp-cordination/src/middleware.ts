import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/unauthorized",
    "/forgot-password",
    "/reset-password",
  ],
};

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const { pathname } = request.nextUrl;
  const isAuthenticated = accessToken || refreshToken;

  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isDashboard = pathname.startsWith("/dashboard");
  const isUnauthorized = pathname === "/unauthorized";
  if (!isAuthenticated && (isDashboard || isUnauthorized)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
