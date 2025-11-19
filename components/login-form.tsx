"use client"

import { useState } from 'react'
import { apiFetch } from '@/lib/backend-api'

export default function LoginForm({ onSuccess }: { onSuccess?: (user: any) => void }) {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: any) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: user, password })
      })
      onSuccess?.(res.user)
    } catch (e: any) {
      setError(e.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input className="w-full" value={user} onChange={(e) => setUser(e.target.value)} placeholder="usuario o email" />
      <input className="w-full" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="contraseña" />
      {error && <div className="text-red-500">{error}</div>}
      <button className="btn" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
    </form>
  )
}
