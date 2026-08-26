import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const jwt = request.cookies.get("jwt")?.value;
  const userCookie = request.cookies.get("user")?.value;

  // If navigating to the dashboard, check if the user is logged in
  if (pathname.startsWith("/dashboard")) {
    if (!jwt || !userCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const user = JSON.parse(userCookie);
      const userRole = user.role?.type;

      // which dashboard page can be accessed by which role
      if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (
        pathname.startsWith("/dashboard/instructor") &&
        userRole !== "instructor" &&
        userRole !== "admin"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (
        pathname.startsWith("/dashboard/content-manager") &&
        userRole !== "content_manager" &&
        userRole !== "admin"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (pathname.startsWith("/dashboard/student") && userRole !== "student") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
