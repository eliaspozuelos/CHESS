// Generate educational content for moves

import type { ChessBoard } from "./chess-engine"

export interface TeachContent {
  explanation: string
  exercise?: {
    question: string
    options: string[]
    correctAnswer: number
  }
}

// Simulated AI explanation generator
export function generateTeachContent(board: ChessBoard, lastMove: string): TeachContent {
  // In a real implementation, this would call an LLM API
  // For now, we'll generate contextual educational content based on the move

  const moveCount = board.moveHistory.length
  const isOpening = moveCount <= 10
  const isMiddlegame = moveCount > 10 && moveCount <= 30
  const isEndgame = moveCount > 30

  const explanations = {
    opening: [
      {
        explanation:
          "En la apertura, es crucial controlar el centro del tablero. Los peones centrales (e4, d4, e5, d5) son fundamentales para establecer una posición sólida y permitir el desarrollo de las piezas.",
        exercise: {
          question: "¿Cuál es el objetivo principal en la apertura?",
          options: [
            "Atacar al rey enemigo inmediatamente",
            "Controlar el centro y desarrollar piezas",
            "Mover todos los peones",
            "Enrocar lo más rápido posible",
          ],
          correctAnswer: 1,
        },
      },
      {
        explanation:
          "El desarrollo de piezas menores (caballos y alfiles) antes que las piezas mayores es un principio fundamental. Esto permite mayor movilidad y control del tablero.",
        exercise: {
          question: "¿Qué piezas debes desarrollar primero?",
          options: ["La dama y las torres", "Los caballos y alfiles", "Solo los peones", "El rey primero"],
          correctAnswer: 1,
        },
      },
    ],
    middlegame: [
      {
        explanation:
          "En el medio juego, busca crear amenazas tácticas. Las horquillas, clavadas y ataques dobles son patrones tácticos que pueden ganar material o mejorar tu posición significativamente.",
        exercise: {
          question: "¿Qué es una horquilla en ajedrez?",
          options: [
            "Mover dos piezas al mismo tiempo",
            "Atacar dos piezas enemigas con una sola pieza",
            "Defender el rey con dos piezas",
            "Cambiar piezas de igual valor",
          ],
          correctAnswer: 1,
        },
      },
      {
        explanation:
          "La coordinación de piezas es esencial. Las piezas trabajan mejor cuando se apoyan mutuamente y atacan objetivos comunes. Evita dejar piezas aisladas sin apoyo.",
        exercise: {
          question: "¿Por qué es importante la coordinación de piezas?",
          options: [
            "Para mover más rápido",
            "Para crear amenazas más fuertes y defender mejor",
            "Para confundir al oponente",
            "No es importante",
          ],
          correctAnswer: 1,
        },
      },
    ],
    endgame: [
      {
        explanation:
          "En el final, el rey se convierte en una pieza activa. Debe participar en el ataque y la defensa. La activación del rey es crucial para ganar finales.",
        exercise: {
          question: "¿Cuál es el rol del rey en el final?",
          options: [
            "Debe permanecer escondido",
            "Debe ser una pieza activa y participar",
            "Solo debe defender",
            "No tiene importancia",
          ],
          correctAnswer: 1,
        },
      },
      {
        explanation:
          "Los peones pasados son extremadamente valiosos en el final. Un peón pasado es aquel que no tiene peones enemigos que puedan detenerlo en su camino hacia la promoción.",
        exercise: {
          question: "¿Qué es un peón pasado?",
          options: [
            "Un peón que ya se movió",
            "Un peón sin peones enemigos que lo detengan",
            "Un peón en el centro",
            "Un peón defendido por el rey",
          ],
          correctAnswer: 1,
        },
      },
    ],
  }

  let content: TeachContent
  if (isOpening) {
    content = explanations.opening[Math.floor(Math.random() * explanations.opening.length)]
  } else if (isMiddlegame) {
    content = explanations.middlegame[Math.floor(Math.random() * explanations.middlegame.length)]
  } else {
    content = explanations.endgame[Math.floor(Math.random() * explanations.endgame.length)]
  }

  return content
}
