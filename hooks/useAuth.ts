"use client"

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/backend-api'

export default function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    apiFetch('/api/users/me').then((res) => {
      if (mounted) setUser(res.user)
    }).catch(() => {
      if (mounted) setUser(null)
    }).finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  return { user, setUser, loading }
}
