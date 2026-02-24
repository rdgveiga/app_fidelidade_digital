import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: Supabase URL or Key is missing from environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function initDb() {
  console.log('Banco de dados Supabase conectado.');

  // O esquema já foi aplicado via migração externa.
  // Aqui poderíamos rodar verificações iniciais se necessário.
}

export default supabase;
