/**
 * Anthropic Claude AI 服务
 *
 * 支持 Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku 等模型
 */

import {
  type AIProvider,
  type AICompletionOptions,
  type AICompletionResponse,
  AIServiceError,
} from './types'

export interface AnthropicConfig {
  apiKey: string
  baseUrl?: string
}

// 开发环境使用 Vite 代理，生产环境使用 Vercel API Routes
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    // 开发环境：使用 Vite 代理
    return '/api/anthropic'
  }
  // 生产环境：使用 Vercel Serverless Function
  return '/api/anthropic'
}

export function createAnthropicProvider(config: AnthropicConfig): AIProvider {
  const { apiKey, baseUrl } = config

  const makeRequest = async (
    endpoint: string,
    body: object
  ): Promise<Response> => {
    const url = baseUrl
      ? `${baseUrl}${endpoint}`
      : `${getApiUrl()}${endpoint}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new AIServiceError(
        error.error?.message || `API 请求失败: ${response.status}`,
        error.error?.type || 'api_error',
        'anthropic'
      )
    }

    return response
  }

  return {
    name: 'Anthropic',

    async testConnection(): Promise<boolean> {
      try {
        // 使用一个简单的请求测试连接
        await this.complete({
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: 'Hi' }],
          maxTokens: 10,
        })
        return true
      } catch (error) {
        console.error('Anthropic connection test failed:', error)
        return false
      }
    },

    async complete(options: AICompletionOptions): Promise<AICompletionResponse> {
      const { model, messages, systemPrompt, maxTokens = 4096, temperature = 0.7 } = options

      // 将消息转换为 Anthropic 格式
      const systemMessage = messages.find((m) => m.role === 'system')
      const chatMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

      const body: Record<string, unknown> = {
        model,
        messages: chatMessages,
        max_tokens: maxTokens,
        temperature,
      }

      // 优先使用 systemPrompt 参数，其次使用 messages 中的 system 消息
      if (systemPrompt) {
        body.system = systemPrompt
      } else if (systemMessage) {
        body.system = systemMessage.content
      }

      const response = await makeRequest('/messages', body)
      const data = await response.json()

      return {
        content: data.content[0]?.text || '',
        usage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0,
        },
      }
    },

    async streamComplete(
      options: AICompletionOptions,
      onChunk: (chunk: string) => void
    ): Promise<AICompletionResponse> {
      const { model, messages, systemPrompt, maxTokens = 4096, temperature = 0.7 } = options

      const systemMessage = messages.find((m) => m.role === 'system')
      const chatMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

      const body: Record<string, unknown> = {
        model,
        messages: chatMessages,
        max_tokens: maxTokens,
        temperature,
        stream: true,
      }

      // 优先使用 systemPrompt 参数，其次使用 messages 中的 system 消息
      if (systemPrompt) {
        body.system = systemPrompt
      } else if (systemMessage) {
        body.system = systemMessage.content
      }

      const response = await makeRequest('/messages', body)

      if (!response.body) {
        throw new AIServiceError('No response body', 'stream_error', 'anthropic')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let inputTokens = 0
      let outputTokens = 0

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)

                if (parsed.type === 'content_block_delta') {
                  const text = parsed.delta?.text || ''
                  fullContent += text
                  onChunk(text)
                }

                if (parsed.type === 'message_delta') {
                  outputTokens = parsed.usage?.output_tokens || outputTokens
                }

                if (parsed.type === 'message_start') {
                  inputTokens = parsed.message?.usage?.input_tokens || 0
                }
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      return {
        content: fullContent,
        usage: {
          inputTokens,
          outputTokens,
        },
      }
    },
  }
}

/**
 * Anthropic 模型列表
 */
export const ANTHROPIC_MODELS = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    description: '最新的平衡型模型，性价比高',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: '强大的通用模型，适合大多数任务',
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    description: '最强大的模型，适合复杂任务',
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    description: '快速轻量模型，适合简单任务',
  },
]
