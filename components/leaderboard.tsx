"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, TrendingUp, Target } from "lucide-react"
import { getLeaderboard } from "@/lib/user-storage"
import type { User } from "@/lib/types"
import { fmtDateGT } from "@/lib/format"

type SortBy = "wins" | "winRate" | "gamesPlayed"

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([])
  const [sortBy, setSortBy] = useState<SortBy>("wins")

  useEffect(() => {
    loadLeaderboard()
  }, [sortBy])

  const loadLeaderboard = () => {
    const allUsers = getLeaderboard()

    const sorted = [...allUsers].sort((a, b) => {
      switch (sortBy) {
        case "wins":
          return b.stats.gamesWon - a.stats.gamesWon
        case "winRate":
          const aRate = a.stats.gamesPlayed > 0 ? a.stats.gamesWon / a.stats.gamesPlayed : 0
          const bRate = b.stats.gamesPlayed > 0 ? b.stats.gamesWon / b.stats.gamesPlayed : 0
          return bRate - aRate
        case "gamesPlayed":
          return b.stats.gamesPlayed - a.stats.gamesPlayed
        default:
          return 0
      }
    })

    setUsers(sorted)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getWinRate = (user: User) => {
    if (user.stats.gamesPlayed === 0) return 0
    return Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Tabla de Clasificación
        </h2>
        <p className="text-muted-foreground">Los mejores jugadores de ajedrez</p>
      </div>

      {/* Sort Options */}
      <div className="flex justify-center gap-2">
        <Button
          variant={sortBy === "wins" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("wins")}
          className="gap-2"
        >
          <Trophy className="h-4 w-4" />
          Victorias
        </Button>
        <Button
          variant={sortBy === "winRate" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("winRate")}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Tasa de Victoria
        </Button>
        <Button
          variant={sortBy === "gamesPlayed" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("gamesPlayed")}
          className="gap-2"
        >
          <Target className="h-4 w-4" />
          Partidas Jugadas
        </Button>
      </div>

      {/* Leaderboard */}
      {users.length === 0 ? (
        <Card className="p-12 text-center">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No hay jugadores registrados aún</p>
          <p className="text-sm text-muted-foreground mt-2">Crea un perfil y juega para aparecer en la clasificación</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => {
            const rank = index + 1
            const winRate = getWinRate(user)
            const isTopThree = rank <= 3

            return (
              <Card
                key={user.id}
                className={`p-4 transition-all ${isTopThree ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/30" : ""
                  }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">{getRankIcon(rank)}</div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{user.username}</h3>
                    <p className="text-sm text-muted-foreground">
                      <>
                        Miembro desde{" "}
                        <span suppressHydrationWarning>{fmtDateGT(user.createdAt)}</span>
                      </>

                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{user.stats.gamesWon}</p>
                      <p className="text-xs text-muted-foreground">Victorias</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{winRate}%</p>
                      <p className="text-xs text-muted-foreground">Tasa</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{user.stats.gamesPlayed}</p>
                      <p className="text-xs text-muted-foreground">Partidas</p>
                    </div>
                  </div>
                </div>

                {/* Additional Stats for Top 3 */}
                {isTopThree && (
                  <div className="mt-4 pt-4 border-t border-primary/20 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{user.stats.averageMovesPerWin || 0}</p>
                      <p className="text-xs text-muted-foreground">Mov. promedio</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{Math.floor((user.stats.averageTimePerWin || 0) / 60)}m</p>
                      <p className="text-xs text-muted-foreground">Tiempo promedio</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{user.stats.gamesDraw}</p>
                      <p className="text-xs text-muted-foreground">Empates</p>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
