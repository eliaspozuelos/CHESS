import { Router, Request, Response } from 'express'
import UserService from '../services/user.service'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// Get user profile
router.get('/:userId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const user = UserService.getUserById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { passwordHash, ...userWithoutPassword } = user
    res.json({ user: userWithoutPassword })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get leaderboard
router.get('/leaderboard/top', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const leaderboard = UserService.getLeaderboard(limit)
    res.json({ leaderboard })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Update user stats (called after game ends)
router.post('/:userId/stats', authMiddleware, (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const gameResult = req.body

    UserService.updateUserStats(userId, gameResult)
    
    const user = UserService.getUserById(userId)
    const { passwordHash, ...userWithoutPassword } = user!

    res.json({
      message: 'Stats updated successfully',
      user: userWithoutPassword
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
