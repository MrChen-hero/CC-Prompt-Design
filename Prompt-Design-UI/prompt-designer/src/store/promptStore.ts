import { create } from 'zustand'

export type PromptCategory =
  | 'coding'
  | 'writing'
  | 'academic'
  | 'education'
  | 'business'
  | 'translation'
  | 'analysis'
  | 'other'

export interface StoredPrompt {
  id: string
  name: string
  description: string
  category: PromptCategory
  tags: string[]
  cliVersion: string
  webVersion: string
  createdAt: Date
  updatedAt: Date
  usageCount: number
  isFavorite: boolean
}

interface PromptStore {
  prompts: StoredPrompt[]
  selectedPrompt: StoredPrompt | null
  searchQuery: string
  filterCategory: PromptCategory | 'all'
  sortBy: 'recent' | 'usage' | 'name'

  // Actions
  setPrompts: (prompts: StoredPrompt[]) => void
  addPrompt: (prompt: StoredPrompt) => void
  updatePrompt: (id: string, updates: Partial<StoredPrompt>) => void
  deletePrompt: (id: string) => void
  setSelectedPrompt: (prompt: StoredPrompt | null) => void
  setSearchQuery: (query: string) => void
  setFilterCategory: (category: PromptCategory | 'all') => void
  setSortBy: (sort: PromptStore['sortBy']) => void
  toggleFavorite: (id: string) => void
  incrementUsage: (id: string) => void
}

export const usePromptStore = create<PromptStore>((set) => ({
  prompts: [],
  selectedPrompt: null,
  searchQuery: '',
  filterCategory: 'all',
  sortBy: 'recent',

  setPrompts: (prompts) => set({ prompts }),

  addPrompt: (prompt) =>
    set((state) => ({
      prompts: [prompt, ...state.prompts],
    })),

  updatePrompt: (id, updates) =>
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
      selectedPrompt:
        state.selectedPrompt?.id === id
          ? { ...state.selectedPrompt, ...updates, updatedAt: new Date() }
          : state.selectedPrompt,
    })),

  deletePrompt: (id) =>
    set((state) => ({
      prompts: state.prompts.filter((p) => p.id !== id),
      selectedPrompt:
        state.selectedPrompt?.id === id ? null : state.selectedPrompt,
    })),

  setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilterCategory: (category) => set({ filterCategory: category }),

  setSortBy: (sort) => set({ sortBy: sort }),

  toggleFavorite: (id) =>
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      ),
    })),

  incrementUsage: (id) =>
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p
      ),
    })),
}))

// Selectors
export const useFilteredPrompts = () => {
  const { prompts, searchQuery, filterCategory, sortBy } = usePromptStore()

  let filtered = [...prompts]

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    )
  }

  // Filter by category
  if (filterCategory !== 'all') {
    filtered = filtered.filter((p) => p.category === filterCategory)
  }

  // Sort
  switch (sortBy) {
    case 'recent':
      filtered.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      break
    case 'usage':
      filtered.sort((a, b) => b.usageCount - a.usageCount)
      break
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
  }

  return filtered
}
