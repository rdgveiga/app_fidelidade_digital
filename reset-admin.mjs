// Script to reset admin password
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const NEW_PASSWORD = 'Admin@2025!';
const ADMIN_EMAIL = 'rodrigoveigagt@gmail.com';

const hash = bcrypt.hashSync(NEW_PASSWORD, 10);
console.log('Generated hash:', hash);
console.log('Self-verify:', bcrypt.compareSync(NEW_PASSWORD, hash));

const { data, error } = await supabase
    .from('users')
    .update({ password_hash: hash })
    .eq('email', ADMIN_EMAIL)
    .select('email, role');

if (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
}

console.log('Updated:', data);
console.log(`\n✅ Login credentials:`);
console.log(`   Email: ${ADMIN_EMAIL}`);
console.log(`   Password: ${NEW_PASSWORD}`);
