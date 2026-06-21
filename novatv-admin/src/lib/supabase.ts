import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// The Admin panel utilizes the standard client for public reads/writes
// For unrestricted access to bypass potential complex RLS policies, the service_role key can be passed.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
