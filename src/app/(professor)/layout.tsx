import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfessorSidebar } from "@/components/professor/ProfessorSidebar";

export default async function ProfessorLayout({
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

  // Allow any authenticated user for demo purposes
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ProfessorSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}
