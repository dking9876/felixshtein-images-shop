'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                // Set admin session in localStorage for UI state
                localStorage.setItem('adminLoggedIn', 'true')
                router.push('/admin/dashboard')
            } else {
                setError(data.error || 'Invalid email or password')
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        }

        setLoading(false)
    }

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <div className={styles.loginHeader}>
                    <h1>Admin Login</h1>
                    <p>Felix Shtein Wall Art</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}
