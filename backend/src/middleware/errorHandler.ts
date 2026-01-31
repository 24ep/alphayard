import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Convert generic Error to ApiError
    const statusCode = (error as any).statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(message, statusCode, 'INTERNAL_ERROR', undefined, false);
    error.stack = err.stack;
  }

  const apiError = error as ApiError;

  // Log error
  console.error('Error:', {
    message: apiError.message,
    code: apiError.code,
    stack: apiError.stack,
    statusCode: apiError.statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  const response = {
    success: false,
    error: {
      message: apiError.message,
      code: apiError.code || 'UNKNOWN_ERROR',
      ...(apiError.details && { details: apiError.details })
    },
    ...(process.env.NODE_ENV === 'development' && { stack: apiError.stack }),
    timestamp: new Date().toISOString()
  };

  res.status(apiError.statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
