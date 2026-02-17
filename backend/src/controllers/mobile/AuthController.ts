import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/UserModel';
import { config } from '../../config/env';
import emailService from '../../services/emailService';

// Import specialized controllers
import { ssoAuthController } from './SSOAuthController';
import { otpAuthController } from './OTPAuthController';

export class AuthController {
    // ============================
    // Delegate methods to specialized controllers
    // ============================

    // SSO Login - delegate to SSOAuthController
    async ssoLogin(req: any, res: Response) {
        return ssoAuthController.ssoLogin(req, res);
    }

    // Check if user exists - delegate to OTPAuthController
    async checkUserExistence(req: any, res: Response) {
        return otpAuthController.checkUserExistence(req, res);
    }

    // Request OTP for login - delegate to OTPAuthController
    async requestLoginOtp(req: any, res: Response) {
        return otpAuthController.requestLoginOtp(req, res);
    }

    // Verify OTP and Login - delegate to OTPAuthController
    async loginWithOtp(req: any, res: Response) {
        return otpAuthController.loginWithOtp(req, res);
    }

    // ============================
    // Core Authentication Methods
    // ============================

    // Register new user
    async register(req: any, res: Response) {
        try {
            const {
                email,
                password,
                firstName,
                lastName,
                phone,
                dateOfBirth,
                userType,
            } = req.body;

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser && existingUser.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists',
                });
            }

            // Hash password
            let hashedPassword = undefined;
            if (password) {
                const saltRounds = 12;
                hashedPassword = await bcrypt.hash(password, saltRounds);
            } else {
                const randomPass = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
                hashedPassword = await bcrypt.hash(randomPass, 12);
            }

            // Create verification code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

            let user;
            if (existingUser && !existingUser.isActive) {
                // Update existing temporary user
                await UserModel.findByIdAndUpdate(existingUser.id, {
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    date_of_birth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                    user_type: userType || 'circle',
                    password_hash: hashedPassword,
                    is_active: true,
                    is_email_verified: true
                });
                user = await UserModel.findById(existingUser.id);
                if (!user) throw new Error('Failed to update user');
            } else {
                user = await UserModel.create({
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    phone,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                    userType: userType || 'circle',
                    subscriptionTier: 'free',
                    isEmailVerified: true,
                    isActive: true,
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
            }

            // Generate tokens for immediate login
            const accessToken = this.generateAccessToken(user.id);
            const refreshToken = this.generateRefreshToken(user.id);

            // Save refresh token
            user.refreshTokens = [refreshToken];
            await user.save();

            // AUTO-CREATE DEFAULT CIRCLE
            try {
                const { circleService } = require('../../services/circleService');
                const circle = await circleService.createCircle({
                    name: 'My Circle',
                    description: 'My personal circle',
                    owner_id: user.id,
                    type: 'circle'
                });
                console.info(`Default circle entity created for user: ${user.id} (Circle ID: ${circle.id})`);
            } catch (circleError) {
                console.error('Failed to create default circle entity:', circleError);
            }

            const userResponse = this.sanitizeUser(user);
            console.info(`New user registered (immediate verification): ${email}`);

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                user: userResponse,
                accessToken,
                refreshToken,
            });
        } catch (error) {
            console.error('Registration failed:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed',
            });
        }
    }

    // Login user
    async login(req: any, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password || '');
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                });
            }

            if (!user.isEmailVerified) {
                return res.status(401).json({
                    success: false,
                    message: 'Please verify your email before logging in',
                });
            }

            console.log('[AUTH] Generating token for user ID:', user.id, 'email:', user.email);
            const accessToken = this.generateAccessToken(user.id);
            const refreshToken = this.generateRefreshToken(user.id);

            user.refreshTokens.push(refreshToken);
            user.lastLogin = new Date();
            await user.save();

            const userResponse = this.sanitizeUser(user);
            console.info(`User logged in: ${email}`);

            res.json({
                success: true,
                message: 'Login successful',
                user: userResponse,
                accessToken,
                refreshToken,
            });
        } catch (error) {
            console.error('Login failed:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed',
            });
        }
    }

    // Get current user
    async getCurrentUser(req: any, res: Response) {
        try {
            const userId = req.user?.id;

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            const userResponse = this.sanitizeUser(user);

            res.json({
                success: true,
                user: userResponse,
            });
        } catch (error) {
            console.error('Get current user failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user data',
            });
        }
    }

    // Refresh token
    async refreshToken(req: any, res: Response) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required',
                });
            }

            // DEV BYPASS: Handle "mock-refresh-token"
            if (refreshToken === 'mock-refresh-token') {
                const TEST_USER_ID = 'f739edde-45f8-4aa9-82c8-c1876f434683';
                const user = await UserModel.findById(TEST_USER_ID);
                if (!user) {
                    return res.status(401).json({ success: false, message: 'Test user not found' });
                }
                const newAccessToken = this.generateAccessToken(user.id);
                return res.json({
                    success: true,
                    accessToken: newAccessToken,
                    refreshToken: 'mock-refresh-token',
                });
            }

            // Verify refresh token
            let decoded;
            try {
                decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
                console.log('[AUTH] Refresh token verified for user ID:', decoded.id || decoded.userId);
            } catch (verifyError) {
                console.error('[AUTH ERROR] Refresh token verification failed:', verifyError);
                return res.status(401).json({
                    success: false,
                    message: verifyError instanceof jwt.TokenExpiredError ? 'Refresh token expired' : 'Invalid refresh token'
                });
            }

            const user = await UserModel.findById(decoded.id || decoded.userId);
            if (!user) {
                console.error('[AUTH ERROR] Refresh token user not found:', decoded.id || decoded.userId);
                return res.status(401).json({
                    success: false,
                    message: 'User associated with token no longer exists',
                });
            }

            if (!user.refreshTokens.includes(refreshToken)) {
                console.error('[AUTH ERROR] Refresh token not in user whitelist. User email:', user.email);
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token has been revoked or session invalidated',
                });
            }

            const newAccessToken = this.generateAccessToken(user.id);
            const newRefreshToken = this.generateRefreshToken(user.id);

            user.refreshTokens = user.refreshTokens.filter((token: any) => token !== refreshToken);
            user.refreshTokens.push(newRefreshToken);
            await user.save();

            console.log('[AUTH] Token rotation successful for user:', user.email);

            res.json({
                success: true,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });
        } catch (error) {
            console.error('[AUTH CRITICAL ERROR] Token refresh failed:', error);
            res.status(401).json({
                success: false,
                message: 'Authentication failure during refresh',
            });
        }
    }

    // Logout
    async logout(req: any, res: Response) {
        try {
            const { refreshToken } = req.body;
            const userId = req.user?.id;

            if (refreshToken && userId) {
                await UserModel.findByIdAndUpdate(userId, {
                    $pull: { refreshTokens: refreshToken },
                });
            }

            console.info(`User logged out: ${userId}`);

            res.json({
                success: true,
                message: 'Logout successful',
            });
        } catch (error) {
            console.error('Logout failed:', error);
            res.status(500).json({
                success: false,
                message: 'Logout failed',
            });
        }
    }

    // ============================
    // Email Verification Methods
    // ============================

    // Verify email
    async verifyEmail(req: any, res: Response) {
        try {
            const { email, code } = req.body;

            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already verified',
                });
            }

            if (user.emailVerificationCode !== code) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid verification code',
                });
            }

            if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Verification code has expired',
                });
            }

            user.isEmailVerified = true;
            user.emailVerificationCode = undefined;
            user.emailVerificationExpiry = undefined;
            await user.save();

            console.info(`Email verified: ${email}`);

            const accessToken = this.generateAccessToken(user.id);
            const refreshToken = this.generateRefreshToken(user.id);

            user.refreshTokens.push(refreshToken);
            user.lastLogin = new Date();
            await user.save();

            const userResponse = this.sanitizeUser(user);

            res.json({
                success: true,
                message: 'Email verified successfully',
                user: userResponse,
                accessToken,
                refreshToken
            });
        } catch (error) {
            console.error('Email verification failed:', error);
            res.status(500).json({
                success: false,
                message: 'Email verification failed',
            });
        }
    }

    // Resend verification email
    async resendVerification(req: any, res: Response) {
        try {
            const { email } = req.body;

            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already verified',
                });
            }

            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

            user.emailVerificationCode = verificationCode;
            user.emailVerificationExpiry = verificationExpiry;
            await user.save();

            await emailService.sendEmail({
                to: email,
                subject: 'Bondarys - Verify Your Email',
                template: 'email-verification',
                data: {
                    firstName: user.firstName,
                    verificationCode,
                    appName: 'Bondarys',
                },
            });

            console.info(`Verification email resent: ${email}`);

            res.json({
                success: true,
                message: 'Verification email sent successfully',
            });
        } catch (error) {
            console.error('Resend verification failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email',
            });
        }
    }

    // ============================
    // Onboarding Methods
    // ============================

    // Complete onboarding
    async completeOnboarding(req: any, res: Response) {
        try {
            const userId = req.user?.id;

            const user = await UserModel.findByIdAndUpdate(
                userId,
                { isOnboardingComplete: true }
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            const fullUser = await UserModel.findById(user.id);
            if (!fullUser) throw new Error('User lost after update');

            const userResponse = this.sanitizeUser(fullUser);
            console.info(`Onboarding completed: ${fullUser.email}`);

            res.json({
                success: true,
                message: 'Onboarding completed successfully',
                user: userResponse,
            });
        } catch (error) {
            console.error('Onboarding completion failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to complete onboarding',
            });
        }
    }

    // ============================
    // Helper Methods
    // ============================

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
