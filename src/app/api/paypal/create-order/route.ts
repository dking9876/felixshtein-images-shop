import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PRICING, calculatePrice, SHIPPING_COST_USD } from '@/lib/pricing'

// PayPal API configuration
const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || ''

// Valid product IDs and their base prices (source of truth)
// TODO: Move to database in production
const PRODUCT_PRICES: Record<string, number> = {
    '1': 50, // Abstract Sunset
    '2': 50, // Mountain Serenity
    '3': 50, // Urban Dreams
    '4': 50, // Ocean Waves
}

// Maximum quantity limits
const MAX_QUANTITY_PER_ITEM = 10
const MAX_TOTAL_ITEMS = 20

// Input validation schema with strict cart item validation
const cartItemSchema = z.object({
    productId: z.string().min(1).max(50),
    sizeId: z.string().min(1).max(50),
    materialId: z.string().min(1).max(50),
    quantity: z.number().int().positive().max(MAX_QUANTITY_PER_ITEM),
    name: z.string().max(255).optional(),
    price: z.number().positive().optional(), // Frontend price - will be ignored
})

const createOrderSchema = z.object({
    amount: z.number().positive().max(100000), // Frontend amount - will be verified
    currency: z.string().length(3).default('USD'),
    items: z.array(cartItemSchema).min(1).max(MAX_TOTAL_ITEMS),
    customerInfo: z.object({
        email: z.string().email().optional(),
        name: z.string().max(255).optional(),
    }).optional(),
})

// Server-side price calculation
function calculateServerTotal(items: z.infer<typeof cartItemSchema>[]): {
    subtotal: number;
    shipping: number;
    total: number;
    itemDetails: Array<{ productId: string; calculatedPrice: number; quantity: number }>;
    errors: string[];
} {
    const errors: string[] = []
    const itemDetails: Array<{ productId: string; calculatedPrice: number; quantity: number }> = []
    let subtotal = 0
    let totalQuantity = 0

    for (const item of items) {
        // Validate product exists
        const basePrice = PRODUCT_PRICES[item.productId]
        if (basePrice === undefined) {
            errors.push(`Invalid product ID: ${item.productId}`)
            continue
        }

        // Validate size exists
        const size = PRICING.sizes.find(s => s.id === item.sizeId)
        if (!size) {
            errors.push(`Invalid size ID: ${item.sizeId}`)
            continue
        }

        // Validate material exists
        const material = PRICING.materials.find(m => m.id === item.materialId)
        if (!material) {
            errors.push(`Invalid material ID: ${item.materialId}`)
            continue
        }

        // Check total quantity
        totalQuantity += item.quantity
        if (totalQuantity > MAX_TOTAL_ITEMS) {
            errors.push(`Total quantity exceeds maximum of ${MAX_TOTAL_ITEMS}`)
            break
        }

        // Calculate server-side price
        const unitPrice = calculatePrice(item.sizeId, item.materialId, basePrice)
        const itemTotal = unitPrice * item.quantity

        itemDetails.push({
            productId: item.productId,
            calculatedPrice: unitPrice,
            quantity: item.quantity
        })

        subtotal += itemTotal
    }

    const shipping = SHIPPING_COST_USD
    const total = subtotal + shipping

    return { subtotal, shipping, total, itemDetails, errors }
}

// Get PayPal access token
async function getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    })

    const data = await response.json()
    return data.access_token
}

// Create PayPal order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input structure
        const validation = createOrderSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { amount: frontendAmount, currency, items, customerInfo } = validation.data

        // SERVER-SIDE PRICE CALCULATION (Critical Security Fix)
        const serverCalc = calculateServerTotal(items)

        // Check for calculation errors
        if (serverCalc.errors.length > 0) {
            return NextResponse.json(
                { error: 'Invalid cart items', details: serverCalc.errors },
                { status: 400 }
            )
        }

        // CRITICAL: Compare frontend amount with server calculation
        // Allow small tolerance for floating point differences
        const priceDifference = Math.abs(frontendAmount - serverCalc.total)
        const TOLERANCE = 0.02 // $0.02 tolerance for rounding

        if (priceDifference > TOLERANCE) {
            console.error('Price mismatch detected!', {
                frontendAmount,
                serverTotal: serverCalc.total,
                difference: priceDifference,
                items: serverCalc.itemDetails
            })
            return NextResponse.json(
                {
                    error: 'Price verification failed',
                    message: 'The cart total does not match. Please refresh and try again.',
                    expectedTotal: serverCalc.total
                },
                { status: 400 }
            )
        }

        // Use SERVER-calculated total (never trust frontend)
        const totalAmount = serverCalc.total

        // If PayPal credentials are not configured, use demo mode (development only)
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            if (process.env.NODE_ENV === 'production') {
                return NextResponse.json(
                    { error: 'PayPal not configured for production' },
                    { status: 500 }
                )
            }
            console.log('PayPal not configured - using demo mode (development only)')
            const demoOrderId = `DEMO-${Date.now().toString(36).toUpperCase()}`
            return NextResponse.json({
                id: demoOrderId,
                status: 'DEMO_MODE',
                verifiedTotal: totalAmount,
                message: 'PayPal credentials not configured. This is a demo order (development only).'
            })
        }

        const accessToken = await getAccessToken()

        // Create order payload with SERVER-calculated total
        const orderPayload = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: totalAmount.toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: currency,
                            value: serverCalc.subtotal.toFixed(2),
                        },
                        shipping: {
                            currency_code: currency,
                            value: serverCalc.shipping.toFixed(2),
                        },
                    },
                },
                description: 'Felix Shtein Wall Art',
                custom_id: JSON.stringify({
                    customerEmail: customerInfo?.email,
                    customerName: customerInfo?.name,
                    verifiedItems: serverCalc.itemDetails,
                }),
            }],
            application_context: {
                brand_name: 'Felix Shtein',
                landing_page: 'NO_PREFERENCE',
                user_action: 'PAY_NOW',
                return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
            },
        }

        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderPayload),
        })

        const order = await response.json()

        if (!response.ok) {
            console.error('PayPal create order error:', order)
            return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 })
        }

        return NextResponse.json({
            ...order,
            verifiedTotal: totalAmount // Send back the verified total
        })

    } catch (error) {
        console.error('PayPal create order error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
