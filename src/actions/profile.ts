"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const fullName = formData.get("full_name") as string;

  if (!fullName || fullName.trim().length === 0) {
    return { error: "Full name is required" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName.trim() })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/student/profile");
  return { success: true };
}
