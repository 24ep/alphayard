const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const secret = '12345678901234567890123456789012';

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

const envContent = `
# Development Environment Variables
NODE_ENV=development
PORT=3000

# JWT - Shared secret with PostgREST
JWT_SECRET=${secret}
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=bondarys-dev-refresh-secret-2024
JWT_REFRESH_EXPIRES_IN=7d

# Supabase Keys - Signed with the secret above
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}
SUPABASE_ANON_KEY=${anonKey}

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=54322
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres

# CORS
CORS_ORIGIN=*

# Frontend URL
FRONTEND_URL=http://localhost:3001

# S3 / MinIO Configuration
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
AWS_S3_BUCKET=bondarys-files
AWS_S3_ENDPOINT=http://localhost:9000

ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,application/pdf
`.trim();

fs.writeFileSync(path.join(__dirname, '.env'), envContent, 'utf8');
console.log('.env file updated with matching secrets.');
