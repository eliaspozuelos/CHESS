import { Server as SocketIOServer, Socket } from 'socket.io'
import { QueueEvents } from 'bullmq'
import Redis from 'ioredis'
import GameService from '../services/game.service'
import { aiMoveQueue, AIMoveJobData } from '../queues/ai-move.queue'
import GameTimerService from '../services/game-timer.service'

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
})

const queueEvents = new QueueEvents('ai-moves', { connection })

export function setupSocketHandlers(io: SocketIOServer) {
  GameTimerService.initialize(io)

  // Listen for completed AI move jobs
  queueEvents.on('completed', async ({ jobId, returnvalue }) => {
    try {
      console.log(`📦 Job ${jobId} completed event received`)
      
      // Try to get the job (it should still exist for 10 seconds)
      const job = await aiMoveQueue.getJob(jobId)
      if (!job) {
        console.log(`⚠️  Job ${jobId} not found (already cleaned up). JobId:`, jobId)
        // Extract gameId from job name if possible (format: ai-move-{gameId})
        const jobName = jobId.toString()
        console.log(`⚠️  Cannot process without job data`)
        return
      }

      console.log(`📦 Job data:`, JSON.stringify(job.data))
      console.log(`📦 Return value:`, JSON.stringify(returnvalue))

      const result = returnvalue as any
      
      // Check if job was skipped due to game not being active
      if (result && result.skipped) {
        console.log(`⏹️  AI move skipped for game ${job.data.gameId}: ${result.reason}`)
        return
      }
      
      if (result && result.success) {
        console.log(`✅ Applying AI move: ${result.move.from} → ${result.move.to}`)
        const applyResult = await GameService.applyAIMove(job.data.gameId, result.move)
        
        if (applyResult.success) {
          console.log(`📡 Emitting move to game ${job.data.gameId}`)
          // Emit move to all clients in the game
          io.to(job.data.gameId).emit('move_made', {
            move: applyResult.move,
            fen: applyResult.fen
          })
          console.log(`✅ Move emitted successfully to room ${job.data.gameId}`)
          
          // Check if game ended after AI move
          const game = GameService.getGame(job.data.gameId)
          if (game && game.status === 'completed') {
            console.log(`🏁 Game ${job.data.gameId} completed after AI move: ${game.winner}`)
            io.to(job.data.gameId).emit('game_ended', {
              winner: game.winner,
              reason: game.winner === 'draw' ? 'draw' : 'checkmate',
              moves: game.moves
            })
          }
        } else {
          console.error(`❌ Failed to apply AI move:`, applyResult.error)
        }
      } else {
        console.error(`❌ Job result invalid or unsuccessful:`, result)
      }
    } catch (error) {
      console.error('❌ Error applying AI move:', error)
    }
  })

  queueEvents.on('failed', async ({ jobId, failedReason }) => {
    try {
      const job = await aiMoveQueue.getJob(jobId)
      if (job) {
        io.to(job.data.gameId).emit('move_error', {
          error: `AI move failed: ${failedReason}`
        })
      }
    } catch (error) {
      console.error('Error handling failed job:', error)
    }
  })
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    // Join a game room
    socket.on('join', ({ gameId }: { gameId: string }) => {
      console.log(`👤 ${socket.id} joining game ${gameId}`)
      socket.join(gameId)
      socket.emit('joined', { gameId })
    })

    // Leave a game room
    socket.on('leave', ({ gameId }: { gameId: string }) => {
      console.log(`👋 ${socket.id} leaving game ${gameId}`)
      socket.leave(gameId)
    })

    // Handle move
    socket.on('move', async ({ gameId, from, to, promotion, playerId }: {
      gameId: string
      from: string
      to: string
      promotion?: string
      playerId?: string
    }) => {
      try {
        console.log(`♟️  Move in game ${gameId}: ${from} -> ${to}`)
        
        const result = await GameService.makeMove(gameId, from, to, promotion)
        
        if (!result.success) {
          socket.emit('move_error', { error: result.error })
          return
        }

        // Broadcast move to all clients in the game room
        io.to(gameId).emit('move_made', {
          move: result.move,
          fen: result.fen
        })

        // Check if game ended (checkmate, stalemate, draw)
        const game = GameService.getGame(gameId)
        if (game && game.status === 'completed') {
          console.log(`🏁 Game ${gameId} completed: ${game.winner}`)
          io.to(gameId).emit('game_ended', {
            winner: game.winner,
            reason: game.winner === 'draw' ? 'draw' : 'checkmate',
            moves: game.moves
          })
          return // Don't request AI move if game ended
        }

        // Check if current player is AI and request AI move (non-blocking)
        // Only request if the previous move was NOT from AI (to avoid double-queueing)
        if (game) {
          const currentPlayer = game.currentPlayer === 'w' 
            ? game.config.whitePlayer 
            : game.config.blackPlayer

          // Only request AI move if current player is AI
          // Note: applyAIMove handles AI vs AI continuation automatically
          if (currentPlayer.type === 'ai' && game.status === 'active') {
            // Emit AI thinking status
            io.to(gameId).emit('ai_thinking', { player: game.currentPlayer })
            
            // Request AI move (returns immediately, doesn't block)
            setTimeout(async () => {
              const aiResult = await GameService.requestAIMove(gameId)
              
              if (!aiResult.success) {
                socket.emit('move_error', { error: aiResult.error })
              }
            }, 500)
          }
        }
      } catch (error: any) {
        console.error('Move error:', error)
        socket.emit('move_error', { error: error.message })
      }
    })

    // Request AI move (non-blocking)
    socket.on('request_ai_move', async ({ gameId }: { gameId: string }) => {
      try {
        io.to(gameId).emit('ai_thinking', { player: 'AI' })
        
        const result = await GameService.requestAIMove(gameId)
        
        if (!result.success) {
          socket.emit('move_error', { error: result.error })
        }
      } catch (error: any) {
        socket.emit('move_error', { error: error.message })
      }
    })

    // Handle game resignation
    socket.on('resign', ({ gameId, color }: { gameId: string; color: 'w' | 'b' }) => {
      const success = GameService.resignGame(gameId, color)
      
      if (success) {
        io.to(gameId).emit('game_resigned', { color })
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`)
    })
  })
}
