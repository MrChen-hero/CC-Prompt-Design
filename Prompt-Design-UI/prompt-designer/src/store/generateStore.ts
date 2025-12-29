import { create } from 'zustand'
import {
  type GenerateSession,
  type XmlTag,
  createNewSession,
} from '@/types/generate'

interface GenerateStore {
  session: GenerateSession

  // Step Navigation
  setStep: (step: 1 | 2 | 3 | 4) => void
  nextStep: () => void
  prevStep: () => void

  // Step 1: Description
  setDescription: (description: string) => void

  // Step 2: Analysis
  setAnalysis: (analysis: GenerateSession['analysis']) => void

  // Step 3: Adjustments
  toggleTag: (tag: XmlTag) => void
  setLanguage: (language: 'zh' | 'en') => void
  setOutputStyle: (style: 'professional' | 'friendly' | 'academic') => void
  setIncludeExample: (include: boolean) => void

  // Step 4: Result
  setResult: (result: GenerateSession['result']) => void

  // Status
  setGenerating: (isGenerating: boolean) => void
  setError: (error: string | null) => void

  // Reset
  resetSession: () => void
}

export const useGenerateStore = create<GenerateStore>((set) => ({
  session: createNewSession(),

  setStep: (step) =>
    set((state) => ({
      session: { ...state.session, currentStep: step },
    })),

  nextStep: () =>
    set((state) => ({
      session: {
        ...state.session,
        currentStep: Math.min(4, state.session.currentStep + 1) as 1 | 2 | 3 | 4,
      },
    })),

  prevStep: () =>
    set((state) => ({
      session: {
        ...state.session,
        currentStep: Math.max(1, state.session.currentStep - 1) as 1 | 2 | 3 | 4,
      },
    })),

  setDescription: (description) =>
    set((state) => ({
      session: { ...state.session, userDescription: description },
    })),

  setAnalysis: (analysis) =>
    set((state) => ({
      session: {
        ...state.session,
        analysis,
        // 当收到分析结果时，更新启用的标签
        adjustments: analysis
          ? {
              ...state.session.adjustments,
              enabledTags: analysis.suggestedTags,
            }
          : state.session.adjustments,
      },
    })),

  toggleTag: (tag) =>
    set((state) => {
      const currentTags = state.session.adjustments.enabledTags
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag]
      return {
        session: {
          ...state.session,
          adjustments: { ...state.session.adjustments, enabledTags: newTags },
        },
      }
    }),

  setLanguage: (language) =>
    set((state) => ({
      session: {
        ...state.session,
        adjustments: { ...state.session.adjustments, language },
      },
    })),

  setOutputStyle: (outputStyle) =>
    set((state) => ({
      session: {
        ...state.session,
        adjustments: { ...state.session.adjustments, outputStyle },
      },
    })),

  setIncludeExample: (includeExample) =>
    set((state) => ({
      session: {
        ...state.session,
        adjustments: { ...state.session.adjustments, includeExample },
      },
    })),

  setResult: (result) =>
    set((state) => ({
      session: { ...state.session, result },
    })),

  setGenerating: (isGenerating) =>
    set((state) => ({
      session: { ...state.session, isGenerating },
    })),

  setError: (error) =>
    set((state) => ({
      session: { ...state.session, error },
    })),

  resetSession: () =>
    set({
      session: createNewSession(),
    }),
}))
