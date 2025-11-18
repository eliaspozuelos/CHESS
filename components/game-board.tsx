"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Chessboard from "@/components/chessboard"
import PlayerInfo from "@/components/player-info"
import MoveLog from "@/components/move-log"
import TeachModePanel from "@/components/teach-mode-panel"
import { type ChessBoard, initializeBoard } from "@/lib/chess-engine"
import { RotateCcw, Pause as Pause2, Play, Flag, GraduationCap, Eye, EyeOff } from "lucide-react"
import type { User, GameType } from "@/lib/types"
import { generateTeachContent, type TeachContent } from "@/lib/teach-mode"

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

interface GameBoardProps {
  gameConfig: GameConfig
  currentUser: User | null
  onGameEnd: (result: "win" | "loss" | "draw") => void
}

export default function GameBoard({ gameConfig, currentUser, onGameEnd }: GameBoardProps) {
  const [board, setBoard] = useState<ChessBoard | null>(null)
  const [moves, setMoves] = useState<string[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [gameStatus, setGameStatus] = useState<"playing" | "checkmate" | "stalemate" | "resigned">("playing")
  const [teachModeEnabled, setTeachModeEnabled] = useState(false)
  const [currentTeachContent, setCurrentTeachContent] = useState<TeachContent | null>(null)
  const [showTeachPanel, setShowTeachPanel] = useState(false)

  const [predictionMode, setPredictionMode] = useState(false)
  const [savedBoard, setSavedBoard] = useState<ChessBoard | null>(null)
  const [savedMoves, setSavedMoves] = useState<string[]>([])
  const [predictionMoves, setPredictionMoves] = useState<string[]>([])

  const getInitialTime = (gameType: GameType) => {
    switch (gameType) {
      case "normal":
        return 3600
      case "rapid":
        return 600
      case "blitz":
        return 180
      default:
        return 600
    }
  }

  const [whiteTime, setWhiteTime] = useState(getInitialTime(gameConfig.gameType))
  const [blackTime, setBlackTime] = useState(getInitialTime(gameConfig.gameType))
  const gameStartTime = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleGameEnd = (winner: "white" | "black") => {
    onGameEnd(winner === "white" ? "win" : "loss")
  }

  useEffect(() => {
    setBoard(initializeBoard())
    gameStartTime.current = Date.now()
  }, [])

  useEffect(() => {
    if (!isPaused && !predictionMode && board && gameStatus === "playing") {
      timerRef.current = setInterval(() => {
        if (board.currentPlayer === "w") {
          setWhiteTime((t) => {
            const newTime = Math.max(0, t - 1)
            if (newTime === 0) {
              handleGameEnd("black")
            }
            return newTime
          })
        } else {
          setBlackTime((t) => {
            const newTime = Math.max(0, t - 1)
            if (newTime === 0) {
              handleGameEnd("white")
            }
            return newTime
          })
        }
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, predictionMode, board, gameStatus])

  const handleEnterPredictionMode = () => {
    if (board) {
      setSavedBoard(JSON.parse(JSON.stringify(board)))
      setSavedMoves([...moves])
      setPredictionMoves([])
      setPredictionMode(true)
    }
  }

  const handleExitPredictionMode = () => {
    if (savedBoard) {
      setBoard(savedBoard)
      setMoves(savedMoves)
      setSavedBoard(null)
      setSavedMoves([])
      setPredictionMoves([])
      setPredictionMode(false)
    }
  }

  const handleMove = (move: string) => {
    if (board) {
      if (predictionMode) {
        setPredictionMoves([...predictionMoves, move])
      } else {
        setMoves([...moves, move])
      }

      if (teachModeEnabled && !predictionMode) {
        const isAIMove =
          (board.currentPlayer === "w" && gameConfig.whitePlayer.type === "ai") ||
          (board.currentPlayer === "b" && gameConfig.blackPlayer.type === "ai")

        if (isAIMove) {
          const content = generateTeachContent(board, move)
          setCurrentTeachContent(content)
          setShowTeachPanel(true)
        }
      }
    }
  }

  const handleRequestExplanation = () => {
    if (board && moves.length > 0) {
      const content = generateTeachContent(board, moves[moves.length - 1])
      setCurrentTeachContent(content)
      setShowTeachPanel(true)
    }
  }

  const handleUndo = () => {
    if (moves.length > 0) {
      setMoves(moves.slice(0, -1))
    }
  }

  const handleResign = () => {
    const winner = board?.currentPlayer === "w" ? "black" : "white"
    setGameStatus("resigned")
    handleGameEnd(winner)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!board) return null

  const whiteCapturedByBlack = board.capturedPieces.b
  const blackCapturedByWhite = board.capturedPieces.w

  return (
    <div className="space-y-6">
      {gameStatus !== "playing" && (
        <div className="px-4 py-3 bg-primary/10 border border-primary rounded-lg">
          <p className="text-center font-semibold text-primary">
            {gameStatus === "checkmate" && "Jaque mate"}
            {gameStatus === "stalemate" && "Ahogado"}
            {gameStatus === "resigned" && "Partida rendida"}
          </p>
        </div>
      )}

      {predictionMode && (
        <Alert className="bg-blue-500/10 border-blue-500">
          <Eye className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="font-semibold">
              Modo Predicción Activo - Explora movimientos sin afectar la partida real
            </span>
            <Button size="sm" variant="outline" onClick={handleExitPredictionMode} className="gap-2 bg-transparent">
              <EyeOff className="h-4 w-4" />
              Salir
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-primary" />
            <div>
              <Label htmlFor="teach-mode" className="font-semibold">
                Modo Enseñanza
              </Label>
              <p className="text-xs text-muted-foreground">Recibe explicaciones después de cada movimiento de la IA</p>
            </div>
          </div>
          <Switch id="teach-mode" checked={teachModeEnabled} onCheckedChange={setTeachModeEnabled} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-2">
          <PlayerInfo
            playerType={gameConfig.whitePlayer.type}
            playerColor="white"
            playerName={
              gameConfig.whitePlayer.type === "human"
                ? "Tú (Blancas)"
                : gameConfig.whitePlayer.aiModel || "IA (Blancas)"
            }
            level={gameConfig.whitePlayer.aiLevel}
            isCurrentTurn={board.currentPlayer === "w"}
            timeRemaining={formatTime(whiteTime)}
            capturedPieces={whiteCapturedByBlack}
          />
        </div>

        <div className="md:col-span-8">
          <Card className="p-6 space-y-6">
            <Chessboard onMove={handleMove} board={board} onBoardChange={setBoard} />

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={moves.length === 0 || predictionMode}
                  className="gap-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  Deshacer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                  className="gap-2"
                  disabled={predictionMode}
                >
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4" />
                      Reanudar
                    </>
                  ) : (
                    <>
                      <Pause2 className="h-4 w-4" />
                      Pausar
                    </>
                  )}
                </Button>
                {!predictionMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnterPredictionMode}
                    disabled={gameStatus !== "playing"}
                    className="gap-2 bg-blue-500/10 border-blue-500 hover:bg-blue-500/20"
                  >
                    <Eye className="h-4 w-4" />
                    Predicción
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExitPredictionMode}
                    className="gap-2 bg-blue-500/10 border-blue-500 hover:bg-blue-500/20"
                  >
                    <EyeOff className="h-4 w-4" />
                    Salir Predicción
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestExplanation}
                  disabled={moves.length === 0 || predictionMode}
                  className="gap-2 bg-transparent"
                >
                  <GraduationCap className="h-4 w-4" />
                  Explicar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleResign}
                  disabled={gameStatus !== "playing" || predictionMode}
                  className="gap-2"
                >
                  <Flag className="h-4 w-4" />
                  Rendirse
                </Button>
              </div>

              {predictionMode && (
                <div className="text-center text-sm text-blue-600 font-medium">
                  Movimientos de predicción: {predictionMoves.length}
                </div>
              )}

              {gameConfig.whitePlayer.type === "ai" && gameConfig.blackPlayer.type === "ai" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Velocidad de partida</label>
                  <input type="range" min="0.5" max="3" step="0.5" defaultValue="1" className="w-full" />
                </div>
              )}
            </div>

            {showTeachPanel && currentTeachContent && !predictionMode && (
              <div className="mt-4">
                <TeachModePanel
                  explanation={currentTeachContent.explanation}
                  exercise={currentTeachContent.exercise}
                  onExerciseComplete={() => {
                    setTimeout(() => setShowTeachPanel(false), 1000)
                  }}
                />
              </div>
            )}
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <PlayerInfo
            playerType={gameConfig.blackPlayer.type}
            playerColor="black"
            playerName={
              gameConfig.blackPlayer.type === "human" ? "Tú (Negras)" : gameConfig.blackPlayer.aiModel || "IA (Negras)"
            }
            level={gameConfig.blackPlayer.aiLevel}
            isCurrentTurn={board.currentPlayer === "b"}
            timeRemaining={formatTime(blackTime)}
            capturedPieces={blackCapturedByWhite}
          />

          <MoveLog moves={predictionMode ? [...moves, ...predictionMoves] : moves} />
        </div>
      </div>
    </div>
  )
}
