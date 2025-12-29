import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGenerateStore } from "@/store/generateStore"
import { type XmlTag, XML_TAG_INFO } from "@/types/generate"
import { XML_TAG_TEMPLATES, OUTPUT_STYLES, LANGUAGES } from "@/constants/promptRules"
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

// 模拟 AI 生成标签内容（后续替换为真实 API 调用）
function generateTagContents(
  description: string,
  analysis: {
    roleIdentification: string
    taskGoals: string[]
    recommendedTemplates: string[]
    suggestedTags: XmlTag[]
  },
  language: 'zh' | 'en',
  outputStyle: 'professional' | 'friendly' | 'academic'
): Promise<Partial<Record<XmlTag, string>>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const style = OUTPUT_STYLES[outputStyle]
      const lang = LANGUAGES[language]
      const result: Partial<Record<XmlTag, string>> = {}

      // 基于分析结果生成各标签内容
      for (const tag of analysis.suggestedTags) {
        switch (tag) {
          case 'role':
            result.role = `你是一位${analysis.roleIdentification}，具备深厚的专业背景和丰富的实战经验。
你以${style.tone}的风格进行沟通，${style.manner}。

核心能力：
${analysis.taskGoals.map((g) => `- ${g}`).join('\n')}`
            break

          case 'task':
            result.task = `你的任务是帮助用户完成以下目标：
${analysis.taskGoals.map((g) => `- ${g}`).join('\n')}

用户需求描述：
${description}

请根据用户的具体问题，运用你的专业能力提供高质量的解答和建议。`
            break

          case 'thinking':
            result.thinking = `此思考过程为内部推理，不直接输出给用户。

在回答之前，请按以下框架思考：
1. **需求理解**：准确理解用户的核心诉求和背景
2. **信息分析**：识别关键信息点和潜在约束条件
3. **方案设计**：基于专业知识设计最优解决方案
4. **验证检查**：确保方案的可行性、正确性和完整性
5. **输出组织**：以清晰的结构呈现结果`
            break

          case 'instructions':
            result.instructions = `1. 仔细阅读并理解用户的输入内容
2. 运用专业知识进行分析和处理
3. 以结构化的方式组织输出内容
4. 如有不确定之处，明确说明并提供多种可能的解决方案
5. 根据问题类型选择合适的输出格式：
   - 分析类问题：使用"分析过程" + "结论"结构
   - 操作类问题：使用分步骤说明
   - 创意类问题：提供多个备选方案
6. 在回答结束时，询问用户是否需要进一步的帮助或解释`
            break

          case 'output_format':
            result.output_format = `- 使用 Markdown 格式进行排版
- 重要信息使用**加粗**标注
- 代码使用 \`代码块\` 包裹
- 对比信息使用表格呈现
- 步骤说明使用有序列表
- 长文本适当分段，每段不超过 3-4 句话`
            break

          case 'constraints':
            result.constraints = `- ${lang.constraint}
- 保持${style.tone}的沟通风格
- 回答必须基于事实，如不确定请明确说明"我不确定"
- 避免冗余内容，保持简洁有效
- 遵循职业道德，不提供有害、违法或不道德的建议
- 尊重用户隐私，不主动询问敏感个人信息`
            break

          case 'example':
            result.example = XML_TAG_TEMPLATES.example.defaultContent
            break

          case 'tools':
            result.tools = XML_TAG_TEMPLATES.tools.defaultContent
            break

          case 'context':
            result.context = XML_TAG_TEMPLATES.context.defaultContent
            break
        }
      }

      resolve(result)
    }, 1200) // 模拟延迟
  })
}

export function Step2Analysis() {
  const {
    session,
    setAnalysis,
    setGeneratedTagContent,
    nextStep,
    prevStep,
    setGenerating,
  } = useGenerateStore()
  const { userDescription, analysis, adjustments } = session
  const { language, outputStyle } = adjustments
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)

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

  // 接受并生成标签内容
  const handleAcceptAndGenerate = async () => {
    if (!analysis) return

    setIsGeneratingContent(true)
    setGenerating(true)

    try {
      const generatedContent = await generateTagContents(
        userDescription,
        analysis,
        language,
        outputStyle
      )
      setGeneratedTagContent(generatedContent)
      nextStep()
    } catch (error) {
      console.error('Failed to generate content:', error)
    } finally {
      setIsGeneratingContent(false)
      setGenerating(false)
    }
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
    </div>
  )
}
