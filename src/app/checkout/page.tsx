'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useCurrency } from '@/context/CurrencyContext'
import { useCart } from '@/context/CartContext'
import { SHIPPING_COST_USD } from '@/lib/pricing'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import styles from './page.module.css'

interface CheckoutForm {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    zipCode: string
}

function CheckoutContent() {
    const t = useTranslations()
    const router = useRouter()
    const { format, currency } = useCurrency()
    const { items, subtotal, clearCart } = useCart()

    const [form, setForm] = useState<CheckoutForm>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
    })
    const [error, setError] = useState('')
    const [formValid, setFormValid] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [isDemoMode, setIsDemoMode] = useState(false)

    const total = subtotal + SHIPPING_COST_USD

    // Check if PayPal is configured
    useEffect(() => {
        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
        if (!clientId || clientId === 'test' || clientId === '') {
            setIsDemoMode(true)
        }
    }, [])

    if (items.length === 0) {
        return (
            <div className={styles.emptyCart}>
                <h1>{t('cart.emptyCart')}</h1>
                <Link href="/products" className="btn btn-primary">
                    {t('common.continuesShopping')}
                </Link>
            </div>
        )
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newForm = { ...form, [e.target.name]: e.target.value }
        setForm(newForm)

        // Validate form
        const isValid = !!(
            newForm.fullName &&
            newForm.email &&
            /\S+@\S+\.\S+/.test(newForm.email) &&
            newForm.address &&
            newForm.city
        )
        setFormValid(isValid)
    }

    // Demo mode checkout
    const handleDemoCheckout = async () => {
        if (!formValid) {
            setError('Please fill in all required fields')
            return
        }

        setProcessing(true)
        setError('')

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Generate demo order number
            const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}`

            // Clear cart and redirect
            clearCart()
            router.push(`/checkout/success?order=${orderNumber}`)
        } catch {
            setError('Payment failed. Please try again.')
            setProcessing(false)
        }
    }

    // Create PayPal order
    const createOrder = async () => {
        if (!formValid) {
            setError('Please fill in all required fields with valid information')
            throw new Error('Form validation failed')
        }

        setError('')

        try {
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: total,
                    currency: 'USD',
                    items: items.map(item => ({
                        name: item.productName,
                        quantity: item.quantity,
                        price: item.unitPrice,
                    })),
                    customerInfo: {
                        name: form.fullName,
                        email: form.email,
                    },
                }),
            })

            const order = await response.json()

            if (order.error) {
                throw new Error(order.error)
            }

            // Check if demo mode response
            if (order.status === 'DEMO_MODE') {
                // Handle demo mode - redirect directly
                const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}`
                clearCart()
                router.push(`/checkout/success?order=${orderNumber}`)
                return order.id
            }

            return order.id
        } catch (err) {
            console.error('Create order error:', err)
            setError('Failed to create order. Please try again.')
            throw err
        }
    }

    // Capture PayPal order (complete payment)
    const onApprove = async (data: { orderID: string }) => {
        try {
            const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID }),
            })

            const captureData = await response.json()

            if (captureData.error) {
                throw new Error(captureData.error)
            }

            // Clear cart and redirect to success
            clearCart()
            router.push(`/checkout/success?order=${captureData.orderNumber}`)

        } catch (err) {
            console.error('Capture order error:', err)
            setError('Payment failed. Please try again.')
        }
    }

    // Handle PayPal errors
    const onError = (err: Record<string, unknown>) => {
        console.error('PayPal error:', err)
        setError('Payment error. Please try again or use a different payment method.')
    }

    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''

    return (
        <div className={styles.page}>
            <div className="container">
                <h1 className={styles.title}>{t('checkout.title')}</h1>

                <div className={styles.checkoutGrid}>
                    {/* Checkout Form */}
                    <div className={styles.formSection}>
                        <div className={styles.formCard}>
                            <h2>{t('checkout.shippingAddress')}</h2>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="fullName">{t('checkout.fullName')} *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={handleInputChange}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="email">{t('checkout.email')} *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleInputChange}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="phone">{t('checkout.phone')}</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleInputChange}
                                        className="input"
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label htmlFor="address">{t('checkout.address')} *</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={form.address}
                                        onChange={handleInputChange}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="city">{t('checkout.city')} *</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={form.city}
                                        onChange={handleInputChange}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="zipCode">{t('checkout.zipCode')}</label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="zipCode"
                                        value={form.zipCode}
                                        onChange={handleInputChange}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className={styles.countryNote}>
                                <span>📍 {t('checkout.country')}: Israel</span>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className={styles.formCard}>
                            <h2>{t('checkout.paymentMethod')}</h2>

                            {error && (
                                <div className={styles.errorMessage}>
                                    {error}
                                </div>
                            )}

                            {!formValid && (
                                <div className={styles.formWarning}>
                                    Please fill in all required shipping fields before paying
                                </div>
                            )}

                            {isDemoMode ? (
                                // Demo mode - show custom button
                                <div className={styles.demoMode}>
                                    <div className={styles.demoNotice}>
                                        ⚠️ Demo Mode - PayPal not configured
                                    </div>
                                    <button
                                        onClick={handleDemoCheckout}
                                        disabled={!formValid || processing}
                                        className={styles.demoButton}
                                    >
                                        {processing ? (
                                            <span className={styles.processingText}>
                                                <span className="spinner" style={{ width: 20, height: 20 }}></span>
                                                Processing...
                                            </span>
                                        ) : (
                                            <>💳 Complete Demo Order - {format(total)}</>
                                        )}
                                    </button>
                                    <p className={styles.demoHint}>
                                        To enable real payments, add PayPal credentials to .env file
                                    </p>
                                </div>
                            ) : (
                                // Real PayPal mode
                                <div className={styles.paypalContainer}>
                                    <PayPalScriptProvider options={{
                                        clientId: paypalClientId,
                                        currency: 'USD',
                                        intent: 'capture',
                                    }}>
                                        <PayPalButtons
                                            style={{
                                                layout: 'vertical',
                                                color: 'blue',
                                                shape: 'rect',
                                                label: 'paypal',
                                            }}
                                            disabled={!formValid}
                                            createOrder={createOrder}
                                            onApprove={onApprove}
                                            onError={onError}
                                        />
                                    </PayPalScriptProvider>
                                </div>
                            )}

                            <p className={styles.secureNote}>
                                🔒 Your payment is secure and encrypted
                            </p>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className={styles.summarySection}>
                        <div className={styles.summaryCard}>
                            <h2>{t('checkout.orderSummary')}</h2>

                            <div className={styles.summaryItems}>
                                {items.map((item) => (
                                    <div key={item.id} className={styles.summaryItem}>
                                        <div className={styles.summaryItemImage}>
                                            <Image
                                                src={item.productImage}
                                                alt={item.productName}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                unoptimized
                                            />
                                            <span className={styles.itemQty}>{item.quantity}</span>
                                        </div>
                                        <div className={styles.summaryItemInfo}>
                                            <p className={styles.summaryItemName}>{item.productName}</p>
                                            <p className={styles.summaryItemSpecs}>
                                                {item.sizeDimensions} cm • {item.materialName}
                                            </p>
                                        </div>
                                        <span className={styles.summaryItemPrice}>
                                            {format(item.unitPrice * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.summaryTotals}>
                                <div className={styles.summaryRow}>
                                    <span>{t('cart.subtotal')}</span>
                                    <span>{format(subtotal)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>{t('cart.shipping')}</span>
                                    <span>{format(SHIPPING_COST_USD)}</span>
                                </div>
                                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                    <span>{t('cart.total')}</span>
                                    <span>{format(total)} {currency}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutPage() {
    return <CheckoutContent />
}
