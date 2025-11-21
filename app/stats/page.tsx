"use client"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { TrendingUp, Trophy, Zap, Clock, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/backend-api"
import { getCurrentUser } from "@/lib/user-storage"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"

const COLORS = ["var(--color-primary)", "var(--color-secondary)", "#888"]

export default function StatsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserStats() {
      try {
        const currentUser = getCurrentUser()
        if (!currentUser) {
          router.push("/")
          return
        }

        // Fetch latest user data from backend
        const userData = await apiFetch(`/api/users/${currentUser.id}`)
        setUser(userData)
      } catch (err: any) {
        console.error("Error loading user stats:", err)
        setError(err.message || "Error al cargar estadísticas")
      } finally {
        setLoading(false)
      }
    }

    loadUserStats()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando estadísticas...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Card className="p-6 text-center">
            <p className="text-red-500">{error || "No se pudo cargar las estadísticas"}</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Volver al inicio
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  const stats = user.stats
  const winRate = stats.gamesPlayed > 0 ? (stats.gamesWon / stats.gamesPlayed) * 100 : 0
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Estadísticas</h1>
            <p className="text-muted-foreground">Análisis completo de tu desempeño</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Partidas Totales</span>
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.gamesPlayed}</p>
            </Card>

            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Tasa de Victoria</span>
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{winRate.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">
                {stats.gamesWon}W-{stats.gamesLost}L-{stats.gamesDraw}D
              </p>
            </Card>

            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total de Movimientos</span>
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.totalMoves}</p>
            </Card>

            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Tiempo Total Jugado</span>
                <Clock className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{Math.floor(stats.totalTime / 60)}</p>
              <p className="text-xs text-muted-foreground">minutos</p>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Win Rate Pie Chart */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Resultados</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Victorias", value: stats.gamesWon },
                      { name: "Derrotas", value: stats.gamesLost },
                      { name: "Tablas", value: stats.gamesDraw },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="rgb(5, 150, 213)" />
                    <Cell fill="rgb(124, 58, 237)" />
                    <Cell fill="#888" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Stats by Game Type */}
            <Card className="p-6 space-y-4 lg:col-span-2">
              <h2 className="text-lg font-bold text-foreground">Estadísticas por Tipo de Partida</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: "Normal", jugadas: stats.byGameType.normal.played, victorias: stats.byGameType.normal.won },
                  { name: "Rápida", jugadas: stats.byGameType.rapid.played, victorias: stats.byGameType.rapid.won },
                  { name: "Blitz", jugadas: stats.byGameType.blitz.played, victorias: stats.byGameType.blitz.won },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-foreground)" />
                  <YAxis stroke="var(--color-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-foreground)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="jugadas" fill="rgb(5, 150, 213)" name="Partidas Jugadas" />
                  <Bar dataKey="victorias" fill="rgb(34, 197, 94)" name="Victorias" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Game History */}
          {user.gameHistory && user.gameHistory.length > 0 && (
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Historial de Partidas</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-sm font-semibold text-muted-foreground text-left">
                      <th className="pb-3">Fecha</th>
                      <th className="pb-3">Tipo</th>
                      <th className="pb-3">Oponente</th>
                      <th className="pb-3">Color</th>
                      <th className="pb-3">Resultado</th>
                      <th className="pb-3">Movimientos</th>
                      <th className="pb-3">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.gameHistory.slice(-10).reverse().map((game, idx) => {
                      const userWon =
                        (game.userColor === "white" && game.winner === "white") ||
                        (game.userColor === "black" && game.winner === "black")
                      const isDraw = game.winner === "draw"
                      const resultText = isDraw ? "Empate" : userWon ? "Victoria" : "Derrota"
                      const resultColor = isDraw
                        ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                        : userWon
                          ? "bg-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-red-500/20 text-red-600 dark:text-red-400"

                      return (
                        <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 text-foreground text-sm">
                            {new Date(game.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-foreground text-sm capitalize">{game.gameType}</td>
                          <td className="py-3 text-foreground text-sm">
                            {game.opponentType === "ai" ? game.opponentModel || "IA" : "Humano"}
                          </td>
                          <td className="py-3 text-foreground text-sm capitalize">{game.userColor === "white" ? "Blancas" : "Negras"}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${resultColor}`}>
                              {resultText}
                            </span>
                          </td>
                          <td className="py-3 text-foreground text-sm">{game.moves}</td>
                          <td className="py-3 text-foreground text-sm">{Math.floor(game.duration / 60)}m</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {(!user.gameHistory || user.gameHistory.length === 0) && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No hay partidas en el historial todavía</p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Jugar una partida
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
