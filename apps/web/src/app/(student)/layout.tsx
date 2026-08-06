import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/api";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { GradingNotifier } from "@/components/realtime/GradingNotifier";
import { ToastContainer } from "@/components/ui/toast-notification";
import type { Profile } from "@lms/shared";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("lms_access_token")?.value;
  if (!token) redirect("/auth/login");

  let profile: Profile | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stats: any = null;

  try {
    const data = await serverFetch<{
      profile: Profile;
      stats: unknown;
    }>("/profile", token);
    profile = data.profile;
    stats = data.stats;
  } catch {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <StudentSidebar profile={profile} stats={stats} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header - hidden on desktop */}
        <MobileNav profile={profile} stats={stats} />
        <main className="flex-1 min-h-0">{children}</main>
      </div>
      <GradingNotifier userId={profile!.id} />
      <ToastContainer />
    </div>
  );
}
