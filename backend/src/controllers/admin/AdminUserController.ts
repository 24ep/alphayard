import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { AdminRequest } from '../../middleware/adminAuth';
import { config } from '../../config/env';
import { logger } from '../../middleware/logger';

export class AdminUserController {

    /**
     * Admin login with database-backed authentication
     */
    async login(req: any, res: Response) {
        try {
            const { email, password } = req.body;
            logger.info(`[AdminLogin] Attempt for email: ${email}, password length: ${password ? password.length : 0}`);

            if (!email || !password) {
                logger.warn('[AdminLogin] Missing email or password');
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Find admin user with role information
            const adminUser = await prisma.adminUser.findUnique({
                where: {
                    email: email.toLowerCase(),
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
                logger.warn(`[AdminLogin] No active admin user found for: ${email}`);
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            logger.info(`[AdminLogin] Found user: ${adminUser.email}, hashing comparison...`);

            // Verify password
            const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
            if (!isValidPassword) {
                logger.warn(`[AdminLogin] Password mismatch for: ${email}`);
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            logger.info(`[AdminLogin] Success for: ${email}`);

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
                    type: 'admin'
                },
                this.getJwtSecret(),
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: adminUser.id,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: adminUser.role?.name || null,
                    permissions
                }
            });
        } catch (error: any) {
            console.error('Admin login error:', error);
            res.status(500).json({ error: 'Login failed', details: error.message });
        }
    }

    /**
     * Get current admin user info
     */
    async getCurrentUser(req: AdminRequest, res: Response) {
        try {
            if (!req.admin) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            const adminUser = await prisma.adminUser.findUnique({
                where: { id: req.admin.id },
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
                return res.status(404).json({ error: 'Admin user not found' });
            }

            // Extract permissions from role
            let permissions: string[] = [];
            if (adminUser.role?.rolePermissions) {
                permissions = adminUser.role.rolePermissions.map(rp => 
                    `${rp.permission.module}:${rp.permission.action}`
                );
            }

            res.json({
                user: {
                    id: adminUser.id,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: adminUser.role?.name || null,
                    permissions,
                    isActive: adminUser.isActive,
                    lastLogin: adminUser.lastLoginAt
                }
            });
        } catch (error: any) {
            console.error('Get current user error:', error);
            res.status(500).json({ error: 'Failed to get user info' });
        }
    }

    /**
     * Change admin password
     */
    async changePassword(req: AdminRequest, res: Response) {
        try {
            if (!req.admin) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current and new passwords are required' });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ error: 'New password must be at least 8 characters' });
            }

            // Get current admin user
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: req.admin.id },
                select: { passwordHash: true }
            });
            
            if (!adminUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify current password
            const isValid = await bcrypt.compare(currentPassword, adminUser.passwordHash);
            if (!isValid) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const newHash = await bcrypt.hash(newPassword, 10);
            
            // Update password
            await prisma.adminUser.update({
                where: { id: req.admin.id },
                data: { passwordHash: newHash }
            });

            res.json({ success: true, message: 'Password changed successfully' });
        } catch (error: any) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Failed to change password' });
        }
    }

    /**
     * List all admin users (requires users:read permission)
     */
    async listUsers(req: AdminRequest, res: Response) {
        try {
            const adminUsers = await prisma.adminUser.findMany({
                include: {
                    role: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            const users = adminUsers.map(au => ({
                id: au.id,
                email: au.email,
                name: au.name,
                firstName: au.name.split(' ')[0] || au.name, // Extract first name from name field
                lastName: au.name.split(' ').slice(1).join(' ') || '', // Extract last name from name field
                isActive: au.isActive,
                lastLogin: au.lastLoginAt,
                createdAt: au.createdAt,
                roleName: au.role?.name || null,
                roleId: au.roleId
            }));

            res.json({ users });
        } catch (error: any) {
            console.error('List users error:', error);
            res.status(500).json({ error: 'Failed to list users' });
        }
    }

    /**
     * Create new admin user (requires users:write permission)
     */
    async createUser(req: AdminRequest, res: Response) {
        try {
            const { email, password, firstName, lastName, roleId } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Check if email already exists
            const existing = await prisma.adminUser.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (existing) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);
            
            const name = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];

            // Create admin user
            const newAdminUser = await prisma.adminUser.create({
                data: {
                    email: email.toLowerCase(),
                    passwordHash,
                    name,
                    roleId: roleId || null,
                    isActive: true
                }
            });

            res.status(201).json({ 
                success: true, 
                user: {
                    id: newAdminUser.id,
                    email: newAdminUser.email,
                    firstName: firstName || name.split(' ')[0],
                    lastName: lastName || name.split(' ').slice(1).join(' '),
                    createdAt: newAdminUser.createdAt
                } 
            });
        } catch (error: any) {
            console.error('Create user error:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }

    /**
     * Update admin user (requires users:write permission)
     */
    async updateUser(req: AdminRequest, res: Response) {
        try {
            const { id } = req.params;
            const { firstName, lastName, roleId, isActive } = req.body;

            // Get existing admin user
            const existingAdmin = await prisma.adminUser.findUnique({
                where: { id }
            });

            if (!existingAdmin) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Prepare update data
            const updateData: any = {};

            if (firstName !== undefined || lastName !== undefined) {
                const currentName = existingAdmin.name.split(' ');
                const newFirstName = firstName !== undefined ? firstName : (currentName[0] || '');
                const newLastName = lastName !== undefined ? lastName : (currentName.slice(1).join(' ') || '');
                updateData.name = `${newFirstName} ${newLastName}`.trim();
            }

            if (roleId !== undefined) {
                updateData.roleId = roleId;
            }

            if (isActive !== undefined) {
                updateData.isActive = isActive;
            }

            // Update admin user
            await prisma.adminUser.update({
                where: { id },
                data: updateData
            });

            res.json({ success: true, message: "User updated successfully" });

        } catch (error: any) {
            console.error('Update user error:', error);
            res.status(500).json({ error: 'Failed to update user' });
        }
    }

    /**
     * Delete admin user (soft delete, requires users:write permission)
     */
    async deleteUser(req: AdminRequest, res: Response) {
        try {
            const { id } = req.params;

            // Prevent self-deletion
            if (req.admin?.id === id) {
                return res.status(400).json({ error: 'Cannot delete your own account' });
            }

            await prisma.adminUser.update({
                where: { id },
                data: { isActive: false }
            });

            res.json({ success: true, message: 'User deactivated successfully' });
        } catch (error: any) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }

    /**
     * List all admin roles
     */
    async listRoles(req: AdminRequest, res: Response) {
        try {
            const roles = await prisma.adminRole.findMany({
                orderBy: {
                    createdAt: 'asc'
                }
            });
            res.json({ roles });
        } catch (error: any) {
            console.error('List roles error:', error);
            res.status(500).json({ error: 'Failed to list roles' });
        }
    }

    private getJwtSecret() {
        return config.JWT_SECRET;
    }
}

export const adminUserController = new AdminUserController();
