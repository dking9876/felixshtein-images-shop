'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRICING } from '@/lib/pricing'
import styles from './page.module.css'

interface PriceConfig {
    sizes: { id: string; dimensions: string; multiplier: number }[]
    materials: { id: string; name: string; multiplier: number }[]
    basePrice: number
    shippingCost: number
}

export default function AdminPricingPage() {
    const router = useRouter()
    const [loaded, setLoaded] = useState(false)
    const [config, setConfig] = useState<PriceConfig>({
        sizes: PRICING.sizes.map(s => ({ ...s })),
        materials: PRICING.materials.map(m => ({ id: m.id, name: m.name, multiplier: m.multiplier })),
        basePrice: PRICING.base.small,
        shippingCost: 10,
    })
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (localStorage.getItem('adminLoggedIn') !== 'true') {
            router.push('/admin')
        } else {
            setLoaded(true)
        }
    }, [router])

    const updateSizeMultiplier = (id: string, multiplier: number) => {
        setConfig({
            ...config,
            sizes: config.sizes.map(s => s.id === id ? { ...s, multiplier } : s),
        })
    }

    const updateMaterialMultiplier = (id: string, multiplier: number) => {
        setConfig({
            ...config,
            materials: config.materials.map(m => m.id === id ? { ...m, multiplier } : m),
        })
    }

    const handleSave = () => {
        // In production, this would save to the database
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    // Calculate example price
    const calculateExample = (sizeId: string, materialId: string) => {
        const size = config.sizes.find(s => s.id === sizeId)
        const material = config.materials.find(m => m.id === materialId)
        if (!size || !material) return 0
        return Math.round(config.basePrice * size.multiplier * material.multiplier)
    }

    if (!loaded) {
        return <div className={styles.loading}><div className="spinner"></div></div>
    }

    return (
        <div className={styles.pricingPage}>
            <div className={styles.header}>
                <h1>Pricing</h1>
                <button
                    className={`btn ${saved ? 'btn-accent' : 'btn-primary'}`}
                    onClick={handleSave}
                >
                    {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
            </div>

            <div className={styles.pricingGrid}>
                {/* Base Settings */}
                <div className={styles.card}>
                    <h2>Base Settings</h2>
                    <div className={styles.formGroup}>
                        <label>Base Price (USD) - for smallest canvas</label>
                        <input
                            type="number"
                            className="input"
                            value={config.basePrice}
                            onChange={e => setConfig({ ...config, basePrice: Number(e.target.value) })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Shipping Cost (USD)</label>
                        <input
                            type="number"
                            className="input"
                            value={config.shippingCost}
                            onChange={e => setConfig({ ...config, shippingCost: Number(e.target.value) })}
                        />
                    </div>
                </div>

                {/* Size Multipliers */}
                <div className={styles.card}>
                    <h2>Size Multipliers</h2>
                    <p className={styles.hint}>Price = Base Price × Size Multiplier × Material Multiplier</p>
                    {config.sizes.map((size) => (
                        <div key={size.id} className={styles.multiplierRow}>
                            <span>{size.dimensions} cm</span>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                className={styles.multiplierInput}
                                value={size.multiplier}
                                onChange={e => updateSizeMultiplier(size.id, Number(e.target.value))}
                            />
                            <span className={styles.multiplierLabel}>{size.multiplier}x</span>
                        </div>
                    ))}
                </div>

                {/* Material Multipliers */}
                <div className={styles.card}>
                    <h2>Material Multipliers</h2>
                    {config.materials.map((material) => (
                        <div key={material.id} className={styles.multiplierRow}>
                            <span>{material.name}</span>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                className={styles.multiplierInput}
                                value={material.multiplier}
                                onChange={e => updateMaterialMultiplier(material.id, Number(e.target.value))}
                            />
                            <span className={styles.multiplierLabel}>{material.multiplier}x</span>
                        </div>
                    ))}
                </div>

                {/* Price Matrix Preview */}
                <div className={`${styles.card} ${styles.matrixCard}`}>
                    <h2>Price Matrix Preview</h2>
                    <div className={styles.priceMatrix}>
                        <div className={styles.matrixHeader}>
                            <span></span>
                            {config.sizes.map(s => (
                                <span key={s.id}>{s.dimensions}</span>
                            ))}
                        </div>
                        {config.materials.map((material) => (
                            <div key={material.id} className={styles.matrixRow}>
                                <span>{material.name}</span>
                                {config.sizes.map(size => (
                                    <span key={size.id} className={styles.matrixPrice}>
                                        ${calculateExample(size.id, material.id)}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
