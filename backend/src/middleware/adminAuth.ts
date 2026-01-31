import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AdminRequest extends Request {
  admin?: {
    id: string; // This is now users.id
    adminId?: string; // This is admin_users.id (optional)
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    permissions: string[];
    type: string;
  };
}

export const authenticateAdmin = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const jwtSecret = config.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Check if it's an admin token
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Admin access required'
      });
    }

    // Add admin info to request
    req.admin = {
      id: decoded.id, // users.id
      adminId: decoded.adminId, // admin_users.id
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      role: decoded.role,
      permissions: decoded.permissions || [],
      type: decoded.type
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }

    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check if admin has required permission
 * Usage: requirePermission('pages:write')
 */
export const requirePermission = (permission: string) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Not authenticated'
      });
    }

    const { permissions } = req.admin;

    // Super admins have all permissions
    if (permissions.includes('*')) {
      return next();
    }

    // Check for specific permission
    if (permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      error: 'Forbidden',
      message: `Permission denied. Required: ${permission}`
    });
  };
};
