"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser, createUser, authenticateUser, logoutUser, saveUser } from "@/lib/user-storage"
import type { User } from "@/lib/types"
import { UserCircle, LogOut } from "lucide-react"
import { apiFetch } from "@/lib/backend-api"

interface UserProfileProps {
  onUserChange: (user: User | null) => void
}

export default function UserProfile({ onUserChange }: UserProfileProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  // Show login form by default on first visit
  const [isCreating, setIsCreating] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(true)
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const user = getCurrentUser()

      if (user) {
        // Sync stats from backend on page load
        try {
          const response = await apiFetch(`/api/users/${user.id}`)
          if (response && response.user && response.user.stats) {
            const updatedUser = {
              ...user,
              stats: response.user.stats
            }
            saveUser(updatedUser)
            console.log("✅ Stats synced from backend on page load:", response.user.stats)
            setCurrentUser(updatedUser)
            onUserChange(updatedUser)
            setIsLoggingIn(false)
            return
          }
        } catch (err) {
          console.warn("⚠️ Could not sync stats from backend on page load:", err)
        }
        setIsLoggingIn(false)
      }

      setCurrentUser(user)
      onUserChange(user)
    }

    loadUser()
  }, [onUserChange])

  const handleCreateUser = async () => {
    if (username.trim().length < 2) {
      alert("El nombre de usuario debe tener al menos 2 caracteres")
      return
    }
    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsBusy(true)
    try {
      const user = await createUser(username.trim(), password)
      setCurrentUser(user)
      onUserChange(user)
      setUsername("")
      setPassword("")
      setIsCreating(false)
    } catch (error: any) {
      alert(error.message || 'Error al crear usuario. Intenta con otro nombre de usuario.')
    } finally {
      setIsBusy(false)
    }
  }

  const handleLogin = async () => {
    if (username.trim().length < 2 || password.length < 1) {
      alert("Ingresa usuario y contraseña")
      return
    }
    setIsBusy(true)
    try {
      const user = await authenticateUser(username.trim(), password)
      if (!user) {
        alert("Usuario o contraseña incorrectos")
        return
      }

      // Sync stats from backend after login
      try {
        const response = await apiFetch(`/api/users/${user.id}`)
        if (response && response.user && response.user.stats) {
          // Update local user with backend stats
          user.stats = response.user.stats
          saveUser(user)
          console.log("✅ Stats synced from backend after login:", response.user.stats)
        }
      } catch (err) {
        console.warn("⚠️ Could not sync stats from backend:", err)
        // Continue with local stats
      }

      setCurrentUser(user)
      onUserChange(user)
      setUsername("")
      setPassword("")
      setIsLoggingIn(false)
    } finally {
      setIsBusy(false)
    }
  }

  const handleLogout = () => {
    logoutUser()
    setCurrentUser(null)
    onUserChange(null)
  }

  if (currentUser) {
    return (
      <Card className="p-4 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold">{currentUser.username}</p>
              <p className="text-xs text-muted-foreground">
                {currentUser.stats.gamesWon}W - {currentUser.stats.gamesLost}L - {currentUser.stats.gamesDraw}D
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </Card>
    )
  }

  if (isCreating) {
    return (
      <Card className="p-4 space-y-3">
        <div className="space-y-2">
          <Label htmlFor="username">Nombre de usuario</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu nombre"
            onKeyDown={(e) => e.key === "Enter" && handleCreateUser()}
          />
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            onKeyDown={(e) => e.key === "Enter" && handleCreateUser()}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateUser} className="flex-1">
            {isBusy ? 'Creando...' : 'Crear perfil'}
          </Button>
          <Button variant="outline" onClick={() => setIsCreating(false)}>
            Cancelar
          </Button>
        </div>
      </Card>
    )
  }

  if (isLoggingIn) {
    return (
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-3">
          <UserCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Bienvenido</h2>
          <p className="text-sm text-muted-foreground text-center">Inicia sesión para continuar y guardar tus estadísticas</p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="grid gap-2">
            <Button onClick={handleLogin} className="w-full py-3 bg-primary text-primary-foreground">
              {isBusy ? "Iniciando..." : "Iniciar sesión"}
            </Button>
            <Button variant="outline" onClick={() => { setIsCreating(true); setIsLoggingIn(false) }} className="w-full py-3">
              Crear perfil
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 text-center space-y-3">
      <UserCircle className="h-12 w-12 mx-auto text-muted-foreground" />
      <div>
        <p className="font-medium">Bienvenido</p>
        <p className="text-sm text-muted-foreground">Crea un perfil para guardar tus estadísticas</p>
      </div>
      <div className="grid gap-2">
        <Button onClick={() => setIsCreating(true)} className="w-full">
          Crear perfil
        </Button>
        <Button variant="outline" onClick={() => setIsLoggingIn(true)} className="w-full">
          Iniciar sesión
        </Button>
      </div>
    </Card>
  )
}
