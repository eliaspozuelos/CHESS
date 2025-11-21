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

    // Validaciones
    if (!user.trim()) {
      setError('Por favor ingresa tu usuario o email')
      return
    }
    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña')
      return
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: user.trim(), password })
      })
      onSuccess?.(res.user)
    } catch (e: any) {
      setError(e.message || 'Usuario o contraseña incorrectos')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        placeholder="usuario o email"
        required
        maxLength={50}
      />
      <input
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="contraseña"
        required
        minLength={4}
        maxLength={100}
      />
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      <button
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
