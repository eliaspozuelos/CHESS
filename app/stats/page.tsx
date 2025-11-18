"use client"
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
import { TrendingUp, Trophy, Zap, Clock } from "lucide-react"

// Mock data for demonstration
const mockStats = {
  totalGames: 42,
  wins: 18,
  losses: 16,
  draws: 8,
  winRate: 0.43,
  averageMoves: 34.5,
  fastestVictory: 12,
}

const gameHistoryData = [
  { game: "Game 1", rating: 1200, result: "W" },
  { game: "Game 2", rating: 1210, result: "W" },
  { game: "Game 3", rating: 1205, result: "L" },
  { game: "Game 4", rating: 1215, result: "W" },
  { game: "Game 5", rating: 1220, result: "W" },
  { game: "Game 6", rating: 1218, result: "D" },
  { game: "Game 7", rating: 1225, result: "W" },
  { game: "Game 8", rating: 1220, result: "L" },
]

const aiComparison = [
  { name: "ChatGPT-4", wins: 8, losses: 5, draws: 2 },
  { name: "Claude Sonnet", wins: 5, losses: 4, draws: 1 },
  { name: "Gemini Pro", wins: 3, losses: 4, draws: 2 },
  { name: "DeepSeek", wins: 2, losses: 3, draws: 1 },
]

const COLORS = ["var(--color-primary)", "var(--color-secondary)", "#888"]

export default function StatsPage() {
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
              <p className="text-3xl font-bold text-foreground">{mockStats.totalGames}</p>
            </Card>

            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Tasa de Victoria</span>
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{(mockStats.winRate * 100).toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">
                {mockStats.wins}W-{mockStats.losses}L-{mockStats.draws}D
              </p>
            </Card>

            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Promedio de Movimientos</span>
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{mockStats.averageMoves}</p>
            </Card>

            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Victoria Más Rápida</span>
                <Clock className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{mockStats.fastestVictory}</p>
              <p className="text-xs text-muted-foreground">movimientos</p>
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
                      { name: "Victorias", value: mockStats.wins },
                      { name: "Derrotas", value: mockStats.losses },
                      { name: "Tablas", value: mockStats.draws },
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

            {/* Comparison vs AI Models */}
            <Card className="p-6 space-y-4 lg:col-span-2">
              <h2 className="text-lg font-bold text-foreground">Desempeño vs IAs</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={aiComparison}>
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
                  <Bar dataKey="wins" fill="rgb(5, 150, 213)" name="Victorias" />
                  <Bar dataKey="losses" fill="rgb(124, 58, 237)" name="Derrotas" />
                  <Bar dataKey="draws" fill="#888" name="Tablas" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Game History */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Últimas Partidas</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-sm font-semibold text-muted-foreground text-left">
                    <th className="pb-3">Partida</th>
                    <th className="pb-3">Rating</th>
                    <th className="pb-3">Resultado</th>
                    <th className="pb-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {gameHistoryData.map((game, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 text-foreground">{game.game}</td>
                      <td className="py-3 text-foreground font-mono">{game.rating}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            game.result === "W"
                              ? "bg-green-500/20 text-green-600 dark:text-green-400"
                              : game.result === "L"
                                ? "bg-red-500/20 text-red-600 dark:text-red-400"
                                : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                          }`}
                        >
                          {game.result === "W" ? "Victoria" : game.result === "L" ? "Derrota" : "Tablas"}
                        </span>
                      </td>
                      <td className="py-3">
                        <Button variant="outline" size="sm">
                          Analizar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
