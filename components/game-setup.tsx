"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, Clock } from "lucide-react"
import PlayerSelector from "@/components/player-selector"
import type { GameType, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

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

interface GameSetupProps {
  onStartGame: (config: GameConfig) => void
  currentUser: User | null
}

export default function GameSetup({ onStartGame, currentUser }: GameSetupProps) {
  const { toast } = useToast()
  const [config, setConfig] = useState<GameConfig>({
    whitePlayer: { type: "human" },
    blackPlayer: { type: "ai", aiModel: "Gemini Pro", aiLevel: "intermediate" },
    gameType: "rapid",
  })

  const handleWhiteChange = (playerConfig: any) => {
    setConfig((prev) => ({
      ...prev,
      whitePlayer: playerConfig,
    }))
  }

  const handleBlackChange = (playerConfig: any) => {
    setConfig((prev) => ({
      ...prev,
      blackPlayer: playerConfig,
    }))
  }

  const handleGameTypeChange = (gameType: GameType) => {
    setConfig((prev) => ({
      ...prev,
      gameType,
    }))
  }

  const handleStartGame = () => {
    // Validación: Verificar que los jugadores AI tengan modelo y nivel seleccionados
    if (config.whitePlayer.type === "ai" && (!config.whitePlayer.aiModel || !config.whitePlayer.aiLevel)) {
      toast({
        title: "⚠️ Configuración incompleta",
        description: "Por favor selecciona un modelo y nivel de dificultad para el jugador blanco",
        variant: "destructive"
      })
      return
    }

    if (config.blackPlayer.type === "ai" && (!config.blackPlayer.aiModel || !config.blackPlayer.aiLevel)) {
      toast({
        title: "⚠️ Configuración incompleta",
        description: "Por favor selecciona un modelo y nivel de dificultad para el jugador negro",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "✅ Partida iniciada",
      description: `${config.gameType === 'normal' ? 'Partida normal' : config.gameType === 'rapid' ? 'Partida rápida' : 'Blitz'} comenzando...`
    })

    onStartGame(config)
  }

  const gameTypes: { type: GameType; label: string; time: string; description: string }[] = [
    { type: "normal", label: "Normal", time: "60 min", description: "Partida clásica" },
    { type: "rapid", label: "Rápida", time: "10 min", description: "Partida rápida" },
    { type: "blitz", label: "Blitz", time: "3 min", description: "Partida relámpago" },
  ]

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="text-center space-y-2 mb-12">
        <h2 className="text-4xl font-bold text-foreground">Configura tu partida</h2>
        <p className="text-muted-foreground">Elige tus oponentes y personaliza la experiencia</p>
      </div>

      <div className="max-w-3xl mx-auto mb-8">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" />
            Tipo de Partida
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {gameTypes.map((gt) => (
            <Card
              key={gt.type}
              className={`p-4 cursor-pointer transition-all hover:border-primary ${
                config.gameType === gt.type ? "border-primary bg-primary/5" : "border-border"
              }`}
              onClick={() => handleGameTypeChange(gt.type)}
            >
              <div className="text-center space-y-1">
                <p className="font-semibold text-lg">{gt.label}</p>
                <p className="text-2xl font-bold text-primary">{gt.time}</p>
                <p className="text-xs text-muted-foreground">{gt.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Player Configuration Cards */}
  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-8 max-w-4xl mx-auto">
        {/* White Player */}
        <PlayerSelector color="white" playerConfig={config.whitePlayer} onPlayerChange={handleWhiteChange} />

        {/* VS Divider */}
  <div className="hidden md:flex items-center justify-center px-4 self-center">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">VS</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Batalla</div>
          </div>
        </div>

        {/* Black Player */}
        <PlayerSelector color="black" playerConfig={config.blackPlayer} onPlayerChange={handleBlackChange} />
      </div>

      {/* Start Button */}
      <div className="flex justify-center mt-12">
        <Button
          onClick={handleStartGame}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-lg"
        >
          Iniciar Partida
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
