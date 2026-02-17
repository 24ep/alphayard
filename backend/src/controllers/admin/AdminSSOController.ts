import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { AdminRequest } from '../../middleware/adminAuth';
import { config } from '../../config/env';
import { logger } from '../../middleware/logger';
import * as identityService from '../../services/identityService';

export class AdminSSOController {
    /**
     * Admin SSO Login
     * Handles SSO authentication for admin users
     */
    async ssoLogin(req: any, res: Response) {
        try {
            const { provider, ...ssoData } = req.body;
            logger.info(`[AdminSSO] SSO login attempt for provider: ${provider}`);

            // Fetch provider configuration from Identity Service
            const allProviders = await identityService.getOAuthProviders();
            const providerConfig = allProviders.find((p: any) => p.providerName === provider && p.isEnabled);

            if (!providerConfig) {
                return res.status(400).json({
                    success: false,
                    message: `SSO provider '${provider}' is not enabled or configured`,
                });
            }

            let userData: any = {};

            // Verify SSO token based on provider
            switch (provider) {
                case 'google':
                    userData = await this.verifyGoogleToken(ssoData.idToken, providerConfig.clientId);
                    break;
                case 'microsoft':
                    userData = await this.verifyMicrosoftToken(ssoData.accessToken, ssoData.idToken, providerConfig.clientId);
                    break;
                case 'github':
                    userData = await this.verifyGitHubToken(ssoData.accessToken, providerConfig.clientId);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: `Provider '${provider}' is not supported for admin login`,
                    });
            }

            // Check if user exists as admin user
            const adminUser = await prisma.adminUser.findUnique({
                where: {
                    email: userData.email.toLowerCase(),
                    isActive: true
                },
                include: {
                    role: {
                        include: {
                            rolePermissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            });

            if (!adminUser) {
                logger.warn(`[AdminSSO] No admin user found for SSO email: ${userData.email}`);
                return res.status(401).json({
                    success: false,
                    message: 'This account is not authorized for admin access'
                });
            }

            // Update last login
            await prisma.adminUser.update({
                where: { id: adminUser.id },
                data: { lastLoginAt: new Date() }
            });

            // Extract permissions from role
            let permissions: string[] = [];
            if (adminUser.role?.rolePermissions) {
                permissions = adminUser.role.rolePermissions.map(rp => 
                    `${rp.permission.module}:${rp.permission.action}`
                );
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: adminUser.id,
                    adminId: adminUser.id,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: adminUser.role?.name || null,
                    permissions,
                    type: 'admin',
                    ssoProvider: provider
                },
                config.JWT_SECRET,
                { expiresIn: '24h' }
            );

            logger.info(`[AdminSSO] Successful SSO login for: ${adminUser.email} via ${provider}`);

            res.json({
                success: true,
                token,
                user: {
                    id: adminUser.id,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: adminUser.role?.name || null,
                    permissions,
                    ssoProvider: provider
                }
            });

        } catch (error: any) {
            logger.error('[AdminSSO] SSO login error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'SSO authentication failed'
            });
        }
    }

    /**
     * Verify Google ID token
     */
    private async verifyGoogleToken(idToken: string, clientId: string): Promise<any> {
        const { OAuth2Client } = await import('google-auth-library');
        const client = new OAuth2Client(clientId);
        
        const ticket = await client.verifyIdToken({
            idToken,
            audience: clientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error('Invalid Google token');
        }

        return {
            email: payload.email,
            name: payload.name,
            firstName: payload.given_name,
            lastName: payload.family_name,
            avatar: payload.picture
        };
    }

    /**
     * Verify Microsoft token
     */
    private async verifyMicrosoftToken(accessToken: string, idToken: string, clientId: string): Promise<any> {
        // For Microsoft, we'd typically verify the ID token
        // This is a simplified version - in production you'd want proper token verification
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Invalid Microsoft token');
        }

        const userData: any = await response.json();
        
        return {
            email: userData.mail || userData.userPrincipalName,
            name: userData.displayName,
            firstName: userData.givenName,
            lastName: userData.surname,
            avatar: null
        };
    }

    /**
     * Verify GitHub token
     */
    private async verifyGitHubToken(accessToken: string, clientId: string): Promise<any> {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Invalid GitHub token');
        }

        const userData: any = await response.json();
        
        // Get user email (GitHub requires separate API call for email)
        const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
                'Authorization': `token ${accessToken}`
            }
        });

        const emails = await emailResponse.json() as any[];
        const primaryEmail = emails.find((email: any) => email.primary && email.verified);

        if (!primaryEmail) {
            throw new Error('No verified email found for GitHub user');
        }

        return {
            email: primaryEmail.email,
            name: userData.name || userData.login,
            firstName: userData.name?.split(' ')[0] || userData.login,
            lastName: userData.name?.split(' ')[1] || '',
            avatar: userData.avatar_url
        };
    }
}

export const adminSSOController = new AdminSSOController();
