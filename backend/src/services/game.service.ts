import { Chess } from 'chess.js'
import { Game, GameConfig } from '../types'
import StockfishService from './stockfish.service'
import AIProviderService from './ai-provider.service'

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

    // Auto-start AI vs AI games
    if (config.whitePlayer.type === 'ai' && config.blackPlayer.type === 'ai') {
      // Trigger first AI move after a short delay
      setTimeout(() => {
        this.getAIMove(gameId).catch(err => {
          console.error('Error making initial AI move:', err)
        })
      }, 1000)
    }

    return game
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId)
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
      const move = chess.move({ from, to, promotion })
      
      if (!move) {
        return { success: false, error: 'Invalid move' }
      }

      // Update game state
      game.fen = chess.fen()
      game.pgn = chess.pgn()
      game.currentPlayer = chess.turn()
      game.moves.push(move.san)

      // Check for game end
      if (chess.isCheckmate()) {
        game.status = 'completed'
        game.winner = chess.turn() === 'w' ? 'black' : 'white'
      } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
        game.status = 'completed'
        game.winner = 'draw'
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

  async getAIMove(gameId: string, emitCallback?: (moveData: any) => void): Promise<{
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

    const currentPlayer = game.currentPlayer === 'w' ? game.config.whitePlayer : game.config.blackPlayer
    
    if (currentPlayer.type !== 'ai') {
      return { success: false, error: 'Current player is not AI' }
    }

    const level = currentPlayer.aiLevel || 'intermediate'
    const aiModel = currentPlayer.aiModel || 'stockfish'
    
    let move = null
    
    // Try to use the specified AI model (GPT/Claude)
    if (aiModel !== 'stockfish') {
      move = await AIProviderService.getMove(
        aiModel as any,
        chess.fen(),
        level,
        game.moves
      )
    }
    
    // Fallback to Stockfish if AI provider fails or not configured
    if (!move) {
      move = await StockfishService.getBestMove(chess.fen(), level)
    }

    if (!move) {
      return { success: false, error: 'AI failed to generate move' }
    }

    const result = await this.makeMove(gameId, move.from, move.to, move.promotion)
    
    // If callback provided, emit the move
    if (emitCallback && result.success) {
      emitCallback(result)
    }
    
    // If both players are AI and game is still active, schedule next move
    if (result.success && game.status === 'active' && 
        game.config.whitePlayer.type === 'ai' && 
        game.config.blackPlayer.type === 'ai') {
      setTimeout(() => {
        this.getAIMove(gameId, emitCallback).catch(err => {
          console.error('Error in AI vs AI move:', err)
        })
      }, 1000)
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
    
    return true
  }

  deleteGame(gameId: string): boolean {
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
