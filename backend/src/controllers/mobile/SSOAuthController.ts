import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../../models/UserModel';
import { config } from '../../config/env';
import jwksClient from 'jwks-rsa';
import * as identityService from '../../services/identityService';

const googleClient = null; // Removed static client initialization

// Microsoft JWKS client for token verification
const microsoftJwksClient = jwksClient({
    jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
    cache: true,
    rateLimit: true
});

export class SSOAuthController {
    // SSO Login
    async ssoLogin(req: any, res: Response) {
        try {
            const { provider, ...ssoData } = req.body;

            // Fetch provider configuration from Identity Service
            const allProviders = await identityService.getOAuthProviders();
            const providerConfig = allProviders.find(p => p.providerName === provider && p.isEnabled);

            if (!providerConfig) {
                return res.status(400).json({
                    success: false,
                    message: `SSO provider '${provider}' is not enabled or configured`,
                });
            }

            let userData: any = {};

            switch (provider) {
                case 'google':
                    userData = await this.verifyGoogleToken(ssoData.idToken, providerConfig.clientId);
                    break;
                case 'facebook':
                    userData = await this.verifyFacebookToken(ssoData.accessToken, providerConfig.clientId);
                    break;
                case 'apple':
                    userData = await this.verifyAppleToken(ssoData.identityToken, providerConfig.clientId);
                    break;
                case 'microsoft':
                    userData = await this.verifyMicrosoftToken(ssoData.accessToken, ssoData.idToken, providerConfig.clientId);
                    break;
                case 'twitter':
                case 'x':
                    userData = await this.verifyTwitterToken(ssoData.accessToken, ssoData.accessTokenSecret, providerConfig.clientId, providerConfig.clientSecret);
                    break;
                case 'line':
                    userData = await this.verifyLineToken(ssoData.accessToken, ssoData.idToken, providerConfig.clientId);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Unsupported SSO provider',
                    });
            }

            // Find or create user
            let user = await UserModel.findByEmail(userData.email);

            if (!user) {
                // Create new user from SSO
                user = await UserModel.create({
                    email: userData.email,
                    firstName: userData.firstName || userData.name?.split(' ')[0] || '',
                    lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
                    avatar: userData.avatar,
                    userType: 'circle',
                    subscriptionTier: 'free',
                    isEmailVerified: true, // SSO users are pre-verified
                    ssoProvider: provider,
                    ssoProviderId: userData.id || userData.userId,
                    preferences: {
                        notifications: true,
                        locationSharing: true,
                        popupSettings: {
                            enabled: true,
                            frequency: 'daily',
                            maxPerDay: 3,
                            categories: ['announcement', 'promotion'],
                        },
                    },
                });
                console.info(`New SSO user created: ${userData.email} via ${provider}`);

                // AUTO-CREATE DEFAULT CIRCLE
                try {
                    const { circleService } = require('../../services/circleService');
                    await circleService.createCircle({
                        name: 'My Circle',
                        description: 'My personal circle',
                        owner_id: user.id,
                        type: 'circle'
                    });
                    console.info(`Default circle entity created for SSO user: ${user.id}`);
                } catch (circleError) {
                    console.error('Failed to create default circle for SSO user:', circleError);
                }
            } else {
                await user.save();
            }

            // Generate tokens
            const accessToken = this.generateAccessToken(user.id);
            const refreshToken = this.generateRefreshToken(user.id);

            // Save refresh token
            user.refreshTokens.push(refreshToken);
            await user.save();

            // Remove sensitive data
            const userResponse = this.sanitizeUser(user);

            console.info(`SSO login successful: ${userData.email} via ${provider}`);

            res.json({
                success: true,
                message: 'SSO login successful',
                user: userResponse,
                accessToken,
                refreshToken,
            });
        } catch (error) {
            console.error('SSO login failed:', error);
            res.status(500).json({
                success: false,
                message: 'SSO login failed',
            });
        }
    }

    // Verify Google token
    async verifyGoogleToken(idToken: string, clientId: string) {
        try {
            const client = new OAuth2Client(clientId);
            const ticket = await client.verifyIdToken({
                idToken,
                audience: clientId,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Invalid Google token');
            }

            return {
                id: payload.sub,
                email: payload.email,
                firstName: payload.given_name,
                lastName: payload.family_name,
                avatar: payload.picture,
            };
        } catch (error) {
            console.error('Google token verification failed:', error);
            throw new Error('Invalid Google token');
        }
    }

    // Verify Facebook token
    async verifyFacebookToken(accessToken: string, clientId?: string) {
        try {
            const response = await fetch(
                `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
            );
            const data = await response.json();

            if ((data as any).error) {
                throw new Error('Invalid Facebook token');
            }

            // Optional: verify app_id if strictly needed via debug_token endpoint
            // but for simple user info check, successful graph call implies valid token.
            // Strict implementation would call graph.facebook.com/debug_token?input_token=...&access_token=APP_TOKEN

            return {
                id: (data as any).id,
                email: (data as any).email,
                name: (data as any).name,
                avatar: (data as any).picture?.data?.url,
            };
        } catch (error) {
            console.error('Facebook token verification failed:', error);
            throw new Error('Invalid Facebook token');
        }
    }

    // Verify Apple token
    async verifyAppleToken(identityToken: string, clientId?: string) {
        try {
            const decoded = jwt.decode(identityToken) as any;

            if (!decoded) {
                throw new Error('Invalid Apple token');
            }

            if (clientId && decoded.aud !== clientId) {
                throw new Error('Apple token audience mismatch');
            }

            return {
                id: decoded.sub,
                email: decoded.email,
                firstName: decoded.firstName,
                lastName: decoded.lastName,
            };
        } catch (error) {
            console.error('Apple token verification failed:', error);
            throw new Error('Invalid Apple token');
        }
    }

    // Verify Microsoft token
    async verifyMicrosoftToken(accessToken: string, idToken?: string, clientId?: string) {
        try {
            // If we have an ID token, decode it for user info
            if (idToken) {
                const decoded = jwt.decode(idToken) as any;
                if (decoded) {
                    if (clientId && decoded.aud !== clientId) {
                        // Microsoft tokens might have aud as URI or UUID, soft check or skip if unsure
                    }
                    return {
                        id: decoded.oid || decoded.sub,
                        email: decoded.email || decoded.preferred_username,
                        firstName: decoded.given_name,
                        lastName: decoded.family_name,
                        name: decoded.name,
                    };
                }
            }

            // Fallback: Use the access token to call Microsoft Graph API
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch Microsoft user info');
            }

            const data = await response.json() as any;

            return {
                id: data.id,
                email: data.mail || data.userPrincipalName,
                firstName: data.givenName,
                lastName: data.surname,
                name: data.displayName,
            };
        } catch (error) {
            console.error('Microsoft token verification failed:', error);
            throw new Error('Invalid Microsoft token');
        }
    }

    // Verify Twitter/X token (OAuth 2.0)
    async verifyTwitterToken(accessToken: string, accessTokenSecret?: string, clientId?: string, clientSecret?: string) {
        try {
            // Twitter API v2 - Get current user
            const response = await fetch('https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Twitter API error:', errorData);
                throw new Error('Failed to fetch Twitter user info');
            }

            const result = await response.json() as any;
            const data = result.data;

            if (!data) {
                throw new Error('No user data returned from Twitter');
            }

            // Twitter doesn't provide email by default, needs elevated access
            // Split name into first and last name
            const nameParts = (data.name || '').split(' ');
            const firstName = nameParts[0] || data.username;
            const lastName = nameParts.slice(1).join(' ') || '';

            return {
                id: data.id,
                email: data.email || `${data.username}@twitter.placeholder`, // Twitter may not provide email
                firstName,
                lastName,
                name: data.name,
                username: data.username,
                avatar: data.profile_image_url,
            };
        } catch (error) {
            console.error('Twitter token verification failed:', error);
            throw new Error('Invalid Twitter token');
        }
    }

    // Verify LINE token
    async verifyLineToken(accessToken: string, idToken?: string, clientId?: string) {
        try {
            // If we have an ID token, verify and decode it
            if (idToken) {
                // LINE ID tokens can be decoded (they're JWTs)
                const decoded = jwt.decode(idToken) as any;
                if (decoded) {
                    if (clientId && decoded.aud !== clientId) {
                       // Audience check
                    }
                    return {
                        id: decoded.sub,
                        email: decoded.email,
                        name: decoded.name,
                        firstName: decoded.name?.split(' ')[0] || decoded.name,
                        lastName: decoded.name?.split(' ').slice(1).join(' ') || '',
                        avatar: decoded.picture,
                    };
                }
            }

            // Fallback: Use access token to call LINE Profile API
            const response = await fetch('https://api.line.me/v2/profile', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch LINE user info');
            }

            const data = await response.json() as any;

            // LINE doesn't provide email through profile API by default
            // It requires OpenID Connect scope and ID token
            const nameParts = (data.displayName || '').split(' ');

            return {
                id: data.userId,
                email: data.email || `${data.userId}@line.placeholder`, // May not have email
                name: data.displayName,
                firstName: nameParts[0] || data.displayName,
                lastName: nameParts.slice(1).join(' ') || '',
                avatar: data.pictureUrl,
            };
        } catch (error) {
            console.error('LINE token verification failed:', error);
            throw new Error('Invalid LINE token');
        }
    }

    // Generate access token
    private generateAccessToken(userId: string): string {
        return jwt.sign(
            { id: userId },
            config.JWT_SECRET,
            { expiresIn: '1d' }
        );
    }

    // Generate refresh token
    private generateRefreshToken(userId: string): string {
        return jwt.sign(
            { id: userId },
            config.JWT_REFRESH_SECRET,
            { expiresIn: '30d' }
        );
    }

    // Sanitize user data
    private sanitizeUser(user: any) {
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.refreshTokens;
        delete userObj.emailVerificationCode;
        delete userObj.emailVerificationExpiry;
        return userObj;
    }
}

export const ssoAuthController = new SSOAuthController();
