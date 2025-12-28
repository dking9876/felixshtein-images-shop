'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CurrencyCode, CURRENCIES, convertCurrency, formatPrice } from '@/lib/pricing'

interface CurrencyContextType {
    currency: CurrencyCode
    setCurrency: (currency: CurrencyCode) => void
    convert: (priceUSD: number) => number
    format: (priceUSD: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencyCode>('USD')

    useEffect(() => {
        const saved = localStorage.getItem('currency') as CurrencyCode | null
        if (saved && CURRENCIES[saved]) {
            setCurrencyState(saved)
        }
    }, [])

    const setCurrency = (newCurrency: CurrencyCode) => {
        setCurrencyState(newCurrency)
        localStorage.setItem('currency', newCurrency)
    }

    const convert = (priceUSD: number) => convertCurrency(priceUSD, currency)
    const format = (priceUSD: number) => formatPrice(convertCurrency(priceUSD, currency), currency)

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, convert, format }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider')
    }
    return context
}
