'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useCurrency } from '@/context/CurrencyContext'
import { useCart } from '@/context/CartContext'
import { PRICING, calculatePrice } from '@/lib/pricing'
import styles from './page.module.css'

// Placeholder products - will be replaced with database data
const productsData: Record<string, {
    id: string
    name: string
    nameHe: string
    nameRu: string
    description: string
    basePrice: number
    imageUrl: string
}> = {
    '1': {
        id: '1',
        name: 'Abstract Sunset',
        nameHe: 'שקיעה מופשטת',
        nameRu: 'Абстрактный закат',
        description: 'A stunning abstract representation of a sunset with vibrant colors.',
        basePrice: 50,
        imageUrl: '/assets/image1.jpg',
    },
    '2': {
        id: '2',
        name: 'Mountain Serenity',
        nameHe: 'שלווה הררית',
        nameRu: 'Горное спокойствие',
        description: 'Peaceful mountain landscape that brings tranquility to any space.',
        basePrice: 50,
        imageUrl: '/assets/image2.jpg',
    },
    '3': {
        id: '3',
        name: 'Urban Dreams',
        nameHe: 'חלומות עירוניים',
        nameRu: 'Городские мечты',
        description: 'Modern cityscape capturing the essence of urban life.',
        basePrice: 50,
        imageUrl: '/assets/placeholder1.jpg',
    },
    '4': {
        id: '4',
        name: 'Ocean Waves',
        nameHe: 'גלי אוקיינוס',
        nameRu: 'Океанские волны',
        description: 'Dynamic ocean waves that bring the sea into your home.',
        basePrice: 50,
        imageUrl: '/assets/placeholder2.jpg',
    },
}

type PageParams = { params: Promise<{ id: string }> }

export default function ProductDetailPage({ params }: PageParams) {
    const t = useTranslations()
    const { format } = useCurrency()
    const { addItem } = useCart()

    const [productId, setProductId] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState(PRICING.sizes[0].id)
    const [selectedMaterial, setSelectedMaterial] = useState(PRICING.materials[0].id)
    const [quantity, setQuantity] = useState(1)
    const [added, setAdded] = useState(false)

    // Load params in useEffect to avoid React state update warning
    useEffect(() => {
        params.then(p => setProductId(p.id))
    }, [params])

    // Show loading while params are being resolved
    if (productId === null) {
        return (
            <div className={styles.loading}>
                <div className="spinner"></div>
            </div>
        )
    }

    const product = productsData[productId]

    if (!product) {
        return (
            <div className={styles.notFound}>
                <h1>Product not found</h1>
                <Link href="/products" className="btn btn-primary">
                    {t('common.backToHome')}
                </Link>
            </div>
        )
    }

    const price = calculatePrice(selectedSize, selectedMaterial, product.basePrice)
    const selectedSizeData = PRICING.sizes.find(s => s.id === selectedSize)
    const selectedMaterialData = PRICING.materials.find(m => m.id === selectedMaterial)

    const handleAddToCart = () => {
        if (!selectedSizeData || !selectedMaterialData) return

        addItem({
            productId: product.id,
            productName: product.name,
            productImage: product.imageUrl,
            sizeId: selectedSize,
            sizeDimensions: selectedSizeData.dimensions,
            materialId: selectedMaterial,
            materialName: selectedMaterialData.name,
            quantity,
            unitPrice: price,
        })

        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <Link href="/products" className={styles.backLink}>
                    ← {t('common.continuesShopping')}
                </Link>

                <div className={styles.productGrid}>
                    {/* Product Image */}
                    <div className={styles.imageSection}>
                        <div className={styles.mainImage}>
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                unoptimized
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className={styles.infoSection}>
                        <h1 className={styles.title}>{product.name}</h1>
                        <p className={styles.description}>{product.description}</p>

                        {/* Size Selection */}
                        <div className={styles.optionGroup}>
                            <label className={styles.optionLabel}>{t('product.selectSize')}</label>
                            <div className={styles.sizeOptions}>
                                {PRICING.sizes.map((size) => (
                                    <button
                                        key={size.id}
                                        className={`${styles.sizeBtn} ${selectedSize === size.id ? styles.selected : ''}`}
                                        onClick={() => setSelectedSize(size.id)}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Material Selection */}
                        <div className={styles.optionGroup}>
                            <label className={styles.optionLabel}>{t('product.selectMaterial')}</label>
                            <div className={styles.materialOptions}>
                                {PRICING.materials.map((material) => (
                                    <button
                                        key={material.id}
                                        className={`${styles.materialBtn} ${selectedMaterial === material.id ? styles.selected : ''}`}
                                        onClick={() => setSelectedMaterial(material.id)}
                                    >
                                        {material.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className={styles.optionGroup}>
                            <label className={styles.optionLabel}>{t('product.quantity')}</label>
                            <div className={styles.quantityControl}>
                                <button
                                    className={styles.quantityBtn}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    −
                                </button>
                                <span className={styles.quantityValue}>{quantity}</span>
                                <button
                                    className={styles.quantityBtn}
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Price */}
                        <div className={styles.priceSection}>
                            <span className={styles.priceLabel}>{t('product.price')}:</span>
                            <span className={styles.price}>{format(price * quantity)}</span>
                        </div>

                        {/* Add to Cart */}
                        <button
                            className={`btn btn-accent ${styles.addToCartBtn} ${added ? styles.added : ''}`}
                            onClick={handleAddToCart}
                        >
                            {added ? '✓ Added!' : t('product.addToCart')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
