'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import styles from './Footer.module.css'

export default function Footer() {
    const t = useTranslations()

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <h3 className={styles.brandName}>{t('common.shopName')}</h3>
                    <p className={styles.tagline}>{t('common.tagline')}</p>
                </div>

                <div className={styles.links}>
                    <Link href="/" className={styles.link}>{t('common.home')}</Link>
                    <Link href="/products" className={styles.link}>{t('common.shop')}</Link>
                    <Link href="/cart" className={styles.link}>{t('common.cart')}</Link>
                </div>

                <div className={styles.contact}>
                    <a href="mailto:dwaitser@gmail.com" className={styles.link}>
                        {t('footer.contact')}
                    </a>
                </div>
            </div>

            <div className={styles.bottom}>
                <p>{t('footer.copyright')}</p>
            </div>
        </footer>
    )
}
