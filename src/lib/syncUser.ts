import type { SupabaseClient } from "@supabase/supabase-js";

export async function syncUser(
  supabase: SupabaseClient,
  clerkId: string,
  email?: string | null
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .upsert({ clerk_id: clerkId, email: email ?? null }, { onConflict: "clerk_id" });

  if (error) {
    console.error("[syncUser] upsert failed:", error.message, error.code);
  }
}
