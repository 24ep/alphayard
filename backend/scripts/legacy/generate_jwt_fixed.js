const jwt = require('jsonwebtoken');

// This MUST match Docker and .env exactly
const secret = 'bondarys-dev-secret-key-2024-extended-to-32-chars';

console.log('Generating keys with secret:', secret);

const serviceRolePayload = {
    role: 'service_role',
    iss: 'bondarys',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365 * 10) // 10 years
};

const anonPayload = {
    role: 'anon',
    iss: 'bondarys',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365 * 10) // 10 years
};

// Sign with HS256 (default) which PostgREST expects
const serviceRoleKey = jwt.sign(serviceRolePayload, secret);
const anonKey = jwt.sign(anonPayload, secret);

console.log('SERVICE_ROLE_KEY=' + serviceRoleKey);
console.log('ANON_KEY=' + anonKey);

// Verify immediately
try {
    jwt.verify(serviceRoleKey, secret);
    console.log('✅ Generated SERVICE_ROLE_KEY verifies correctly');
} catch (e) {
    console.error('❌ Verification failed immediately:', e.message);
}
