import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useGenerateStore } from "@/store/generateStore"
import { usePromptStore } from "@/store/promptStore"
import { promptsDB } from "@/services/db"
import { generateCliPrompt, generateWebPrompt } from "@/services/promptGenerator"
import { Loader2, Copy, Download, Check, RefreshCw, Save } from "lucide-react"
export function Step4Result() {
  const { session, setResult, prevStep, resetSession, setGenerating } = useGenerateStore()
  const { addPrompt } = usePromptStore()
  const { userDescription, analysis, adjustments, result, isGenerating } = session

  const [activeTab, setActiveTab] = useState<'cli' | 'web'>('cli')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // 生成提示词
  useEffect(() => {
    if (!result && analysis && !isGenerating) {
      setGenerating(true)

      // 生成两种格式
      const cliVersion = generateCliPrompt(userDescription, analysis, adjustments)
      const webVersion = generateWebPrompt(cliVersion)

      // 模拟生成延迟
      setTimeout(() => {
        setResult({ cliVersion, webVersion })
        setGenerating(false)
      }, 1000)
    }
  }, [result, analysis, adjustments, userDescription, isGenerating, setResult, setGenerating])

  const handleCopy = async () => {
    if (!result) return
    const text = activeTab === 'cli' ? result.cliVersion : result.webVersion
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!result) return
    const text = activeTab === 'cli' ? result.cliVersion : result.webVersion
    const filename = activeTab === 'cli' ? 'prompt-cli.md' : 'prompt-web.md'
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = async () => {
    if (!result || !analysis) return

    setSaving(true)
    try {
      const promptData = {
        name: analysis.roleIdentification,
        description: userDescription.slice(0, 100) + (userDescription.length > 100 ? '...' : ''),
        category: 'other' as const,
        tags: analysis.taskGoals.slice(0, 3),
        cliVersion: result.cliVersion,
        webVersion: result.webVersion,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        isFavorite: false,
      }

      // 保存到 IndexedDB
      await promptsDB.create(promptData)

      // 更新 Zustand store
      addPrompt({
        id: crypto.randomUUID(),
        ...promptData,
      })

      setSaved(true)
    } catch (error) {
      console.error('Failed to save prompt:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleNewPrompt = () => {
    resetSession()
  }

  if (isGenerating || !result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-slate-400">正在生成提示词...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'cli'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('cli')}
        >
          CLI 专业版 (Anthropic XML)
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'web'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('web')}
        >
          Web 简明版 (Gemini/GPTs)
        </button>
      </div>

      {/* Result Display */}
      <div className="relative">
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1 text-green-500" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                复制
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-1" />
            下载
          </Button>
        </div>

        <pre className="p-4 pt-12 rounded-lg bg-slate-900 border border-slate-700 overflow-auto max-h-96 text-sm font-mono">
          <code className="text-slate-300 whitespace-pre-wrap">
            {activeTab === 'cli' ? result.cliVersion : result.webVersion}
          </code>
        </pre>
      </div>

      {/* Quick Convert */}
      {activeTab === 'cli' && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setActiveTab('web')}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          一键转换为 Web 版
        </Button>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-slate-700">
        <Button variant="outline" onClick={prevStep}>
          ← 返回调整
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-500" />
                已保存
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                保存到仓库
              </>
            )}
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleNewPrompt}
          >
            新建提示词
          </Button>
        </div>
      </div>
    </div>
  )
}
