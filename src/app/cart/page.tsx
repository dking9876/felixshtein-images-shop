'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useCurrency } from '@/context/CurrencyContext'
import { useCart } from '@/context/CartContext'
import { SHIPPING_COST_USD } from '@/lib/pricing'
import styles from './page.module.css'

export default function CartPage() {
    const t = useTranslations()
    const { format } = useCurrency()
    const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart()

    if (items.length === 0) {
        return (
            <div className={styles.emptyCart}>
                <div className={styles.emptyCartContent}>
                    <div className={styles.emptyIcon}>🛒</div>
                    <h1>{t('cart.yourCart')}</h1>
                    <p>{t('cart.emptyCart')}</p>
                    <Link href="/products" className="btn btn-primary">
                        {t('common.continuesShopping')}
                    </Link>
                </div>
            </div>
        )
    }

    const total = subtotal + SHIPPING_COST_USD

    return (
        <div className={styles.page}>
            <div className="container">
                <h1 className={styles.title}>{t('cart.yourCart')}</h1>

                <div className={styles.cartGrid}>
                    {/* Cart Items */}
                    <div className={styles.cartItems}>
                        {items.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                <div className={styles.itemImage}>
                                    <Image
                                        src={item.productImage}
                                        alt={item.productName}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        unoptimized
                                    />
                                </div>

                                <div className={styles.itemDetails}>
                                    <h3 className={styles.itemName}>{item.productName}</h3>
                                    <p className={styles.itemSpecs}>
                                        {item.sizeDimensions} cm • {item.materialName}
                                    </p>
                                    <p className={styles.itemPrice}>{format(item.unitPrice)}</p>
                                </div>

                                <div className={styles.itemActions}>
                                    <div className={styles.quantityControl}>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className={styles.quantityBtn}
                                        >
                                            −
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className={styles.quantityBtn}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className={styles.removeBtn}
                                    >
                                        {t('cart.remove')}
                                    </button>
                                </div>

                                <div className={styles.itemTotal}>
                                    {format(item.unitPrice * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className={styles.orderSummary}>
                        <h2>{t('checkout.orderSummary')}</h2>

                        <div className={styles.summaryRow}>
                            <span>{t('cart.subtotal')} ({itemCount} items)</span>
                            <span>{format(subtotal)}</span>
                        </div>

                        <div className={styles.summaryRow}>
                            <span>{t('cart.shipping')}</span>
                            <span>{format(SHIPPING_COST_USD)}</span>
                        </div>
                        <p className={styles.shippingNote}>{t('cart.flatRate')}</p>

                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>{t('cart.total')}</span>
                            <span>{format(total)}</span>
                        </div>

                        <Link href="/checkout" className="btn btn-accent" style={{ width: '100%' }}>
                            {t('cart.proceedToCheckout')}
                        </Link>

                        <Link href="/products" className={styles.continueLink}>
                            {t('common.continuesShopping')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
