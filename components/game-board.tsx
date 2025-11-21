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
import { apiFetch } from '@/lib/backend-api'
import useGameSocket from '@/hooks/useGameSocket'
import { makeMove as engineMakeMove } from '@/lib/chess-engine'
import { RotateCcw, Pause as Pause2, Play, Flag, GraduationCap, Eye, EyeOff, AlertCircle } from "lucide-react"
import type { User, GameType } from "@/lib/types"
import { getCurrentUser } from "@/lib/user-storage"
import { generateTeachContent, type TeachContent } from "@/lib/teach-mode"
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

interface GameBoardProps {
  gameConfig: GameConfig
  currentUser: User | null
  onGameEnd: (result: "win" | "loss" | "draw", moves: string[]) => void
}

export default function GameBoard({ gameConfig, currentUser, onGameEnd }: GameBoardProps) {
  const { toast } = useToast()
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
  const [moveError, setMoveError] = useState<string | null>(null)

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
  const lastValidFen = useRef<string | null>(null)

  const handleGameEnd = async (winner: "white" | "black") => {
    toast({
      title: winner === "white" ? "🏆 Victoria de las Blancas" : "🏆 Victoria de las Negras",
      description: gameStatus === "checkmate" ? "¡Jaque mate!" : gameStatus === "resigned" ? "El oponente se rindió" : "Juego terminado"
    })

    onGameEnd(winner === "white" ? "win" : "loss", moves)

    // Save game statistics to backend
    try {
      const currentUser = getCurrentUser()
      if (!currentUser || !gameStartTime.current) return

      const gameDuration = Math.floor((Date.now() - gameStartTime.current) / 1000)
      const userColor = gameConfig.whitePlayer.type === "human" ? "white" : "black"

      // Determine opponent info
      const opponentConfig = userColor === "white" ? gameConfig.blackPlayer : gameConfig.whitePlayer
      const opponentType = opponentConfig.type
      const opponentModel = opponentType === "ai" ? opponentConfig.aiModel : undefined

      const gameResult = {
        date: new Date().toISOString(),
        gameType: gameConfig.gameType,
        whitePlayer: gameConfig.whitePlayer.type === "ai"
          ? `AI (${gameConfig.whitePlayer.aiModel})`
          : currentUser.username,
        blackPlayer: gameConfig.blackPlayer.type === "ai"
          ? `AI (${gameConfig.blackPlayer.aiModel})`
          : currentUser.username,
        winner: winner,
        moves: moves.length,
        duration: gameDuration,
        userColor: userColor,
        opponentType: opponentType,
        opponentModel: opponentModel
      }

      await apiFetch(`/api/users/${currentUser.id}/stats`, {
        method: "POST",
        body: JSON.stringify(gameResult)
      })

      console.log("✅ Statistics saved to backend")
    } catch (err) {
      console.error("❌ Error saving game statistics:", err)
      toast({
        title: "⚠️ Error al guardar estadísticas",
        description: "No se pudieron guardar las estadísticas de la partida",
        variant: "destructive"
      })
    }
  }

  const [currentGameId, setCurrentGameId] = useState<string | null>(null)

  useEffect(() => {
    const initialBoard = initializeBoard()
    setBoard(initialBoard)
    gameStartTime.current = Date.now()
    // pick up game id set by the starter (created in app/page)
    try {
      const g = (window as any).__CURRENT_GAME_ID as string | undefined
      setCurrentGameId(g ?? null)

      // ⚠️ NO solicitar movimiento inicial de IA aquí
      // El backend lo maneja automáticamente en createGame para partidas AI vs AI
      // Para humano vs AI, el backend solicita el movimiento después del primer movimiento del humano
      if (g && gameConfig.whitePlayer.type === 'ai') {
        console.log('\n🎮 ═══════════════════════════════════════')
        console.log('   INICIO DE PARTIDA')
        console.log('   Blancas: IA - El backend manejará el primer movimiento')
        console.log('═══════════════════════════════════════\n')
      }
    } catch (e) {
      setCurrentGameId(null)
    }
  }, [])

  // socket: update board when server broadcasts a move_made
  const { emitMove, emitResign } = useGameSocket(currentGameId, {
    onMoveMade: (payload) => {
      try {
        console.log('\n📨 ═══════════════════════════════════════')
        console.log('   Movimiento recibido del servidor')
        console.log('   Payload:', JSON.stringify(payload, null, 2))
        console.log('═══════════════════════════════════════')

        const mv = payload.move || {}
        let from = ""
        let to = ""

        if (mv.uci) {
          from = mv.uci.slice(0, 2)
          to = mv.uci.slice(2, 4)
        } else if (mv.from && mv.to) {
          from = mv.from
          to = mv.to
        } else if (typeof mv === "string" && mv.length >= 4) {
          from = mv.slice(0, 2)
          to = mv.slice(2, 4)
        }

        if (!from || !to) {
          console.warn("⚠️ No se pudo determinar from/to del payload:", payload)
          return
        }

        // ✅ Usar SIEMPRE la versión más reciente del tablero
        let updatedBoard: ChessBoard | null = null

        setBoard((prev) => {
          if (!prev) return prev

          const piece = prev.squares[from]?.type || "?"
          const pieceNames: Record<string, string> = {
            p: "♟️ Peón",
            n: "♞ Caballo",
            b: "♝ Alfil",
            r: "♜ Torre",
            q: "♛ Reina",
            k: "♚ Rey",
            "?": "♟️ ?",
          }
          const pieceName = pieceNames[piece] || "♟️ ?"

          console.log(`\n${pieceName.split(" ")[0]} ═══════════════════════════════════════`)
          console.log(`   EJECUTANDO MOVIMIENTO`)
          console.log(`   ${from.toUpperCase()} → ${to.toUpperCase()}`)
          console.log(`   Pieza: ${pieceName}`)
          console.log(`═══════════════════════════════════════\n`)

          const nb = engineMakeMove(prev, from, to)
          updatedBoard = nb

          // Save last valid move for reference
          lastValidFen.current = `${from}${to}`

          return nb
        })

        // Actualizar historial usando el estado anterior
        setMoves((prev) => [...prev, `${from}${to}`])

        // Clear any error when move succeeds
        setMoveError(null)

        // ⚠️ NO pedir jugada de IA aquí - el backend lo maneja automáticamente
        // El backend ya encola el siguiente movimiento de IA después de cada movimiento

        console.log("✅ Tablero actualizado exitosamente\n")
      } catch (e) {
        console.error("❌ Error en socket move_made handler:", e)
      }
    },

    onMoveError: (err) => {
      console.error("❌ move_error desde el servidor:", err)

      // Show error alert
      const errorMsg = err.error || "Este movimiento no es válido según las reglas del ajedrez"
      setMoveError(errorMsg)

      // Show toast notification
      toast({
        title: "❌ Movimiento Inválido",
        description: errorMsg,
        variant: "destructive"
      })

      // Auto-hide error after 5 seconds
      setTimeout(() => setMoveError(null), 5000)

      // Restore board to last valid state if we have it
      if (lastValidFen.current && board) {
        console.log("⚠️ Restaurando tablero al último estado válido")
        // The board state will be restored when server sends next move_made
      }
    },

    onGameResigned: (data) => {
      console.log('🏳️ Game resigned received from server:', data)
      const winner = data.color === 'w' ? 'black' : 'white'
      setGameStatus('resigned')
      handleGameEnd(winner)
    },

    onGameEnded: (data) => {
      console.log('🏁 Game ended received from server:', data)
      const status = data.reason === 'checkmate' ? 'checkmate' : data.reason === 'draw' ? 'stalemate' : 'playing'
      setGameStatus(status)

      // Show victory/defeat message
      if (data.winner === 'draw') {
        toast({
          title: "🤝 Empate",
          description: "La partida terminó en tablas",
          duration: 6000
        })
        handleGameEnd('white') // Use any color, will be corrected in handleGameEnd based on draw
      } else {
        const isVictory = data.winner === 'white' // Assume player is white
        toast({
          title: isVictory ? "🏆 ¡Victoria!" : "😔 Derrota",
          description: data.reason === 'checkmate' ? "¡Jaque mate!" : "Partida terminada",
          duration: 6000
        })
        handleGameEnd(data.winner)
      }
    },
  })

  useEffect(() => {
    if (!isPaused && !predictionMode && board && gameStatus === "playing") {
      timerRef.current = setInterval(() => {
        if (board.currentPlayer === "w") {
          setWhiteTime((t) => {
            const newTime = Math.max(0, t - 1)
            if (newTime === 0) {
              toast({
                title: "⏰ Tiempo agotado",
                description: "Las Blancas se quedaron sin tiempo"
              })
              handleGameEnd("black")
            }
            return newTime
          })
        } else {
          setBlackTime((t) => {
            const newTime = Math.max(0, t - 1)
            if (newTime === 0) {
              toast({
                title: "⏰ Tiempo agotado",
                description: "Las Negras se quedaron sin tiempo"
              })
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
    if (!board) return

    const from = move.slice(0, 2)
    const to = move.slice(2, 4)

    // 🧪 Modo predicción: completamente local, no enviar al servidor
    if (predictionMode) {
      setPredictionMoves([...predictionMoves, move])
      const newBoard = engineMakeMove(board, from, to)
      setBoard(newBoard)
      return
    }

    // ✅ Con backend: mandar por socket y NO tocar el tablero aquí
    if (currentGameId) {
      emitMove({ from, to })
      return
    }

    // 🧪 Modo local (sin backend)
    setMoves([...moves, move])

    const newBoard = engineMakeMove(board, from, to)
    setBoard(newBoard)

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
    if (!board) return
    if (gameStatus !== "playing") {
      toast({
        title: "⚠️ Juego ya terminado",
        description: "No puedes rendirte en un juego que ya terminó",
        variant: "destructive"
      })
      return
    }

    const confirmed = confirm("¿Estás seguro de que quieres rendirte?")
    if (!confirmed) return

    const currentColor = board.currentPlayer
    console.log('🏳️ Resigning game as:', currentColor === 'w' ? 'Blancas' : 'Negras')

    toast({
      title: "🏳️ Rendición",
      description: `Las ${currentColor === 'w' ? 'Blancas' : 'Negras'} se rindieron`
    })

    emitResign(currentColor)
    // El estado se actualizará cuando recibamos el evento game_resigned del servidor
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

      {moveError && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="font-semibold">{moveError}</span>
            <Button size="sm" variant="ghost" onClick={() => setMoveError(null)} className="h-6 px-2">
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
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
