import 'dotenv/config'
import { aiMoveWorker } from './workers/ai-move.worker'

console.log('🚀 Starting AI Move Worker...')
console.log(`📡 Connected to Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`)
console.log('⏳ Waiting for AI move jobs...\n')

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⏹️  SIGTERM received, closing worker...')
  await aiMoveWorker.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('\n⏹️  SIGINT received, closing worker...')
  await aiMoveWorker.close()
  process.exit(0)
})
