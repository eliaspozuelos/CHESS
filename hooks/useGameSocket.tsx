"use client"

import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'

type MoveMade = { move: any; fen: string }

export function useGameSocket(gameId: string | null, handlers: { onMoveMade?: (p: MoveMade) => void; onMoveError?: (e: any) => void } = {}) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!gameId) return

    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
    const socket = io(base, { withCredentials: true, transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join', { gameId })
    })

    socket.on('move_made', (payload: MoveMade) => {
      handlers.onMoveMade?.(payload)
    })

    socket.on('move_error', (err: any) => {
      handlers.onMoveError?.(err)
    })

    socket.io.on('reconnect', () => {
      socket.emit('join', { gameId })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [gameId])

  function emitMove(payload: { from: string; to: string; promotion?: string; playerId?: string }) {
    if (!socketRef.current) return
    socketRef.current.emit('move', { gameId: gameId, ...payload })
  }

  function emitRequestAIMove() {
    if (!socketRef.current || !gameId) return
    console.log('📤 Emitting request_ai_move to server...')
    socketRef.current.emit('request_ai_move', { gameId })
  }

  return { socket: socketRef.current, emitMove, emitRequestAIMove }
}

export default useGameSocket
