import { createClient } from '@supabase/supabase-js';

// Reemplazar estas variables con tus credenciales reales obtenidos de Supabase
const SUPABASE_URL = 'https://TU-SUPABASE-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.youranonkeyhere...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
