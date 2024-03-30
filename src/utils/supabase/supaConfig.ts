import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { evalError } from "../actions";

export const createSupabase = () => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
      },
    }
  );

  return supabase;
};
