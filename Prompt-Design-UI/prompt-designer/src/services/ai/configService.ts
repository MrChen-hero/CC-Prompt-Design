/**
 * AI 配置服务
 *
 * 获取已保存的 AI 配置并创建 Provider 实例
 */

import { modelsDB } from '@/services/db'
import { decryptApiKey } from '@/services/crypto'
import { createAIProvider, type AIProvider } from './index'

export interface AIConfig {
  provider: string
  apiKey: string
  modelId: string
  baseUrl?: string
  temperature: number
  maxTokens: number
}

/**
 * 获取默认的 AI 配置
 */
export async function getDefaultAIConfig(): Promise<AIConfig | null> {
  try {
    const defaultModel = await modelsDB.getDefault()

    if (!defaultModel) {
      return null
    }

    // 解密 API Key
    let apiKey = ''
    if (defaultModel.apiKeyEncrypted) {
      try {
        apiKey = await decryptApiKey(defaultModel.apiKeyEncrypted)
      } catch (error) {
        console.error('Failed to decrypt API key:', error)
        return null
      }
    }

    return {
      provider: defaultModel.provider,
      apiKey,
      modelId: defaultModel.modelId,
      baseUrl: defaultModel.baseUrl,
      temperature: defaultModel.temperature,
      maxTokens: defaultModel.maxTokens,
    }
  } catch (error) {
    console.error('Failed to get AI config:', error)
    return null
  }
}

/**
 * 获取已配置的 AI Provider 实例
 */
export async function getConfiguredAIProvider(): Promise<AIProvider | null> {
  const config = await getDefaultAIConfig()

  if (!config || !config.apiKey) {
    return null
  }

  try {
    const provider = createAIProvider({
      provider: config.provider as 'anthropic' | 'openai' | 'google' | 'deepseek' | 'custom',
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
    })

    return provider
  } catch (error) {
    console.error('Failed to create AI provider:', error)
    return null
  }
}

/**
 * 检查是否已配置 AI
 */
export async function isAIConfigured(): Promise<boolean> {
  const config = await getDefaultAIConfig()
  return config !== null && config.apiKey.length > 0
}
