'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import styles from './page.module.css'

function SuccessContent() {
    const t = useTranslations()
    const searchParams = useSearchParams()
    const orderNumber = searchParams.get('order') || 'FS-XXXXXX'

    return (
        <div className={styles.successPage}>
            <div className={styles.successCard}>
                <div className={styles.successIcon}>✓</div>
                <h1>{t('checkout.orderComplete')}</h1>
                <p className={styles.thankYou}>{t('checkout.thankYou')}</p>

                <div className={styles.orderInfo}>
                    <span className={styles.orderLabel}>{t('checkout.orderNumber')}:</span>
                    <span className={styles.orderNumber}>{orderNumber}</span>
                </div>

                <p className={styles.confirmationText}>
                    {t('checkout.confirmationEmail')}
                </p>

                <Link href="/products" className="btn btn-primary">
                    {t('common.continuesShopping')}
                </Link>
            </div>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className={styles.loading}><div className="spinner"></div></div>}>
            <SuccessContent />
        </Suspense>
    )
}
