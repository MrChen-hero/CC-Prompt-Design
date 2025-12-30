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

export type ModelProvider = 'anthropic' | 'openai' | 'google' | 'deepseek' | 'custom'

export interface AIServiceConfig {
  provider: ModelProvider
  apiKey: string
  baseUrl?: string
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
      // TODO: 实现 OpenAI 提供者
      throw new Error('OpenAI provider not implemented yet')

    case 'google':
      // TODO: 实现 Google 提供者
      throw new Error('Google provider not implemented yet')

    case 'deepseek':
      // TODO: 实现 DeepSeek 提供者
      throw new Error('DeepSeek provider not implemented yet')

    case 'custom':
      // 对于自定义提供者，假设使用 OpenAI 兼容接口
      throw new Error('Custom provider not implemented yet')

    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}

/**
 * 模型提供商信息
 */
export const MODEL_PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    description: 'Claude AI 系列模型',
    apiKeyPrefix: 'sk-ant-',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
  },
  openai: {
    name: 'OpenAI',
    description: 'GPT 系列模型',
    apiKeyPrefix: 'sk-',
    defaultBaseUrl: 'https://api.openai.com/v1',
  },
  google: {
    name: 'Google',
    description: 'Gemini 系列模型',
    apiKeyPrefix: '',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1',
  },
  deepseek: {
    name: 'DeepSeek',
    description: 'DeepSeek 系列模型',
    apiKeyPrefix: 'sk-',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
  },
  custom: {
    name: '自定义',
    description: 'OpenAI 兼容接口',
    apiKeyPrefix: '',
    defaultBaseUrl: '',
  },
} as const
