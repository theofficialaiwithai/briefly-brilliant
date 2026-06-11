import { useMemo } from "react";
import { useSession } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// Returns an authenticated Supabase client when the user is signed in via Clerk.
// Falls back to the anon role when no Clerk session exists (e.g. public pages).
// The client is recreated only when the Clerk session changes.
export function useSupabaseClient() {
  const { session } = useSession();

  return useMemo(
    () =>
      createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
          fetch: async (url, options = {}) => {
            const token = session
              ? await session.getToken({ template: "supabase" })
              : null;
            const headers = new Headers(options.headers);
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return fetch(url, { ...options, headers });
          },
        },
      }),
    [session]
  );
}
