"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Lightbulb, CheckCircle2, XCircle } from "lucide-react"

interface TeachModePanelProps {
  explanation: string
  exercise?: {
    question: string
    options: string[]
    correctAnswer: number
  }
  onExerciseComplete?: () => void
}

export default function TeachModePanel({ explanation, exercise, onExerciseComplete }: TeachModePanelProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index)
    setShowResult(true)
    if (index === exercise?.correctAnswer && onExerciseComplete) {
      setTimeout(() => {
        onExerciseComplete()
      }, 2000)
    }
  }

  const isCorrect = selectedAnswer === exercise?.correctAnswer

  return (
    <Card className="p-4 space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      {/* Explanation Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <BookOpen className="h-5 w-5" />
          <span>Explicación del Movimiento</span>
        </div>
        <p className="text-sm leading-relaxed">{explanation}</p>
      </div>

      {/* Exercise Section */}
      {exercise && (
        <div className="space-y-3 pt-3 border-t border-primary/20">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Lightbulb className="h-5 w-5" />
            <span>Mini Ejercicio</span>
          </div>
          <p className="text-sm font-medium">{exercise.question}</p>

          <div className="space-y-2">
            {exercise.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={`w-full justify-start text-left h-auto py-3 ${
                  showResult
                    ? index === exercise.correctAnswer
                      ? "bg-green-500/20 border-green-500 hover:bg-green-500/20"
                      : selectedAnswer === index
                        ? "bg-red-500/20 border-red-500 hover:bg-red-500/20"
                        : ""
                    : ""
                }`}
                onClick={() => !showResult && handleAnswerSelect(index)}
                disabled={showResult}
              >
                <span className="flex-1">{option}</span>
                {showResult && index === exercise.correctAnswer && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {showResult && selectedAnswer === index && index !== exercise.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </Button>
            ))}
          </div>

          {showResult && (
            <div className={`p-3 rounded-lg ${isCorrect ? "bg-green-500/10" : "bg-red-500/10"}`}>
              <p className="text-sm font-medium">
                {isCorrect ? "¡Correcto! Excelente comprensión." : "Incorrecto. Revisa la explicación arriba."}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
