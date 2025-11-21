import { Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import { Chess } from 'chess.js'
import AIProviderService from '../services/ai-provider.service'
import StockfishService from '../services/stockfish.service'
import GameService from '../services/game.service'
import { AIMoveJobData } from '../queues/ai-move.queue'

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
})

// Map friendly names from frontend to technical model names
function mapAIModel(frontendModel: string): string {
  const modelMap: Record<string, string> = {
    'Gemini Flash': 'gemini-2.0-flash-lite',
    'ChatGPT-3.5': 'gpt-3.5-turbo',
    'Stockfish': 'stockfish',
    // Keep technical names as-is for backward compatibility
    'gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
    'stockfish': 'stockfish'
  }
  
  return modelMap[frontendModel] || frontendModel
}

async function processAIMove(job: Job<AIMoveJobData>) {
  const { gameId, fen, level, moveHistory } = job.data
  const aiModel = mapAIModel(job.data.aiModel)
  
  console.log(`🤖 Worker processing AI move for game ${gameId}`)
  console.log(`   Model: ${aiModel}, Level: ${level}`)
  
  try {
    // Check if game is still active (could have been resigned while job was queued)
    console.log(`🔍 Looking for game ${gameId} in GameService...`)
    const game = GameService.getGameById(gameId)
    console.log(`🔍 Game found:`, game ? `Yes (status: ${game.status})` : 'No')
    
    if (!game || game.status !== 'active') {
      console.log(`⏹️  Game ${gameId} is not active (status: ${game?.status || 'not found'}). Skipping AI move.`)
      return { skipped: true, reason: game ? `Game status: ${game.status}` : 'Game not found' }
    }
    
    // Update progress
    await job.updateProgress(10)
    
    // Validate FEN
    const chess = new Chess(fen)
    if (!chess) {
      throw new Error('Invalid FEN position')
    }
    
    await job.updateProgress(20)
    
    // Get AI move with timeout
    let move = null
    
    if (aiModel !== 'stockfish') {
      console.log(`   🌐 Requesting move from ${aiModel.toUpperCase()}...`)
      const movePromise = AIProviderService.getMove(
        aiModel as any,
        fen,
        level,
        moveHistory
      )
      
      // Race between AI call and timeout
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.log(`   ⏱️  ${aiModel.toUpperCase()} TIMEOUT after 15s, falling back to Stockfish`)
          resolve(null)
        }, 15000) // 15 seconds timeout
      })
      
      move = await Promise.race([movePromise, timeoutPromise])
      
      if (move) {
        console.log(`   ✅ ${aiModel.toUpperCase()} responded successfully!`)
      }
      await job.updateProgress(70)
    }
    
    // Fallback to Stockfish if needed
    if (!move) {
      console.log(`   🔄 Using Stockfish as fallback...`)
      move = await StockfishService.getBestMove(fen, level)
      await job.updateProgress(90)
    }
    
    if (!move) {
      throw new Error('Failed to generate move from all AI providers')
    }
    
    // Validate move is legal
    const testChess = new Chess(fen)
    const result = testChess.move({ from: move.from, to: move.to, promotion: move.promotion })
    
    if (!result) {
      throw new Error(`AI generated illegal move: ${move.from}${move.to}`)
    }
    
    await job.updateProgress(100)
    
    console.log(`✅ Worker completed: ${move.from} → ${move.to}`)
    
    return {
      success: true,
      move: {
        from: move.from,
        to: move.to,
        promotion: move.promotion,
        uci: `${move.from}${move.to}${move.promotion || ''}`,
        san: result.san
      },
      fen: testChess.fen()
    }
  } catch (error: any) {
    console.error(`❌ Worker error for game ${gameId}:`, error.message)
    throw error
  }
}

export const aiMoveWorker = new Worker<AIMoveJobData>('ai-moves', processAIMove, {
  connection,
  concurrency: 5, // Process up to 5 AI moves in parallel
  limiter: {
    max: 10,
    duration: 1000 // Max 10 jobs per second
  }
})

aiMoveWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed for game ${job.data.gameId}`)
})

aiMoveWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message)
})

aiMoveWorker.on('error', (err) => {
  console.error('Worker error:', err)
})

console.log('✅ AI Move Worker started')
