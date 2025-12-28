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
        // Check if same product with same size and material exists
        const existing = items.find(
            i => i.productId === item.productId &&
                i.sizeId === item.sizeId &&
                i.materialId === item.materialId
        )

        if (existing) {
            setItems(items.map(i =>
                i.id === existing.id
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
            ))
        } else {
            const newItem: CartItem = {
                ...item,
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
        setItems(items.map(item =>
            item.id === id ? { ...item, quantity } : item
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
