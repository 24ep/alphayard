/**
 * Admin OAuth Clients Management Routes
 * 
 * Allows administrators to manage OAuth clients that use AppKit as SSO provider.
 */

import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticateAdmin, AdminRequest } from '../../middleware/adminAuth';
import { requirePermission } from '../../middleware/permissionCheck';
import { oauthServiceWrapper, ServiceError } from '../../services/serviceWrapper';
import { prisma } from '../../lib/prisma';
import SSOProvider from '../../services/SSOProviderService';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// SSOProvider service is now imported at top level

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// ============================================================================
// List OAuth Clients
// ============================================================================

/**
 * Get all OAuth clients
 * GET /admin/oauth-clients
 */
router.get('/', requirePermission('settings', 'view'), async (req: AdminRequest, res: Response) => {
    try {
        const { page = '1', limit = '20', search } = req.query;
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        const searchStr = search as string;
        // Get total count
        const count = await prisma.oAuthClient.count({
            where: {
                // Add filtering logic here based on whereClause
                ...(req.applicationId && !req.admin?.isSuperAdmin && {
                    OR: [
                        { applicationId: req.applicationId },
                        { applicationId: null }
                    ]
                }),
                ...(searchStr && {
                    OR: [
                        { name: { contains: searchStr, mode: 'insensitive' } },
                        { clientId: { contains: searchStr, mode: 'insensitive' } }
                    ]
                })
            }
        });
        
        // Get clients using Prisma client
        const clients = await prisma.oAuthClient.findMany({
            where: {
                // Add filtering logic here based on whereClause
                ...(req.applicationId && !req.admin?.isSuperAdmin && {
                    OR: [
                        { applicationId: req.applicationId },
                        { applicationId: null }
                    ]
                }),
                ...(searchStr && {
                    OR: [
                        { name: { contains: searchStr, mode: 'insensitive' } },
                        { clientId: { contains: searchStr, mode: 'insensitive' } }
                    ]
                })
            },
            include: {
                application: {
                    select: { name: true }
                },
                creator: {
                    select: { email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: parseInt(limit as string)
        });
        
        res.json({
            data: clients,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total: count,
                totalPages: Math.ceil(count / parseInt(limit as string))
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// Get Single OAuth Client
// ============================================================================

/**
 * Get OAuth client by ID
 * GET /admin/oauth-clients/:id
 */
router.get('/:id', [
    param('id').isUUID()
], requirePermission('settings', 'view'), async (req: AdminRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid client ID' });
    }
    
    try {
        // Get client using Prisma client
        const client = await prisma.oAuthClient.findUnique({
            where: { id: req.params.id },
            include: {
                application: {
                    select: { name: true }
                },
                creator: {
                    select: { email: true }
                }
            }
        });
        
        if (!client) {
            return res.status(404).json({ error: 'OAuth client not found' });
        }
        
        // Get statistics using Prisma client
        const [activeConsents, activeTokens, pendingCodes] = await Promise.all([
            prisma.oAuthUserConsent.count({
                where: { 
                    clientId: req.params.id,
                    revokedAt: null
                }
            }),
            prisma.oAuthAccessToken.count({
                where: { 
                    clientId: req.params.id,
                    isRevoked: false,
                    expiresAt: { gt: new Date() }
                }
            }),
            prisma.oAuthAuthorizationCode.count({
                where: { 
                    clientId: req.params.id,
                    usedAt: null,
                    expiresAt: { gt: new Date() }
                }
            })
        ]);
        
        const stats = {
            activeConsents,
            activeTokens,
            pendingCodes
        };
        
        res.json({
            id: client.id,
            client_id: client.clientId,
            client_type: client.clientType,
            name: client.name,
            description: client.description,
            logo_url: client.logoUrl,
            homepage_url: client.homepageUrl,
            privacy_policy_url: client.privacyPolicyUrl,
            terms_of_service_url: client.termsOfServiceUrl,
            redirect_uris: client.redirectUris,
            grant_types: client.grantTypes,
            allowed_scopes: client.allowedScopes,
            access_token_lifetime: client.accessTokenLifetime,
            refresh_token_lifetime: client.refreshTokenLifetime,
            is_active: client.isActive,
            created_at: client.createdAt,
            updated_at: client.updatedAt,
            application_name: client.application?.name,
            created_by_email: client.creator?.email,
            statistics: stats
        });
        
    } catch (error: unknown) {
        console.error('Error fetching OAuth client:', error);
        res.status(500).json({ error: 'Failed to fetch OAuth client' });
    }
});

// ============================================================================
// Create OAuth Client
// ============================================================================

/**
 * Create new OAuth client
 * POST /admin/oauth-clients
 */
router.post('/', [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('redirect_uris').isArray({ min: 1 }).withMessage('At least one redirect URI is required'),
    body('redirect_uris.*').isURL({ require_tld: false }).withMessage('Invalid redirect URI'),
    body('client_type').optional().isIn(['confidential', 'public']),
    body('grant_types').optional().isArray(),
    body('allowed_scopes').optional().isArray(),
    body('access_token_lifetime').optional().isInt({ min: 60, max: 86400 }),
    body('refresh_token_lifetime').optional().isInt({ min: 3600, max: 31536000 }),
    body('require_pkce').optional().isBoolean(),
    body('require_consent').optional().isBoolean(),
    body('first_party').optional().isBoolean()
], requirePermission('settings', 'manage'), async (req: AdminRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    
    try {
        const result = await oauthServiceWrapper.wrapCall(async () => {
            if (!SSOProvider) {
                throw new ServiceError('SSOProvider service not available', 'SERVICE_UNAVAILABLE');
            }
            return await SSOProvider.createClient({
                name: req.body.name,
                description: req.body.description,
                redirect_uris: req.body.redirect_uris,
            client_type: req.body.client_type,
            grant_types: req.body.grant_types,
            allowed_scopes: req.body.allowed_scopes,
            require_pkce: req.body.require_pkce,
            require_consent: req.body.require_consent,
            first_party: req.body.first_party,
            application_id: req.applicationId,
            created_by: req.admin?.adminId,
            logo_url: req.body.logo_url,
            homepage_url: req.body.homepage_url
        });
        
        // Update additional fields
        if (req.body.access_token_lifetime || req.body.refresh_token_lifetime || req.body.privacy_policy_url || req.body.terms_of_service_url) {
            const updateData: any = {};
            
            if (req.body.access_token_lifetime !== undefined) {
                updateData.accessTokenLifetime = req.body.access_token_lifetime;
            }
            if (req.body.refresh_token_lifetime !== undefined) {
                updateData.refreshTokenLifetime = req.body.refresh_token_lifetime;
            }
            if (req.body.privacy_policy_url !== undefined) {
                updateData.privacyPolicyUrl = req.body.privacy_policy_url;
            }
            if (req.body.terms_of_service_url !== undefined) {
                updateData.termsOfServiceUrl = req.body.terms_of_service_url;
            }

            await prisma.oAuthClient.update({
                where: { id: result.client.id },
                data: updateData
            });
        }
        
        res.status(201).json({
            message: 'OAuth client created successfully',
            client: {
                id: result.client.id,
                client_id: result.client.client_id,
                client_secret: result.client_secret, // Only returned on creation!
                name: result.client.name,
                redirect_uris: result.client.redirect_uris
            },
            warning: result.client_secret ? 'Store the client_secret securely. It will not be shown again.' : undefined
        });
        });
        
    } catch (error: unknown) {
        console.error('Error creating OAuth client:', error);
        if (error instanceof ServiceError && error.code === 'SERVICE_UNAVAILABLE') {
            return res.status(503).json({ 
                error: 'OAuth service is currently unavailable',
                message: 'Required database tables are missing. Please contact your administrator.'
            });
        }
        res.status(500).json({ error: 'Failed to create OAuth client' });
    }
});

// ============================================================================
// Update OAuth Client
// ============================================================================

/**
 * Update OAuth client
 * PUT /admin/oauth-clients/:id
 */
router.put('/:id', [
    param('id').isUUID(),
    body('name').optional().notEmpty().trim(),
    body('redirect_uris').optional().isArray({ min: 1 }),
    body('redirect_uris.*').optional().isURL({ require_tld: false }),
    body('allowed_scopes').optional().isArray(),
    body('access_token_lifetime').optional().isInt({ min: 60, max: 86400 }),
    body('refresh_token_lifetime').optional().isInt({ min: 3600, max: 31536000 }),
    body('require_pkce').optional().isBoolean(),
    body('require_consent').optional().isBoolean(),
    body('is_active').optional().isBoolean()
], requirePermission('settings', 'manage'), async (req: AdminRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    
    try {
        // Build update data object
        const updateData: any = {};
        
        const allowedFields = [
            'name', 'description', 'logoUrl', 'homepageUrl', 'privacyPolicyUrl',
            'termsOfServiceUrl', 'redirectUris', 'allowedScopes', 'defaultScopes',
            'accessTokenLifetime', 'refreshTokenLifetime', 'idTokenLifetime',
            'requirePkce', 'requireConsent', 'firstParty', 'isActive'
        ];
        
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                const value = ['redirectUris', 'allowedScopes', 'defaultScopes'].includes(field)
                    ? JSON.stringify(req.body[field])
                    : req.body[field];
                updateData[field] = value;
            }
        }
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        const updatedClient = await prisma.oAuthClient.update({
            where: { id: req.params.id },
            data: updateData
        });
        
        if (!updatedClient) {
            return res.status(404).json({ error: 'OAuth client not found' });
        }
        
        res.json({ message: 'OAuth client updated successfully' });
        
    } catch (error: unknown) {
        console.error('Error updating OAuth client:', error);
        res.status(500).json({ error: 'Failed to update OAuth client' });
    }
});

// ============================================================================
// Regenerate Client Secret
// ============================================================================

/**
 * Regenerate client secret
 * POST /admin/oauth-clients/:id/regenerate-secret
 */
router.post('/:id/regenerate-secret', [
    param('id').isUUID()
], requirePermission('settings', 'manage'), async (req: AdminRequest, res: Response) => {
    try {
        // Check if client exists and is confidential
        const client = await prisma.oAuthClient.findUnique({
            where: { id: req.params.id },
            select: { clientType: true }
        });
        
        if (!client) {
            return res.status(404).json({ error: 'OAuth client not found' });
        }
        
        if (client.clientType === 'public') {
            return res.status(400).json({ error: 'Public clients do not have a secret' });
        }
        
        // Generate new secret
        const newSecret = crypto.randomBytes(32).toString('base64url');
        const newSecretHash = await bcrypt.hash(newSecret, 12);
        
        await prisma.oAuthClient.update({
            where: { id: req.params.id },
            data: { 
                clientSecretHash: newSecretHash,
                updatedAt: new Date()
            }
        });
        
        res.json({
            message: 'Client secret regenerated successfully',
            client_secret: newSecret,
            warning: 'Store the client_secret securely. It will not be shown again.'
        });
        
    } catch (error: unknown) {
        console.error('Error regenerating client secret:', error);
        res.status(500).json({ error: 'Failed to regenerate client secret' });
    }
});

// ============================================================================
// Delete OAuth Client
// ============================================================================

/**
 * Delete OAuth client
 * DELETE /admin/oauth-clients/:id
 */
router.delete('/:id', [
    param('id').isUUID()
], requirePermission('settings', 'manage'), async (req: AdminRequest, res: Response) => {
    try {
        const deletedClient = await prisma.oAuthClient.delete({
            where: { id: req.params.id }
        });
        
        if (!deletedClient) {
            return res.status(404).json({ error: 'OAuth client not found' });
        }
        
        res.json({ message: 'OAuth client deleted successfully' });
        
    } catch (error: unknown) {
        console.error('Error deleting OAuth client:', error);
        res.status(500).json({ error: 'Failed to delete OAuth client' });
    }
});

// ============================================================================
// Get Client Consents
// ============================================================================

/**
 * Get users who have granted consent to a client
 * GET /admin/oauth-clients/:id/consents
 */
router.get('/:id/consents', [
    param('id').isUUID()
], requirePermission('settings', 'view'), async (req: AdminRequest, res: Response) => {
    try {
        const { page = '1', limit = '20' } = req.query;
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        const consents = await prisma.oAuthUserConsent.findMany({
            where: { clientId: req.params.id },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: parseInt(limit as string)
        });
        
        const total = await prisma.oAuthUserConsent.count({
            where: { clientId: req.params.id }
        });
        
        res.json({
            data: consents.map((consent: any) => ({
                id: consent.id,
                user_id: consent.userId,
                user_email: undefined,
                user_first_name: undefined,
                user_last_name: undefined,
                granted_at: consent.createdAt,
                expires_at: consent.expiresAt,
                revoked_at: consent.revokedAt,
                scopes: consent.scopes,
                ip_address: consent.ipAddress,
                user_agent: consent.userAgent
            })),
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages: Math.ceil(total / parseInt(limit as string))
            }
        });
        
    } catch (error: unknown) {
        console.error('Error fetching consents:', error);
        res.status(500).json({ error: 'Failed to fetch consents' });
    }
});

/**
 * Revoke specific user consent
 * DELETE /admin/oauth-clients/:id/consents/:userId
 */
router.delete('/:id/consents/:userId', [
    param('id').isUUID(),
    param('userId').isUUID()
], requirePermission('settings', 'manage'), async (req: AdminRequest, res: Response) => {
    try {
        await oauthServiceWrapper.wrapCall(async () => {
            if (!SSOProvider) {
                throw new ServiceError('SSOProvider service not available', 'SERVICE_UNAVAILABLE');
            }
            await SSOProvider.revokeUserConsent(req.params.userId, req.params.id);
            return null;
        });
        res.json({ message: 'User consent revoked successfully' });
    } catch (error: unknown) {
        console.error('Error revoking user consent:', error);
        if (error instanceof ServiceError && error.code === 'SERVICE_UNAVAILABLE') {
            return res.status(503).json({ 
                error: 'OAuth service is currently unavailable',
                message: 'Required database tables are missing. Please contact your administrator.'
            });
        }
        res.status(500).json({ error: 'Failed to revoke user consent' });
    }
});

// ============================================================================
// Revoke All Tokens for Client
// ============================================================================

/**
 * Revoke all tokens for a client
 * POST /admin/oauth-clients/:id/revoke-all-tokens
 */
router.post('/:id/revoke-all-tokens', [
    param('id').isUUID()
], requirePermission('settings', 'manage'), async (req: AdminRequest, res: Response) => {
    try {
        // Revoke access tokens
        const revokedAccessTokens = await prisma.oAuthAccessToken.updateMany({
            where: { 
                clientId: req.params.id,
                isRevoked: false 
            },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
                revokedReason: 'Admin revocation'
            }
        });
        
        // Revoke refresh tokens
        const revokedRefreshTokens = await prisma.oAuthRefreshToken.updateMany({
            where: { 
                clientId: req.params.id,
                isRevoked: false 
            },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
                revokedReason: 'Admin revocation'
            }
        });
        
        res.json({
            message: 'All tokens revoked',
            revoked: {
                access_tokens: revokedAccessTokens.count,
                refresh_tokens: revokedRefreshTokens.count
            }
        });
        
    } catch (error: unknown) {
        console.error('Error revoking tokens:', error);
        res.status(500).json({ error: 'Failed to revoke tokens' });
    }
});

// ============================================================================
// OAuth Audit Log
// ============================================================================

/**
 * Get OAuth audit log
 * GET /admin/oauth-clients/audit-log
 */
router.get('/audit-log', [
    query('client_id').optional().isUUID(),
    query('user_id').optional().isUUID(),
    query('event_type').optional()
], requirePermission('audit', 'view'), async (req: AdminRequest, res: Response) => {
    try {
        const { page = '1', limit = '50', client_id, user_id, event_type } = req.query;
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        // Build where conditions for Prisma
        const whereConditions: any = {};
        
        if (client_id) {
            whereConditions.clientId = client_id;
        }
        
        if (user_id) {
            whereConditions.userId = user_id;
        }
        
        if (event_type) {
            whereConditions.eventType = event_type;
        }
        
        const auditLogs = await prisma.oAuthAuditLog.findMany({
            where: whereConditions,
            include: {
                client: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: parseInt(limit as string)
        });
        
        const total = await prisma.oAuthAuditLog.count({
            where: whereConditions
        });
        
        res.json({
            data: auditLogs.map((log: any) => ({
                id: log.id,
                client_id: log.clientId,
                user_id: log.userId,
                event_type: log.eventType,
                event_data: log.eventData,
                ip_address: log.ipAddress,
                user_agent: log.userAgent,
                created_at: log.createdAt,
                client_name: log.client?.name,
                user_email: log.user?.email
            })),
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages: Math.ceil(total / parseInt(limit as string))
            }
        });
        
    } catch (error: unknown) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({ error: 'Failed to fetch audit log' });
    }
});

export default router;
