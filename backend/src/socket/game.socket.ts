import { Server as SocketIOServer, Socket } from 'socket.io'
import GameService from '../services/game.service'

export function setupSocketHandlers(io: SocketIOServer) {
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

        // Check if current player is AI and make AI move
        const game = GameService.getGame(gameId)
        if (game) {
          const currentPlayer = game.currentPlayer === 'w' 
            ? game.config.whitePlayer 
            : game.config.blackPlayer

          if (currentPlayer.type === 'ai' && game.status === 'active') {
            // Wait a bit for better UX
            setTimeout(async () => {
              const aiResult = await GameService.getAIMove(gameId, (moveData) => {
                io.to(gameId).emit('move_made', {
                  move: moveData.move,
                  fen: moveData.fen
                })
              })
              
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

    // Request AI move
    socket.on('request_ai_move', async ({ gameId }: { gameId: string }) => {
      try {
        const result = await GameService.getAIMove(gameId, (moveData) => {
          io.to(gameId).emit('move_made', {
            move: moveData.move,
            fen: moveData.fen
          })
        })
        
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
