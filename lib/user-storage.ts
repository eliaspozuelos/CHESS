// User management with localStorage

import type { User, UserStats, GameResult } from "./types"
import { apiFetch } from './backend-api'

const USERS_KEY = "chess_users"
const CURRENT_USER_KEY = "chess_current_user"

// Initialize empty stats
export function createEmptyStats(): UserStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDraw: 0,
    totalMoves: 0,
    totalTime: 0,
    averageMovesPerWin: 0,
    averageTimePerWin: 0,
    byGameType: {
      normal: { played: 0, won: 0 },
      rapid: { played: 0, won: 0 },
      blitz: { played: 0, won: 0 },
    },
  }
}

// Get all users
export function getAllUsers(): User[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(USERS_KEY)
  return data ? JSON.parse(data) : []
}

// Save all users
function saveAllUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Get current user
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const userId = localStorage.getItem(CURRENT_USER_KEY)
  if (!userId) return null
  const users = getAllUsers()
  return users.find((u) => u.id === userId) || null
}

// Set current user
export function setCurrentUser(userId: string): void {
  localStorage.setItem(CURRENT_USER_KEY, userId)
}

// Create new user
// Helper: compute SHA-256 hex on the client
async function hashStringSHA256(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && (crypto as any).subtle) {
    const enc = new TextEncoder()
    const data = enc.encode(input)
    const hash = await (crypto as any).subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback: simple (not cryptographically strong) base64 marker — only for very old environments
  return btoa(input)
}

// Create new user (async because password hashing uses Web Crypto)
export async function createUser(username: string, password?: string): Promise<User> {
  // Prefer creating user via backend if available
  try {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    const user: User = res.user
    // persist minimal client-side state
    const users = getAllUsers()
    if (!users.find((u) => u.id === user.id)) {
      users.push(user)
      saveAllUsers(users)
    }
    setCurrentUser(user.id)
    return user
  } catch (e: any) {
    // If backend error, show it
    const errorMsg = e.error || e.message || 'Error al crear usuario'
    console.error('Error creating user:', errorMsg)
    throw new Error(errorMsg)
  }
}

// Authenticate user by username + password, returns the user or null
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  // Try backend authentication first
  try {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    const user: User = res.user
    // persist minimal client-side state
    const users = getAllUsers()
    if (!users.find((u) => u.id === user.id)) {
      users.push(user)
      saveAllUsers(users)
    }
    setCurrentUser(user.id)
    return user
  } catch (e) {
    console.error('Authentication error:', e)
    return null
  }
}

// Update user stats after a game
export function updateUserStats(userId: string, gameResult: GameResult): void {
  const users = getAllUsers()
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex === -1) return

  const user = users[userIndex]
  user.gameHistory.push(gameResult)

  // Update stats
  const stats = user.stats
  stats.gamesPlayed++
  stats.totalMoves += gameResult.moves
  stats.totalTime += gameResult.duration

  // Determine if user won
  const userWon =
    (gameResult.userColor === "white" && gameResult.winner === "white") ||
    (gameResult.userColor === "black" && gameResult.winner === "black")

  if (userWon) {
    stats.gamesWon++
    stats.byGameType[gameResult.gameType].won++
  } else if (gameResult.winner === "draw") {
    stats.gamesDraw++
  } else {
    stats.gamesLost++
  }

  stats.byGameType[gameResult.gameType].played++

  // Calculate averages
  if (stats.gamesWon > 0) {
    const wonGames = user.gameHistory.filter((g) => {
      return (g.userColor === "white" && g.winner === "white") || (g.userColor === "black" && g.winner === "black")
    })
    const totalWinMoves = wonGames.reduce((sum, g) => sum + g.moves, 0)
    const totalWinTime = wonGames.reduce((sum, g) => sum + g.duration, 0)
    stats.averageMovesPerWin = Math.round(totalWinMoves / stats.gamesWon)
    stats.averageTimePerWin = Math.round(totalWinTime / stats.gamesWon)
  }

  users[userIndex] = user
  saveAllUsers(users)
}

// Get user by ID
export function getUserById(userId: string): User | null {
  const users = getAllUsers()
  return users.find((u) => u.id === userId) || null
}

// Update/save a user
export function saveUser(user: User): void {
  const users = getAllUsers()
  const index = users.findIndex((u) => u.id === user.id)
  if (index !== -1) {
    users[index] = user
    saveAllUsers(users)
  }
}

// Get leaderboard (sorted by wins)
export function getLeaderboard(): User[] {
  const users = getAllUsers()
  return users.sort((a, b) => b.stats.gamesWon - a.stats.gamesWon)
}

// Logout current user
export async function logoutUser(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' })
  } catch (e) {
    console.error('Logout error:', e)
  }
  localStorage.removeItem(CURRENT_USER_KEY)
}
