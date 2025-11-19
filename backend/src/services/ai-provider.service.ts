import { Chess } from 'chess.js'
import axios from 'axios'

type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro' | 'gemini-1.5-flash' | 'stockfish'
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

      if (model.startsWith('gpt-')) {
        return await this.getOpenAIMove(model, fen, level, moveHistory)
      }

      if (model.startsWith('gemini-')) {
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
      // Gemini uses different model names in the API
      const geminiModel = model === 'gemini-pro' ? 'gemini-1.5-pro-latest' : 'gemini-1.5-flash-latest'
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${this.geminiApiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: systemPrompt + '\n\n' + prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: this.getTemperature(level),
            maxOutputTokens: 10,
            topP: 0.95,
            topK: 40
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )

      const moveText = response.data.candidates[0].content.parts[0].text.trim()
      return this.parseUCIMove(moveText)
    } catch (error: any) {
      console.error('Gemini API error:', error.response?.data || error.message)
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
      { model: 'gpt-4', name: 'GPT-4 (OpenAI)', configured: this.isConfigured('gpt-4') },
      { model: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenAI)', configured: this.isConfigured('gpt-3.5-turbo') },
      { model: 'gemini-pro', name: 'Gemini 1.5 Pro (Google)', configured: this.isConfigured('gemini-pro') },
      { model: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Google)', configured: this.isConfigured('gemini-1.5-flash') }
    ]
  }
}

export default new AIProviderService()
