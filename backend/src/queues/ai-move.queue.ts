import { Queue } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
})

export interface AIMoveJobData {
  gameId: string
  fen: string
  aiModel: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'master'
  moveHistory: string[]
}

export const aiMoveQueue = new Queue<AIMoveJobData>('ai-moves', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: {
      age: 10, // Keep completed jobs for 10 seconds
      count: 100 // Keep last 100 completed jobs
    },
    removeOnFail: false
  }
})

console.log('✅ AI Move Queue initialized')
