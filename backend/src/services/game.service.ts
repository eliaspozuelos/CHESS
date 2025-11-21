import { Chess } from 'chess.js'
import { Game, GameConfig } from '../types'
import StockfishService from './stockfish.service'
import AIProviderService from './ai-provider.service'
import { aiMoveQueue } from '../queues/ai-move.queue'
import GameTimerService from './game-timer.service'

class GameService {
  private games: Map<string, Game> = new Map()
  private chessInstances: Map<string, Chess> = new Map()

  createGame(config: GameConfig, creatorId: string): Game {
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const chess = new Chess()
    
    const timeByType = {
      normal: 3600,
      rapid: 600,
      blitz: 180
    }

    const game: Game = {
      id: gameId,
      config,
      fen: chess.fen(),
      pgn: chess.pgn(),
      currentPlayer: 'w',
      status: 'active',
      moves: [],
      startTime: Date.now(),
      whiteTime: timeByType[config.gameType],
      blackTime: timeByType[config.gameType],
      createdBy: creatorId
    }

    this.games.set(gameId, game)
    this.chessInstances.set(gameId, chess)
    console.log(`✅ Game ${gameId} created and stored in GameService. Total games: ${this.games.size}`)

    // Start game timer
    GameTimerService.startTimer(gameId, game.whiteTime, game.blackTime, game.currentPlayer)

    // Auto-start AI vs AI games
    if (config.whitePlayer.type === 'ai' && config.blackPlayer.type === 'ai') {
      // Trigger first AI move after a short delay
      setTimeout(() => {
        this.requestAIMove(gameId).catch(err => {
          console.error('Error making initial AI move:', err)
        })
      }, 1000)
    }

    return game
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId)
  }

  // Alias for compatibility
  getGameById(gameId: string): Game | undefined {
    return this.getGame(gameId)
  }

  async makeMove(gameId: string, from: string, to: string, promotion?: string): Promise<{
    success: boolean
    move?: any
    fen?: string
    error?: string
  }> {
    const game = this.games.get(gameId)
    const chess = this.chessInstances.get(gameId)

    if (!game || !chess) {
      return { success: false, error: 'Game not found' }
    }

    if (game.status !== 'active') {
      return { success: false, error: 'Game is not active' }
    }

    try {
      // Get piece at source square for better error messages
      const piece = chess.get(from as any)
      const currentTurn = chess.turn()
      
      const move = chess.move({ from, to, promotion })
      
      if (!move) {
        // Provide more detailed error message
        let errorMsg = `Invalid move: ${from} to ${to}`
        
        if (!piece) {
          errorMsg += ` (no piece at ${from})`
        } else if (piece.color !== currentTurn) {
          errorMsg += ` (not your turn, current: ${currentTurn === 'w' ? 'white' : 'black'})`
        } else {
          errorMsg += ` (illegal move for ${piece.type})`
        }
        
        console.log(`❌ ${errorMsg}`)
        return { success: false, error: errorMsg }
      }

      // Update game state
      game.fen = chess.fen()
      game.pgn = chess.pgn()
      const previousPlayer = game.currentPlayer
      game.currentPlayer = chess.turn()
      game.moves.push(move.san)

      // Switch timer to new player
      if (previousPlayer !== game.currentPlayer) {
        GameTimerService.switchPlayer(gameId, game.currentPlayer)
      }

      // Check for game end
      if (chess.isCheckmate()) {
        game.status = 'completed'
        game.winner = chess.turn() === 'w' ? 'black' : 'white'
        GameTimerService.stopTimer(gameId)
        console.log(`🏁 Game ${gameId} ended: ${game.winner} wins by checkmate`)
      } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
        game.status = 'completed'
        game.winner = 'draw'
        GameTimerService.stopTimer(gameId)
        console.log(`🏁 Game ${gameId} ended: Draw`)
      }

      return {
        success: true,
        move: {
          from: move.from,
          to: move.to,
          san: move.san,
          uci: from + to + (promotion || ''),
          promotion: move.promotion
        },
        fen: chess.fen()
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async requestAIMove(gameId: string): Promise<{ success: boolean; jobId?: string; error?: string }> {
    const game = this.games.get(gameId)
    const chess = this.chessInstances.get(gameId)

    if (!game || !chess) {
      return { success: false, error: 'Game not found' }
    }

    // Check if game is still active
    if (game.status !== 'active') {
      console.log(`⏹️  Game ${gameId} is not active (status: ${game.status}), skipping AI move`)
      return { success: false, error: 'Game is not active' }
    }

    const currentPlayer = game.currentPlayer === 'w' ? game.config.whitePlayer : game.config.blackPlayer
    
    if (currentPlayer.type !== 'ai') {
      return { success: false, error: 'Current player is not AI' }
    }

    const level = currentPlayer.aiLevel || 'intermediate'
    const aiModel = currentPlayer.aiModel || 'stockfish'
    
    try {
      // Enqueue AI move job (non-blocking)
      const job = await aiMoveQueue.add('ai-move', {
        gameId,
        fen: chess.fen(),
        aiModel,
        level,
        moveHistory: game.moves
      })

      console.log(`📬 AI move job ${job.id} queued for game ${gameId}`)
      
      return { success: true, jobId: job.id }
    } catch (error: any) {
      console.error('Failed to queue AI move:', error)
      return { success: false, error: error.message }
    }
  }

  async applyAIMove(gameId: string, move: any): Promise<{
    success: boolean
    move?: any
    fen?: string
    error?: string
  }> {
    // Check if game is still active before applying move
    const game = this.games.get(gameId)
    if (!game) {
      console.log(`⚠️  Game ${gameId} not found, skipping AI move`)
      return { success: false, error: 'Game not found' }
    }
    
    if (game.status !== 'active') {
      console.log(`⚠️  Game ${gameId} is no longer active (status: ${game.status}), skipping AI move`)
      return { success: false, error: `Game is ${game.status}` }
    }
    
    const result = await this.makeMove(gameId, move.from, move.to, move.promotion)
    
    // If both players are AI and game is still active, schedule next move
    // Re-check game status after move (it could have ended with checkmate/stalemate)
    const updatedGame = this.games.get(gameId)
    if (result.success && updatedGame?.status === 'active') {
      const currentPlayer = updatedGame.currentPlayer === 'w' 
        ? updatedGame.config.whitePlayer 
        : updatedGame.config.blackPlayer
      
      // Only request next AI move if current player is also AI (AI vs AI games)
      if (updatedGame.config.whitePlayer.type === 'ai' && 
          updatedGame.config.blackPlayer.type === 'ai' &&
          currentPlayer.type === 'ai') {
        // Use longer delay for AI vs AI to make moves visible (2.5 seconds)
        setTimeout(() => {
          // Double-check game is still active before requesting
          const currentGame = this.games.get(gameId)
          if (currentGame?.status === 'active') {
            this.requestAIMove(gameId).catch(err => {
              console.error('Error in AI vs AI move:', err)
            })
          }
        }, 2500)
      }
    }
    
    return result
  }

  resignGame(gameId: string, color: 'w' | 'b'): boolean {
    const game = this.games.get(gameId)
    
    if (!game || game.status !== 'active') {
      return false
    }

    game.status = 'resigned'
    game.winner = color === 'w' ? 'black' : 'white'
    
    // Stop timer
    GameTimerService.stopTimer(gameId)
    
    const playerName = color === 'w' ? 'Blancas' : 'Negras'
    console.log(`🏳️  Game ${gameId} ended: ${playerName} resigned. Winner: ${game.winner}`)
    console.log(`⏹️  Any queued AI moves for this game will be skipped`)
    
    return true
  }

  deleteGame(gameId: string): boolean {
    GameTimerService.stopTimer(gameId)
    this.chessInstances.delete(gameId)
    return this.games.delete(gameId)
  }

  getAllGames(): Game[] {
    return Array.from(this.games.values())
  }

  getLegalMoves(gameId: string, square?: string): string[] {
    const chess = this.chessInstances.get(gameId)
    
    if (!chess) {
      return []
    }

    if (square) {
      const moves = chess.moves({ square: square as any, verbose: true })
      return moves.map((m: any) => m.to)
    }

    return chess.moves()
  }
}

export default new GameService()
