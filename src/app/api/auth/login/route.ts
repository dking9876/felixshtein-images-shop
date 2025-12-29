import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Get JWT secret - throws if not configured
function getJWTSecret(): string {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not configured. This is a security requirement.')
    }
    return secret
}

// Input validation schema
const loginSchema = z.object({
    email: z.string().email('Invalid email format').max(255),
    password: z.string().min(1, 'Password required').max(128),
})

// Simple in-memory rate limiting
const loginAttempts = new Map<string, { count: number; resetTime: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const record = loginAttempts.get(ip)

    if (!record) {
        loginAttempts.set(ip, { count: 1, resetTime: now + WINDOW_MS })
        return false
    }

    if (now > record.resetTime) {
        loginAttempts.set(ip, { count: 1, resetTime: now + WINDOW_MS })
        return false
    }

    if (record.count >= MAX_ATTEMPTS) {
        return true
    }

    record.count++
    return false
}

export async function POST(req: Request) {
    try {
        // Get client IP for rate limiting
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

        // Check rate limit
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                { status: 429 }
            )
        }

        // Parse and validate input
        const body = await req.json()
        const validation = loginSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { email, password } = validation.data

        const admin = await prisma.admin.findUnique({
            where: { email }
        })

        if (!admin) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Create JWT token
        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            getJWTSecret(),
            { expiresIn: '1d' }
        )

        const response = NextResponse.json(
            { success: true, message: 'Logged in successfully' },
            { status: 200 }
        )

        // Set secure cookie
        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, // 1 day
            path: '/'
        })

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
