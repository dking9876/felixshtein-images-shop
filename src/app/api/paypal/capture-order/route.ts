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

// Capture PayPal order (complete the payment)
export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json()

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
        }

        // Demo mode check
        if (orderId.startsWith('DEMO-')) {
            const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}`
            return NextResponse.json({
                status: 'COMPLETED',
                orderNumber,
                message: 'Demo order completed successfully'
            })
        }

        // If PayPal credentials are not configured
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            return NextResponse.json({ error: 'PayPal not configured' }, { status: 500 })
        }

        const accessToken = await getAccessToken()

        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })

        const captureData = await response.json()

        if (!response.ok) {
            console.error('PayPal capture error:', captureData)
            return NextResponse.json({ error: 'Failed to capture PayPal order' }, { status: 500 })
        }

        // Generate order number for our system
        const orderNumber = `FS-${Date.now().toString(36).toUpperCase()}`

        // Here you would save the order to your database
        // For now, we just return success

        return NextResponse.json({
            status: captureData.status,
            orderNumber,
            paypalOrderId: orderId,
            captureId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        })

    } catch (error) {
        console.error('PayPal capture error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
