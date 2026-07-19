"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function login(prevState: { error: string } | null, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { success } = rateLimit(email, 5, 60000);
  if (!success) {
    return { error: "Too many attempts. Please try again in a minute." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/student");
}

export async function register(
  prevState: { error: string; confirmEmail?: boolean } | null,
  formData: FormData
) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "student";

  if (!fullName || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const { success } = rateLimit(email, 5, 60000);
  if (!success) {
    return { error: "Too many attempts. Please try again in a minute." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: email.split("@")[0],
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is required, the user object exists but
  // the session will be null (identities may be empty too).
  if (data.user && !data.session) {
    return { error: "", confirmEmail: true };
  }

  revalidatePath("/", "layout");
  redirect("/student");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
