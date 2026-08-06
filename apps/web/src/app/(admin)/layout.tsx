import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/api";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import type { Profile } from "@lms/shared";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("lms_access_token")?.value;
  if (!token) redirect("/auth/login");

  let profile: Profile | null = null;

  try {
    const data = await serverFetch<{ profile: Profile }>("/profile", token);
    profile = data.profile;
  } catch {
    redirect("/auth/login");
  }

  if (!profile || profile.role !== "admin") {
    redirect("/student");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <AdminSidebar profile={profile} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header - hidden on desktop */}
        <AdminMobileNav profile={profile} />
        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}
