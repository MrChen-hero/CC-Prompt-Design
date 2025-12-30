/**
 * OpenAI GPT AI 服务
 *
 * 支持 GPT-4o, GPT-4, o1 等模型
 * 也用于 OpenAI 兼容接口（如 Ollama、LM Studio、vLLM 等）
 *
 * @see https://platform.openai.com/docs/api-reference
 */

import {
  type AIProvider,
  type AICompletionOptions,
  type AICompletionResponse,
  AIServiceError,
} from './types'

export interface OpenAIConfig {
  apiKey: string
  baseUrl?: string
  testModel?: string  // 用于连接测试的模型，自定义接口可指定
}

// 开发环境使用 Vite 代理，生产环境使用 Vercel API Routes
const getApiUrl = (baseUrl?: string) => {
  if (baseUrl) {
    // 清理用户可能误填的端点路径，避免路径重复
    let cleanUrl = baseUrl.trim()
    // 移除末尾斜杠
    cleanUrl = cleanUrl.replace(/\/+$/, '')
    // 移除常见的端点路径后缀（用户可能直接复制完整URL）
    const endpointSuffixes = [
      '/chat/completions',
      '/completions',
      '/embeddings',
      '/models',
    ]
    for (const suffix of endpointSuffixes) {
      if (cleanUrl.endsWith(suffix)) {
        cleanUrl = cleanUrl.slice(0, -suffix.length)
        break
      }
    }
    return cleanUrl
  }
  if (import.meta.env.DEV) {
    return '/api/openai'
  }
  return '/api/openai'
}

export function createOpenAIProvider(config: OpenAIConfig): AIProvider {
  const { apiKey, baseUrl, testModel } = config

  const makeRequest = async (
    endpoint: string,
    body: object
  ): Promise<Response> => {
    const url = `${getApiUrl(baseUrl)}${endpoint}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new AIServiceError(
        error.error?.message || `API 请求失败: ${response.status}`,
        error.error?.type || 'api_error',
        'openai'
      )
    }

    return response
  }

  return {
    name: 'OpenAI',

    async testConnection(): Promise<boolean> {
      try {
        // 使用配置的测试模型，如未指定则使用 gpt-4o-mini（官方 OpenAI 默认）
        const modelToTest = testModel || 'gpt-4o-mini'
        await this.complete({
          model: modelToTest,
          messages: [{ role: 'user', content: 'Hi' }],
          maxTokens: 10,
        })
        return true
      } catch (error) {
        console.error('OpenAI connection test failed:', error)
        return false
      }
    },

    async complete(options: AICompletionOptions): Promise<AICompletionResponse> {
      const { model, messages, systemPrompt, maxTokens = 4096, temperature = 0.7 } = options

      // 构建消息列表
      const apiMessages: Array<{ role: string; content: string }> = []

      // 添加 system 消息
      if (systemPrompt) {
        apiMessages.push({ role: 'system', content: systemPrompt })
      }

      // 添加其他消息
      for (const msg of messages) {
        if (msg.role === 'system' && !systemPrompt) {
          apiMessages.push({ role: 'system', content: msg.content })
        } else if (msg.role !== 'system') {
          apiMessages.push({ role: msg.role, content: msg.content })
        }
      }

      const body = {
        model,
        messages: apiMessages,
        max_tokens: maxTokens,
        temperature,
      }

      const response = await makeRequest('/chat/completions', body)
      const data = await response.json()

      return {
        content: data.choices?.[0]?.message?.content || '',
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
        },
      }
    },

    async streamComplete(
      options: AICompletionOptions,
      onChunk: (chunk: string) => void
    ): Promise<AICompletionResponse> {
      const { model, messages, systemPrompt, maxTokens = 4096, temperature = 0.7 } = options

      const apiMessages: Array<{ role: string; content: string }> = []

      if (systemPrompt) {
        apiMessages.push({ role: 'system', content: systemPrompt })
      }

      for (const msg of messages) {
        if (msg.role === 'system' && !systemPrompt) {
          apiMessages.push({ role: 'system', content: msg.content })
        } else if (msg.role !== 'system') {
          apiMessages.push({ role: msg.role, content: msg.content })
        }
      }

      const body = {
        model,
        messages: apiMessages,
        max_tokens: maxTokens,
        temperature,
        stream: true,
      }

      const response = await makeRequest('/chat/completions', body)

      if (!response.body) {
        throw new AIServiceError('No response body', 'stream_error', 'openai')
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
                const delta = parsed.choices?.[0]?.delta?.content
                if (delta) {
                  fullContent += delta
                  onChunk(delta)
                }

                // 尝试获取 usage（某些实现在最后返回）
                if (parsed.usage) {
                  inputTokens = parsed.usage.prompt_tokens || inputTokens
                  outputTokens = parsed.usage.completion_tokens || outputTokens
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
 * OpenAI 模型列表
 * @see https://platform.openai.com/docs/models
 */
export const OPENAI_MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: '最新旗舰模型，多模态能力强',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: '轻量快速模型，性价比高',
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: '高性能模型，支持 128K 上下文',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: '经典 GPT-4 模型',
  },
  {
    id: 'o1',
    name: 'o1',
    description: '推理模型，适合复杂问题',
  },
  {
    id: 'o1-mini',
    name: 'o1 Mini',
    description: '轻量推理模型',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: '经济实惠的快速模型',
  },
]
