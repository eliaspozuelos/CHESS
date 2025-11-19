"use client"

import { useState } from "react"
import { apiFetch } from '@/lib/backend-api'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"
import GameSetup from "@/components/game-setup"
import GameBoard from "@/components/game-board"
import GameAnalysis from "@/components/game-analysis"
import UserProfile from "@/components/user-profile"
import StatisticsDashboard from "@/components/statistics-dashboard"
import Leaderboard from "@/components/leaderboard"
import type { User, GameType } from "@/lib/types"

type GameState = "setup" | "playing" | "finished"

interface GameConfig {
  whitePlayer: {
    type: "human" | "ai"
    aiModel?: string
    aiLevel?: "beginner" | "intermediate" | "advanced" | "master"
  }
  blackPlayer: {
    type: "human" | "ai"
    aiModel?: string
    aiLevel?: "beginner" | "intermediate" | "advanced" | "master"
  }
  gameType: GameType
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("setup")
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    whitePlayer: { type: "human" },
    blackPlayer: { type: "ai", aiModel: "gpt-4", aiLevel: "intermediate" },
    gameType: "rapid",
  })
  const [moves, setMoves] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<string>("game")

  const handleStartGame = (config: GameConfig) => {
    // create game on backend
    ; (async () => {
      setGameConfig(config)
      setMoves([])
      try {
        const res = await apiFetch('/api/games/create', {
          method: 'POST',
          body: JSON.stringify({ config }),
        })
        const gameId = res.game?.id
        console.log('Game created:', gameId)
        // store game id so GameBoard can connect via WebSocket
        setGameState('playing')
          // Set global variable for GameBoard to pick up
          ; (window as any).__CURRENT_GAME_ID = gameId
      } catch (e) {
        console.error('Failed to create game:', e)
        setGameState('setup')
      }
    })()
  }

  const handleGameEnd = (result: "win" | "loss" | "draw") => {
    setGameState("finished")
  }

  const handleBackToSetup = () => {
    setGameState("setup")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* If not logged in, show only the login/profile card centered */}
        {!currentUser ? (
          <div className="max-w-xl mx-auto">
            <UserProfile onUserChange={setCurrentUser} />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <UserProfile onUserChange={setCurrentUser} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
                <TabsTrigger value="game">Jugar</TabsTrigger>
                <TabsTrigger value="stats" disabled={!currentUser}>
                  Estadísticas
                </TabsTrigger>
                <TabsTrigger value="ranking">Ranking</TabsTrigger>
              </TabsList>

              <TabsContent value="game" className="space-y-6">
                {gameState === "setup" && <GameSetup onStartGame={handleStartGame} currentUser={currentUser} />}

                {gameState === "playing" && (
                  <div className="space-y-4">
                    <Button variant="outline" onClick={handleBackToSetup} className="mb-4 bg-transparent">
                      Atrás al Setup
                    </Button>
                    <GameBoard gameConfig={gameConfig} currentUser={currentUser} onGameEnd={handleGameEnd} />
                  </div>
                )}

                {gameState === "finished" && (
                  <div className="space-y-6">
                    <Button variant="outline" onClick={handleBackToSetup} className="mb-4 bg-transparent">
                      Nueva Partida
                    </Button>
                    <GameAnalysis moves={moves} result="win" />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stats">{currentUser && <StatisticsDashboard user={currentUser} />}</TabsContent>

              <TabsContent value="ranking">
                <Leaderboard />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
