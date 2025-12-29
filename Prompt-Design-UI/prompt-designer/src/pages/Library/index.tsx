import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { usePromptStore, useFilteredPrompts, type PromptCategory, type StoredPrompt } from "@/store/promptStore"
import { promptsDB } from "@/services/db"
import { PromptDetail } from "@/components/prompt/PromptDetail"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Plus,
  Upload,
  Download,
  Star,
  Edit,
  Copy,
  Trash2,
  Calendar,
  RefreshCw,
  Check,
  Loader2,
  Eye,
} from "lucide-react"

const CATEGORIES: { value: PromptCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'coding', label: '编程开发' },
  { value: 'writing', label: '创意写作' },
  { value: 'academic', label: '学术科研' },
  { value: 'education', label: '教育培训' },
  { value: 'business', label: '商业办公' },
  { value: 'translation', label: '翻译' },
  { value: 'analysis', label: '数据分析' },
  { value: 'other', label: '其他' },
]

const SORT_OPTIONS = [
  { value: 'recent' as const, label: '最近更新' },
  { value: 'usage' as const, label: '使用次数' },
  { value: 'name' as const, label: '名称' },
]

export function Library() {
  const navigate = useNavigate()
  const {
    setPrompts,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    sortBy,
    setSortBy,
    toggleFavorite,
    deletePrompt,
  } = usePromptStore()

  const filteredPrompts = useFilteredPrompts()
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 详情弹窗状态
  const [selectedPrompt, setSelectedPrompt] = useState<StoredPrompt | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // 加载数据库中的提示词
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const dbPrompts = await promptsDB.getAll()
        // 转换 DBPrompt 到 StoredPrompt (id 类型转换)
        const prompts = dbPrompts.map((p) => ({
          id: String(p.id),
          name: p.name,
          description: p.description,
          category: p.category as PromptCategory,
          tags: p.tags,
          cliVersion: p.cliVersion,
          webVersion: p.webVersion,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          usageCount: p.usageCount,
          isFavorite: p.isFavorite,
        }))
        setPrompts(prompts)
      } catch (error) {
        console.error('Failed to load prompts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPrompts()
  }, [setPrompts])

  const handleCopy = async (id: string, cliVersion: string) => {
    await navigator.clipboard.writeText(cliVersion)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个提示词吗？')) return

    setDeletingId(id)
    try {
      await promptsDB.delete(Number(id))
      deletePrompt(id)
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleFavorite = async (id: string, currentFavorite: boolean) => {
    try {
      await promptsDB.update(Number(id), { isFavorite: !currentFavorite })
      toggleFavorite(id)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  // 打开详情弹窗
  const handleOpenDetail = (prompt: StoredPrompt) => {
    setSelectedPrompt(prompt)
    setDetailOpen(true)
  }

  // 更新提示词（从详情弹窗触发）
  const handleUpdatePrompt = (id: string, updates: Partial<StoredPrompt>) => {
    // 更新 store 中的数据
    const { updatePrompt } = usePromptStore.getState()
    updatePrompt(id, updates)

    // 同步更新 selectedPrompt 以保持弹窗数据最新
    if (selectedPrompt && selectedPrompt.id === id) {
      setSelectedPrompt({ ...selectedPrompt, ...updates })
    }
  }

  const handleExportAll = () => {
    const dataStr = JSON.stringify(filteredPrompts, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompts-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          📚 我的提示词仓库
        </h1>
        <div className="flex gap-2">
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate('/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            新建
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            导入
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="搜索提示词名称、描述、标签..."
            className="pl-10 bg-slate-800 border-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-9 px-3 rounded-md bg-slate-800 border border-slate-700 text-sm text-slate-300"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as PromptCategory | 'all')}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              分类：{cat.label}
            </option>
          ))}
        </select>
        <select
          className="h-9 px-3 rounded-md bg-slate-800 border border-slate-700 text-sm text-slate-300"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'usage' | 'name')}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              排序：{opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Prompts List */}
      {filteredPrompts.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-16 text-center">
            <p className="text-slate-400 mb-4">
              {searchQuery || filterCategory !== 'all'
                ? '没有找到匹配的提示词'
                : '还没有保存任何提示词'}
            </p>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              创建第一个提示词
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer"
              onClick={() => handleOpenDetail(prompt)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(prompt.id, prompt.isFavorite)
                        }}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            prompt.isFavorite
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-slate-500 hover:text-yellow-500'
                          }`}
                        />
                      </button>
                      <h3 className="font-semibold text-white">{prompt.name}</h3>
                      <Badge
                        variant="secondary"
                        className="bg-purple-600/20 text-purple-300"
                      >
                        {CATEGORIES.find((c) => c.value === prompt.category)?.label || prompt.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">
                      {prompt.description}
                    </p>
                    {prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {prompt.tags.map((tag, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs border-slate-600 text-slate-400"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(prompt.updatedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        使用 {prompt.usageCount} 次
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                      onClick={() => handleOpenDetail(prompt)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      查看
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                      onClick={() => handleCopy(prompt.id, prompt.cliVersion)}
                    >
                      {copiedId === prompt.id ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-green-500" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          CLI版
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                      onClick={() => handleCopy(prompt.id + '-web', prompt.webVersion)}
                    >
                      {copiedId === prompt.id + '-web' ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-green-500" />
                          已复制
                        </>
                      ) : (
                        'Web版'
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white"
                      onClick={() => handleOpenDetail(prompt)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(prompt.id)}
                      disabled={deletingId === prompt.id}
                    >
                      {deletingId === prompt.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>共 {filteredPrompts.length} 个提示词</span>
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" onClick={handleExportAll}>
            <Download className="w-4 h-4 mr-1" />
            导出全部
          </Button>
        </div>
      </div>

      {/* Prompt Detail Dialog */}
      {selectedPrompt && (
        <PromptDetail
          prompt={selectedPrompt}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdate={handleUpdatePrompt}
        />
      )}
    </div>
  )
}
