import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const accessToken = req.cookies.get("sb-access-token")?.value;
  const refreshToken = req.cookies.get("sb-refresh-token")?.value;
  const role = req.cookies.get("role")?.value;
  const path = req.nextUrl.pathname;

  const isProtectedRoute =
    path.startsWith("/dashboard") || path.startsWith("/superadmin");

  if (!accessToken && isProtectedRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (role === "admin" && path.startsWith("/superadmin")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (role === "superadmin" && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/superadmin", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/superadmin/:path*"],
};
