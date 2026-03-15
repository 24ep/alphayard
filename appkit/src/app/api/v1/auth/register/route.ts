import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/server/lib/prisma';
import { config } from '@/server/config/env';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone || null,
        isActive: true,
        isVerified: false,
        userType: 'user',
      }
    });

    // Generate JWT tokens (same secret as bondary-backend for cross-service auth)
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      type: 'user',
    };

    const accessToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userResponse } = user as any;

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phoneNumber,
        avatar: user.avatarUrl,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Mobile registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
