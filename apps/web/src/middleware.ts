import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("lms_access_token")?.value;
  const pathname = request.nextUrl.pathname;

  if (!token && !pathname.startsWith("/auth") && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (token && pathname.startsWith("/auth")) {
    // Decode JWT to check role for redirect target
    let redirectPath = "/student";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "tester") {
        redirectPath = "/tester/bugs";
      }
    } catch {
      // fall through to default redirect
    }
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
