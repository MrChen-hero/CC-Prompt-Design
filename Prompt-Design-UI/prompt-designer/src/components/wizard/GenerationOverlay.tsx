import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type GenerationPhase = 'designing' | 'checking' | 'polishing' | 'complete' | 'error'

export interface GenerationStep {
  id: GenerationPhase
  label: string
  description: string
}

const STEPS: GenerationStep[] = [
  {
    id: 'designing',
    label: '提示词设计中',
    description: '正在根据分析结果生成各标签内容...',
  },
  {
    id: 'checking',
    label: '提示词质量检查',
    description: '正在根据 Anthropic 准则进行质量审核...',
  },
  {
    id: 'polishing',
    label: '提示词润色中',
    description: '正在根据检查结果优化提示词...',
  },
]

interface GenerationOverlayProps {
  isVisible: boolean
  currentPhase: GenerationPhase
  qualityScore?: number
  errorMessage?: string
}

export function GenerationOverlay({
  isVisible,
  currentPhase,
  qualityScore,
  errorMessage,
}: GenerationOverlayProps) {
  if (!isVisible) return null

  const currentStepIndex = STEPS.findIndex(s => s.id === currentPhase)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 p-6 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            AI 生成流程
          </h3>
          <p className="text-sm text-slate-400">
            正在为您生成高质量的专业提示词
          </p>
        </div>

        {/* 步骤列表 */}
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentPhase
            const isComplete = currentStepIndex > index || currentPhase === 'complete'
            const isPending = currentStepIndex < index && currentPhase !== 'error'
            const isError = currentPhase === 'error' && isActive

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg transition-all duration-300',
                  isActive && !isError && 'bg-purple-900/30 border border-purple-500/50',
                  isComplete && 'bg-green-900/20 border border-green-500/30',
                  isPending && 'bg-slate-800/50 opacity-50',
                  isError && 'bg-red-900/30 border border-red-500/50'
                )}
              >
                {/* 状态图标 */}
                <div className="flex-shrink-0 mt-0.5">
                  {isComplete && (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  )}
                  {isActive && !isError && (
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  )}
                  {isError && (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  {isPending && (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                  )}
                </div>

                {/* 步骤内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'font-medium',
                        isActive && !isError && 'text-purple-300',
                        isComplete && 'text-green-300',
                        isPending && 'text-slate-500',
                        isError && 'text-red-300'
                      )}
                    >
                      {step.label}
                    </span>
                    {/* 质量评分显示 */}
                    {step.id === 'checking' && isComplete && qualityScore !== undefined && (
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          qualityScore >= 90
                            ? 'bg-green-500/20 text-green-400'
                            : qualityScore >= 70
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        )}
                      >
                        {qualityScore}分
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm mt-1',
                      isActive && !isError && 'text-slate-300',
                      isComplete && 'text-slate-400',
                      isPending && 'text-slate-600',
                      isError && 'text-red-400'
                    )}
                  >
                    {isError ? errorMessage : step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* 底部进度指示 */}
        <div className="mt-6">
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out',
                currentPhase === 'error' ? 'bg-red-500' : 'bg-purple-500'
              )}
              style={{
                width:
                  currentPhase === 'complete'
                    ? '100%'
                    : currentPhase === 'error'
                    ? `${((currentStepIndex + 1) / STEPS.length) * 100}%`
                    : `${((currentStepIndex + 0.5) / STEPS.length) * 100}%`,
              }}
            />
          </div>
          <p className="text-center text-xs text-slate-500 mt-2">
            {currentPhase === 'complete'
              ? '生成完成！'
              : currentPhase === 'error'
              ? '生成出错'
              : `步骤 ${currentStepIndex + 1} / ${STEPS.length}`}
          </p>
        </div>
      </div>
    </div>
  )
}
