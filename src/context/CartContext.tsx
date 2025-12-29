'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
    id: string
    productId: string
    productName: string
    productImage: string
    sizeId: string
    sizeDimensions: string
    materialId: string
    materialName: string
    quantity: number
    unitPrice: number
}

// Security: Quantity limits to prevent abuse
const MAX_QUANTITY_PER_ITEM = 10
const MAX_TOTAL_ITEMS = 20

interface CartContextType {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'id'>) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    subtotal: number
    itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('cart')
        if (saved) {
            try {
                setItems(JSON.parse(saved))
            } catch {
                setItems([])
            }
        }
        setLoaded(true)
    }, [])

    useEffect(() => {
        if (loaded) {
            localStorage.setItem('cart', JSON.stringify(items))
        }
    }, [items, loaded])

    const addItem = (item: Omit<CartItem, 'id'>) => {
        // Security: Check total items limit
        const currentTotalItems = items.reduce((sum, i) => sum + i.quantity, 0)
        if (currentTotalItems + item.quantity > MAX_TOTAL_ITEMS) {
            console.warn('Cart limit reached: Maximum items exceeded')
            return
        }

        // Check if same product with same size and material exists
        const existing = items.find(
            i => i.productId === item.productId &&
                i.sizeId === item.sizeId &&
                i.materialId === item.materialId
        )

        if (existing) {
            // Security: Enforce per-item quantity limit
            const newQuantity = Math.min(existing.quantity + item.quantity, MAX_QUANTITY_PER_ITEM)
            setItems(items.map(i =>
                i.id === existing.id
                    ? { ...i, quantity: newQuantity }
                    : i
            ))
        } else {
            // Security: Enforce per-item quantity limit
            const newItem: CartItem = {
                ...item,
                quantity: Math.min(item.quantity, MAX_QUANTITY_PER_ITEM),
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }
            setItems([...items, newItem])
        }
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id)
            return
        }
        // Security: Enforce per-item quantity limit
        const limitedQuantity = Math.min(quantity, MAX_QUANTITY_PER_ITEM)
        setItems(items.map(item =>
            item.id === id ? { ...item, quantity: limitedQuantity } : item
        ))
    }

    const clearCart = () => setItems([])

    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            subtotal,
            itemCount
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
