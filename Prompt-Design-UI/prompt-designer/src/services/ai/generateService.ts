/**
 * 提示词生成 AI 服务
 *
 * 提供 AI 分析、标签内容生成、内容润色等功能
 */

import { getConfiguredAIProvider, getDefaultAIConfig } from './configService'
import type { XmlTag } from '@/types/generate'

export interface AnalysisResult {
  roleIdentification: string
  taskGoals: string[]
  recommendedTemplates: string[]
  suggestedTags: XmlTag[]
}

export interface GeneratedTagContent {
  [key: string]: string
}

/**
 * 分析用户描述，提取角色、目标、推荐标签
 */
export async function analyzeUserDescription(description: string): Promise<AnalysisResult> {
  const provider = await getConfiguredAIProvider()
  const config = await getDefaultAIConfig()

  if (!provider || !config) {
    throw new Error('请先在设置页面配置 AI API')
  }

  const systemPrompt = `你是一位专业的 Prompt 工程师，擅长分析用户需求并设计高质量的 AI 提示词结构。

你的任务是分析用户的描述，提取以下信息：
1. 角色定位：识别 AI 应扮演的专业角色
2. 核心任务目标：提取 3-5 个主要任务目标
3. 推荐模板：根据任务类型推荐合适的模板
4. 建议 XML 标签：推荐应该使用的 XML 标签

请以 JSON 格式返回结果，格式如下：
{
  "roleIdentification": "角色名称",
  "taskGoals": ["目标1", "目标2", "目标3"],
  "recommendedTemplates": ["模板名称"],
  "suggestedTags": ["role", "task", "instructions", ...]
}

可用的 XML 标签：
- role: 角色定义
- task: 任务声明
- thinking: 思考框架（内部推理，不直接输出）
- instructions: 操作指令
- output_format: 输出格式
- constraints: 约束条件
- example: 示例内容
- tools: 工具定义
- context: 上下文信息

可用的模板类型：
- 模板 A (单一任务型): 适合明确的单一任务
- 模板 B (多轮交互型): 适合需要多轮对话的场景
- 模板 C (代码/技术任务型): 适合编程和技术任务
- 模板 D (引用来源型): 适合需要引用验证的场景
- 模板 E (深度推理型): 适合复杂推理和学术研究

只返回 JSON，不要包含其他内容。`

  const userPrompt = `请分析以下用户描述，提取角色定位、任务目标、推荐模板和建议的 XML 标签：

用户描述：
${description}`

  try {
    const response = await provider.complete({
      model: config.modelId,
      messages: [
        { role: 'user', content: userPrompt },
      ],
      systemPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // 解析 JSON 响应
    const content = response.content.trim()
    // 尝试提取 JSON（可能被 markdown 代码块包裹）
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI 响应格式错误')
    }

    const result = JSON.parse(jsonMatch[0]) as AnalysisResult

    // 验证必要字段
    if (!result.roleIdentification || !result.taskGoals || !result.suggestedTags) {
      throw new Error('AI 响应缺少必要字段')
    }

    // 确保 suggestedTags 只包含有效标签
    const validTags: XmlTag[] = ['role', 'task', 'thinking', 'instructions', 'output_format', 'constraints', 'example', 'tools', 'context']
    result.suggestedTags = result.suggestedTags.filter(tag => validTags.includes(tag as XmlTag)) as XmlTag[]

    return result
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('AI 响应解析失败，请重试')
    }
    throw error
  }
}

/**
 * 生成各 XML 标签的内容
 */
export async function generateTagContents(
  description: string,
  analysis: AnalysisResult,
  language: 'zh' | 'en',
  outputStyle: 'professional' | 'friendly' | 'academic'
): Promise<Partial<Record<XmlTag, string>>> {
  const provider = await getConfiguredAIProvider()
  const config = await getDefaultAIConfig()

  if (!provider || !config) {
    throw new Error('请先在设置页面配置 AI API')
  }

  const styleDescriptions = {
    professional: '专业严谨的风格，使用行业术语',
    friendly: '友好亲切的风格，通俗易懂',
    academic: '学术规范的风格，注重逻辑严密性',
  }

  const languageDescriptions = {
    zh: '使用简体中文',
    en: '使用英文',
  }

  const systemPrompt = `你是一位专业的 Prompt 工程师，现在需要为用户生成高质量的提示词内容。

请根据用户提供的分析结果，为每个 XML 标签生成具体内容。

要求：
- ${languageDescriptions[language]}
- 采用${styleDescriptions[outputStyle]}
- 内容应该具体、可操作
- 每个标签的内容应该独立完整

XML 标签说明：
- role: 定义 AI 的身份、专业背景和能力
- task: 明确核心任务目标和期望结果
- thinking: AI 的内部推理过程（标注"此思考过程为内部推理，不直接输出给用户"）
- instructions: 具体的执行步骤和操作指南
- output_format: 通用格式规范（Markdown、表格等）
- constraints: 限定行为边界和禁止事项
- example: Few-Shot 学习的输入输出示例
- tools: 可用工具和使用场景定义
- context: 背景知识或相关信息

请以 JSON 格式返回，键为标签名，值为标签内容：
{
  "role": "角色定义内容...",
  "task": "任务声明内容...",
  ...
}

只返回 JSON，不要包含其他内容。`

  const userPrompt = `请为以下提示词生成各标签内容：

用户原始描述：
${description}

分析结果：
- 角色定位：${analysis.roleIdentification}
- 核心任务：${analysis.taskGoals.join('、')}
- 推荐模板：${analysis.recommendedTemplates.join('、')}

需要生成的标签：${analysis.suggestedTags.join(', ')}

请生成每个标签的具体内容。`

  try {
    const response = await provider.complete({
      model: config.modelId,
      messages: [
        { role: 'user', content: userPrompt },
      ],
      systemPrompt,
      temperature: 0.7,
      maxTokens: 4000,
    })

    // 解析 JSON 响应
    const content = response.content.trim()
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI 响应格式错误')
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>

    // 验证并过滤：确保所有值都是字符串类型
    const result: Partial<Record<XmlTag, string>> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        result[key as XmlTag] = value
      } else if (value !== null && value !== undefined) {
        // 如果不是字符串但有值，尝试转换为字符串
        result[key as XmlTag] = String(value)
      }
      // null 或 undefined 的值直接跳过
    }

    return result
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('AI 响应解析失败，请重试')
    }
    throw error
  }
}

/**
 * 润色/重新生成单个标签内容
 */
export async function polishTagContent(
  tag: XmlTag,
  currentContent: string,
  userDescription: string,
  analysis: AnalysisResult,
  language: 'zh' | 'en',
  outputStyle: 'professional' | 'friendly' | 'academic'
): Promise<string> {
  const provider = await getConfiguredAIProvider()
  const config = await getDefaultAIConfig()

  if (!provider || !config) {
    throw new Error('请先在设置页面配置 AI API')
  }

  const tagDescriptions: Record<XmlTag, string> = {
    role: '角色定义 - 定义 AI 的身份、专业背景和能力',
    task: '任务声明 - 明确核心任务目标和期望结果',
    thinking: '思考框架 - AI 的内部推理过程（标注"此思考过程为内部推理"）',
    instructions: '操作指令 - 具体的执行步骤和操作指南',
    output_format: '输出格式 - 通用格式规范（Markdown、表格等）',
    constraints: '约束条件 - 限定行为边界和禁止事项',
    example: '示例 - Few-Shot 学习的输入输出示例',
    tools: '工具定义 - 可用工具和使用场景',
    context: '上下文 - 背景知识或相关信息',
  }

  const styleDescriptions = {
    professional: '专业严谨的风格',
    friendly: '友好亲切的风格',
    academic: '学术规范的风格',
  }

  const languageDescriptions = {
    zh: '简体中文',
    en: '英文',
  }

  const systemPrompt = `你是一位专业的 Prompt 工程师，擅长优化和润色提示词内容。

你的任务是优化用户提供的标签内容，使其更加：
1. 清晰明确 - 表达准确，无歧义
2. 结构合理 - 逻辑清晰，层次分明
3. 内容完整 - 覆盖必要信息，无遗漏
4. 风格一致 - 符合指定的语言和风格要求

请直接返回优化后的内容，不要包含额外的解释或标记。`

  const userPrompt = `请优化以下 <${tag}> 标签的内容：

标签类型：${tagDescriptions[tag]}
语言要求：${languageDescriptions[language]}
风格要求：${styleDescriptions[outputStyle]}

用户原始描述：${userDescription}
角色定位：${analysis.roleIdentification}
核心任务：${analysis.taskGoals.join('、')}

当前内容：
${currentContent}

请优化上述内容，使其更加专业、完整和清晰。只返回优化后的内容，不要包含任何解释。`

  try {
    const response = await provider.complete({
      model: config.modelId,
      messages: [
        { role: 'user', content: userPrompt },
      ],
      systemPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return response.content.trim()
  } catch (error) {
    throw error
  }
}

/**
 * 检查是否可以使用 AI 功能
 */
export async function canUseAI(): Promise<{ available: boolean; message?: string }> {
  const provider = await getConfiguredAIProvider()

  if (!provider) {
    return {
      available: false,
      message: '请先在设置页面配置 AI API',
    }
  }

  return { available: true }
}
