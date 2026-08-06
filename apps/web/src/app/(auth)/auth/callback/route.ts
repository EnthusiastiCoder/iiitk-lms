import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(
    `${origin}/auth/login?error=OAuth is handled by the API. Please sign in directly.`
  );
}
