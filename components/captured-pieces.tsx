"use client"

interface CapturedPiecesProps {
  pieces: string[]
  playerColor: "white" | "black"
}

const pieceValues: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
}

export default function CapturedPieces({ pieces, playerColor }: CapturedPiecesProps) {
  if (pieces.length === 0) {
    return <div className="text-sm text-muted-foreground text-center py-3">Ninguna pieza capturada</div>
  }

  // Group pieces and calculate material advantage
  const grouped = pieces.reduce(
    (acc, piece) => {
      acc[piece] = (acc[piece] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const totalValue = pieces.reduce((sum, p) => sum + (pieceValues[p] || 0), 0)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {pieces.map((piece, idx) => {
          const pieceSymbols: Record<string, string> = {
            p: "♟",
            n: "♞",
            b: "♝",
            r: "♜",
            q: "♛",
          }
          return (
            <span
              key={idx}
              className="text-2xl opacity-70 hover:opacity-100 transition-opacity"
              title={`Pieza capturada (+${pieceValues[piece] || 0})`}
            >
              {pieceSymbols[piece] || piece}
            </span>
          )
        })}
      </div>
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-muted-foreground">Material</span>
        <span className="font-mono font-bold text-foreground">+{totalValue}</span>
      </div>
    </div>
  )
}
