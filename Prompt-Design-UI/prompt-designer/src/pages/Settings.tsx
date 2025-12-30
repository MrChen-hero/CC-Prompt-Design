import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useModelStore, type ModelConfig } from "@/store/modelStore"
import { modelsDB } from "@/services/db"
import { encryptApiKey, decryptApiKey, validateApiKey, maskApiKey } from "@/services/crypto"
import {
  createAIProvider,
  ANTHROPIC_MODELS,
  OPENAI_MODELS,
  GOOGLE_MODELS,
  MODEL_PROVIDERS,
  type ModelProvider,
} from "@/services/ai"
import {
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react"

type ConnectionStatus = "idle" | "testing" | "success" | "error"

export function Settings() {
  const { activeModel, setActiveModel, addModel, updateModel, removeModel } = useModelStore()

  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [provider, setProvider] = useState<ModelProvider>("anthropic")
  const [model, setModel] = useState("claude-sonnet-4-20250514")
  const [customModel, setCustomModel] = useState("")  // 自定义模型名称
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [baseUrl, setBaseUrl] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // 加载已保存的配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedModels = await modelsDB.getAll()
        if (savedModels.length > 0) {
          const defaultModel = savedModels.find((m) => m.isDefault) || savedModels[0]
          setProvider(defaultModel.provider as ModelProvider)
          setModel(defaultModel.modelId)
          setTemperature(defaultModel.temperature)
          setMaxTokens(defaultModel.maxTokens)
          setBaseUrl(defaultModel.baseUrl || "")

          // 对于自定义提供商，设置自定义模型
          if (defaultModel.provider === "custom") {
            setCustomModel(defaultModel.modelId)
          }

          // 解密 API Key
          if (defaultModel.apiKeyEncrypted) {
            try {
              const decrypted = await decryptApiKey(defaultModel.apiKeyEncrypted)
              setApiKey(decrypted)
            } catch {
              console.error("Failed to decrypt API key")
            }
          }

          // 同步到 store
          if (!activeModel) {
            const config: ModelConfig = {
              id: String(defaultModel.id),
              provider: defaultModel.provider as ModelProvider,
              apiKey: "", // 不在 store 中存储明文
              modelId: defaultModel.modelId,
              baseUrl: defaultModel.baseUrl,
              temperature: defaultModel.temperature,
              maxTokens: defaultModel.maxTokens,
              isDefault: defaultModel.isDefault,
            }
            setActiveModel(config)
          }
        }
      } catch (error) {
        console.error("Failed to load model config:", error)
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [activeModel, setActiveModel])

  // 根据提供商更新可用模型
  const getAvailableModels = () => {
    switch (provider) {
      case "anthropic":
        return ANTHROPIC_MODELS
      case "openai":
        return OPENAI_MODELS
      case "google":
        return GOOGLE_MODELS
      default:
        return []
    }
  }

  // 获取当前要使用的模型 ID
  const getModelId = () => {
    if (provider === "custom") {
      return customModel
    }
    return model
  }

  // 获取 API Key 占位符
  const getApiKeyPlaceholder = () => {
    const info = MODEL_PROVIDERS[provider]
    return info.apiKeyHint || `${info.apiKeyPrefix}...`
  }

  // 测试 API 连接
  const handleTestConnection = async () => {
    // 自定义模式需要填写 Base URL 和模型名称
    if (provider === "custom") {
      if (!baseUrl) {
        setConnectionStatus("error")
        setErrorMessage("自定义模式需要填写 Base URL")
        return
      }
      if (!customModel) {
        setConnectionStatus("error")
        setErrorMessage("自定义模式需要填写模型名称")
        return
      }
    }

    // 验证 API Key 格式
    const validation = validateApiKey(provider, apiKey)
    if (!validation.valid) {
      setConnectionStatus("error")
      setErrorMessage(validation.message || "API Key 格式无效")
      return
    }

    setConnectionStatus("testing")
    setErrorMessage("")

    try {
      const aiProvider = createAIProvider({
        provider,
        apiKey,
        baseUrl: baseUrl || undefined,
        model: provider === "custom" ? customModel : undefined,  // 自定义模式传递用户指定的模型
      })

      const success = await aiProvider.testConnection()

      if (success) {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
        setErrorMessage("连接测试失败，请检查 API Key")
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "连接失败")
    }
  }

  // 保存配置
  const handleSave = async () => {
    const modelId = getModelId()

    // 自定义模式验证
    if (provider === "custom") {
      if (!baseUrl) {
        setConnectionStatus("error")
        setErrorMessage("自定义模式需要填写 Base URL")
        return
      }
      if (!customModel) {
        setConnectionStatus("error")
        setErrorMessage("自定义模式需要填写模型名称")
        return
      }
    }

    // 验证 API Key
    const validation = validateApiKey(provider, apiKey)
    if (!validation.valid) {
      setConnectionStatus("error")
      setErrorMessage(validation.message || "API Key 格式无效")
      return
    }

    setSaving(true)
    setErrorMessage("")

    try {
      // 加密 API Key
      const encryptedKey = await encryptApiKey(apiKey)

      // 查找现有配置
      const existingModels = await modelsDB.getAll()
      const existingModel = existingModels.find((m) => m.provider === provider)

      if (existingModel && existingModel.id) {
        // 更新现有配置
        await modelsDB.update(existingModel.id, {
          apiKeyEncrypted: encryptedKey,
          modelId,
          baseUrl: baseUrl || undefined,
          temperature,
          maxTokens,
          isDefault: true,
        })

        updateModel(String(existingModel.id), {
          modelId,
          baseUrl: baseUrl || undefined,
          temperature,
          maxTokens,
        })
      } else {
        // 创建新配置
        const id = await modelsDB.create({
          provider,
          apiKeyEncrypted: encryptedKey,
          modelId,
          baseUrl: baseUrl || undefined,
          temperature,
          maxTokens,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const newConfig: ModelConfig = {
          id: String(id),
          provider,
          apiKey: "", // 不在 store 中存储明文
          modelId,
          baseUrl: baseUrl || undefined,
          temperature,
          maxTokens,
          isDefault: true,
        }

        addModel(newConfig)
        setActiveModel(newConfig)
      }

      setConnectionStatus("success")
    } catch (error) {
      console.error("Failed to save config:", error)
      setConnectionStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "保存失败")
    } finally {
      setSaving(false)
    }
  }

  // 删除配置
  const handleDelete = async () => {
    if (!activeModel) return

    try {
      await modelsDB.delete(Number(activeModel.id))
      removeModel(activeModel.id)
      setApiKey("")
      setConnectionStatus("idle")
    } catch (error) {
      console.error("Failed to delete config:", error)
    }
  }

  // 切换提供商时重置模型
  const handleProviderChange = (newProvider: ModelProvider) => {
    setProvider(newProvider)
    setConnectionStatus("idle")

    if (newProvider === "custom") {
      setCustomModel("")
    } else {
      const models = (() => {
        switch (newProvider) {
          case "anthropic":
            return ANTHROPIC_MODELS
          case "openai":
            return OPENAI_MODELS
          case "google":
            return GOOGLE_MODELS
          default:
            return []
        }
      })()
      if (models.length > 0) {
        setModel(models[0].id)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  const providerInfo = MODEL_PROVIDERS[provider]

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
              onChange={(e) => handleProviderChange(e.target.value as ModelProvider)}
            >
              {Object.entries(MODEL_PROVIDERS).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name} - {info.description}
                </option>
              ))}
            </select>
            {providerInfo.docsUrl && (
              <a
                href={providerInfo.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
              >
                <ExternalLink className="w-3 h-3" />
                查看 {providerInfo.name} API 文档
              </a>
            )}
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">
              API Key
              {apiKey && (
                <span className="ml-2 text-xs text-slate-500">
                  ({maskApiKey(apiKey)})
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder={getApiKeyPlaceholder()}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value)
                    setConnectionStatus("idle")
                  }}
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
            </div>
            <p className="text-xs text-slate-500">
              格式要求: <code className="text-purple-400">{providerInfo.apiKeyHint}</code>
              {" · "}API Key 将使用 AES-GCM 加密后存储在本地
            </p>
          </div>

          {/* Model Selection - 非自定义模式 */}
          {provider !== "custom" && (
            <div className="space-y-2">
              <label className="text-sm text-slate-400">模型选择</label>
              <select
                className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {getAvailableModels().map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} - {m.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 自定义模式特有配置 */}
          {provider === "custom" && (
            <>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Base URL <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="例如: http://localhost:11434/v1 (Ollama)"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="bg-slate-900 border-slate-700"
                />
                <p className="text-xs text-slate-500">
                  常用端点: Ollama (http://localhost:11434/v1), LM Studio (http://localhost:1234/v1)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  模型名称 <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="例如: llama3.2, qwen2.5:14b, deepseek-v3"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  className="bg-slate-900 border-slate-700"
                />
                <p className="text-xs text-slate-500">
                  填写服务端支持的模型名称，如 Ollama 使用 `ollama list` 查看可用模型
                </p>
              </div>
            </>
          )}

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
                <span>0.0 (确定性)</span>
                <span>1.0 (创造性)</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Max Tokens</label>
              <Input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                className="bg-slate-900 border-slate-700"
              />
            </div>

            {/* Base URL - 非自定义模式 */}
            {provider !== "custom" && (
              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Base URL <span className="text-slate-600">(可选，用于代理或自定义端点)</span>
                </label>
                <Input
                  placeholder={providerInfo.defaultBaseUrl}
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="bg-slate-900 border-slate-700"
                />
              </div>
            )}
          </div>

          <Separator className="bg-slate-700" />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={handleSave}
              disabled={saving || !apiKey || (provider === "custom" && (!baseUrl || !customModel))}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存配置"
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleTestConnection}
              disabled={connectionStatus === "testing" || !apiKey || (provider === "custom" && (!baseUrl || !customModel))}
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
            {activeModel && (
              <Button
                variant="outline"
                size="icon"
                className="text-red-400 hover:text-red-300"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Connection Status */}
          {connectionStatus === "success" && (
            <Badge className="w-full justify-center py-2 bg-green-600/20 text-green-400 border-green-600/30">
              <Check className="w-4 h-4 mr-2" />
              API 连接正常，配置已生效
            </Badge>
          )}
          {connectionStatus === "error" && (
            <Badge className="w-full justify-center py-2 bg-red-600/20 text-red-400 border-red-600/30">
              <AlertCircle className="w-4 h-4 mr-2" />
              {errorMessage || "连接失败，请检查配置"}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">使用说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-400 space-y-2">
          <p>1. 选择 AI 模型提供商并输入对应的 API Key</p>
          <p>2. 点击"测试连接"验证 API Key 是否有效</p>
          <p>3. 保存配置后即可在提示词生成中使用真实 AI 分析</p>
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg space-y-1">
            <p className="text-xs font-medium text-slate-300">API Key 格式参考：</p>
            <p className="text-xs"><span className="text-purple-400">Anthropic:</span> sk-ant-api03-...</p>
            <p className="text-xs"><span className="text-purple-400">OpenAI:</span> sk-proj-... 或 sk-...</p>
            <p className="text-xs"><span className="text-purple-400">Google:</span> AIzaSy...</p>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            注意：API Key 仅存储在本地浏览器中，不会上传到服务器
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
