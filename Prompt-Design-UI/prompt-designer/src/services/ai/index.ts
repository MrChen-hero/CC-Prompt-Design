/**
 * AI 服务统一入口
 */

export * from './types'
export { createAnthropicProvider, ANTHROPIC_MODELS } from './anthropic'
export { getDefaultAIConfig, getConfiguredAIProvider, isAIConfigured } from './configService'
export {
  analyzeUserDescription,
  generateTagContents,
  polishTagContent,
  canUseAI,
  type AnalysisResult,
} from './generateService'

import { type AIProvider } from './types'
import { createAnthropicProvider } from './anthropic'
import { createOpenAIProvider } from './openai'
import { createGoogleProvider } from './google'

export { OPENAI_MODELS } from './openai'
export { GOOGLE_MODELS } from './google'

export type ModelProvider = 'anthropic' | 'openai' | 'google' | 'custom'

export interface AIServiceConfig {
  provider: ModelProvider
  apiKey: string
  baseUrl?: string
  model?: string  // 用于自定义模型
}

/**
 * 创建 AI 服务提供者
 */
export function createAIProvider(config: AIServiceConfig): AIProvider {
  switch (config.provider) {
    case 'anthropic':
      return createAnthropicProvider({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
      })

    case 'openai':
      return createOpenAIProvider({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
      })

    case 'google':
      return createGoogleProvider({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
      })

    case 'custom':
      // 自定义提供者使用 OpenAI 兼容接口
      if (!config.baseUrl) {
        throw new Error('自定义提供者需要设置 Base URL')
      }
      return createOpenAIProvider({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        testModel: config.model,  // 传递自定义模型用于连接测试
      })

    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}

/**
 * 模型提供商信息
 * 基于各供应商官方文档
 *
 * @see https://docs.anthropic.com/ - Anthropic Claude
 * @see https://platform.openai.com/docs/api-reference - OpenAI GPT
 * @see https://ai.google.dev/gemini-api/docs - Google Gemini
 */
export const MODEL_PROVIDERS: Record<ModelProvider, {
  name: string
  description: string
  apiKeyPrefix: string
  apiKeyHint: string
  defaultBaseUrl: string
  authHeader: string
  docsUrl: string
}> = {
  anthropic: {
    name: 'Anthropic',
    description: 'Claude AI 系列模型（Claude 4、Claude 3.5 等）',
    apiKeyPrefix: 'sk-ant-',
    apiKeyHint: 'sk-ant-api03-...',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    authHeader: 'x-api-key',
    docsUrl: 'https://docs.anthropic.com/',
  },
  openai: {
    name: 'OpenAI',
    description: 'GPT 系列模型（GPT-4o、GPT-4、o1 等）',
    apiKeyPrefix: 'sk-',
    apiKeyHint: 'sk-proj-... 或 sk-...',
    defaultBaseUrl: 'https://api.openai.com/v1',
    authHeader: 'Authorization: Bearer',
    docsUrl: 'https://platform.openai.com/docs/api-reference',
  },
  google: {
    name: 'Google',
    description: 'Gemini 系列模型（Gemini 2.5、Gemini 2.0 等）',
    apiKeyPrefix: 'AIzaSy',
    apiKeyHint: 'AIzaSy...',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    authHeader: 'x-goog-api-key',
    docsUrl: 'https://ai.google.dev/gemini-api/docs',
  },
  custom: {
    name: '自定义',
    description: 'OpenAI 兼容接口（如 Ollama、LM Studio、vLLM 等）',
    apiKeyPrefix: '',
    apiKeyHint: '根据服务商要求填写',
    defaultBaseUrl: '',
    authHeader: 'Authorization: Bearer',
    docsUrl: '',
  },
}
