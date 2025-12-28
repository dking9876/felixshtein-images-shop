import { NextRequest, NextResponse } from 'next/server'

// PayPal API configuration
const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || ''

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
        const { amount, currency = 'USD', items, customerInfo } = await request.json()

        // Validate required fields
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        // If PayPal credentials are not configured, use demo mode
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            console.log('PayPal not configured - using demo mode')
            const demoOrderId = `DEMO-${Date.now().toString(36).toUpperCase()}`
            return NextResponse.json({
                id: demoOrderId,
                status: 'DEMO_MODE',
                message: 'PayPal credentials not configured. This is a demo order.'
            })
        }

        const accessToken = await getAccessToken()

        // Create order payload
        const orderPayload = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: amount.toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: currency,
                            value: (amount - 10).toFixed(2), // Subtract shipping
                        },
                        shipping: {
                            currency_code: currency,
                            value: '10.00',
                        },
                    },
                },
                description: 'Felix Shtein Wall Art',
                custom_id: JSON.stringify({
                    customerEmail: customerInfo?.email,
                    customerName: customerInfo?.name,
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

        return NextResponse.json(order)

    } catch (error) {
        console.error('PayPal create order error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
