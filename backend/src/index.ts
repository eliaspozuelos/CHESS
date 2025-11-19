import express from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import gameRoutes from './routes/game.routes'
import { setupSocketHandlers } from './socket/game.socket'
import StockfishService from './services/stockfish.service'
import { initializeDatabase, testConnection, closeDatabase } from './database/init'

// Load environment variables
dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
})

const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/games', gameRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chess backend is running' })
})

// Setup socket handlers
setupSocketHandlers(io)

// Initialize database and start server
async function startServer() {

// Test database connection
const dbConnected = await testConnection()

if (!dbConnected) {
  console.error('❌ Failed to connect to database')
  console.log('⚠️  Make sure PostgreSQL is running and DATABASE_URL is configured')
  console.log('💡 Server will continue but database features will not work')
}

// Initialize database schema
if (dbConnected) {
  await initializeDatabase()
}

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`)
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  if (dbConnected) {
    console.log(`🗄️  PostgreSQL database connected`)
  }
})
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...')
  StockfishService.shutdown()
  await closeDatabase()
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...')
  StockfishService.shutdown()
  await closeDatabase()
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

export { app, server, io }
