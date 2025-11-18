"use client"

import { Card } from "@/components/ui/card"
import { Bot, User, Clock, Heart } from "lucide-react"
import CapturedPieces from "@/components/captured-pieces"

interface PlayerInfoProps {
  playerType: "human" | "ai"
  playerColor: "white" | "black"
  playerName: string
  level?: "beginner" | "intermediate" | "advanced" | "master"
  isCurrentTurn: boolean
  timeRemaining?: string
  capturedPieces?: string[]
}

const levelColors = {
  beginner: "text-green-500",
  intermediate: "text-yellow-500",
  advanced: "text-orange-500",
  master: "text-red-500",
}

export default function PlayerInfo({
  playerType,
  playerColor,
  playerName,
  level,
  isCurrentTurn,
  timeRemaining = "10:00",
  capturedPieces = [],
}: PlayerInfoProps) {
  const colorBg =
    playerColor === "white" ? "bg-white dark:bg-gray-200 shadow-sm" : "bg-gray-800 dark:bg-black shadow-sm"

  const levelClass = level ? levelColors[level] : ""

  return (
    <Card
      className={`p-6 space-y-6 transition-all duration-300 ${
        isCurrentTurn ? "ring-2 ring-primary/60 shadow-lg bg-gradient-to-br from-primary/5 to-transparent" : ""
      }`}
    >
      {/* Player Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-full border-3 border-border ${colorBg} flex items-center justify-center`}>
            {playerType === "human" ? (
              <User className="h-6 w-6 text-foreground" />
            ) : (
              <Bot className="h-6 w-6 text-primary" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="font-bold text-lg text-foreground">{playerName}</h3>
              <span className={`text-xs font-semibold uppercase tracking-wide ${levelClass}`}>
                {level || (playerType === "human" ? "Jugador" : "IA")}
              </span>
            </div>
            {playerType === "ai" && level && 
            <p className="text-xs text-muted-foreground mt-1">Dificultad: {level}</p>}
          </div>
        </div>

        {/* Status Indicator */}
        {isCurrentTurn && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
            <Heart className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Tu turno</span>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <Clock className="h-5 w-5 text-foreground/60" />
        <span className="font-mono text-lg font-bold text-foreground">{timeRemaining}</span>
      </div>

      {/* Captured Pieces Section */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Piezas capturadas</p>
        <CapturedPieces pieces={capturedPieces} playerColor={playerColor} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Movimientos</p>
          <p className="text-lg font-bold text-foreground">0</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Evaluación</p>
          <p className="text-lg font-bold text-foreground">0.0</p>
        </div>
      </div>
    </Card>
  )
}
