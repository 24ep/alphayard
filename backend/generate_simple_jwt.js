const jwt = require('jsonwebtoken');

// Matches new simplified docker-compose secret
const secret = '12345678901234567890123456789012';

console.log('Generating keys with simple secret:', secret);

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

const serviceRoleKey = jwt.sign(serviceRolePayload, secret);
const anonKey = jwt.sign(anonPayload, secret);

console.log('SERVICE_ROLE_KEY=' + serviceRoleKey);
console.log('ANON_KEY=' + anonKey);
