import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { type StoredPrompt, type PromptCategory } from "@/store/promptStore"
import { promptsDB } from "@/services/db"
import {
  Copy,
  Download,
  Check,
  Save,
  Star,
  Calendar,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react"

interface PromptDetailProps {
  prompt: StoredPrompt
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (id: string, updates: Partial<StoredPrompt>) => void
}

const CATEGORIES: { value: PromptCategory; label: string }[] = [
  { value: 'coding', label: '编程开发' },
  { value: 'writing', label: '创意写作' },
  { value: 'academic', label: '学术科研' },
  { value: 'education', label: '教育培训' },
  { value: 'business', label: '商业办公' },
  { value: 'translation', label: '翻译' },
  { value: 'analysis', label: '数据分析' },
  { value: 'other', label: '其他' },
]

export function PromptDetail({
  prompt,
  open,
  onOpenChange,
  onUpdate,
}: PromptDetailProps) {
  const [activeTab, setActiveTab] = useState<'cli' | 'web'>('cli')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // 编辑状态下的表单数据
  const [editForm, setEditForm] = useState({
    name: prompt.name,
    description: prompt.description,
    category: prompt.category,
    tags: prompt.tags.join(', '),
    cliVersion: prompt.cliVersion,
    webVersion: prompt.webVersion,
  })

  // 进入编辑模式时重置表单
  const handleStartEdit = () => {
    setEditForm({
      name: prompt.name,
      description: prompt.description,
      category: prompt.category,
      tags: prompt.tags.join(', '),
      cliVersion: prompt.cliVersion,
      webVersion: prompt.webVersion,
    })
    setIsEditing(true)
  }

  // 保存编辑
  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = {
        name: editForm.name,
        description: editForm.description,
        category: editForm.category as PromptCategory,
        tags: editForm.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        cliVersion: editForm.cliVersion,
        webVersion: editForm.webVersion,
        updatedAt: new Date(),
      }

      await promptsDB.update(Number(prompt.id), updates)
      onUpdate(prompt.id, updates)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save prompt:', error)
    } finally {
      setSaving(false)
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      name: prompt.name,
      description: prompt.description,
      category: prompt.category,
      tags: prompt.tags.join(', '),
      cliVersion: prompt.cliVersion,
      webVersion: prompt.webVersion,
    })
  }

  // 复制到剪贴板
  const handleCopy = async () => {
    const content = activeTab === 'cli'
      ? (isEditing ? editForm.cliVersion : prompt.cliVersion)
      : (isEditing ? editForm.webVersion : prompt.webVersion)
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 下载文件
  const handleDownload = () => {
    const content = activeTab === 'cli'
      ? (isEditing ? editForm.cliVersion : prompt.cliVersion)
      : (isEditing ? editForm.webVersion : prompt.webVersion)
    const filename = `${prompt.name.replace(/\s+/g, '-')}-${activeTab}.md`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <Star
                className={`w-5 h-5 ${
                  prompt.isFavorite
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-slate-500'
                }`}
              />
              {isEditing ? (
                <Input
                  className="text-lg font-semibold bg-slate-800 border-slate-700 text-white w-64"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              ) : (
                <DialogTitle>{prompt.name}</DialogTitle>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-1" />
                    取消
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    保存
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={handleStartEdit}>
                  编辑
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {isEditing ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">分类：</span>
                  <select
                    className="h-8 px-2 rounded-md bg-slate-800 border border-slate-700 text-slate-300"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        category: e.target.value as PromptCategory,
                      })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-slate-400">标签：</span>
                  <Input
                    className="h-8 bg-slate-800 border-slate-700 text-white flex-1"
                    placeholder="标签1, 标签2, ..."
                    value={editForm.tags}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tags: e.target.value })
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <Badge
                  variant="secondary"
                  className="bg-purple-600/20 text-purple-300"
                >
                  {CATEGORIES.find((c) => c.value === prompt.category)?.label ||
                    prompt.category}
                </Badge>
                {prompt.tags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="border-slate-600 text-slate-400"
                  >
                    #{tag}
                  </Badge>
                ))}
              </>
            )}
          </div>

          {/* Description */}
          {isEditing ? (
            <div>
              <label className="text-sm text-slate-400 mb-1 block">描述：</label>
              <Input
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="简短描述..."
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>
          ) : (
            <p className="text-slate-400">{prompt.description}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-xs text-slate-500 pb-2 border-b border-slate-700">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              创建：{formatDate(prompt.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              更新：{formatDate(prompt.updatedAt)}
            </span>
            <span>使用 {prompt.usageCount} 次</span>
          </div>

          {/* Content Tabs */}
          <div className="flex gap-2 border-b border-slate-700">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'cli'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('cli')}
            >
              CLI 专业版 (XML)
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'web'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('web')}
            >
              Web 简明版
            </button>
          </div>

          {/* Content Area */}
          <div className="relative">
            {isEditing ? (
              <textarea
                className="w-full h-80 p-4 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                value={activeTab === 'cli' ? editForm.cliVersion : editForm.webVersion}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    [activeTab === 'cli' ? 'cliVersion' : 'webVersion']:
                      e.target.value,
                  })
                }
              />
            ) : (
              <pre className="w-full h-80 p-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-sm overflow-auto whitespace-pre-wrap">
                {activeTab === 'cli' ? prompt.cliVersion : prompt.webVersion}
              </pre>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-green-500" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    复制到剪贴板
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />
                下载 .md
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400"
              onClick={() => onOpenChange(false)}
            >
              关闭
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
