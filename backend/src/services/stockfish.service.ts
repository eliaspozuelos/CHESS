import { spawn, ChildProcess } from 'child_process'
import * as path from 'path'

type AILevel = 'beginner' | 'intermediate' | 'advanced' | 'master'

class StockfishService {
  private stockfish: ChildProcess | null = null
  private isReady: boolean = false
  private outputQueue: string[] = []

  constructor() {
    this.initStockfish()
  }

  private initStockfish() {
    try {
      // Try to use system stockfish or the one specified in environment
      const stockfishPath = process.env.STOCKFISH_PATH || 'stockfish'
      
      this.stockfish = spawn(stockfishPath)

      this.stockfish.on('error', (error: any) => {
        if (error.code === 'ENOENT') {
          console.log('⚠️  Stockfish not found in system PATH')
          console.log('💡 Install Stockfish or set STOCKFISH_PATH in .env')
          console.log('🎲 Using random move generation as fallback')
          this.stockfish = null
        } else {
          console.error('Stockfish error:', error)
        }
      })

      this.stockfish.stdout?.on('data', (data) => {
        const output = data.toString()
        this.outputQueue.push(output)
        
        if (output.includes('readyok')) {
          this.isReady = true
          console.log('✅ Stockfish engine initialized successfully')
        }
      })

      this.stockfish.stderr?.on('data', (data) => {
        console.error('Stockfish stderr:', data.toString())
      })

      this.stockfish.on('close', (code) => {
        console.log('Stockfish process closed with code', code)
        this.isReady = false
      })

      // Initialize stockfish
      this.sendCommand('uci')
      this.sendCommand('isready')
      
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error)
      console.log('🎲 Falling back to random move generation')
      this.stockfish = null
    }
  }

  private sendCommand(command: string) {
    if (this.stockfish && !this.stockfish.killed) {
      this.stockfish.stdin?.write(command + '\n')
    }
  }

  private async waitForReady(): Promise<void> {
    if (this.isReady) return

    return new Promise((resolve) => {
      const checkReady = setInterval(() => {
        if (this.isReady) {
          clearInterval(checkReady)
          resolve()
        }
      }, 100)

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkReady)
        resolve()
      }, 5000)
    })
  }

  async getBestMove(fen: string, level: AILevel = 'intermediate'): Promise<{
    from: string
    to: string
    promotion?: string
  } | null> {
    // If stockfish is not available, use random move
    if (!this.stockfish || this.stockfish.killed) {
      return this.getRandomMove(fen)
    }

    await this.waitForReady()

    return new Promise((resolve) => {
      this.outputQueue = []

      // Set skill level based on AI level
      const skillLevel = this.getSkillLevel(level)
      const depth = this.getDepth(level)

      this.sendCommand(`setoption name Skill Level value ${skillLevel}`)
      this.sendCommand(`position fen ${fen}`)
      this.sendCommand(`go depth ${depth}`)

      const timeout = setTimeout(() => {
        resolve(this.getRandomMove(fen))
      }, 5000)

      const checkOutput = setInterval(() => {
        const output = this.outputQueue.join('\n')
        const bestmoveMatch = output.match(/bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/)
        
        if (bestmoveMatch) {
          clearInterval(checkOutput)
          clearTimeout(timeout)
          
          resolve({
            from: bestmoveMatch[1],
            to: bestmoveMatch[2],
            promotion: bestmoveMatch[3]
          })
        }
      }, 100)
    })
  }

  private getSkillLevel(level: AILevel): number {
    const levels = {
      beginner: 1,
      intermediate: 10,
      advanced: 15,
      master: 20
    }
    return levels[level]
  }

  private getDepth(level: AILevel): number {
    const depths = {
      beginner: 5,
      intermediate: 10,
      advanced: 15,
      master: 20
    }
    return depths[level]
  }

  private getRandomMove(fen: string): {
    from: string
    to: string
    promotion?: string
  } | null {
    // Simple random move generator as fallback
    // This is a very basic implementation
    const Chess = require('chess.js').Chess
    const chess = new Chess(fen)
    const moves = chess.moves({ verbose: true })
    
    if (moves.length === 0) return null
    
    const randomMove = moves[Math.floor(Math.random() * moves.length)]
    
    return {
      from: randomMove.from,
      to: randomMove.to,
      promotion: randomMove.promotion
    }
  }

  async analyzePosition(fen: string, depth: number = 15): Promise<{
    evaluation: number
    bestMove: string
    ponderMove?: string
  } | null> {
    if (!this.stockfish || this.stockfish.killed) {
      return null
    }

    await this.waitForReady()

    return new Promise((resolve) => {
      this.outputQueue = []

      this.sendCommand(`position fen ${fen}`)
      this.sendCommand(`go depth ${depth}`)

      const timeout = setTimeout(() => {
        resolve(null)
      }, 10000)

      let evaluation = 0
      let bestMove = ''
      let ponderMove = ''

      const checkOutput = setInterval(() => {
        const output = this.outputQueue.join('\n')
        
        // Get evaluation
        const scoreMatch = output.match(/score cp (-?\d+)/)
        if (scoreMatch) {
          evaluation = parseInt(scoreMatch[1]) / 100
        }

        // Get best move
        const bestmoveMatch = output.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)(?:\s+ponder\s+([a-h][1-8][a-h][1-8][qrbn]?))?/)
        
        if (bestmoveMatch) {
          clearInterval(checkOutput)
          clearTimeout(timeout)
          
          bestMove = bestmoveMatch[1]
          ponderMove = bestmoveMatch[2]
          
          resolve({
            evaluation,
            bestMove,
            ponderMove
          })
        }
      }, 100)
    })
  }

  shutdown() {
    if (this.stockfish && !this.stockfish.killed) {
      this.sendCommand('quit')
      this.stockfish.kill()
    }
  }
}

export default new StockfishService()
