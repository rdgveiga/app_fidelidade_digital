import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
// Prefer service_role key (bypasses RLS) for backend operations
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: Supabase URL or Key is missing from environment variables.');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY not set — using anon key. RLS may block queries.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function initDb() {
  console.log('Banco de dados Supabase conectado.');
}

export default supabase;
