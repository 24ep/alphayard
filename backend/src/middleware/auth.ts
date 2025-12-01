import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '../services/supabaseService';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
  familyId?: string;
  familyRole?: string;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
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
    const jwtSecret = process.env.JWT_SECRET || 'bondarys-dev-secret-key';
    if ((process.env.NODE_ENV === 'production') && jwtSecret === 'bondarys-dev-secret-key') {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'JWT secret not configured'
      });
    }
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as any;

    // Check if we're in demo mode (no Supabase configured)
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Demo mode - just use the token data
      req.user = {
        id: decoded.id || decoded.userId,
        email: decoded.email
      };
      return next();
    }

    // Check if user still exists and is active
    const supabase = getSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, is_active')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token - user not found'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Account is disabled'
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email
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

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    const jwtSecret = process.env.JWT_SECRET || 'bondarys-dev-secret-key';
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as any;

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id, email, is_active')
      .eq('id', decoded.id)
      .single();

    if (user && user.is_active) {
      req.user = {
        id: user.id,
        email: user.email
      };
    }

    next();
  } catch (error) {
    // If there's an error, just continue without authentication
    next();
  }
};

// Role-based access control middleware
export const requireRole = (requiredRole: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    try {
      // Extract role from a trusted source. Prefer upstream assignment (e.g., gateway),
      // fallback to JWT claim parsed earlier into req as needed by your stack.
      const roleFromRequest = (req as any).userRole || (req as any).user?.role;

      if (!roleFromRequest) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Role not present on request'
        });
      }

      if (roleFromRequest !== requiredRole && roleFromRequest !== 'super_admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: `Requires role: ${requiredRole}`
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Role verification failed'
      });
    }
  };
};

export const requireFamilyMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', req.user.id)
      .single();

    if (!familyMember) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You must be a member of a hourse to access this resource'
      });
      return;
    }

    // Add hourse info to request
    req.familyId = familyMember.family_id;
    req.familyRole = familyMember.role;

    next();
  } catch (error) {
    console.error('hourse member check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify hourse membership'
    });
    return;
  }
};

export const requireFamilyOwner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', req.user.id)
      .eq('role', 'owner')
      .single();

    if (!familyMember) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You must be a hourse owner to access this resource'
      });
      return;
    }

    req.familyId = familyMember.family_id;
    req.familyRole = familyMember.role;

    next();
  } catch (error) {
    console.error('hourse owner check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify hourse ownership'
    });
    return;
  }
};
