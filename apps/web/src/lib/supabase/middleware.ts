import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Logger } from "@/lib/logger";

const log = new Logger("middleware");

export async function updateSession(request: NextRequest) {
  const start = Date.now();

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    if (!user && !pathname.startsWith("/auth") && pathname !== "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      log.info("request", { method: request.method, path: pathname, status: 302, duration: Date.now() - start, authenticated: false });
      return NextResponse.redirect(url);
    }

    if (user && pathname.startsWith("/auth")) {
      const url = request.nextUrl.clone();
      url.pathname = "/student";
      log.info("request", { method: request.method, path: pathname, status: 302, duration: Date.now() - start, authenticated: true, userId: user.id });
      return NextResponse.redirect(url);
    }

    log.info("request", { method: request.method, path: pathname, status: 200, duration: Date.now() - start, authenticated: !!user, userId: user?.id });
    return supabaseResponse;
  } catch (err) {
    log.error(err, { path: request.nextUrl.pathname, duration: Date.now() - start });
    return NextResponse.next({ request });
  }
}
