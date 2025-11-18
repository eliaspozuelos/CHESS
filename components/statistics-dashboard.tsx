"use client"

import { Card } from "@/components/ui/card"
import { Trophy, Target, Clock, TrendingUp, Zap } from "lucide-react"
import type { User } from "@/lib/types"
import { fmtDateGT } from "@/lib/format"
interface StatisticsDashboardProps {
  user: User
}

export default function StatisticsDashboard({ user }: StatisticsDashboardProps) {
  const stats = user.stats

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Estadísticas de {user.username}</h2>
        <p className="text-muted-foreground">Resumen de tu desempeño en el ajedrez</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span className="text-sm">Partidas Jugadas</span>
          </div>
          <p className="text-3xl font-bold">{stats.gamesPlayed}</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">Victorias</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.gamesWon}</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Tasa de Victoria</span>
          </div>
          <p className="text-3xl font-bold text-primary">{winRate}%</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="h-4 w-4" />
            <span className="text-sm">Empates</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.gamesDraw}</p>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Métricas de Rendimiento</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Movimientos promedio por victoria</span>
              <span className="text-xl font-bold">{stats.averageMovesPerWin || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tiempo promedio por victoria</span>
              <span className="text-xl font-bold">{formatTime(stats.averageTimePerWin || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total de movimientos</span>
              <span className="text-xl font-bold">{stats.totalMoves}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tiempo total jugado</span>
              <span className="text-xl font-bold">{formatTime(stats.totalTime)}</span>
            </div>
          </div>
        </Card>

        {/* Game Type Breakdown */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Estadísticas por Tipo de Partida
          </h3>
          <div className="space-y-4">
            {/* Normal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Normal (60 min)</span>
                <span className="text-sm text-muted-foreground">{stats.byGameType.normal.played} partidas</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-600 h-full"
                    style={{
                      width: `${stats.byGameType.normal.played > 0
                          ? (stats.byGameType.normal.won / stats.byGameType.normal.played) * 100
                          : 0
                        }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">{stats.byGameType.normal.won}W</span>
              </div>
            </div>

            {/* Rapid */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Rápida (10 min)</span>
                <span className="text-sm text-muted-foreground">{stats.byGameType.rapid.played} partidas</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full"
                    style={{
                      width: `${stats.byGameType.rapid.played > 0
                          ? (stats.byGameType.rapid.won / stats.byGameType.rapid.played) * 100
                          : 0
                        }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">{stats.byGameType.rapid.won}W</span>
              </div>
            </div>

            {/* Blitz */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Blitz (3 min)</span>
                <span className="text-sm text-muted-foreground">{stats.byGameType.blitz.played} partidas</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full"
                    style={{
                      width: `${stats.byGameType.blitz.played > 0
                          ? (stats.byGameType.blitz.won / stats.byGameType.blitz.played) * 100
                          : 0
                        }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">{stats.byGameType.blitz.won}W</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Games */}
      {user.gameHistory.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Historial Reciente</h3>
          <div className="space-y-2">
            {user.gameHistory
              .slice(-5)
              .reverse()
              .map((game) => {
                const userWon =
                  (game.userColor === "white" && game.winner === "white") ||
                  (game.userColor === "black" && game.winner === "black")
                const resultColor =
                  game.winner === "draw" ? "text-yellow-600" : userWon ? "text-green-600" : "text-red-600"
                const resultText = game.winner === "draw" ? "Empate" : userWon ? "Victoria" : "Derrota"

                return (
                  <div key={game.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`font-semibold ${resultColor}`}>{resultText}</div>
                      <div className="text-sm text-muted-foreground">
                        {game.gameType === "normal" ? "Normal" : game.gameType === "rapid" ? "Rápida" : "Blitz"}
                      </div>
                      <div className="text-sm">
                        vs {game.opponentType === "ai" ? game.opponentModel || "AI" : "Humano"}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{game.moves} movimientos</span>
                      <span>{Math.floor(game.duration / 60)}m</span>
                      <span suppressHydrationWarning>{fmtDateGT(game.date)}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>
      )}
    </div>
  )
}
