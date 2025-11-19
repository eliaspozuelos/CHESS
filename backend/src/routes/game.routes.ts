import { Router, Request, Response } from 'express'
import GameService from '../services/game.service'
import AIProviderService from '../services/ai-provider.service'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// Get available AI models
router.get('/ai-models', (req: Request, res: Response) => {
  const models = AIProviderService.getAvailableModels()
  res.json({ models })
})

// Create new game
router.post('/create', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { config } = req.body
    const userId = (req as any).user.id
    
    const game = GameService.createGame(config, userId)
    
    res.status(201).json({
      message: 'Game created successfully',
      game
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get game by ID
router.get('/:gameId', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params
    const game = GameService.getGame(gameId)
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }
    
    res.json({ game })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Make a move
router.post('/:gameId/move', async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params
    const { from, to, promotion } = req.body
    
    const result = await GameService.makeMove(gameId, from, to, promotion)
    
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }
    
    res.json({
      message: 'Move made successfully',
      move: result.move,
      fen: result.fen
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get AI move
router.post('/:gameId/ai-move', async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params
    
    const result = await GameService.getAIMove(gameId)
    
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }
    
    res.json({
      message: 'AI move generated',
      move: result.move,
      fen: result.fen
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Resign game
router.post('/:gameId/resign', authMiddleware, (req: Request, res: Response) => {
  try {
    const { gameId } = req.params
    const { color } = req.body
    
    const success = GameService.resignGame(gameId, color)
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to resign game' })
    }
    
    res.json({ message: 'Game resigned successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get legal moves
router.get('/:gameId/legal-moves', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params
    const { square } = req.query
    
    const moves = GameService.getLegalMoves(gameId, square as string)
    
    res.json({ moves })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})


// Get PGN for a game (export)
router.get("/:gameId/pgn", async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params
    const game = GameService.getGame(gameId)

    if (!game) {
      return res.status(404).json({ error: "Game not found" })
    }

    // Enviar como texto plano para facilitar descarga
    res
      .status(200)
      .type("text/plain")
      .send(game.pgn || "")
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})


// Delete game
router.delete('/:gameId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { gameId } = req.params
    
    const success = GameService.deleteGame(gameId)
    
    if (!success) {
      return res.status(404).json({ error: 'Game not found' })
    }
    
    res.json({ message: 'Game deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
