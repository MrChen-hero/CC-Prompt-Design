import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGenerateStore } from "@/store/generateStore"
import { XML_TAG_INFO } from "@/types/generate"
import { Loader2, AlertCircle } from "lucide-react"
import {
  analyzeUserDescription,
  generateTagContents as aiGenerateTagContents,
  canUseAI,
} from "@/services/ai"

export function Step2Analysis() {
  const {
    session,
    setAnalysis,
    setGeneratedTagContent,
    nextStep,
    prevStep,
    setGenerating,
    setError,
  } = useGenerateStore()
  const { userDescription, analysis, adjustments, error } = session
  const { language, outputStyle } = adjustments
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)

  // 自动开始分析
  useEffect(() => {
    const startAnalysis = async () => {
      if (analysis || isAnalyzing) return

      // 检查 AI 是否可用
      const aiStatus = await canUseAI()
      if (!aiStatus.available) {
        setError(aiStatus.message || '请先在设置页面配置 AI API')
        return
      }

      setIsAnalyzing(true)
      setGenerating(true)
      setError(null)

      try {
        const result = await analyzeUserDescription(userDescription)
        setAnalysis(result)
      } catch (err) {
        console.error('Failed to analyze description:', err)
        setError(err instanceof Error ? err.message : '分析失败，请重试')
      } finally {
        setIsAnalyzing(false)
        setGenerating(false)
      }
    }

    startAnalysis()
  }, [userDescription, analysis, isAnalyzing, setAnalysis, setGenerating, setError])

  // 接受并生成标签内容
  const handleAcceptAndGenerate = async () => {
    if (!analysis) return

    setIsGeneratingContent(true)
    setGenerating(true)
    setError(null)

    try {
      const generatedContent = await aiGenerateTagContents(
        userDescription,
        analysis,
        language,
        outputStyle
      )
      setGeneratedTagContent(generatedContent)
      nextStep()
    } catch (err) {
      console.error('Failed to generate content:', err)
      setError(err instanceof Error ? err.message : '生成失败，请重试')
    } finally {
      setIsGeneratingContent(false)
      setGenerating(false)
    }
  }

  // 显示错误状态
  if (error && !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-red-400">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={prevStep}>
            ← 返回修改
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setError(null)
              setAnalysis(null)
            }}
          >
            重试
          </Button>
        </div>
      </div>
    )
  }

  if (isAnalyzing || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-slate-400">AI 正在分析您的描述...</p>
        <p className="text-sm text-slate-500">识别角色定位、任务目标、推荐模板</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-purple-400 text-lg">🤖</span>
          <span className="text-white font-medium">AI 分析结果</span>
        </div>

        <p className="text-slate-300 mb-4">
          基于您的描述，我建议采用以下设计方案：
        </p>

        <div className="space-y-3">
          {/* 角色定位 */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800 rounded-lg">
            <span className="text-slate-400 mr-2">📋 角色定位：</span>
            <span className="text-white font-medium">{analysis.roleIdentification}</span>
          </div>

          {/* 核心任务 */}
          <div className="p-3 bg-slate-800 rounded-lg">
            <span className="text-slate-400">🎯 核心任务：</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {analysis.taskGoals.map((goal, i) => (
                <Badge key={i} variant="outline" className="border-slate-600">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          {/* 推荐模板 */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800 rounded-lg">
            <span className="text-slate-400 mr-2">🛠️ 推荐模板：</span>
            {analysis.recommendedTemplates.map((template, i) => (
              <Badge key={i} className="bg-purple-600/30 text-purple-300 border-purple-500/30">
                {template}
              </Badge>
            ))}
          </div>

          {/* 建议 XML 标签 */}
          <div className="p-3 bg-slate-800 rounded-lg">
            <span className="text-slate-400">📌 建议包含的 XML 标签：</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {analysis.suggestedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-green-500/50 text-green-400"
                >
                  {`<${tag}>`}
                  <span className="ml-1 text-slate-500 text-xs">
                    {XML_TAG_INFO[tag].label}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          ← 返回修改
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setAnalysis(null)
              setError(null)
            }}
            disabled={isGeneratingContent}
          >
            重新分析
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleAcceptAndGenerate}
            disabled={isGeneratingContent}
          >
            {isGeneratingContent ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              "接受并生成 →"
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
