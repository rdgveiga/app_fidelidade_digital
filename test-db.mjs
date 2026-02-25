import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

console.log('URL:', url);
console.log('Key prefix:', key?.substring(0, 20) + '...');
console.log('');
console.log('Testing Supabase connection...');

const db = createClient(url, key);

try {
    const start = Date.now();
    const { data, error } = await db.from('users').select('id, email, role, password_hash').eq('email', 'rodrigoveigagt@gmail.com').single();
    const elapsed = Date.now() - start;
    console.log(`Query took ${elapsed}ms`);
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Error:', JSON.stringify(error, null, 2));
} catch (e) {
    console.error('Exception:', e.message);
}

process.exit(0);
