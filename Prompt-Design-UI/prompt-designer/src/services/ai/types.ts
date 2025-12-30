/**
 * AI 服务接口定义
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AICompletionOptions {
  model: string
  messages: AIMessage[]
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export interface AICompletionResponse {
  content: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

export interface AIProvider {
  name: string
  testConnection: () => Promise<boolean>
  complete: (options: AICompletionOptions) => Promise<AICompletionResponse>
  streamComplete?: (
    options: AICompletionOptions,
    onChunk: (chunk: string) => void
  ) => Promise<AICompletionResponse>
}

/**
 * AI 服务错误类型
 */
export class AIServiceError extends Error {
  code: string
  provider: string

  constructor(message: string, code: string, provider: string) {
    super(message)
    this.name = 'AIServiceError'
    this.code = code
    this.provider = provider
  }
}
