"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy } from "lucide-react"
import { useState } from "react"

interface MoveLogProps {
  moves: string[]
}

export default function MoveLog({ moves }: MoveLogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyPGN = () => {
    // Format as standard PGN notation
    let pgn = ""
    for (let i = 0; i < moves.length; i += 2) {
      pgn += `${Math.floor(i / 2) + 1}. ${moves[i] || ""} ${moves[i + 1] || ""} `
    }

    navigator.clipboard.writeText(pgn.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">Historial de movimientos</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCopyPGN}
          title={copied ? "Copiado!" : "Copiar PGN"}
        >
          {copied ? <span className="text-xs text-green-500">✓</span> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {moves.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Los movimientos aparecerán aquí</p>
        ) : (
          <div className="space-y-1">
            {/* Group moves in pairs (white, black) */}
            {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, idx) => {
              const whiteMove = moves[idx * 2]
              const blackMove = moves[idx * 2 + 1]

              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs text-muted-foreground w-6 font-mono">{idx + 1}.</span>
                  <span className="flex-1 font-mono text-sm text-foreground/80">{whiteMove}</span>
                  {blackMove && <span className="flex-1 font-mono text-sm text-foreground/80">{blackMove}</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Export Button */}
      {moves.length > 0 && (
        <div className="pt-2 border-t border-border">
          <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleCopyPGN}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PGN
          </Button>
        </div>
      )}
    </Card>
  )
}
