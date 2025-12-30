import Dexie, { type Table } from 'dexie'

// Database types
export interface DBPrompt {
  id?: number
  name: string
  description: string
  category: string
  tags: string[]
  cliVersion: string
  webVersion: string
  createdAt: Date
  updatedAt: Date
  usageCount: number
  isFavorite: boolean
}

export interface DBModelConfig {
  id?: number
  provider: string
  apiKeyEncrypted: string  // 加密存储
  modelId: string
  baseUrl?: string
  temperature: number
  maxTokens: number
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DBSession {
  id?: number
  userDescription: string
  aiAnalysis?: string
  generatedCliPrompt?: string
  generatedWebPrompt?: string
  status: 'draft' | 'analyzing' | 'adjusting' | 'completed'
  createdAt: Date
  updatedAt: Date
}

// Database class
export class PromptDesignerDB extends Dexie {
  prompts!: Table<DBPrompt>
  models!: Table<DBModelConfig>
  sessions!: Table<DBSession>

  constructor() {
    super('PromptDesigner')

    this.version(1).stores({
      prompts: '++id, name, category, *tags, createdAt, updatedAt, isFavorite',
      models: '++id, provider, isDefault, createdAt',
      sessions: '++id, status, createdAt, updatedAt',
    })
  }
}

// Database instance
export const db = new PromptDesignerDB()

// Helper functions
export const promptsDB = {
  async getAll(): Promise<DBPrompt[]> {
    return db.prompts.orderBy('updatedAt').reverse().toArray()
  },

  async getById(id: number): Promise<DBPrompt | undefined> {
    return db.prompts.get(id)
  },

  async create(prompt: Omit<DBPrompt, 'id'>): Promise<number> {
    return db.prompts.add({
      ...prompt,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  },

  async update(id: number, updates: Partial<DBPrompt>): Promise<number> {
    return db.prompts.update(id, {
      ...updates,
      updatedAt: new Date(),
    })
  },

  async delete(id: number): Promise<void> {
    return db.prompts.delete(id)
  },

  async search(query: string): Promise<DBPrompt[]> {
    const lowerQuery = query.toLowerCase()
    return db.prompts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery)
      )
      .toArray()
  },

  async getByCategory(category: string): Promise<DBPrompt[]> {
    return db.prompts.where('category').equals(category).toArray()
  },

  async getFavorites(): Promise<DBPrompt[]> {
    // IndexedDB 不支持布尔值作为索引键，改用 filter 方法
    const all = await db.prompts.toArray()
    return all.filter(p => p.isFavorite === true)
  },

  async incrementUsage(id: number): Promise<void> {
    const prompt = await db.prompts.get(id)
    if (prompt) {
      await db.prompts.update(id, {
        usageCount: prompt.usageCount + 1,
        updatedAt: new Date(),
      })
    }
  },
}

export const modelsDB = {
  async getAll(): Promise<DBModelConfig[]> {
    return db.models.toArray()
  },

  async getDefault(): Promise<DBModelConfig | undefined> {
    // IndexedDB 不支持布尔值作为索引键，改用 filter 方法
    const all = await db.models.toArray()
    return all.find(m => m.isDefault === true)
  },

  async create(model: Omit<DBModelConfig, 'id'>): Promise<number> {
    // If this is the first model or set as default, ensure it's the only default
    if (model.isDefault) {
      await db.models.toCollection().modify({ isDefault: false })
    }
    return db.models.add({
      ...model,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  },

  async update(id: number, updates: Partial<DBModelConfig>): Promise<number> {
    if (updates.isDefault) {
      await db.models.toCollection().modify({ isDefault: false })
    }
    return db.models.update(id, {
      ...updates,
      updatedAt: new Date(),
    })
  },

  async delete(id: number): Promise<void> {
    return db.models.delete(id)
  },
}

export const sessionsDB = {
  async getAll(): Promise<DBSession[]> {
    return db.sessions.orderBy('updatedAt').reverse().toArray()
  },

  async create(session: Omit<DBSession, 'id'>): Promise<number> {
    return db.sessions.add({
      ...session,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  },

  async update(id: number, updates: Partial<DBSession>): Promise<number> {
    return db.sessions.update(id, {
      ...updates,
      updatedAt: new Date(),
    })
  },

  async delete(id: number): Promise<void> {
    return db.sessions.delete(id)
  },
}
