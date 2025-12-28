'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

interface Order {
    id: string
    orderNumber: string
    customerName: string
    customerEmail: string
    total: number
    status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
    date: string
    items: { name: string; size: string; material: string; qty: number; price: number }[]
}

// Demo orders
const demoOrders: Order[] = [
    {
        id: '1',
        orderNumber: 'FS-ABC123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        total: 250,
        status: 'PAID',
        date: '2024-12-27',
        items: [{ name: 'Abstract Sunset', size: '40x60', material: 'Canvas', qty: 1, price: 100 }],
    },
    {
        id: '2',
        orderNumber: 'FS-DEF456',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        total: 180,
        status: 'PROCESSING',
        date: '2024-12-26',
        items: [{ name: 'Mountain Serenity', size: '60x90', material: 'Framed', qty: 1, price: 180 }],
    },
    {
        id: '3',
        orderNumber: 'FS-GHI789',
        customerName: 'David Cohen',
        customerEmail: 'david@example.com',
        total: 320,
        status: 'SHIPPED',
        date: '2024-12-25',
        items: [{ name: 'Urban Dreams', size: '60x90', material: 'Metal', qty: 1, price: 320 }],
    },
]

const statusOptions = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const

export default function AdminOrdersPage() {
    const router = useRouter()
    const [loaded, setLoaded] = useState(false)
    const [orders, setOrders] = useState<Order[]>(demoOrders)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    useEffect(() => {
        if (localStorage.getItem('adminLoggedIn') !== 'true') {
            router.push('/admin')
        } else {
            setLoaded(true)
        }
    }, [router])

    const updateStatus = (orderId: string, newStatus: Order['status']) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        if (selectedOrder?.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
    }

    if (!loaded) {
        return <div className={styles.loading}><div className="spinner"></div></div>
    }

    return (
        <div className={styles.ordersPage}>
            <h1>Orders</h1>

            <div className={styles.ordersTable}>
                <div className={styles.tableHeader}>
                    <span>Order #</span>
                    <span>Customer</span>
                    <span>Total</span>
                    <span>Status</span>
                    <span>Date</span>
                    <span>Actions</span>
                </div>

                {orders.map((order) => (
                    <div key={order.id} className={styles.tableRow}>
                        <span className={styles.orderId}>{order.orderNumber}</span>
                        <span>{order.customerName}</span>
                        <span>${order.total}</span>
                        <span>
                            <select
                                value={order.status}
                                onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                                className={`${styles.statusSelect} ${styles[order.status.toLowerCase()]}`}
                            >
                                {statusOptions.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </span>
                        <span className={styles.date}>{order.date}</span>
                        <span>
                            <button
                                className={styles.viewBtn}
                                onClick={() => setSelectedOrder(order)}
                            >
                                View
                            </button>
                        </span>
                    </div>
                ))}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Order {selectedOrder.orderNumber}</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>×</button>
                        </div>

                        <div className={styles.orderDetails}>
                            <div className={styles.detailRow}>
                                <span>Customer:</span>
                                <span>{selectedOrder.customerName}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Email:</span>
                                <span>{selectedOrder.customerEmail}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Date:</span>
                                <span>{selectedOrder.date}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Status:</span>
                                <span className={`${styles.status} ${styles[selectedOrder.status.toLowerCase()]}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                        </div>

                        <h3>Items</h3>
                        <div className={styles.orderItems}>
                            {selectedOrder.items.map((item, i) => (
                                <div key={i} className={styles.orderItem}>
                                    <span>{item.name}</span>
                                    <span>{item.size} cm • {item.material}</span>
                                    <span>x{item.qty}</span>
                                    <span>${item.price}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.orderTotal}>
                            <span>Total:</span>
                            <span>${selectedOrder.total}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
