// Pricing configuration
export const PRICING = {
    // Base prices in USD (for canvas material)
    base: {
        small: 50,
        medium: 100,
        large: 200,
    },

    // Size configurations
    sizes: [
        { id: 'small', dimensions: '20x30', label: '20x30 cm', multiplier: 1.0 },
        { id: 'medium', dimensions: '40x60', label: '40x60 cm', multiplier: 2.0 },
        { id: 'large', dimensions: '60x90', label: '60x90 cm', multiplier: 4.0 },
    ],

    // Material configurations with price multipliers
    materials: [
        { id: 'canvas', name: 'Canvas', nameHe: 'קנבס', nameRu: 'Холст', multiplier: 1.0 },
        { id: 'framed', name: 'Framed Print', nameHe: 'הדפס ממוסגר', nameRu: 'В раме', multiplier: 1.2 },
        { id: 'paper_glossy', name: 'Photo Paper (Glossy)', nameHe: 'נייר צילום (מבריק)', nameRu: 'Фотобумага (глянец)', multiplier: 0.6 },
        { id: 'paper_matte', name: 'Photo Paper (Matte)', nameHe: 'נייר צילום (מט)', nameRu: 'Фотобумага (матовая)', multiplier: 0.6 },
        { id: 'metal', name: 'Metal Print', nameHe: 'הדפס מתכת', nameRu: 'На металле', multiplier: 1.6 },
        { id: 'acrylic', name: 'Acrylic Print', nameHe: 'הדפס אקרילי', nameRu: 'На акриле', multiplier: 1.8 },
        { id: 'wood', name: 'Wood Print', nameHe: 'הדפס עץ', nameRu: 'На дереве', multiplier: 1.4 },
    ],
} as const

// Calculate price for a given size and material
export function calculatePrice(sizeId: string, materialId: string, basePrice: number = PRICING.base.small): number {
    const size = PRICING.sizes.find(s => s.id === sizeId)
    const material = PRICING.materials.find(m => m.id === materialId)

    if (!size || !material) {
        return basePrice
    }

    return Math.round(basePrice * size.multiplier * material.multiplier)
}

// Currency configuration
export const CURRENCIES = {
    USD: { symbol: '$', rate: 1, label: 'USD' },
    ILS: { symbol: '₪', rate: 3.7, label: 'ILS' },
} as const

export type CurrencyCode = keyof typeof CURRENCIES

// Convert price between currencies
export function convertCurrency(priceUSD: number, toCurrency: CurrencyCode): number {
    return Math.round(priceUSD * CURRENCIES[toCurrency].rate)
}

// Format price with currency symbol
export function formatPrice(price: number, currency: CurrencyCode = 'USD'): string {
    const { symbol } = CURRENCIES[currency]
    return `${symbol}${price.toLocaleString()}`
}

// Shipping cost
export const SHIPPING_COST_USD = 10
