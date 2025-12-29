import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Protected admin routes
const PROTECTED_PATHS = [
    '/admin/dashboard',
    '/admin/products',
    '/admin/orders',
    '/admin/pricing',
]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if this is a protected admin route
    const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))

    if (!isProtectedPath) {
        return NextResponse.next()
    }

    // Get the token from cookies
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
        // Redirect to login page
        const loginUrl = new URL('/admin', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Verify the token
    try {
        const secret = process.env.JWT_SECRET
        if (!secret) {
            console.error('JWT_SECRET not configured')
            return NextResponse.redirect(new URL('/admin', request.url))
        }

        // Verify JWT using jose (Edge-compatible)
        const secretKey = new TextEncoder().encode(secret)
        await jwtVerify(token, secretKey)

        // Token is valid, allow access
        return NextResponse.next()
    } catch (error) {
        console.error('JWT verification failed:', error)
        // Token is invalid, redirect to login
        const loginUrl = new URL('/admin', request.url)
        return NextResponse.redirect(loginUrl)
    }
}

// Configure which routes the middleware runs on
export const config = {
    matcher: [
        '/admin/dashboard/:path*',
        '/admin/products/:path*',
        '/admin/orders/:path*',
        '/admin/pricing/:path*',
    ]
}
