import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ModelConfig {
  id: string
  provider: 'anthropic' | 'openai' | 'google' | 'deepseek' | 'custom'
  apiKey: string
  modelId: string
  baseUrl?: string
  temperature: number
  maxTokens: number
  isDefault: boolean
}

interface ModelStore {
  models: ModelConfig[]
  activeModel: ModelConfig | null
  connectionStatus: 'idle' | 'testing' | 'connected' | 'error'

  // Actions
  setActiveModel: (model: ModelConfig) => void
  addModel: (model: ModelConfig) => void
  updateModel: (id: string, updates: Partial<ModelConfig>) => void
  removeModel: (id: string) => void
  setConnectionStatus: (status: ModelStore['connectionStatus']) => void
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      models: [],
      activeModel: null,
      connectionStatus: 'idle',

      setActiveModel: (model) => set({ activeModel: model }),

      addModel: (model) =>
        set((state) => ({
          models: [...state.models, model],
          activeModel: model.isDefault ? model : state.activeModel,
        })),

      updateModel: (id, updates) =>
        set((state) => ({
          models: state.models.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
          activeModel:
            state.activeModel?.id === id
              ? { ...state.activeModel, ...updates }
              : state.activeModel,
        })),

      removeModel: (id) =>
        set((state) => ({
          models: state.models.filter((m) => m.id !== id),
          activeModel:
            state.activeModel?.id === id ? null : state.activeModel,
        })),

      setConnectionStatus: (status) => set({ connectionStatus: status }),
    }),
    {
      name: 'model-storage',
      partialize: (state) => ({
        models: state.models.map((m) => ({
          ...m,
          // 不持久化 API Key 的明文（实际应用中需要加密）
          apiKey: m.apiKey ? '***' : '',
        })),
        activeModel: state.activeModel
          ? { ...state.activeModel, apiKey: '***' }
          : null,
      }),
    }
  )
)
