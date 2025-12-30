/**
 * Google Gemini AI 服务
 *
 * 支持 Gemini 2.5、Gemini 2.0、Gemini 1.5 等模型
 *
 * @see https://ai.google.dev/gemini-api/docs
 */

import {
  type AIProvider,
  type AICompletionOptions,
  type AICompletionResponse,
  AIServiceError,
} from './types'

export interface GoogleConfig {
  apiKey: string
  baseUrl?: string
}

// 开发环境使用 Vite 代理，生产环境使用 Vercel API Routes
const getApiUrl = (baseUrl?: string) => {
  if (baseUrl) {
    return baseUrl
  }
  if (import.meta.env.DEV) {
    return '/api/google'
  }
  return '/api/google'
}

export function createGoogleProvider(config: GoogleConfig): AIProvider {
  const { apiKey, baseUrl } = config

  const makeRequest = async (
    model: string,
    endpoint: string,
    body: object
  ): Promise<Response> => {
    // Google Gemini API 的 URL 格式: /models/{model}:{method}
    const url = `${getApiUrl(baseUrl)}/models/${model}:${endpoint}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new AIServiceError(
        error.error?.message || `API 请求失败: ${response.status}`,
        error.error?.code || 'api_error',
        'google'
      )
    }

    return response
  }

  return {
    name: 'Google',

    async testConnection(): Promise<boolean> {
      try {
        await this.complete({
          model: 'gemini-2.0-flash',
          messages: [{ role: 'user', content: 'Hi' }],
          maxTokens: 10,
        })
        return true
      } catch (error) {
        console.error('Google connection test failed:', error)
        return false
      }
    },

    async complete(options: AICompletionOptions): Promise<AICompletionResponse> {
      const { model, messages, systemPrompt, maxTokens = 4096, temperature = 0.7 } = options

      // 构建 Gemini API 格式的内容
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []

      // Gemini 使用 systemInstruction 而不是 system 角色
      let systemInstruction: { parts: Array<{ text: string }> } | undefined

      if (systemPrompt) {
        systemInstruction = { parts: [{ text: systemPrompt }] }
      }

      // 转换消息格式
      for (const msg of messages) {
        if (msg.role === 'system') {
          if (!systemPrompt) {
            systemInstruction = { parts: [{ text: msg.content }] }
          }
        } else {
          // Gemini 使用 'user' 和 'model' 而不是 'assistant'
          const role = msg.role === 'assistant' ? 'model' : 'user'
          contents.push({
            role,
            parts: [{ text: msg.content }],
          })
        }
      }

      const body: Record<string, unknown> = {
        contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
        },
      }

      if (systemInstruction) {
        body.systemInstruction = systemInstruction
      }

      const response = await makeRequest(model, 'generateContent', body)
      const data = await response.json()

      // 提取响应内容
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      return {
        content,
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount || 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
        },
      }
    },

    async streamComplete(
      options: AICompletionOptions,
      onChunk: (chunk: string) => void
    ): Promise<AICompletionResponse> {
      const { model, messages, systemPrompt, maxTokens = 4096, temperature = 0.7 } = options

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []
      let systemInstruction: { parts: Array<{ text: string }> } | undefined

      if (systemPrompt) {
        systemInstruction = { parts: [{ text: systemPrompt }] }
      }

      for (const msg of messages) {
        if (msg.role === 'system') {
          if (!systemPrompt) {
            systemInstruction = { parts: [{ text: msg.content }] }
          }
        } else {
          const role = msg.role === 'assistant' ? 'model' : 'user'
          contents.push({
            role,
            parts: [{ text: msg.content }],
          })
        }
      }

      const body: Record<string, unknown> = {
        contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
        },
      }

      if (systemInstruction) {
        body.systemInstruction = systemInstruction
      }

      // Gemini 流式 API 使用 streamGenerateContent
      const url = `${getApiUrl(baseUrl)}/models/${model}:streamGenerateContent?alt=sse`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new AIServiceError(
          error.error?.message || `API 请求失败: ${response.status}`,
          error.error?.code || 'api_error',
          'google'
        )
      }

      if (!response.body) {
        throw new AIServiceError('No response body', 'stream_error', 'google')
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

              try {
                const parsed = JSON.parse(data)
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                  fullContent += text
                  onChunk(text)
                }

                // 获取 usage
                if (parsed.usageMetadata) {
                  inputTokens = parsed.usageMetadata.promptTokenCount || inputTokens
                  outputTokens = parsed.usageMetadata.candidatesTokenCount || outputTokens
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
 * Google Gemini 模型列表
 * @see https://ai.google.dev/gemini-api/docs/models/gemini
 */
export const GOOGLE_MODELS = [
  {
    id: 'gemini-2.5-pro-preview-06-05',
    name: 'Gemini 2.5 Pro',
    description: '最新旗舰模型，最强推理能力',
  },
  {
    id: 'gemini-2.5-flash-preview-05-20',
    name: 'Gemini 2.5 Flash',
    description: '快速高效模型，自适应思考',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: '多模态模型，支持图像和音频',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    description: '轻量高效模型，成本效益高',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: '支持 200 万 token 上下文',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: '快速响应模型',
  },
]
