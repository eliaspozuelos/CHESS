import { Server as SocketIOServer } from 'socket.io'

interface GameTimer {
  gameId: string
  whiteTime: number
  blackTime: number
  currentPlayer: 'w' | 'b'
  lastUpdate: number
  interval: NodeJS.Timeout
}

class GameTimerService {
  private timers: Map<string, GameTimer> = new Map()
  private io: SocketIOServer | null = null

  initialize(io: SocketIOServer) {
    this.io = io
    console.log('✅ Game Timer Service initialized')
  }

  startTimer(gameId: string, whiteTime: number, blackTime: number, currentPlayer: 'w' | 'b') {
    // Stop existing timer if any
    this.stopTimer(gameId)

    const timer: GameTimer = {
      gameId,
      whiteTime,
      blackTime,
      currentPlayer,
      lastUpdate: Date.now(),
      interval: setInterval(() => {
        this.tick(gameId)
      }, 1000)
    }

    this.timers.set(gameId, timer)
    console.log(`⏱️  Timer started for game ${gameId}`)
  }

  private tick(gameId: string) {
    const timer = this.timers.get(gameId)
    if (!timer || !this.io) return

    const now = Date.now()
    const elapsed = Math.floor((now - timer.lastUpdate) / 1000)

    if (elapsed < 1) return

    // Decrease time for current player
    if (timer.currentPlayer === 'w') {
      timer.whiteTime = Math.max(0, timer.whiteTime - elapsed)
    } else {
      timer.blackTime = Math.max(0, timer.blackTime - elapsed)
    }

    timer.lastUpdate = now

    // Emit timer update to all clients in the game
    this.io.to(gameId).emit('timer_update', {
      whiteTime: timer.whiteTime,
      blackTime: timer.blackTime,
      currentPlayer: timer.currentPlayer
    })

    // Check for timeout
    if (timer.whiteTime === 0) {
      this.io.to(gameId).emit('game_over', {
        reason: 'timeout',
        winner: 'black'
      })
      this.stopTimer(gameId)
    } else if (timer.blackTime === 0) {
      this.io.to(gameId).emit('game_over', {
        reason: 'timeout',
        winner: 'white'
      })
      this.stopTimer(gameId)
    }
  }

  switchPlayer(gameId: string, newPlayer: 'w' | 'b') {
    const timer = this.timers.get(gameId)
    if (!timer) return

    timer.currentPlayer = newPlayer
    timer.lastUpdate = Date.now()
  }

  pauseTimer(gameId: string) {
    const timer = this.timers.get(gameId)
    if (!timer) return

    clearInterval(timer.interval)
    console.log(`⏸️  Timer paused for game ${gameId}`)
  }

  resumeTimer(gameId: string) {
    const timer = this.timers.get(gameId)
    if (!timer) return

    timer.lastUpdate = Date.now()
    timer.interval = setInterval(() => {
      this.tick(gameId)
    }, 1000)
    console.log(`▶️  Timer resumed for game ${gameId}`)
  }

  stopTimer(gameId: string) {
    const timer = this.timers.get(gameId)
    if (!timer) return

    clearInterval(timer.interval)
    this.timers.delete(gameId)
    console.log(`⏹️  Timer stopped for game ${gameId}`)
  }

  getTimer(gameId: string): { whiteTime: number; blackTime: number } | null {
    const timer = this.timers.get(gameId)
    if (!timer) return null

    return {
      whiteTime: timer.whiteTime,
      blackTime: timer.blackTime
    }
  }
}

export default new GameTimerService()
