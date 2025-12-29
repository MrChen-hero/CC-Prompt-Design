import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGenerateStore } from "@/store/generateStore"
import { type XmlTag, XML_TAG_INFO } from "@/types/generate"
import { Loader2 } from "lucide-react"

// 模拟 AI 分析（后续替换为真实 API 调用）
function analyzeDescription(description: string): Promise<{
  roleIdentification: string
  taskGoals: string[]
  recommendedTemplates: string[]
  suggestedTags: XmlTag[]
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 简单的关键词分析
      const lowerDesc = description.toLowerCase()

      let role = "通用助手"
      const goals: string[] = []
      const templates: string[] = []
      let tags: XmlTag[] = ['role', 'task', 'instructions', 'output_format', 'constraints']

      // 检测角色类型
      if (lowerDesc.includes("科研") || lowerDesc.includes("论文") || lowerDesc.includes("学术")) {
        role = "科研专家助手"
        goals.push("论文分析与解读", "研究方法指导", "学术写作辅助")
        templates.push("模板 E (深度推理型)")
        tags = ['role', 'task', 'thinking', 'instructions', 'output_format', 'constraints']
      }

      if (lowerDesc.includes("代码") || lowerDesc.includes("编程") || lowerDesc.includes("开发")) {
        role = role === "通用助手" ? "代码专家" : role + " + 代码专家"
        goals.push("代码审查与优化", "技术方案设计", "问题诊断与调试")
        templates.push("模板 C (代码/技术任务型)")
        if (!tags.includes('thinking')) tags.push('thinking')
      }

      if (lowerDesc.includes("写作") || lowerDesc.includes("创意") || lowerDesc.includes("故事")) {
        role = "创意写作助手"
        goals.push("故事情节构思", "角色发展设计", "文风优化润色")
        templates.push("模板 B (多轮交互型)")
      }

      if (lowerDesc.includes("翻译") || lowerDesc.includes("语言")) {
        role = "翻译专家"
        goals.push("精准翻译", "语境适配", "术语统一")
        templates.push("模板 A (单一任务型)")
      }

      // 默认目标
      if (goals.length === 0) {
        goals.push("理解用户需求", "提供专业建议", "输出结构化内容")
        templates.push("模板 A (单一任务型)")
      }

      resolve({
        roleIdentification: role,
        taskGoals: goals,
        recommendedTemplates: templates,
        suggestedTags: tags,
      })
    }, 1500) // 模拟延迟
  })
}

export function Step2Analysis() {
  const { session, setAnalysis, nextStep, prevStep, setGenerating } = useGenerateStore()
  const { userDescription, analysis } = session
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // 自动开始分析
  useEffect(() => {
    if (!analysis && !isAnalyzing) {
      setIsAnalyzing(true)
      setGenerating(true)

      analyzeDescription(userDescription)
        .then((result) => {
          setAnalysis(result)
        })
        .finally(() => {
          setIsAnalyzing(false)
          setGenerating(false)
        })
    }
  }, [userDescription, analysis, isAnalyzing, setAnalysis, setGenerating])

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
            }}
          >
            重新分析
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={nextStep}>
            接受并继续 →
          </Button>
        </div>
      </div>
    </div>
  )
}
