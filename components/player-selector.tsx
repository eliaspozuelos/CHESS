"use client"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Bot } from "lucide-react"

interface PlayerConfig {
  type: "human" | "ai"
  aiModel?: string
  aiLevel?: "beginner" | "intermediate" | "advanced" | "master"
}

interface PlayerSelectorProps {
  color: "white" | "black"
  playerConfig: PlayerConfig
  onPlayerChange: (config: PlayerConfig) => void
}

const AI_MODELS = ["Gemini Flash", "ChatGPT-3.5"]
const AI_LEVELS = [
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
  { value: "master", label: "Maestro" },
] as const

export default function PlayerSelector({ color, playerConfig, onPlayerChange }: PlayerSelectorProps) {
  const colorLabel = color === "white" ? "Blancas" : "Negras"
  const colorBg = color === "white" ? "bg-white dark:bg-gray-200" : "bg-gray-800 dark:bg-black"

  return (
    <Card className="p-6 h-full flex flex-col overflow-hidden">
      {/* Header with Color Indicator */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-8 w-8 rounded-full border-2 border-border ${colorBg}`} />
  <h3 className="text-xl font-bold text-foreground wrap-break-word whitespace-normal min-w-0">Jugador {colorLabel}</h3>
      </div>

      {/* Make content grow so cards match height */}
      <div className="flex-1 flex flex-col">
        {/* Player Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Tipo de jugador</Label>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onPlayerChange({ type: "human" })}>
              <input
                type="radio"
                id={`${color}-human`}
                name={`${color}-type`}
                checked={playerConfig.type === "human"}
                onChange={() => {}}
                className="w-4 h-4"
              />
              <Label htmlFor={`${color}-human`} className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Humano
              </Label>
            </div>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() =>
                onPlayerChange({
                  type: "ai",
                  aiModel: "Gemini Pro",
                  aiLevel: "intermediate",
                })
              }
            >
              <input
                type="radio"
                id={`${color}-ai`}
                name={`${color}-type`}
                checked={playerConfig.type === "ai"}
                onChange={() => {}}
                className="w-4 h-4"
              />
              <Label htmlFor={`${color}-ai`} className="flex items-center gap-2 cursor-pointer">
                <Bot className="h-4 w-4" />
                IA
              </Label>
            </div>
          </div>
        </div>

        {/* Spacer so AI config sits at bottom if short */}
        <div className="flex-1" />

        {/* AI Configuration */}
        {playerConfig.type === "ai" && (
          <div className="space-y-6 pt-2 border-t border-border">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Modelo de IA</Label>
              <select
                value={playerConfig.aiModel || "Gemini Pro"}
                onChange={(e) =>
                  onPlayerChange({
                    ...playerConfig,
                    aiModel: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                {AI_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Nivel de dificultad</Label>
              <div className="space-y-2">
                {AI_LEVELS.map((level) => (
                  <div key={level.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={`${color}-${level.value}`}
                      name={`${color}-level`}
                      checked={playerConfig.aiLevel === level.value}
                      onChange={() =>
                        onPlayerChange({
                          ...playerConfig,
                          aiLevel: level.value,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`${color}-${level.value}`} className="cursor-pointer text-foreground">
                      {level.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )

}
