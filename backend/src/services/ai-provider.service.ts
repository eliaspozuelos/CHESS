import { Chess } from 'chess.js'
import axios from 'axios'

type AIModel = 'gpt-3.5-turbo' | 'gemini-2.0-flash-lite' | 'stockfish'
type AILevel = 'beginner' | 'intermediate' | 'advanced' | 'master'

interface AIMove {
  from: string
  to: string
  promotion?: string
}

class AIProviderService {
  private openaiApiKey: string
  private geminiApiKey: string

  constructor() {
    this.openaiApiKey = (process.env.OPENAI_API_KEY || '').trim()
    this.geminiApiKey = (process.env.GEMINI_API_KEY || '').trim()
  }

  async getMove(
    model: AIModel,
    fen: string,
    level: AILevel = 'intermediate',
    moveHistory: string[] = []
  ): Promise<AIMove | null> {
    try {
      if (model === 'stockfish') {
        // This will be handled by StockfishService
        return null
      }

      if (model === 'gpt-3.5-turbo') {
        return await this.getOpenAIMove(model, fen, level, moveHistory)
      }

      if (model === 'gemini-2.0-flash-lite') {
        return await this.getGeminiMove(model, fen, level, moveHistory)
      }

      return null
    } catch (error) {
      console.error(`Error getting AI move from ${model}:`, error)
      return null
    }
  }

  private async getOpenAIMove(
    model: string,
    fen: string,
    level: AILevel,
    moveHistory: string[]
  ): Promise<AIMove | null> {
    if (!this.openaiApiKey) {
      console.warn('⚠️  OpenAI API key not configured. Set OPENAI_API_KEY in .env')
      return null
    }

    const chess = new Chess(fen)
    const legalMoves = chess.moves({ verbose: true })

    const prompt = this.buildChessPrompt(fen, level, moveHistory, legalMoves)

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a chess engine. Respond ONLY with a move in UCI format (e.g., "e2e4" or "e7e8q" for promotion). No explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.getTemperature(level),
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )

      const moveText = response.data.choices[0].message.content.trim()
      return this.parseUCIMove(moveText)
    } catch (error: any) {
      console.error('OpenAI API error:', error.response?.data || error.message)
      return null
    }
  }

  private async getGeminiMove(
    model: string,
    fen: string,
    level: AILevel,
    moveHistory: string[]
  ): Promise<AIMove | null> {
    if (!this.geminiApiKey) {
      console.warn('⚠️  Gemini API key not configured. Set GEMINI_API_KEY in .env')
      return null
    }

    const chess = new Chess(fen)
    const legalMoves = chess.moves({ verbose: true })

    const prompt = this.buildChessPrompt(fen, level, moveHistory, legalMoves)
    const systemPrompt = 'You are a chess engine. Respond ONLY with a move in UCI format (e.g., "e2e4" or "e7e8q" for promotion). No explanations.'

    try {
      // Usar el modelo directamente (solo soportamos gemini-2.0-flash-lite)
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: systemPrompt + '\n\n' + prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: this.getTemperature(level),
            maxOutputTokens: 20,
            topP: 0.95,
            topK: 40
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      )

      if (!response.data.candidates || response.data.candidates.length === 0) {
        console.error('Gemini API returned no candidates')
        return null
      }

      const moveText = response.data.candidates[0].content.parts[0].text.trim()
      console.log(`🤖 Gemini response: "${moveText}"`)
      return this.parseUCIMove(moveText)
    } catch (error: any) {
      if (error.response) {
        console.error('Gemini API error:', JSON.stringify(error.response.data, null, 2))
      } else {
        console.error('Gemini API error:', error.message)
      }
      return null
    }
  }

  private buildChessPrompt(
    fen: string,
    level: AILevel,
    moveHistory: string[],
    legalMoves: any[]
  ): string {
    const levelInstructions = {
      beginner: 'Play like a beginner. Make simple, safe moves. Avoid complex tactics.',
      intermediate: 'Play at an intermediate level. Use basic tactics and positional play.',
      advanced: 'Play at an advanced level. Use complex tactics, strategic planning, and strong positional understanding.',
      master: 'Play at a master level. Use deep calculation, strategic mastery, and optimal play.'
    }

    const movesFormatted = legalMoves.map(m => `${m.from}${m.to}${m.promotion || ''}`).join(', ')

    return `Current position (FEN): ${fen}

Skill level: ${level}
Instructions: ${levelInstructions[level]}

${moveHistory.length > 0 ? `Previous moves: ${moveHistory.join(' ')}` : 'Starting position'}

Legal moves available: ${movesFormatted}

Choose the best move and respond ONLY with the move in UCI format (e.g., "e2e4" for normal moves or "e7e8q" for promotion to queen).`
  }

  private parseUCIMove(uciMove: string): AIMove | null {
    // Clean the input
    const cleaned = uciMove.toLowerCase().replace(/[^a-h0-8]/g, '')
    
    if (cleaned.length < 4) {
      return null
    }

    const from = cleaned.substring(0, 2)
    const to = cleaned.substring(2, 4)
    const promotion = cleaned.length === 5 ? cleaned[4] : undefined

    // Validate format
    if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(from + to + (promotion || ''))) {
      return null
    }

    return { from, to, promotion }
  }

  private getTemperature(level: AILevel): number {
    const temperatures = {
      beginner: 1.0,
      intermediate: 0.7,
      advanced: 0.4,
      master: 0.1
    }
    return temperatures[level]
  }

  isConfigured(model: AIModel): boolean {
    if (model === 'stockfish') return true
    if (model.startsWith('gpt-')) return !!this.openaiApiKey
    if (model.startsWith('gemini-')) return !!this.geminiApiKey
    return false
  }

  getAvailableModels(): { model: AIModel; name: string; configured: boolean }[] {
    return [
      { model: 'stockfish', name: 'Stockfish (Local)', configured: true },
      { model: 'gpt-3.5-turbo', name: 'ChatGPT-3.5 (OpenAI)', configured: this.isConfigured('gpt-3.5-turbo') },
      { model: 'gemini-2.0-flash-lite', name: 'Gemini Flash (Google)', configured: this.isConfigured('gemini-2.0-flash-lite') }
    ]
  }
}

export default new AIProviderService()
