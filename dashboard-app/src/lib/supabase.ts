import { createClient } from '@supabase/supabase-js';

// These should be in .env file, but for now we'll ask the user to input them or replace them here.
// We will use placeholders that will log a warning if missing.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bvhlolwatdfhixyoiycq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGxvbHdhdGRmaGl4eW9peWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTYzNDUsImV4cCI6MjA4MDM3MjM0NX0.Ke_J8pPF2eupOmgO-M-UTjjWg4P-s0N-x5lpIvHah5s';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing from env. Using fallback credentials.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
