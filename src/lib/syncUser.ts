import type { SupabaseClient } from "@supabase/supabase-js";

// Upserts a row in the `users` table for the current Clerk user.
// Safe to call on every Quiz mount — the upsert is a no-op if the row already exists.
export async function syncUser(
  supabase: SupabaseClient,
  clerkId: string,
  email?: string | null
): Promise<void> {
  console.log("[syncUser] called — clerkId:", clerkId, "| email:", email ?? "(none)");

  // Expose which Supabase URL this client is pointed at so we can confirm env vars are set
  // @ts-ignore – accessing internal property for debug only
  const supabaseUrl = supabase?.supabaseUrl ?? "(unknown)";
  console.log("[syncUser] supabase URL:", supabaseUrl);

  const { data, error } = await supabase
    .from("users")
    .upsert({ clerk_id: clerkId, email: email ?? null }, { onConflict: "clerk_id" })
    .select();

  if (error) {
    console.error("[syncUser] upsert FAILED");
    console.error("  message:", error.message);
    console.error("  code:", error.code);
    console.error("  details:", error.details);
    console.error("  hint:", error.hint);
    console.error("  full error:", error);
  } else {
    console.log("[syncUser] upsert succeeded — rows affected:", data);
  }
}
