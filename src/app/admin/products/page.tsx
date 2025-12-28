'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.css'

interface Product {
    id: string
    name: string
    basePrice: number
    imageUrl: string
    active: boolean
}

// Demo products
const initialProducts: Product[] = [
    { id: '1', name: 'Abstract Sunset', basePrice: 50, imageUrl: '/assets/image1.jpg', active: true },
    { id: '2', name: 'Mountain Serenity', basePrice: 50, imageUrl: '/assets/image2.jpg', active: true },
    { id: '3', name: 'Urban Dreams', basePrice: 50, imageUrl: '/assets/placeholder1.jpg', active: true },
    { id: '4', name: 'Ocean Waves', basePrice: 50, imageUrl: '/assets/placeholder2.jpg', active: true },
]

export default function AdminProductsPage() {
    const router = useRouter()
    const [loaded, setLoaded] = useState(false)
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [showModal, setShowModal] = useState(false)
    const [editProduct, setEditProduct] = useState<Product | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        basePrice: 50,
        imageUrl: '',
    })

    useEffect(() => {
        if (localStorage.getItem('adminLoggedIn') !== 'true') {
            router.push('/admin')
        } else {
            setLoaded(true)
        }
    }, [router])

    const openNewProductModal = () => {
        setEditProduct(null)
        setFormData({ name: '', basePrice: 50, imageUrl: '' })
        setShowModal(true)
    }

    const openEditModal = (product: Product) => {
        setEditProduct(product)
        setFormData({ name: product.name, basePrice: product.basePrice, imageUrl: product.imageUrl })
        setShowModal(true)
    }

    const handleSave = () => {
        if (!formData.name) return

        if (editProduct) {
            // Update existing
            setProducts(products.map(p =>
                p.id === editProduct.id
                    ? { ...p, ...formData }
                    : p
            ))
        } else {
            // Add new
            const newProduct: Product = {
                id: Date.now().toString(),
                name: formData.name,
                basePrice: formData.basePrice,
                imageUrl: formData.imageUrl || '/assets/placeholder1.jpg',
                active: true,
            }
            setProducts([...products, newProduct])
        }
        setShowModal(false)
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== id))
        }
    }

    const toggleActive = (id: string) => {
        setProducts(products.map(p =>
            p.id === id ? { ...p, active: !p.active } : p
        ))
    }

    if (!loaded) {
        return <div className={styles.loading}><div className="spinner"></div></div>
    }

    return (
        <div className={styles.productsPage}>
            <div className={styles.header}>
                <h1>Products</h1>
                <button className="btn btn-primary" onClick={openNewProductModal}>
                    + Add Product
                </button>
            </div>

            <div className={styles.productsGrid}>
                {products.map((product) => (
                    <div key={product.id} className={`${styles.productCard} ${!product.active ? styles.inactive : ''}`}>
                        <div className={styles.productImage}>
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                unoptimized
                            />
                            {!product.active && (
                                <div className={styles.inactiveOverlay}>Inactive</div>
                            )}
                        </div>
                        <div className={styles.productInfo}>
                            <h3>{product.name}</h3>
                            <p className={styles.price}>${product.basePrice}</p>
                        </div>
                        <div className={styles.productActions}>
                            <button onClick={() => openEditModal(product)} className={styles.editBtn}>
                                Edit
                            </button>
                            <button onClick={() => toggleActive(product.id)} className={styles.toggleBtn}>
                                {product.active ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => handleDelete(product.id)} className={styles.deleteBtn}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>

                        <div className={styles.formGroup}>
                            <label>Product Name</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter product name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Base Price (USD)</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.basePrice}
                                onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Image URL</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.imageUrl}
                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="/assets/your-image.jpg"
                            />
                            <p className={styles.hint}>Upload images to public/assets folder</p>
                        </div>

                        <div className={styles.modalActions}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
