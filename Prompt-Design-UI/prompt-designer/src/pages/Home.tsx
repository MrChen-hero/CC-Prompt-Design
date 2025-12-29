import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePromptStore } from "@/store/promptStore"
import { promptsDB } from "@/services/db"
import {
  Sparkles,
  FileText,
  Search,
  RefreshCw,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Home() {
  const navigate = useNavigate()
  const { prompts, setPrompts } = usePromptStore()
  const [loading, setLoading] = useState(true)

  // 加载提示词数据
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const dbPrompts = await promptsDB.getAll()
        const storedPrompts = dbPrompts.map((p) => ({
          id: String(p.id),
          name: p.name,
          description: p.description,
          category: p.category as 'coding' | 'writing' | 'academic' | 'education' | 'business' | 'translation' | 'analysis' | 'other',
          tags: p.tags,
          cliVersion: p.cliVersion,
          webVersion: p.webVersion,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          usageCount: p.usageCount,
          isFavorite: p.isFavorite,
        }))
        setPrompts(storedPrompts)
      } catch (error) {
        console.error('Failed to load prompts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPrompts()
  }, [setPrompts])

  // 格式化时间显示
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    return new Date(date).toLocaleDateString('zh-CN')
  }

  // 获取最近的提示词（最多显示3个）
  const recentPrompts = prompts
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  const quickActions = [
    { icon: Sparkles, label: "从零设计", path: "/create" },
    { icon: FileText, label: "使用模板", path: "/create?template=true" },
    { icon: Search, label: "分析提示词", path: "/convert" },
    { icon: RefreshCw, label: "格式转换", path: "/convert" },
  ]

  // 计算统计数据
  const totalPrompts = prompts.length
  const totalUsage = prompts.reduce((sum, p) => sum + p.usageCount, 0)
  const favoriteCount = prompts.filter((p) => p.isFavorite).length

  const stats = [
    { label: "提示词总数", value: totalPrompts.toString() },
    { label: "总使用次数", value: totalUsage.toString() },
    { label: "收藏数量", value: favoriteCount.toString() },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            欢迎使用 Prompt Designer
          </h2>
          <p className="text-slate-400 mb-4">
            设计专业、高质量的 AI 提示词
          </p>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate("/create")}
          >
            开始创建
          </Button>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Prompts */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">最近的提示词</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              </div>
            ) : recentPrompts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                还没有创建任何提示词
              </p>
            ) : (
              recentPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                  onClick={() => navigate("/library")}
                >
                  <div>
                    <p className="text-sm text-white">{prompt.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatTimeAgo(prompt.updatedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <Button
              variant="ghost"
              className="w-full text-purple-400 hover:text-purple-300"
              onClick={() => navigate("/library")}
            >
              查看全部
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                className="flex flex-col items-center justify-center h-20 border-slate-600 hover:bg-slate-700 hover:border-purple-500"
                onClick={() => navigate(action.path)}
              >
                <action.icon className="w-5 h-5 mb-1 text-purple-400" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-lg">统计数据</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{stat.label}:</span>
                <Badge variant="secondary" className="bg-slate-700">
                  {stat.value}
                </Badge>
              </div>
            ))}
            {/* Mini Chart */}
            <div className="h-16 bg-slate-700/50 rounded-lg flex items-end justify-around p-2">
              {prompts.length > 0 ? (
                // 显示最近7个提示词的使用次数
                prompts
                  .slice(0, 7)
                  .map((p, i) => {
                    const maxUsage = Math.max(...prompts.map((pr) => pr.usageCount), 1)
                    const height = Math.max((p.usageCount / maxUsage) * 100, 10)
                    return (
                      <div
                        key={i}
                        className="w-4 bg-purple-500/60 rounded-sm"
                        style={{ height: `${height}%` }}
                        title={`${p.name}: ${p.usageCount}次`}
                      />
                    )
                  })
              ) : (
                // 占位图表
                [40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                  <div
                    key={i}
                    className="w-4 bg-slate-600/40 rounded-sm"
                    style={{ height: `${h}%` }}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
