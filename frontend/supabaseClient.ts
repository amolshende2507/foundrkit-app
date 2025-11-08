import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and Key from our .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);