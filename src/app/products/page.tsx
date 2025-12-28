'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCurrency } from '@/context/CurrencyContext'
import styles from './page.module.css'

// Placeholder products - will be replaced with database data
const products = [
    {
        id: '1',
        name: 'Abstract Sunset',
        nameHe: 'שקיעה מופשטת',
        nameRu: 'Абстрактный закат',
        basePrice: 50,
        imageUrl: '/assets/image1.jpg',
    },
    {
        id: '2',
        name: 'Mountain Serenity',
        nameHe: 'שלווה הררית',
        nameRu: 'Горное спокойствие',
        basePrice: 50,
        imageUrl: '/assets/image2.jpg',
    },
    {
        id: '3',
        name: 'Urban Dreams',
        nameHe: 'חלומות עירוניים',
        nameRu: 'Городские мечты',
        basePrice: 50,
        imageUrl: '/assets/placeholder1.jpg',
    },
    {
        id: '4',
        name: 'Ocean Waves',
        nameHe: 'גלי אוקיינוס',
        nameRu: 'Океанские волны',
        basePrice: 50,
        imageUrl: '/assets/placeholder2.jpg',
    },
]

export default function ProductsPage() {
    const t = useTranslations()
    const { format } = useCurrency()

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1>{t('common.shop')}</h1>
                    <p className={styles.subtitle}>{t('common.tagline')}</p>
                </div>

                <div className={styles.productsGrid}>
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className={styles.productCard}
                        >
                            <div className={styles.productImage}>
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    unoptimized
                                />
                            </div>
                            <div className={styles.productInfo}>
                                <h3 className={styles.productName}>{product.name}</h3>
                                <p className={styles.productPrice}>
                                    {t('product.price')}: {format(product.basePrice)}+
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
