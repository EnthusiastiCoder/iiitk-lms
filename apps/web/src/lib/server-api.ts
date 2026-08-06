import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function serverFetch<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("lms_access_token")?.value;
  if (!token) return null;
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body.data;
}
