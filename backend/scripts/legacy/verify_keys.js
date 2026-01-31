require('dotenv').config();
const jwt = require('jsonwebtoken');

const secret = 'bondarys-dev-secret-key-2024-extended-to-32-chars';
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Secret:', secret);

try {
    jwt.verify(anonKey, secret);
    console.log('✅ ANON_KEY is valid and signed correctly.');
} catch (e) {
    console.log('❌ ANON_KEY verify failed:', e.message);
}

try {
    jwt.verify(serviceKey, secret);
    console.log('✅ SERVICE_ROLE_KEY is valid and signed correctly.');
} catch (e) {
    console.log('❌ SERVICE_ROLE_KEY verify failed:', e.message);
}

console.log('ANON_KEY first 20 chars:', anonKey ? anonKey.substring(0, 20) : 'MISSING');
