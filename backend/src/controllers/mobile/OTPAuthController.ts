import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/UserModel';
import { config } from '../../config/env';
import emailService from '../../services/emailService';

export class OTPAuthController {
    // Check if user exists
    async checkUserExistence(req: any, res: Response) {
        try {
            const { email, phone } = req.body;
            const identifier = email || phone;

            if (!identifier) {
                return res.status(400).json({
                    success: false,
                    message: 'Email or phone number is required'
                });
            }

            console.log(`[AUTH DEBUG] RAW REQUEST BODY:`, JSON.stringify(req.body));
            let user = null;
            console.log(`[AUTH DEBUG] checkUserExistence - email: "${email}", phone: "${phone}"`);
            if (email) {
                user = await UserModel.findByEmail(email);
                console.log(`[AUTH DEBUG] findByEmail result:`, user ? `Found user ID: ${user.id}` : 'Not found');
            } else if (phone) {
                user = await UserModel.findOne({ phone });
                console.log(`[AUTH DEBUG] findOne(phone) result:`, user ? `Found user ID: ${user.id}` : 'Not found');
            }

            const exists = !!user;
            console.log(`[AUTH] Check user existence for ${identifier}: ${exists}`);

            res.json({
                success: true,
                exists,
                message: exists ? 'User found' : 'User not found',
                debug: {
                    receivedBody: req.body,
                    checkedEmail: email,
                    checkedPhone: phone,
                    note: 'This is debug info to verify data transmission'
                }
            });

        } catch (error) {
            console.error('Check user existence failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check user existence'
            });
        }
    }

    // Request OTP for login
    async requestLoginOtp(req: any, res: Response) {
        try {
            const { email, phone } = req.body;
            const identifier = email || phone;

            if (!identifier) {
                return res.status(400).json({
                    success: false,
                    message: 'Email or phone number is required'
                });
            }

            let user = null;
            if (email) {
                user = await UserModel.findByEmail(email);
            } else if (phone) {
                user = await UserModel.findOne({ phone });
            }

            if (!user) {
                // Create temporary user for signup verification
                const tempPassword = Math.random().toString(36).slice(-8);
                console.log(`[AUTH] Creating temporary user for new signup: ${identifier}`);
                user = await UserModel.create({
                    email: email || undefined,
                    password: tempPassword,
                    firstName: 'New',
                    lastName: 'User',
                    phone: phone,
                    isEmailVerified: false,
                    isActive: false,
                    isOnboardingComplete: false,
                    preferences: {},
                });
            }

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Update user with OTP
            await UserModel.findByIdAndUpdate(user.id, {
                loginOtp: otp,
                loginOtpExpiry: expiry
            });

            // Send Email or Log for Phone
            if (user.email) {
                await emailService.sendEmail({
                    to: user.email,
                    subject: 'Your Login Code - Bondarys',
                    template: 'login-otp',
                    data: {
                        firstName: user.firstName,
                        otp: otp,
                        appName: 'Bondarys',
                    },
                });
            }

            console.log(`[AUTH] Login OTP for ${identifier}: ${otp}`);

            res.json({
                success: true,
                message: 'OTP sent successfully'
            });

        } catch (error) {
            console.error('Request OTP failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP'
            });
        }
    }

    // Verify OTP and Login
    async loginWithOtp(req: any, res: Response) {
        try {
            const { email, phone, otp } = req.body;
            const identifier = email || phone;

            if (!identifier || !otp) {
                return res.status(400).json({
                    success: false,
                    message: 'Identifier and OTP are required'
                });
            }

            let user = null;
            if (email) {
                user = await UserModel.findByEmail(email);
            } else if (phone) {
                user = await UserModel.findOne({ phone });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Retrieve OTP from user metadata
            const storedOtp = user.metadata?.loginOtp;
            const storedExpiry = user.metadata?.loginOtpExpiry;

            // Validation
            if (!storedOtp || storedOtp !== otp) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid OTP'
                });
            }

            if (storedExpiry && new Date(storedExpiry) < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'OTP has expired'
                });
            }

            // Clear OTP
            await UserModel.findByIdAndUpdate(user.id, {
                loginOtp: null,
                loginOtpExpiry: null
            });

            // Generate Tokens
            const accessToken = this.generateAccessToken(user.id);
            const refreshToken = this.generateRefreshToken(user.id);

            user.refreshTokens.push(refreshToken);
            user.lastLogin = new Date();

            await UserModel.findByIdAndUpdate(user.id, {
                refreshTokens: user.refreshTokens,
                lastLogin: user.lastLogin
            });

            const userResponse = this.sanitizeUser(user);

            console.log(`[AUTH] OTP Login successful for: ${identifier}`);
            console.log(`[AUTH] Response User Object Keys:`, Object.keys(userResponse));
            console.log(`[AUTH] Response User ID:`, userResponse.id);
            console.log(`[AUTH] Response User Email:`, userResponse.email);

            res.json({
                success: true,
                message: 'Login successful',
                user: userResponse,
                accessToken,
                refreshToken,
            });

        } catch (error) {
            console.error('OTP Login failed:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed'
            });
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

export const otpAuthController = new OTPAuthController();
