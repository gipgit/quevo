// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is correctly set in .env.local
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
// Ensure SUPABASE_SERVICE_ROLE_KEY is correctly set in .env.local
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

// Client for client-side interactions and public data access
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key for privileged operations
// Add a check to ensure the service role key is present
if (!supabaseServiceRoleKey) {
  console.error("CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is not set. Supabase admin client will not function correctly.");
  // In a production environment, you might want to throw an error here
  // or use a dummy key that will cause Supabase to reject admin calls.
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || 'dummy_service_role_key_if_missing', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
