import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings as SettingsIcon, Eye, EyeOff, RefreshCw, Check } from "lucide-react"
import { useState } from "react"

export function Settings() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [provider, setProvider] = useState("anthropic")
  const [model, setModel] = useState("claude-3-5-sonnet")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")

  const handleTestConnection = () => {
    setConnectionStatus("testing")
    // 模拟测试连接
    setTimeout(() => {
      setConnectionStatus(apiKey ? "success" : "error")
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            模型配置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">选择模型提供商</label>
            <select
              className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="google">Google</option>
              <option value="deepseek">DeepSeek</option>
              <option value="custom">自定义</option>
            </select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-ant-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-slate-900 border-slate-700 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">模型选择</label>
            <select
              className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
            </select>
          </div>

          <Separator className="bg-slate-700" />

          {/* Advanced Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-300">高级选项</h4>

            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Temperature</span>
                <span className="text-white">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0.0</span>
                <span>1.0</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Max Tokens</label>
              <Input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="bg-slate-900 border-slate-700"
              />
            </div>

            {/* Base URL */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Base URL</label>
              <Input
                placeholder="https://api.anthropic.com/v1 (可选)"
                className="bg-slate-900 border-slate-700"
              />
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
              保存配置
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleTestConnection}
              disabled={connectionStatus === "testing"}
            >
              {connectionStatus === "testing" ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : connectionStatus === "success" ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  连接成功
                </>
              ) : (
                "测试连接"
              )}
            </Button>
          </div>

          {/* Connection Status */}
          {connectionStatus === "success" && (
            <Badge className="w-full justify-center py-2 bg-green-600/20 text-green-400 border-green-600/30">
              ✓ API 连接正常
            </Badge>
          )}
          {connectionStatus === "error" && (
            <Badge className="w-full justify-center py-2 bg-red-600/20 text-red-400 border-red-600/30">
              ✗ 连接失败，请检查 API Key
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
