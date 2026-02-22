import express from 'express';

console.log(`[UniApps Admin Server] Initialization trigger: ${new Date().toISOString()}`);

// Environment variables are loaded by the entry point (server.ts)

import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as Sentry from '@sentry/node';
import cluster from 'cluster';
import os from 'os';

// Import Admin Routes
import v1AdminRouter from './routes/v1/admin';
import healthRoutes from './routes/health';
import { prisma } from './config/database';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { requestIdMiddleware } from './middleware/requestId';

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}


// Export app creator for Custom Server
export async function createApp() {
  const app = express();

  // Middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(compression());
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  // Admin API Routes
  app.use('/api/v1', v1AdminRouter);
  app.use('/api', v1AdminRouter);
  
  // Health check
  app.use('/health', healthRoutes);

  app.use(errorHandler);

  // Database Connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (err: any) {
    console.warn('⚠️ Database connection warning:', err.message);
  }

  return app;
}
