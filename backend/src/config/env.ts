import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables before validating
// 1) Backend-local .env
dotenv.config({ path: path.resolve(__dirname, '../..', '.env') });
// 2) Fallback to default .env resolution (e.g. project root)
dotenv.config();

/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables at startup
 * using Zod schema validation.
 */

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Database
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('54322'),
  DB_NAME: z.string().default('postgres'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),

  // AWS S3 (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),

  // Redis (optional)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // External Services (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().default('*'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

/**
 * Validate and get environment variables
 */
export function getEnv(): Env {
  if (!env) {
    try {
      env = envSchema.parse(process.env);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        console.error('❌ Environment variable validation failed:');
        error.errors.forEach((err: z.ZodIssue) => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
      }
      throw error;
    }
  }
  return env;
}

/**
 * Validate environment variables (call at startup)
 */
export function validateEnv(): { isValid: boolean; errors: string[] } {
  try {
    envSchema.parse(process.env);
    return { isValid: true, errors: [] };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(
        (err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`
      );
      return { isValid: false, errors };
    }
    return { isValid: false, errors: ['Unknown validation error'] };
  }
}

// Export validated env
export const config = getEnv();
