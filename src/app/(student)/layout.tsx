import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { GradingNotifier } from "@/components/realtime/GradingNotifier";
import { ToastContainer } from "@/components/ui/toast-notification";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

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
      <GradingNotifier userId={user.id} />
      <ToastContainer />
    </div>
  );
}
