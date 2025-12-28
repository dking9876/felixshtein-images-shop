'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useState } from 'react'
import styles from './Header.module.css'

export default function Header() {
    const t = useTranslations()
    const { itemCount } = useCart()
    const { currency, setCurrency } = useCurrency()
    const [menuOpen, setMenuOpen] = useState(false)
    const [langDropdown, setLangDropdown] = useState(false)

    const setLocale = (locale: string) => {
        document.cookie = `locale=${locale};path=/;max-age=31536000`
        window.location.reload()
    }

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/assets/logo.jpg"
                        alt="Felix Shtein"
                        width={50}
                        height={50}
                        className={styles.logoImage}
                    />
                    <span className={styles.logoText}>{t('common.shopName')}</span>
                </Link>

                <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
                    <Link href="/" className={styles.navLink}>{t('common.home')}</Link>
                    <Link href="/products" className={styles.navLink}>{t('common.shop')}</Link>
                </nav>

                <div className={styles.actions}>
                    {/* Language & Currency */}
                    <div className={styles.dropdown}>
                        <button
                            className={styles.dropdownBtn}
                            onClick={() => setLangDropdown(!langDropdown)}
                        >
                            🌐
                        </button>
                        {langDropdown && (
                            <div className={styles.dropdownMenu}>
                                <button onClick={() => setLocale('en')} className={styles.dropdownItem}>
                                    English
                                </button>
                                <button onClick={() => setLocale('he')} className={styles.dropdownItem}>
                                    עברית
                                </button>
                                <button onClick={() => setLocale('ru')} className={styles.dropdownItem}>
                                    Русский
                                </button>
                                <hr className={styles.divider} />
                                <button
                                    onClick={() => setCurrency('USD')}
                                    className={`${styles.dropdownItem} ${currency === 'USD' ? styles.active : ''}`}
                                >
                                    $ USD
                                </button>
                                <button
                                    onClick={() => setCurrency('ILS')}
                                    className={`${styles.dropdownItem} ${currency === 'ILS' ? styles.active : ''}`}
                                >
                                    ₪ ILS
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Cart */}
                    <Link href="/cart" className={styles.cartBtn}>
                        <svg className={styles.cartIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 6h15l-1.5 9h-12z" />
                            <circle cx="9" cy="20" r="1" />
                            <circle cx="18" cy="20" r="1" />
                            <path d="M6 6L5 3H2" />
                        </svg>
                        {itemCount > 0 && (
                            <span className={styles.cartCount}>{itemCount}</span>
                        )}
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={styles.menuToggle}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>
    )
}
