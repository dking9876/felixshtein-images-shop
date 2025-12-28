'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

// Demo data
const demoStats = {
    totalOrders: 12,
    totalRevenue: 2450,
    pendingOrders: 3,
    totalProducts: 4,
}

const recentOrders = [
    { id: 'FS-ABC123', customer: 'John Doe', total: 250, status: 'PAID', date: '2024-12-27' },
    { id: 'FS-DEF456', customer: 'Jane Smith', total: 180, status: 'PROCESSING', date: '2024-12-26' },
    { id: 'FS-GHI789', customer: 'David Cohen', total: 320, status: 'SHIPPED', date: '2024-12-25' },
]

export default function AdminDashboardPage() {
    const router = useRouter()
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (localStorage.getItem('adminLoggedIn') !== 'true') {
            router.push('/admin')
        } else {
            setLoaded(true)
        }
    }, [router])

    if (!loaded) {
        return <div className={styles.loading}><div className="spinner"></div></div>
    }

    return (
        <div className={styles.dashboard}>
            <h1>Dashboard</h1>
            <p className={styles.welcomeText}>Welcome back! Here&apos;s what&apos;s happening with your store.</p>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📦</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{demoStats.totalOrders}</span>
                        <span className={styles.statLabel}>Total Orders</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>💵</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>${demoStats.totalRevenue}</span>
                        <span className={styles.statLabel}>Total Revenue</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>⏳</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{demoStats.pendingOrders}</span>
                        <span className={styles.statLabel}>Pending Orders</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🖼️</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{demoStats.totalProducts}</span>
                        <span className={styles.statLabel}>Products</span>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className={styles.recentSection}>
                <h2>Recent Orders</h2>
                <div className={styles.ordersTable}>
                    <div className={styles.tableHeader}>
                        <span>Order ID</span>
                        <span>Customer</span>
                        <span>Total</span>
                        <span>Status</span>
                        <span>Date</span>
                    </div>
                    {recentOrders.map((order) => (
                        <div key={order.id} className={styles.tableRow}>
                            <span className={styles.orderId}>{order.id}</span>
                            <span>{order.customer}</span>
                            <span>${order.total}</span>
                            <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                                {order.status}
                            </span>
                            <span className={styles.date}>{order.date}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
