import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
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

  if (!profile || profile.role !== "admin") {
    redirect("/student");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AdminSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}
