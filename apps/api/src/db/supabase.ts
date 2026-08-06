import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

/** Admin Supabase client with service role key. Bypasses RLS. */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
