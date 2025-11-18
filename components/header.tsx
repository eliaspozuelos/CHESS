"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, Moon, Sun } from "lucide-react"

export default function Header() {
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            ♟
          </div>
          <h1 className="text-2xl font-bold text-foreground">AI Chess Duel</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            Estadísticas
          </a>
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            Historial
          </a>
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            Configuración
          </a>
        </nav>

        {/* Theme Toggle & Menu */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-lg">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-border px-4 py-4 space-y-2">
          <a href="#" className="block px-4 py-2 rounded hover:bg-muted">
            Estadísticas
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-muted">
            Historial
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-muted">
            Configuración
          </a>
        </nav>
      )}
    </header>
  )
}
