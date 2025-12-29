import { Button } from "@/components/ui/button"
import { useGenerateStore } from "@/store/generateStore"
import { type XmlTag, XML_TAG_INFO } from "@/types/generate"
import { Check, ChevronDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function Step3Adjust() {
  const {
    session,
    toggleTag,
    setLanguage,
    setOutputStyle,
    setIncludeExample,
    nextStep,
    prevStep,
  } = useGenerateStore()

  const { adjustments } = session
  const { enabledTags, language, outputStyle, includeExample } = adjustments

  const allTags: XmlTag[] = [
    'role',
    'task',
    'thinking',
    'instructions',
    'output_format',
    'constraints',
    'example',
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">方案调整（可选）</h3>
        <p className="text-sm text-slate-400">
          您可以调整生成提示词包含的组件和输出风格
        </p>
      </div>

      {/* XML Tags Selection */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-300">选择包含的 XML 标签：</p>
        <div className="space-y-2">
          {allTags.map((tag) => {
            const isEnabled = enabledTags.includes(tag)
            const info = XML_TAG_INFO[tag]

            return (
              <button
                key={tag}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left",
                  isEnabled
                    ? "bg-purple-600/10 border-purple-500/50"
                    : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                )}
                onClick={() => toggleTag(tag)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded flex items-center justify-center border",
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
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {info.description}
                    </p>
                  </div>
                </div>
                {tag === 'thinking' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-400 hover:text-purple-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: 展开编辑
                    }}
                  >
                    展开编辑
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </button>
            )
          })}
        </div>

        {/* Add Example */}
        {!includeExample && (
          <button
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-colors"
            onClick={() => setIncludeExample(true)}
          >
            <Plus className="w-4 h-4" />
            添加示例
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
            <option value="zh">中文</option>
            <option value="en">English</option>
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
            <option value="professional">专业严谨</option>
            <option value="friendly">友好亲切</option>
            <option value="academic">学术规范</option>
          </select>
        </div>
      </div>

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
