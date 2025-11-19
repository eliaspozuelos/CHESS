import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    username: string
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string }
    
    ;(req as AuthRequest).user = decoded
    
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
