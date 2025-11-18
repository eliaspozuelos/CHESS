"use client"

import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface GameAnalysisProps {
  moves: string[]
  result: "win" | "loss" | "draw"
}

export default function GameAnalysis({ moves, result }: GameAnalysisProps) {
  // Mock analysis data
  const analysis = {
    bestMoves: 8,
    mistakes: 2,
    blunders: 1,
    accuracy: 92,
    suggestions: [
      { move: "e4", suggestion: "Consider d4 for a stronger opening" },
      { move: "Nf6", suggestion: "Good centralization move" },
      { move: "Bg5", suggestion: "Blunder! Lost material", type: "blunder" },
    ],
  }

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Análisis de Partida</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Precisión</p>
          <p className="text-2xl font-bold text-primary">{analysis.accuracy}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Errores</p>
          <p className="text-2xl font-bold text-secondary">{analysis.mistakes}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Errores Graves</p>
          <p className="text-2xl font-bold text-red-500">{analysis.blunders}</p>
        </div>
      </div>

      {/* Move Analysis */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Movimientos Clave</h3>
        <div className="space-y-2">
          {analysis.suggestions.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              {item.type === "blunder" ? (
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-mono font-bold text-foreground">{item.move}</p>
                <p className="text-sm text-muted-foreground">{item.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
