import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentSidebar } from "@/components/layout/StudentSidebar";

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
      <StudentSidebar profile={profile} stats={stats} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}
