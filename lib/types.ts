// Types for user management and statistics

export type GameType = "normal" | "rapid" | "blitz"

export interface GameResult {
  id: string
  date: string
  gameType: GameType
  whitePlayer: string
  blackPlayer: string
  winner: "white" | "black" | "draw"
  moves: number
  duration: number // in seconds
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
  totalTime: number // in seconds
  averageMovesPerWin: number
  averageTimePerWin: number // in seconds
  byGameType: {
    normal: { played: number; won: number }
    rapid: { played: number; won: number }
    blitz: { played: number; won: number }
  }
}

export interface User {
  id: string
  username: string
  // SHA-256 hex of the user's password (stored locally). Optional for backwards compatibility.
  passwordHash?: string
  createdAt: string
  stats: UserStats
  gameHistory: GameResult[]
}
