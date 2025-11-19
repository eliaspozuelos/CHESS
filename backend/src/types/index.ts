export type GameType = "normal" | "rapid" | "blitz"

export interface GameResult {
  id: string
  date: string
  gameType: GameType
  whitePlayer: string
  blackPlayer: string
  winner: "white" | "black" | "draw"
  moves: number
  duration: number
  userColor: "white" | "black"
  opponentType: "human" | "ai"
  opponentModel?: string
}

export interface UserStats {
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  gamesDraw: number
  totalMoves: number
  totalTime: number
  averageMovesPerWin: number
  averageTimePerWin: number
  byGameType: {
    normal: { played: number; won: number }
    rapid: { played: number; won: number }
    blitz: { played: number; won: number }
  }
}

export interface User {
  id: string
  username: string
  passwordHash: string
  createdAt: string
  stats: UserStats
  gameHistory: GameResult[]
}

export interface PlayerConfig {
  type: "human" | "ai"
  aiModel?: string
  aiLevel?: "beginner" | "intermediate" | "advanced" | "master"
  userId?: string
}

export interface GameConfig {
  whitePlayer: PlayerConfig
  blackPlayer: PlayerConfig
  gameType: GameType
}

export interface Game {
  id: string
  config: GameConfig
  fen: string
  pgn: string
  currentPlayer: "w" | "b"
  status: "active" | "completed" | "resigned"
  winner?: "white" | "black" | "draw"
  moves: string[]
  startTime: number
  whiteTime: number
  blackTime: number
  createdBy: string
}
