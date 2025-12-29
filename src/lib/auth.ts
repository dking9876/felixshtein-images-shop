import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// Get JWT secret - throws if not configured
function getJWTSecret(): string {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not configured')
    }
    return secret
}

export interface AdminTokenPayload {
    id: string
    email: string
    iat: number
    exp: number
}

// Verify the admin token from cookies
export async function verifyAdminToken(): Promise<AdminTokenPayload | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('admin_token')?.value

        if (!token) {
            return null
        }

        const secret = getJWTSecret()
        const decoded = jwt.verify(token, secret) as AdminTokenPayload
        return decoded
    } catch (error) {
        console.error('Token verification failed:', error)
        return null
    }
}

// Check if user is authenticated as admin
export async function isAuthenticated(): Promise<boolean> {
    const token = await verifyAdminToken()
    return token !== null
}

// Get current admin info
export async function getCurrentAdmin(): Promise<{ id: string; email: string } | null> {
    const token = await verifyAdminToken()
    if (!token) return null
    return { id: token.id, email: token.email }
}

// Export the getJWTSecret for use in login route
export { getJWTSecret }
