import { Button } from "@/components/ui/button"
import { useGenerateStore } from "@/store/generateStore"

export function Step1Input() {
  const { session, setDescription, nextStep } = useGenerateStore()
  const { userDescription } = session

  const examplePrompts = [
    "我需要一个能够分析学术论文、提供代码优化建议、并帮助撰写研究报告的科研助手",
    "创建一个专业的前端代码审查助手，能够检查 React/Vue 代码质量并提供改进建议",
    "设计一个创意写作助手，帮助用户构思故事情节、角色发展和对话创作",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">
          请描述你想要创建的 AI 角色
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          详细描述 AI 的身份、专业领域、核心能力和主要任务
        </p>
      </div>

      <textarea
        className="w-full h-48 p-4 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        placeholder="例如：我需要一个能够分析学术论文、提供代码优化建议、并帮助撰写研究报告的科研助手..."
        value={userDescription}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-500">
          {userDescription.length} / 2000
        </span>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={nextStep}
          disabled={!userDescription.trim() || userDescription.length < 10}
        >
          下一步 →
        </Button>
      </div>

      {/* Example prompts */}
      <div className="pt-4 border-t border-slate-700">
        <p className="text-sm text-slate-400 mb-3">💡 示例描述（点击使用）：</p>
        <div className="space-y-2">
          {examplePrompts.map((prompt, i) => (
            <button
              key={i}
              className="w-full text-left p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700/50 hover:border-purple-500/50 transition-colors"
              onClick={() => setDescription(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
