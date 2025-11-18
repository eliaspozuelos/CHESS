// Simple chess engine with piece movement logic and validation

export type PieceType = "p" | "n" | "b" | "r" | "q" | "k"
export type Color = "w" | "b"
export type Square = string // e.g., 'e4'

export interface Piece {
  type: PieceType
  color: Color
}

export interface ChessBoard {
  squares: Record<Square, Piece | null>
  currentPlayer: Color
  moveHistory: string[]
  capturedPieces: { w: PieceType[]; b: PieceType[] }
}

// Starting position in FEN
const INITIAL_POSITION: Record<Square, Piece | null> = {
  a8: { type: "r", color: "b" },
  b8: { type: "n", color: "b" },
  c8: { type: "b", color: "b" },
  d8: { type: "q", color: "b" },
  e8: { type: "k", color: "b" },
  f8: { type: "b", color: "b" },
  g8: { type: "n", color: "b" },
  h8: { type: "r", color: "b" },
  a7: { type: "p", color: "b" },
  b7: { type: "p", color: "b" },
  c7: { type: "p", color: "b" },
  d7: { type: "p", color: "b" },
  e7: { type: "p", color: "b" },
  f7: { type: "p", color: "b" },
  g7: { type: "p", color: "b" },
  h7: { type: "p", color: "b" },
  a6: null,
  b6: null,
  c6: null,
  d6: null,
  e6: null,
  f6: null,
  g6: null,
  h6: null,
  a5: null,
  b5: null,
  c5: null,
  d5: null,
  e5: null,
  f5: null,
  g5: null,
  h5: null,
  a4: null,
  b4: null,
  c4: null,
  d4: null,
  e4: null,
  f4: null,
  g4: null,
  h4: null,
  a3: null,
  b3: null,
  c3: null,
  d3: null,
  e3: null,
  f3: null,
  g3: null,
  h3: null,
  a2: { type: "p", color: "w" },
  b2: { type: "p", color: "w" },
  c2: { type: "p", color: "w" },
  d2: { type: "p", color: "w" },
  e2: { type: "p", color: "w" },
  f2: { type: "p", color: "w" },
  g2: { type: "p", color: "w" },
  h2: { type: "p", color: "w" },
  a1: { type: "r", color: "w" },
  b1: { type: "n", color: "w" },
  c1: { type: "b", color: "w" },
  d1: { type: "q", color: "w" },
  e1: { type: "k", color: "w" },
  f1: { type: "b", color: "w" },
  g1: { type: "n", color: "w" },
  h1: { type: "r", color: "w" },
}

export function initializeBoard(): ChessBoard {
  return {
    squares: { ...INITIAL_POSITION },
    currentPlayer: "w",
    moveHistory: [],
    capturedPieces: { w: [], b: [] },
  }
}

// Validate square coordinates
function isValidSquare(square: string): boolean {
  return square.match(/^[a-h][1-8]$/) !== null
}

// Get square index from notation
function squareToCoords(square: string): [number, number] | null {
  if (!isValidSquare(square)) return null
  const file = square.charCodeAt(0) - 97
  const rank = 8 - Number.parseInt(square[1])
  return [file, rank]
}

// Get notation from coordinates
function coordsToSquare(file: number, rank: number): string {
  return String.fromCharCode(97 + file) + (8 - rank)
}

// Check if square is attacked by opponent
export function isSquareAttacked(board: ChessBoard, square: string, byColor: Color): boolean {
  const opponentColor = byColor === "w" ? "b" : "w"
  const legalMoves = getAttackedSquares(board, byColor)
  return legalMoves.includes(square)
}

// Get all squares attacked by a color
function getAttackedSquares(board: ChessBoard, color: Color): string[] {
  const attacked: Set<string> = new Set()

  Object.entries(board.squares).forEach(([square, piece]) => {
    if (piece && piece.color === color) {
      getValidMoves(board, square).forEach((move) => attacked.add(move))
    }
  })

  return Array.from(attacked)
}

// Get valid moves for a piece at square
export function getValidMoves(board: ChessBoard, square: string): string[] {
  const piece = board.squares[square]
  if (!piece) return []

  const moves: string[] = []
  const coords = squareToCoords(square)
  if (!coords) return []

  const [file, rank] = coords

  switch (piece.type) {
    case "p":
      moves.push(...getPawnMoves(board, square, file, rank, piece.color))
      break
    case "n":
      moves.push(...getKnightMoves(board, file, rank, piece.color))
      break
    case "b":
      moves.push(...getBishopMoves(board, file, rank, piece.color))
      break
    case "r":
      moves.push(...getRookMoves(board, file, rank, piece.color))
      break
    case "q":
      moves.push(...getQueenMoves(board, file, rank, piece.color))
      break
    case "k":
      moves.push(...getKingMoves(board, file, rank, piece.color))
      break
  }

  return moves
}

function getPawnMoves(board: ChessBoard, square: string, file: number, rank: number, color: Color): string[] {
  const moves: string[] = []
  const direction = color === "w" ? -1 : 1
  const startRank = color === "w" ? 6 : 1

  // Forward move
  const forwardSquare = coordsToSquare(file, rank + direction)
  if (board.squares[forwardSquare] === null) {
    moves.push(forwardSquare)

    // Double move from start
    if (rank === startRank) {
      const doubleSquare = coordsToSquare(file, rank + 2 * direction)
      if (board.squares[doubleSquare] === null) {
        moves.push(doubleSquare)
      }
    }
  }
  // Captures
  ;[-1, 1].forEach((df) => {
    const captureSquare = coordsToSquare(file + df, rank + direction)
    const targetPiece = board.squares[captureSquare]
    if (targetPiece && targetPiece.color !== color) {
      moves.push(captureSquare)
    }
  })

  return moves.filter((m) => isValidSquare(m))
}

function getKnightMoves(board: ChessBoard, file: number, rank: number, color: Color): string[] {
  const moves: string[] = []
  const deltas = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ]

  deltas.forEach(([df, dr]) => {
    const newSquare = coordsToSquare(file + df, rank + dr)
    const targetPiece = board.squares[newSquare]
    if (!targetPiece || targetPiece.color !== color) {
      moves.push(newSquare)
    }
  })

  return moves.filter((m) => isValidSquare(m))
}

function getBishopMoves(board: ChessBoard, file: number, rank: number, color: Color): string[] {
  const moves: string[] = []
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ]

  directions.forEach(([df, dr]) => {
    for (let i = 1; i < 8; i++) {
      const newSquare = coordsToSquare(file + df * i, rank + dr * i)
      if (!isValidSquare(newSquare)) break

      const targetPiece = board.squares[newSquare]
      if (!targetPiece) {
        moves.push(newSquare)
      } else {
        if (targetPiece.color !== color) moves.push(newSquare)
        break
      }
    }
  })

  return moves
}

function getRookMoves(board: ChessBoard, file: number, rank: number, color: Color): string[] {
  const moves: string[] = []
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]

  directions.forEach(([df, dr]) => {
    for (let i = 1; i < 8; i++) {
      const newSquare = coordsToSquare(file + df * i, rank + dr * i)
      if (!isValidSquare(newSquare)) break

      const targetPiece = board.squares[newSquare]
      if (!targetPiece) {
        moves.push(newSquare)
      } else {
        if (targetPiece.color !== color) moves.push(newSquare)
        break
      }
    }
  })

  return moves
}

function getQueenMoves(board: ChessBoard, file: number, rank: number, color: Color): string[] {
  return [...getBishopMoves(board, file, rank, color), ...getRookMoves(board, file, rank, color)]
}

function getKingMoves(board: ChessBoard, file: number, rank: number, color: Color): string[] {
  const moves: string[] = []
  const deltas = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]

  deltas.forEach(([df, dr]) => {
    const newSquare = coordsToSquare(file + df, rank + dr)
    const targetPiece = board.squares[newSquare]
    if (!targetPiece || targetPiece.color !== color) {
      moves.push(newSquare)
    }
  })

  return moves.filter((m) => isValidSquare(m))
}

// Make a move on the board
export function makeMove(board: ChessBoard, from: string, to: string): ChessBoard {
  const piece = board.squares[from]
  if (!piece || piece.color !== board.currentPlayer) {
    return board // Invalid move
  }

  const validMoves = getValidMoves(board, from)
  if (!validMoves.includes(to)) {
    return board // Invalid move
  }

  const newBoard = JSON.parse(JSON.stringify(board)) as ChessBoard
  const targetPiece = newBoard.squares[to]

  if (targetPiece) {
    newBoard.capturedPieces[piece.color].push(targetPiece.type)
  }

  newBoard.squares[to] = piece
  newBoard.squares[from] = null
  newBoard.currentPlayer = newBoard.currentPlayer === "w" ? "b" : "w"
  newBoard.moveHistory.push(`${from}${to}`)

  return newBoard
}

// Get piece symbol for display
export function getPieceSymbol(piece: Piece | null): string {
  if (!piece) return ""

  const symbols: Record<PieceType, string> = {
    p: "♟",
    n: "♞",
    b: "♝",
    r: "♜",
    q: "♛",
    k: "♚",
  }

  return piece.color === "w"
    ? symbols[piece.type].replace(/[♟♞♝♜♛♚]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 6))
    : symbols[piece.type]
}
