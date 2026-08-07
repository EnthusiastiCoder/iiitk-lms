import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/api";
import { TesterSidebar } from "@/components/tester/TesterSidebar";
import { TesterMobileNav } from "@/components/tester/TesterMobileNav";
import { ToastContainer } from "@/components/ui/toast-notification";
import type { Profile } from "@lms/shared";

export default async function TesterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("lms_access_token")?.value;
  if (!token) redirect("/auth/login");

  let profile: Profile | null = null;

  try {
    const data = await serverFetch<{
      profile: Profile;
      stats: unknown;
    }>("/profile", token);
    profile = data.profile;
  } catch {
    redirect("/auth/login");
  }

  const role = profile?.role as string;
  if (profile && role !== "tester" && role !== "admin") {
    redirect("/student");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <TesterSidebar profile={profile} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header - hidden on desktop */}
        <TesterMobileNav profile={profile} />
        <main className="flex-1 min-h-0">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
