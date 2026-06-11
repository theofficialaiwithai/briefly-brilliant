import type { SupabaseClient } from "@supabase/supabase-js";

// Upserts a row in the `users` table for the current Clerk user.
// Safe to call on every Quiz mount — the upsert is a no-op if the row already exists.
export async function syncUser(
  supabase: SupabaseClient,
  clerkId: string,
  email?: string | null
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .upsert({ clerk_id: clerkId, email: email ?? null }, { onConflict: "clerk_id" });

  if (error) {
    console.error("[syncUser] upsert failed:", error.message);
  }
}
