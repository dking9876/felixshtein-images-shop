'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCurrency } from '@/context/CurrencyContext'
import styles from './page.module.css'

// Placeholder products for demo
const featuredProducts = [
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

export default function HomePage() {
  const t = useTranslations()
  const { format } = useCurrency()

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('home.heroTitle')}</h1>
          <p className={styles.heroSubtitle}>{t('home.heroSubtitle')}</p>
          <Link href="/products" className={`btn btn-accent ${styles.heroBtn}`}>
            {t('home.shopNow')}
          </Link>
        </div>
        <div className={styles.heroPattern}>
          <div className={styles.patternGrid}>
            {featuredProducts.slice(0, 4).map((product, i) => (
              <div key={i} className={styles.patternItem}>
                <Image
                  src={product.imageUrl}
                  alt=""
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={`section ${styles.featured}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>{t('home.featured')}</h2>
            <Link href="/products" className={styles.viewAllLink}>
              {t('common.viewAll')} →
            </Link>
          </div>

          <div className={styles.productsGrid}>
            {featuredProducts.map((product) => (
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
      </section>

      {/* Materials Banner */}
      <section className={styles.materialsBanner}>
        <div className="container">
          <h2>{t('product.selectMaterial')}</h2>
          <div className={styles.materialsList}>
            <div className={styles.materialItem}>
              <span className={styles.materialIcon}>🖼️</span>
              <span>Canvas</span>
            </div>
            <div className={styles.materialItem}>
              <span className={styles.materialIcon}>🪟</span>
              <span>Framed</span>
            </div>
            <div className={styles.materialItem}>
              <span className={styles.materialIcon}>📄</span>
              <span>Paper</span>
            </div>
            <div className={styles.materialItem}>
              <span className={styles.materialIcon}>🔩</span>
              <span>Metal</span>
            </div>
            <div className={styles.materialItem}>
              <span className={styles.materialIcon}>💎</span>
              <span>Acrylic</span>
            </div>
            <div className={styles.materialItem}>
              <span className={styles.materialIcon}>🪵</span>
              <span>Wood</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
