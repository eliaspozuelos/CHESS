import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import UserService from '../services/user.service'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const user = await UserService.createUser(username, password)
    
    // Create JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '30d'
    })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    const { passwordHash, ...userWithoutPassword } = user

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
      token
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const user = await UserService.authenticateUser(username, password)
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '30d'
    })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    const { passwordHash, ...userWithoutPassword } = user

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token')
  res.json({ message: 'Logout successful' })
})

// Get current user
router.get('/me', (req: Request, res: Response) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = UserService.getUserById(decoded.userId)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { passwordHash, ...userWithoutPassword } = user

    res.json({ user: userWithoutPassword })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
