import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generateWebPrompt, webToCliPrompt } from "@/services/promptGenerator"
import { RefreshCw, ArrowRight, Copy, Download, Check, Clipboard } from "lucide-react"

export function Convert() {
  const [inputFormat, setInputFormat] = useState<"cli" | "web">("cli")
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [copied, setCopied] = useState(false)

  const handleConvert = () => {
    if (!inputText.trim()) return

    try {
      if (inputFormat === "cli") {
        // CLI XML → Web 简明版
        const result = generateWebPrompt(inputText)
        setOutputText(result)
      } else {
        // Web 简明版 → CLI XML
        const result = webToCliPrompt(inputText)
        setOutputText(result)
      }
    } catch (error) {
      console.error('Conversion error:', error)
      setOutputText('转换失败，请检查输入格式是否正确')
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
    } catch (error) {
      console.error('Failed to paste:', error)
    }
  }

  const handleCopy = async () => {
    if (!outputText) return
    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!outputText) return
    const filename = inputFormat === "cli" ? "prompt-web.md" : "prompt-cli.md"
    const blob = new Blob([outputText], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSwapDirection = () => {
    setInputFormat(inputFormat === "cli" ? "web" : "cli")
    // 同时交换输入输出内容
    const temp = inputText
    setInputText(outputText)
    setOutputText(temp)
  }

  const handleClear = () => {
    setInputText("")
    setOutputText("")
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          🔄 格式转换器
        </h1>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          清空
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-lg">📥 输入</CardTitle>
            <select
              className="h-8 px-3 rounded-md bg-slate-900 border border-slate-600 text-sm text-slate-300"
              value={inputFormat}
              onChange={(e) => {
                setInputFormat(e.target.value as "cli" | "web")
                setOutputText("")
              }}
            >
              <option value="cli">CLI XML 格式</option>
              <option value="web">Web 简明格式</option>
            </select>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-80 p-4 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder={
                inputFormat === "cli"
                  ? `<role>\n你是一位专业助手，具备深厚的专业背景和丰富的实战经验。\n</role>\n\n<task>\n你的任务是帮助用户完成以下目标：\n- 需求分析\n- 方案设计\n</task>\n\n<instructions>\n1. 仔细阅读并理解用户的输入内容\n2. 运用专业知识进行分析和处理\n</instructions>`
                  : `你将扮演'专业助手'，具备深厚的专业背景和丰富的实战经验。\n\n目的与目标：\n你的任务是帮助用户完成以下目标：\n* 需求分析\n* 方案设计\n\n行为准则：\n1) 仔细阅读并理解用户的输入内容\n2) 运用专业知识进行分析和处理`
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handlePaste}>
                <Clipboard className="w-4 h-4 mr-2" />
                粘贴
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputText("")}
                disabled={!inputText}
              >
                清除输入
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-lg">📤 输出</CardTitle>
            <span className="text-sm text-purple-400 font-medium">
              → {inputFormat === "cli" ? "Web 简明格式" : "CLI XML 格式"}
            </span>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-80 p-4 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none resize-none"
              value={outputText}
              readOnly
              placeholder="转换结果将显示在这里..."
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!outputText}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!outputText}
              >
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          className="bg-purple-600 hover:bg-purple-700 px-8"
          onClick={handleConvert}
          disabled={!inputText.trim()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          执行转换
        </Button>
        <Button variant="outline" onClick={handleSwapDirection}>
          <ArrowRight className="w-4 h-4 mr-2" />
          交换方向
        </Button>
      </div>

      {/* Help Text */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="py-4">
          <p className="text-sm text-slate-400 text-center">
            {inputFormat === "cli" ? (
              <>
                <strong className="text-slate-300">CLI XML 格式</strong> 适用于
                Claude API、Anthropic Console 等专业场景，使用 XML
                标签结构化内容
              </>
            ) : (
              <>
                <strong className="text-slate-300">Web 简明格式</strong> 适用于
                ChatGPT、Gemini、GPTs 等 Web 界面，使用自然语言描述
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
