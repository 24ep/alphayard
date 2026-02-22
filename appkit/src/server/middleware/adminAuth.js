import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../lib/prisma';
const adminAccessCache = new Map();
const ADMIN_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
// Clear expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of adminAccessCache.entries()) {
        if (now - entry.timestamp > ADMIN_CACHE_TTL_MS) {
            adminAccessCache.delete(key);
        }
    }
}, 60 * 1000);
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Get all applications an admin has access to
 */
async function getAdminApplications(adminId) {
    const cached = adminAccessCache.get(adminId);
    if (cached && Date.now() - cached.timestamp < ADMIN_CACHE_TTL_MS) {
        return cached.applications;
    }
    try {
        // Use Prisma to fetch admin user applications with related application
        const adminAppAccesses = await prisma.adminUserApplication.findMany({
            where: {
                adminUserId: adminId,
                application: {
                    isActive: true
                }
            },
            include: {
                application: {
                    select: {
                        name: true,
                        slug: true
                    }
                }
            },
            orderBy: [
                { isPrimary: 'desc' },
                { createdAt: 'asc' }
            ]
        });
        const applications = adminAppAccesses.map(row => ({
            id: row.id,
            adminUserId: row.adminUserId,
            applicationId: row.applicationId,
            role: row.role,
            permissions: row.permissions || [],
            isPrimary: row.isPrimary,
            grantedAt: row.createdAt,
            lastAccessedAt: row.createdAt
        }));
        adminAccessCache.set(adminId, { applications, timestamp: Date.now() });
        return applications;
    }
    catch (error) {
        console.error('[AdminAuth] Error fetching admin applications:', error);
        return [];
    }
}
/**
 * Check if admin is a super admin
 */
async function checkSuperAdmin(adminId) {
    try {
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: adminId },
            select: { isSuperAdmin: true }
        });
        return adminUser?.isSuperAdmin === true;
    }
    catch (error) {
        console.error('[AdminAuth] Error checking super admin status:', error);
        return false;
    }
}
/**
 * Update admin's last accessed timestamp for an application
 * Note: lastAccessedAt field not in schema, function is a no-op
 */
async function updateAdminLastAccessed(_adminId, _applicationId) {
    // lastAccessedAt field not available in current schema
    // This is a no-op until the schema is updated
}
/**
 * Clear admin access cache
 */
export function clearAdminAccessCache(adminId) {
    if (adminId) {
        adminAccessCache.delete(adminId);
    }
    else {
        adminAccessCache.clear();
    }
}
export const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            console.warn(`[AdminAuth] Access denied: No token provided for ${req.method} ${req.path}`);
            return res.status(401).json({
                error: 'Access denied',
                message: 'No token provided'
            });
        }
        // Verify JWT token
        const jwtSecret = config.JWT_SECRET;
        const decoded = jwt.verify(token, jwtSecret);
        // Check if it's an admin token
        if (decoded.type !== 'admin') {
            console.warn(`[AdminAuth] Access forbidden: Non-admin token type "${decoded.type}" for ${req.path}`);
            return res.status(403).json({
                error: 'Access denied',
                message: 'Admin access required'
            });
        }
        // Get admin's application access
        const adminId = decoded.adminId || decoded.id;
        const [applications, isSuperAdmin] = await Promise.all([
            getAdminApplications(adminId),
            checkSuperAdmin(adminId)
        ]);
        // Add admin info to request
        req.admin = {
            id: decoded.id, // users.id
            adminId: decoded.adminId, // admin_users.id
            email: decoded.email,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            role: decoded.role,
            permissions: decoded.permissions || [],
            type: decoded.type,
            isSuperAdmin,
            applications
        };
        // If there's an application context from appScopingMiddleware, validate access
        if (req.applicationId && req.application) {
            const appAccess = applications.find(a => a.applicationId === req.applicationId);
            if (appAccess || isSuperAdmin) {
                req.admin.currentApp = req.application;
                req.admin.currentAppAccess = appAccess || undefined;
                // Update last accessed timestamp (fire and forget)
                if (appAccess) {
                    updateAdminLastAccessed(adminId, req.applicationId);
                }
            }
        }
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            console.warn(`[AdminAuth] Access denied: Invalid token for ${req.path}`);
            return res.status(401).json({
                error: 'Access denied',
                message: 'Invalid token'
            });
        }
        if (error instanceof jwt.TokenExpiredError) {
            console.warn(`[AdminAuth] Access denied: Token expired for ${req.path}`);
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
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'Not authenticated'
            });
        }
        const { permissions, isSuperAdmin } = req.admin;
        // Super admins have all permissions
        if (isSuperAdmin || permissions.includes('*')) {
            return next();
        }
        // Check for specific permission
        if (permissions.includes(permission)) {
            return next();
        }
        // Check app-specific permissions if there's a current app context
        if (req.admin.currentAppAccess?.permissions?.includes(permission)) {
            return next();
        }
        return res.status(403).json({
            error: 'Forbidden',
            message: `Permission denied. Required: ${permission}`
        });
    };
};
/**
 * Middleware to require admin access to the current application
 * Must be used after authenticateAdmin and appScopingMiddleware
 */
export const requireAdminAppAccess = async (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({
            error: 'Access denied',
            message: 'Not authenticated'
        });
    }
    if (!req.applicationId) {
        return res.status(400).json({
            error: 'Application context required',
            message: 'Please provide X-App-ID header'
        });
    }
    // Super admins can access any application
    if (req.admin.isSuperAdmin) {
        return next();
    }
    // Check if admin has access to this specific application
    const hasAccess = req.admin.applications?.some(app => app.applicationId === req.applicationId);
    if (!hasAccess) {
        return res.status(403).json({
            error: 'Access denied',
            message: 'You do not have access to this application'
        });
    }
    next();
};
/**
 * Middleware to require specific admin role within an application
 * Usage: requireAdminAppRole('admin') or requireAdminAppRole(['admin', 'super_admin'])
 */
export const requireAdminAppRole = (roles) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'Not authenticated'
            });
        }
        // Super admins bypass role checks
        if (req.admin.isSuperAdmin) {
            return next();
        }
        // Check current app access role
        const currentRole = req.admin.currentAppAccess?.role;
        if (currentRole && allowedRoles.includes(currentRole)) {
            return next();
        }
        return res.status(403).json({
            error: 'Insufficient permissions',
            message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
        });
    };
};
// ============================================================================
// Utility Functions for Admin-App Management
// ============================================================================
/**
 * Grant admin access to an application
 */
export async function grantAdminAppAccess(adminUserId, applicationId, role = 'admin', _grantedBy) {
    try {
        const result = await prisma.adminUserApplication.upsert({
            where: {
                adminUserId_applicationId: {
                    adminUserId,
                    applicationId
                }
            },
            update: {
                role
            },
            create: {
                adminUserId,
                applicationId,
                role
            }
        });
        clearAdminAccessCache(adminUserId);
        return {
            id: result.id,
            adminUserId: result.adminUserId,
            applicationId: result.applicationId,
            role: result.role,
            permissions: result.permissions || [],
            isPrimary: result.isPrimary,
            grantedAt: result.createdAt,
            lastAccessedAt: result.createdAt
        };
    }
    catch (error) {
        console.error('[AdminAuth] Error granting admin access:', error);
        return null;
    }
}
/**
 * Revoke admin access from an application
 */
export async function revokeAdminAppAccess(adminUserId, applicationId) {
    try {
        const result = await prisma.adminUserApplication.deleteMany({
            where: {
                adminUserId,
                applicationId
            }
        });
        clearAdminAccessCache(adminUserId);
        return result.count > 0;
    }
    catch (error) {
        console.error('[AdminAuth] Error revoking admin access:', error);
        return false;
    }
}
/**
 * Get all admins for an application
 */
export async function getApplicationAdmins(applicationId) {
    try {
        const admins = await prisma.adminUserApplication.findMany({
            where: { applicationId },
            include: {
                adminUser: true
            },
            orderBy: [
                { role: 'asc' },
                { adminUser: { email: 'asc' } }
            ]
        });
        return admins.map(aua => ({
            ...aua.adminUser,
            app_role: aua.role,
            granted_at: aua.createdAt,
            last_accessed_at: aua.createdAt
        }));
    }
    catch (error) {
        console.error('[AdminAuth] Error getting application admins:', error);
        return [];
    }
}
