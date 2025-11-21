import { User, UserStats, GameResult } from '../types'
import { query } from '../config/database'
import bcrypt from 'bcryptjs'

class UserService {
  constructor() {
    this.ensureTablesExist()
  }

  private async ensureTablesExist() {
    // Tables are created via schema.sql during initialization
    // This is just a safety check
    try {
      await query('SELECT 1 FROM users LIMIT 1')
    } catch (error) {
      console.warn('⚠️  Database tables may not be initialized. Run database initialization.')
    }
  }

  async createUser(username: string, password: string): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      )

      if (existingUser.rows.length > 0) {
        throw new Error('User already exists')
      }

      const passwordHash = await bcrypt.hash(password, 10)

      // Insert user
      const userResult = await query(
        `INSERT INTO users (username, password_hash) 
         VALUES ($1, $2) 
         RETURNING id, username, created_at`,
        [username, passwordHash]
      )

      const user = userResult.rows[0]

      // Create user stats
      await query(
        'INSERT INTO user_stats (user_id) VALUES ($1)',
        [user.id]
      )

      return {
        id: user.id,
        username: user.username,
        passwordHash,
        createdAt: user.created_at,
        stats: {
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
            blitz: { played: 0, won: 0 }
          }
        },
        gameHistory: []
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error creating user')
    }
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT id, username, password_hash, created_at FROM users WHERE username = $1',
        [username]
      )

      if (result.rows.length === 0) {
        return null
      }

      const user = result.rows[0]
      const isValid = await bcrypt.compare(password, user.password_hash)

      if (!isValid) {
        return null
      }

      // Get user with full data
      return await this.getUserById(user.id)
    } catch (error) {
      console.error('Authentication error:', error)
      return null
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userResult = await query(
        `SELECT u.id, u.username, u.password_hash, u.created_at,
                s.games_played, s.games_won, s.games_lost, s.games_draw,
                s.total_moves, s.total_time, s.average_moves_per_win, s.average_time_per_win,
                s.normal_played, s.normal_won, s.rapid_played, s.rapid_won,
                s.blitz_played, s.blitz_won
         FROM users u
         LEFT JOIN user_stats s ON u.id = s.user_id
         WHERE u.id = $1`,
        [userId]
      )

      if (userResult.rows.length === 0) {
        return null
      }

      const row = userResult.rows[0]

      // Get game history
      const historyResult = await query(
        `SELECT * FROM game_history WHERE user_id = $1 ORDER BY game_date DESC`,
        [userId]
      )

      const gameHistory: GameResult[] = historyResult.rows.map(h => ({
        id: h.id,
        date: h.game_date,
        gameType: h.game_type,
        whitePlayer: h.white_player,
        blackPlayer: h.black_player,
        winner: h.winner,
        moves: h.moves_count,
        duration: h.duration,
        userColor: h.user_color,
        opponentType: h.opponent_type,
        opponentModel: h.opponent_model
      }))

      return {
        id: row.id,
        username: row.username,
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        stats: {
          gamesPlayed: row.games_played || 0,
          gamesWon: row.games_won || 0,
          gamesLost: row.games_lost || 0,
          gamesDraw: row.games_draw || 0,
          totalMoves: row.total_moves || 0,
          totalTime: row.total_time || 0,
          averageMovesPerWin: parseFloat(row.average_moves_per_win) || 0,
          averageTimePerWin: parseFloat(row.average_time_per_win) || 0,
          byGameType: {
            normal: { played: row.normal_played || 0, won: row.normal_won || 0 },
            rapid: { played: row.rapid_played || 0, won: row.rapid_won || 0 },
            blitz: { played: row.blitz_played || 0, won: row.blitz_won || 0 }
          }
        },
        gameHistory
      }
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await query('SELECT id FROM users WHERE username = $1', [username])
      if (result.rows.length === 0) return null
      return await this.getUserById(result.rows[0].id)
    } catch (error) {
      return null
    }
  }

  async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    try {
      const result = await query('SELECT id FROM users')
      const users = await Promise.all(
        result.rows.map(row => this.getUserById(row.id))
      )
      return users
        .filter((u): u is User => u !== null)
        .map(({ passwordHash, ...user }) => user)
    } catch (error) {
      return []
    }
  }

  async updateUserStats(userId: string, gameResult: GameResult) {
    try {
      // Add to game history
      await query(
        `INSERT INTO game_history 
         (user_id, game_date, game_type, white_player, black_player, winner, 
          moves_count, duration, user_color, opponent_type, opponent_model)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          userId,
          gameResult.date,
          gameResult.gameType,
          gameResult.whitePlayer,
          gameResult.blackPlayer,
          gameResult.winner,
          gameResult.moves,
          gameResult.duration,
          gameResult.userColor,
          gameResult.opponentType,
          gameResult.opponentModel
        ]
      )

      // Get current stats
      const statsResult = await query(
        'SELECT * FROM user_stats WHERE user_id = $1',
        [userId]
      )

      if (statsResult.rows.length === 0) {
        throw new Error('User stats not found')
      }

      const stats = statsResult.rows[0]

      // Calculate new stats
      const gamesPlayed = stats.games_played + 1
      const totalMoves = stats.total_moves + gameResult.moves
      const totalTime = stats.total_time + gameResult.duration

      let gamesWon = stats.games_won
      let gamesLost = stats.games_lost
      let gamesDraw = stats.games_draw

      if (gameResult.winner === gameResult.userColor) {
        gamesWon++
      } else if (gameResult.winner === 'draw') {
        gamesDraw++
      } else {
        gamesLost++
      }

      // Update game type stats
      let normalPlayed = stats.normal_played
      let normalWon = stats.normal_won
      let rapidPlayed = stats.rapid_played
      let rapidWon = stats.rapid_won
      let blitzPlayed = stats.blitz_played
      let blitzWon = stats.blitz_won

      if (gameResult.gameType === 'normal') {
        normalPlayed++
        if (gameResult.winner === gameResult.userColor) normalWon++
      } else if (gameResult.gameType === 'rapid') {
        rapidPlayed++
        if (gameResult.winner === gameResult.userColor) rapidWon++
      } else if (gameResult.gameType === 'blitz') {
        blitzPlayed++
        if (gameResult.winner === gameResult.userColor) blitzWon++
      }

      // Calculate averages
      let averageMovesPerWin = stats.average_moves_per_win
      let averageTimePerWin = stats.average_time_per_win

      if (gamesWon > 0) {
        const wonGamesResult = await query(
          `SELECT moves_count, duration FROM game_history 
           WHERE user_id = $1 AND winner = user_color`,
          [userId]
        )
        const wonGames = wonGamesResult.rows
        const totalWinMoves = wonGames.reduce((sum: number, g: any) => sum + g.moves_count, 0)
        const totalWinTime = wonGames.reduce((sum: number, g: any) => sum + g.duration, 0)
        averageMovesPerWin = totalWinMoves / gamesWon
        averageTimePerWin = totalWinTime / gamesWon
      }

      // Update stats
      await query(
        `UPDATE user_stats 
         SET games_played = $2, games_won = $3, games_lost = $4, games_draw = $5,
             total_moves = $6, total_time = $7, average_moves_per_win = $8, average_time_per_win = $9,
             normal_played = $10, normal_won = $11, rapid_played = $12, rapid_won = $13,
             blitz_played = $14, blitz_won = $15, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [
          userId, gamesPlayed, gamesWon, gamesLost, gamesDraw,
          totalMoves, totalTime, averageMovesPerWin, averageTimePerWin,
          normalPlayed, normalWon, rapidPlayed, rapidWon, blitzPlayed, blitzWon
        ]
      )
    } catch (error) {
      console.error('Error updating user stats:', error)
      throw error
    }
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const result = await query(
        `SELECT u.id, u.username, u.created_at,
                s.games_played, s.games_won, s.games_lost, s.games_draw,
                s.total_moves, s.total_time, s.average_moves_per_win, s.average_time_per_win,
                s.normal_played, s.normal_won, s.rapid_played, s.rapid_won, 
                s.blitz_played, s.blitz_won
         FROM users u
         LEFT JOIN user_stats s ON u.id = s.user_id
         ORDER BY s.games_won DESC NULLS LAST
         LIMIT $1`,
        [limit]
      )

      return result.rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        createdAt: row.created_at,
        stats: {
          gamesPlayed: row.games_played || 0,
          gamesWon: row.games_won || 0,
          gamesLost: row.games_lost || 0,
          gamesDraw: row.games_draw || 0,
          totalMoves: row.total_moves || 0,
          totalTime: row.total_time || 0,
          averageMovesPerWin: row.average_moves_per_win || 0,
          averageTimePerWin: row.average_time_per_win || 0,
          byGameType: {
            normal: { played: row.normal_played || 0, won: row.normal_won || 0 },
            rapid: { played: row.rapid_played || 0, won: row.rapid_won || 0 },
            blitz: { played: row.blitz_played || 0, won: row.blitz_won || 0 },
          }
        },
        gameHistory: []
      }))
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }
}

export default new UserService()
