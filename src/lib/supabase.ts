import {createClient} from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function checkSupabaseConnection(): Promise<void> {
  try {
    // Method 1: Use Supabase Auth health endpoint (always available)
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: "GET",
      headers: {
        apikey: supabaseServiceKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }

    const data = await response.json();

    // Check if the response indicates healthy status
    if (data && (data.healthy === false || data.status === "error")) {
      throw new Error(`Supabase reported unhealthy status: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    throw new Error(
      `Supabase connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
