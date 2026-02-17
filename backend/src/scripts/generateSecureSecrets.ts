#!/usr/bin/env ts-node

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Generate secure secrets for production deployment
 * This script creates cryptographically secure random values for all sensitive configuration
 */

interface SecretConfig {
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  SESSION_SECRET: string;
  ENCRYPTION_KEY: string;
  MCP_API_KEY: string;
  DATABASE_ENCRYPTION_KEY: string;
  REDIS_PASSWORD: string;
}

function generateSecureSecret(length: number): string {
  return crypto.randomBytes(length).toString('hex');
}

function generateSecureBase64(length: number): string {
  return crypto.randomBytes(length).toString('base64').replace(/[+/=]/g, '');
}

function generateSecureJWTSecret(): string {
  // Generate a 64-byte (512-bit) secret for JWT
  return generateSecureSecret(64);
}

function generateSecureEncryptionKey(): string {
  // Generate a 32-byte (256-bit) key for encryption
  return generateSecureSecret(32);
}

function generateSecureDatabaseKey(): string {
  // Generate a 32-byte key for database encryption
  return generateSecureBase64(32);
}

function generateProductionSecrets(): SecretConfig {
  return {
    JWT_SECRET: generateSecureJWTSecret(),
    JWT_REFRESH_SECRET: generateSecureJWTSecret(),
    SESSION_SECRET: generateSecureJWTSecret(),
    ENCRYPTION_KEY: generateSecureEncryptionKey(),
    MCP_API_KEY: `bk-${generateSecureBase64(32)}`,
    DATABASE_ENCRYPTION_KEY: generateSecureDatabaseKey(),
    REDIS_PASSWORD: generateSecureBase64(24),
  };
}

function generateEnvFile(secrets: SecretConfig, outputPath: string): void {
  const envContent = `# Production Environment Configuration
# Generated on ${new Date().toISOString()}

# =============================================================================
# SECURITY SECRETS (DO NOT COMMIT TO VERSION CONTROL)
# =============================================================================

# JWT Secrets
JWT_SECRET=${secrets.JWT_SECRET}
JWT_REFRESH_SECRET=${secrets.JWT_REFRESH_SECRET}

# Session Management
SESSION_SECRET=${secrets.SESSION_SECRET}

# Encryption Keys
ENCRYPTION_KEY=${secrets.ENCRYPTION_KEY}
DATABASE_ENCRYPTION_KEY=${secrets.DATABASE_ENCRYPTION_KEY}

# MCP Server
MCP_API_KEY=${secrets.MCP_API_KEY}

# Database & Cache
REDIS_PASSWORD=${secrets.REDIS_PASSWORD}

# =============================================================================
# PRODUCTION SETTINGS
# =============================================================================

# Environment
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/bondarys_prod
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bondarys_prod
DB_USER=bondarys_user
DB_PASSWORD=CHANGE_ME_IN_PRODUCTION

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=CHANGE_ME_IN_PRODUCTION
SUPABASE_ANON_KEY=CHANGE_ME_IN_PRODUCTION

# Server Configuration
PORT=4000
HOST=0.0.0.0

# CORS (Production)
CORS_ORIGIN=https://bondarys.com,https://admin.bondarys.com
FRONTEND_URL=https://bondarys.com
ADMIN_URL=https://admin.bondarys.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=CHANGE_ME_IN_PRODUCTION
AWS_SECRET_ACCESS_KEY=CHANGE_ME_IN_PRODUCTION
AWS_REGION=us-east-1
AWS_S3_BUCKET=bondarys-files

# SSL Certificates
CERTBOT_EMAIL=admin@bondarys.com
DOMAIN_NAME=bondarys.com

# Monitoring
GRAFANA_PASSWORD=CHANGE_ME_IN_PRODUCTION

# Notifications
SLACK_WEBHOOK_URL=CHANGE_ME_IN_PRODUCTION

# =============================================================================
# OPTIONAL SERVICES
# =============================================================================

# Google OAuth
GOOGLE_CLIENT_ID=CHANGE_ME_IN_PRODUCTION
GOOGLE_CLIENT_SECRET=CHANGE_ME_IN_PRODUCTION

# Facebook OAuth
FACEBOOK_APP_ID=CHANGE_ME_IN_PRODUCTION
FACEBOOK_APP_SECRET=CHANGE_ME_IN_PRODUCTION

# Apple OAuth
APPLE_CLIENT_ID=CHANGE_ME_IN_PRODUCTION

# Push Notifications
EXPO_PUBLIC_PUSH_NOTIFICATION_KEY=CHANGE_ME_IN_PRODUCTION

# Analytics
EXPO_PUBLIC_ANALYTICS_KEY=CHANGE_ME_IN_PRODUCTION
EXPO_PUBLIC_ERROR_REPORTING_KEY=CHANGE_ME_IN_PRODUCTION

# AWS Backups
AWS_ACCESS_KEY_ID=CHANGE_ME_IN_PRODUCTION
AWS_SECRET_ACCESS_KEY=CHANGE_ME_IN_PRODUCTION
AWS_REGION=us-east-1
AWS_S3_BUCKET=bondarys-backups
`;

  fs.writeFileSync(outputPath, envContent, 'utf8');
  console.log(`✅ Production .env file generated: ${outputPath}`);
}

function generateDockerSecrets(secrets: SecretConfig, outputDir: string): void {
  // Create docker secrets directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate individual secret files
  const secretsMap = {
    'jwt-secret.txt': secrets.JWT_SECRET,
    'jwt-refresh-secret.txt': secrets.JWT_REFRESH_SECRET,
    'session-secret.txt': secrets.SESSION_SECRET,
    'encryption-key.txt': secrets.ENCRYPTION_KEY,
    'database-encryption-key.txt': secrets.DATABASE_ENCRYPTION_KEY,
    'redis-password.txt': secrets.REDIS_PASSWORD,
    'mcp-api-key.txt': secrets.MCP_API_KEY,
  };

  for (const [filename, secret] of Object.entries(secretsMap)) {
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, secret, 'utf8');
    console.log(`✅ Secret file generated: ${filePath}`);
  }

  // Generate docker-compose override
  const dockerComposeOverride = `# Production Docker Compose Override
# Generated on ${new Date().toISOString()}

version: '3.8'

services:
  backend:
    environment:
      - NODE_ENV=production
      - JWT_SECRET_FILE=/run/secrets/jwt-secret.txt
      - JWT_REFRESH_SECRET_FILE=/run/secrets/jwt-refresh-secret.txt
      - SESSION_SECRET_FILE=/run/secrets/session-secret.txt
      - ENCRYPTION_KEY_FILE=/run/secrets/encryption-key.txt
      - DATABASE_ENCRYPTION_KEY_FILE=/run/secrets/database-encryption-key.txt
      - REDIS_PASSWORD_FILE=/run/secrets/redis-password.txt
      - MCP_API_KEY_FILE=/run/secrets/mcp-api-key.txt
    secrets:
      - jwt-secret
      - jwt-refresh-secret
      - session-secret
      - encryption-key
      - database-encryption-key
      - redis-password
      - mcp-api-key

  db:
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db-password
    secrets:
      - db-password

  redis:
    command: redis-server --requirepass-file /run/secrets/redis-password
    secrets:
      - redis-password

secrets:
  jwt-secret:
    file: ./secrets/jwt-secret.txt
  jwt-refresh-secret:
    file: ./secrets/jwt-refresh-secret.txt
  session-secret:
    file: ./secrets/session-secret.txt
  encryption-key:
    file: ./secrets/encryption-key.txt
  database-encryption-key:
    file: ./secrets/database-encryption-key.txt
  redis-password:
    file: ./secrets/redis-password.txt
  mcp-api-key:
    file: ./secrets/mcp-api-key.txt
  db-password:
    external: true
`;

  fs.writeFileSync(path.join(outputDir, 'docker-compose.override.yml'), dockerComposeOverride, 'utf8');
  console.log(`✅ Docker compose override generated: ${path.join(outputDir, 'docker-compose.override.yml')}`);
}

function main() {
  console.log('🔒 Generating production secrets...\n');

  try {
    // Generate secure secrets
    const secrets = generateProductionSecrets();

    // Display generated secrets (for manual copy)
    console.log('📋 Generated Secrets (copy these to your secure location):');
    console.log('=' .repeat(50));
    Object.entries(secrets).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.log('=' .repeat(50));
    console.log('\n⚠️  Store these secrets in a secure location (password manager, vault, etc.)');

    // Generate .env file
    const envPath = path.join(process.cwd(), '.env.production');
    generateEnvFile(secrets, envPath);

    // Generate Docker secrets
    const secretsDir = path.join(process.cwd(), 'secrets');
    generateDockerSecrets(secrets, secretsDir);

    console.log('\n✅ Production secrets generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Store the secrets in a secure location');
    console.log('2. Update the .env.production file with actual database credentials');
    console.log('3. Configure your external services (OAuth, S3, etc.)');
    console.log('4. Set up proper SSL certificates');
    console.log('5. Test the configuration before deployment');

  } catch (error) {
    console.error('❌ Error generating secrets:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { generateProductionSecrets, generateSecureSecret, generateSecureJWTSecret };
