"use client"

import { useState } from "react"
import { type ChessBoard, getValidMoves, makeMove, getPieceSymbol } from "@/lib/chess-engine"

interface ChessboardProps {
  onMove: (move: string) => void
  board: ChessBoard
  onBoardChange: (board: ChessBoard) => void
}

const files = ["a", "b", "c", "d", "e", "f", "g", "h"]
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"]

export default function Chessboard({ onMove, board, onBoardChange }: ChessboardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [validMoves, setValidMoves] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)

  const handleSquareClick = (square: string) => {
    // If clicking on a valid move destination
    if (validMoves.includes(square) && selectedSquare) {
      const newBoard = makeMove(board, selectedSquare, square)
      if (newBoard !== board) {
        setLastMove({ from: selectedSquare, to: square })
        onBoardChange(newBoard)
        onMove(`${selectedSquare}${square}`)
        setSelectedSquare(null)
        setValidMoves([])
        return
      }
    }

    // If clicking on a piece of current player
    const piece = board.squares[square]
    if (piece && piece.color === board.currentPlayer) {
      setSelectedSquare(square)
      setValidMoves(getValidMoves(board, square))
    } else {
      setSelectedSquare(null)
      setValidMoves([])
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="inline-block border-4 border-primary/30 rounded-lg overflow-hidden shadow-2xl bg-gradient-to-br from-background to-muted">
        {/* Rank labels */}
        <div className="flex">
          <div className="w-8" />
          {files.map((file) => (
            <div
              key={file}
              className="h-14 w-14 flex items-center justify-center text-sm font-bold text-foreground/70 bg-muted/50"
            >
              {file}
            </div>
          ))}
          <div className="w-8" />
        </div>

        {/* Board */}
        {ranks.map((rank) => (
          <div key={rank} className="flex">
            <div className="h-14 w-8 flex items-center justify-center text-sm font-bold text-foreground/70 bg-muted/50">
              {rank}
            </div>
            {files.map((file) => {
              const square = `${file}${rank}`
              const piece = board.squares[square]
              const isLightSquare = (file.charCodeAt(0) - 97 + Number.parseInt(rank)) % 2 === 0
              const isSelected = selectedSquare === square
              const isValidMove = validMoves.includes(square)
              const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square)

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`h-14 w-14 flex items-center justify-center cursor-pointer transition-all text-5xl font-bold select-none relative
                    ${
                      isLightSquare
                        ? "bg-[var(--chess-light)] hover:brightness-95"
                        : "bg-[var(--chess-dark)] hover:brightness-125"
                    }
                    ${isSelected ? "ring-4 ring-primary shadow-lg" : ""}
                    ${isLastMoveSquare ? "bg-secondary/30" : ""}
                  `}
                >
                  {/* Valid move indicator */}
                  {isValidMove && <div className="absolute w-3 h-3 bg-secondary rounded-full opacity-70" />}

                  {/* Piece */}
                  {piece ? (
                    <span className={piece.color === "w" ? "text-white drop-shadow-lg" : "text-black drop-shadow-lg"}>
                      {getPieceSymbol(piece)}
                    </span>
                  ) : null}
                </div>
              )
            })}
            <div className="h-14 w-8 flex items-center justify-center text-sm font-bold text-foreground/70 bg-muted/50">
              {rank}
            </div>
          </div>
        ))}

        {/* File labels */}
        <div className="flex">
          <div className="w-8" />
          {files.map((file) => (
            <div
              key={`${file}-label`}
              className="h-8 w-14 flex items-center justify-center text-sm font-bold text-foreground/70 bg-muted/50"
            >
              {file}
            </div>
          ))}
          <div className="w-8" />
        </div>
      </div>

      {/* Game Status */}
      <div className="text-sm font-semibold text-foreground">
        {board.currentPlayer === "w" ? "♔ Turno: Blancas" : "♚ Turno: Negras"}
      </div>
    </div>
  )
}
