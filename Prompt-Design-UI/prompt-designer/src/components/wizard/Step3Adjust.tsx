import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useGenerateStore } from "@/store/generateStore"
import { type XmlTag, XML_TAG_INFO } from "@/types/generate"
import { XML_TAG_TEMPLATES, OUTPUT_STYLES, LANGUAGES } from "@/constants/promptRules"
import { Check, ChevronDown, ChevronUp, Plus, RotateCcw, Sparkles, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { polishTagContent as aiPolishTagContent, canUseAI } from "@/services/ai"

export function Step3Adjust() {
  const {
    session,
    toggleTag,
    setLanguage,
    setOutputStyle,
    setIncludeExample,
    setCustomTagContent,
    updateGeneratedTag,
    nextStep,
    prevStep,
  } = useGenerateStore()

  const { adjustments, analysis, userDescription } = session
  const { enabledTags, language, outputStyle, generatedTagContent, customTagContent } = adjustments

  // 跟踪哪些标签被展开
  const [expandedTags, setExpandedTags] = useState<Set<XmlTag>>(new Set())
  // 跟踪正在重新生成的标签
  const [regeneratingTags, setRegeneratingTags] = useState<Set<XmlTag>>(new Set())
  // 错误信息
  const [error, setError] = useState<string | null>(null)

  const allTags: XmlTag[] = [
    'role',
    'task',
    'thinking',
    'instructions',
    'output_format',
    'constraints',
    'example',
    'tools',
    'context',
  ]

  // 切换标签展开/收起状态
  const toggleExpand = (tag: XmlTag) => {
    setExpandedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) {
        next.delete(tag)
      } else {
        next.add(tag)
      }
      return next
    })
  }

  // 获取标签的当前内容
  const getTagContent = (tag: XmlTag): string => {
    // 优先使用用户自定义内容
    if (customTagContent[tag] !== undefined) {
      return customTagContent[tag]
    }
    // 其次使用 AI 生成的内容
    if (generatedTagContent[tag] !== undefined) {
      return generatedTagContent[tag]
    }
    // 最后使用默认模板
    return XML_TAG_TEMPLATES[tag].defaultContent
  }

  // 检查标签内容是否被用户修改过
  const isTagModified = (tag: XmlTag): boolean => {
    const generated = generatedTagContent[tag]
    const custom = customTagContent[tag]

    // 如果没有生成内容，则无法判断是否修改
    if (generated === undefined) return false
    // 如果自定义内容不存在，则未修改
    if (custom === undefined) return false
    // 比较内容是否不同
    return generated !== custom
  }

  // 重置标签内容为 AI 生成的原始内容
  const handleReset = (tag: XmlTag) => {
    const generated = generatedTagContent[tag]
    if (generated !== undefined) {
      setCustomTagContent(tag, generated)
    }
  }

  // 处理内容编辑
  const handleContentChange = (tag: XmlTag, content: string) => {
    setCustomTagContent(tag, content)
  }

  // 重新生成（AI 润色）
  const handleRegenerate = async (tag: XmlTag) => {
    if (!analysis) return

    // 检查 AI 是否可用
    const aiStatus = await canUseAI()
    if (!aiStatus.available) {
      setError(aiStatus.message || '请先在设置页面配置 AI API')
      return
    }

    setRegeneratingTags((prev) => new Set(prev).add(tag))
    setError(null)

    try {
      const currentContent = getTagContent(tag)
      const polished = await aiPolishTagContent(
        tag,
        currentContent,
        userDescription,
        analysis,
        language,
        outputStyle
      )

      // 更新生成内容和自定义内容
      updateGeneratedTag(tag, polished)
    } catch (err) {
      console.error('Failed to regenerate tag content:', err)
      setError(err instanceof Error ? err.message : '润色失败，请重试')
    } finally {
      setRegeneratingTags((prev) => {
        const next = new Set(prev)
        next.delete(tag)
        return next
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">模板定制</h3>
        <p className="text-sm text-slate-400">
          AI 已生成各标签内容，您可以展开编辑并点击"重新生成"让 AI 润色优化
        </p>
      </div>

      {/* XML Tags Selection */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-300">选择并编辑 XML 标签：</p>
        <div className="space-y-2">
          {allTags.map((tag) => {
            const isEnabled = enabledTags.includes(tag)
            const isExpanded = expandedTags.has(tag)
            const info = XML_TAG_INFO[tag]
            const template = XML_TAG_TEMPLATES[tag]
            const isModified = isTagModified(tag)
            const isRegenerating = regeneratingTags.has(tag)
            const hasGeneratedContent = generatedTagContent[tag] !== undefined

            return (
              <div
                key={tag}
                className={cn(
                  "rounded-lg border transition-colors",
                  isEnabled
                    ? "bg-purple-600/10 border-purple-500/50"
                    : "bg-slate-800/50 border-slate-700"
                )}
              >
                {/* 标签头部 */}
                <div className="flex items-center justify-between p-3">
                  <button
                    className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => toggleTag(tag)}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center border flex-shrink-0",
                        isEnabled
                          ? "bg-purple-600 border-purple-600"
                          : "border-slate-600"
                      )}
                    >
                      {isEnabled && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <span className="text-white">
                        {info.label}{" "}
                        <span className="text-slate-500">({`<${tag}>`})</span>
                        {hasGeneratedContent && (
                          <span className="ml-2 text-xs text-green-400">AI已生成</span>
                        )}
                        {isModified && (
                          <span className="ml-2 text-xs text-amber-400">已修改</span>
                        )}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {info.description}
                      </p>
                    </div>
                  </button>

                  {/* 展开/收起按钮 */}
                  {isEnabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(tag)
                      }}
                    >
                      {isExpanded ? "收起" : "展开编辑"}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </Button>
                  )}
                </div>

                {/* 展开的编辑区域 */}
                {isEnabled && isExpanded && (
                  <div className="px-3 pb-3 space-y-3">
                    <div className="border-t border-slate-700/50 pt-3">
                      {/* 编辑提示和操作按钮 */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">
                          {template.placeholder}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* 重置按钮：仅在内容被修改时显示 */}
                          {isModified && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-slate-400 hover:text-slate-300 h-6 px-2"
                              onClick={() => handleReset(tag)}
                              disabled={isRegenerating}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              重置
                            </Button>
                          )}
                          {/* 重新生成按钮：内容被修改时显示 */}
                          {isModified && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-purple-400 hover:text-purple-300 h-6 px-2"
                              onClick={() => handleRegenerate(tag)}
                              disabled={isRegenerating}
                            >
                              {isRegenerating ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  润色中...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  重新生成
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* 内容编辑器 */}
                      <textarea
                        className={cn(
                          "w-full h-32 p-3 rounded-md bg-slate-900 border text-white font-mono text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y",
                          isModified ? "border-amber-500/50" : "border-slate-700"
                        )}
                        placeholder={template.placeholder}
                        value={getTagContent(tag)}
                        onChange={(e) => handleContentChange(tag, e.target.value)}
                        disabled={isRegenerating}
                      />

                      {/* 标签特殊说明 */}
                      {tag === 'thinking' && (
                        <p className="text-xs text-amber-400/80 mt-2">
                          ⚠️ 思考框架为内部推理过程，不会直接输出给用户
                        </p>
                      )}
                      {tag === 'output_format' && (
                        <p className="text-xs text-slate-500 mt-2">
                          💡 输出格式应只包含通用规范，多场景的格式选择放在操作指令中
                        </p>
                      )}
                      {tag === 'example' && (
                        <p className="text-xs text-slate-500 mt-2">
                          💡 示例用于 Few-Shot 学习，使用 &lt;user&gt; 和 &lt;assistant&gt; 标签
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Add Example */}
        {!enabledTags.includes('example') && (
          <button
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-colors"
            onClick={() => {
              setIncludeExample(true)
              toggleTag('example')
            }}
          >
            <Plus className="w-4 h-4" />
            添加示例 (Few-Shot)
          </button>
        )}
      </div>

      {/* Language & Style */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">语言</label>
          <select
            className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'zh' | 'en')}
          >
            {Object.entries(LANGUAGES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">输出风格</label>
          <select
            className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white"
            value={outputStyle}
            onChange={(e) =>
              setOutputStyle(e.target.value as 'professional' | 'friendly' | 'academic')
            }
          >
            {Object.entries(OUTPUT_STYLES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enabled Tags Summary */}
      <div className="p-3 bg-slate-800/30 rounded-lg">
        <p className="text-xs text-slate-400 mb-2">将生成的 XML 标签：</p>
        <div className="flex flex-wrap gap-1.5">
          {enabledTags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "px-2 py-0.5 rounded text-xs",
                isTagModified(tag)
                  ? "bg-amber-600/30 text-amber-300"
                  : generatedTagContent[tag]
                  ? "bg-green-600/30 text-green-300"
                  : "bg-slate-700/50 text-slate-300"
              )}
            >
              {`<${tag}>`}
              {isTagModified(tag) && " ✎"}
              {!isTagModified(tag) && generatedTagContent[tag] && " ✓"}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          ✓ AI生成 | ✎ 已修改（将使用您的自定义内容）
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            className="ml-auto text-red-300 hover:text-red-200 text-sm"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          ← 返回
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={nextStep}>
          生成提示词 →
        </Button>
      </div>
    </div>
  )
}
