'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './layout.module.css'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loggedIn = localStorage.getItem('adminLoggedIn') === 'true'
        setIsLoggedIn(loggedIn)
        setIsLoading(false)

        // Redirect to login if not logged in and not on login page
        if (!loggedIn && pathname !== '/admin') {
            router.push('/admin')
        }
    }, [router, pathname])

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn')
        setIsLoggedIn(false)
        router.push('/admin')
    }

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className={styles.loadingScreen}>
                <div className="spinner"></div>
            </div>
        )
    }

    // Show login page without admin layout (only for /admin path)
    if (pathname === '/admin') {
        return <>{children}</>
    }

    // If not logged in and not on login page, show nothing (redirect will happen)
    if (!isLoggedIn) {
        return (
            <div className={styles.loadingScreen}>
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>Felix Shtein</h2>
                    <span>Admin Panel</span>
                </div>

                <nav className={styles.sidebarNav}>
                    <Link
                        href="/admin/dashboard"
                        className={`${styles.navItem} ${pathname === '/admin/dashboard' ? styles.active : ''}`}
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        href="/admin/products"
                        className={`${styles.navItem} ${pathname === '/admin/products' ? styles.active : ''}`}
                    >
                        🖼️ Products
                    </Link>
                    <Link
                        href="/admin/orders"
                        className={`${styles.navItem} ${pathname === '/admin/orders' ? styles.active : ''}`}
                    >
                        📦 Orders
                    </Link>
                    <Link
                        href="/admin/pricing"
                        className={`${styles.navItem} ${pathname === '/admin/pricing' ? styles.active : ''}`}
                    >
                        💰 Pricing
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/" className={styles.viewShop}>
                        🏪 View Shop
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        Logout
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    )
}
