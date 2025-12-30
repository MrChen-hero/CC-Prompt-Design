/**
 * 提示词生成 AI 服务
 *
 * 提供 AI 分析、标签内容生成、内容润色等功能
 */

import { getConfiguredAIProvider, getDefaultAIConfig } from './configService'
import type { XmlTag } from '@/types/generate'

export interface AnalysisResult {
  roleIdentification: string      // 角色名称（简短），如"资深Python后端开发工程师"
  roleDescription: string         // 角色能力描述（详细），如"精通Django和FastAPI框架，具有10年分布式系统设计经验"
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

  const systemPrompt = `你是一位资深的 Prompt 工程专家，精通 Anthropic 官方提示词设计准则。你的任务是分析用户需求，为其设计最优的提示词结构方案。

## 分析框架

### 1. 角色定位分析
识别 AI 应扮演的专业角色，需要明确：
- **专业领域**：具体的专业背景（如"资深Python开发工程师"而非泛泛的"程序员"）
- **能力特征**：核心专长和擅长领域
- **经验层次**：体现专业深度（如"10年经验"、"精通..."）

### 2. 任务目标提取
提取 3-5 个具体、可操作的任务目标，遵循原则：
- **具体明确**：避免模糊表述，如"帮助用户"应细化为"分析用户代码并提供优化建议"
- **可衡量**：目标应有明确的完成标准
- **独立完整**：每个目标应能独立理解

### 3. 场景类型判定
根据任务性质判定场景类型，用于后续标签和模板推荐：
- **编程开发类**：代码编写、调试、优化、解释
- **文档处理类**：总结、分析、格式化、翻译
- **创意写作类**：故事创作、文案润色、内容生成
- **学术科研类**：论文分析、深度推理、数据分析
- **通用对话类**：问答、咨询、多轮交互

### 4. 模板推荐决策
根据场景类型和任务复杂度推荐模板：

| 场景特征 | 推荐模板 |
|---------|---------|
| 明确的单一任务，无需多轮交互 | 模板 A (单一任务型) |
| 需要多轮对话、信息收集、迭代优化 | 模板 B (多轮交互型) |
| 编程、技术任务，需要代码输出 | 模板 C (代码/技术任务型) |
| 需要引用验证、防止幻觉、基于文档回答 | 模板 D (引用来源型) |
| 复杂推理、学术研究、多步骤分析 | 模板 E (深度推理型) |

### 5. XML 标签推荐策略

**核心标签（几乎总是需要）：**
- role: 任何提示词都应有角色定位
- task: 任何提示词都应有任务声明
- instructions: 大多数任务需要操作指南

**条件标签（按需添加）：**
- thinking: 复杂推理、多步骤分析、需要展示思考过程时
- output_format: 需要结构化输出（表格、JSON、代码等）时
- constraints: 有明确行为边界、安全要求、格式限制时
- example: 需要 Few-Shot 学习、格式示范、风格参考时
- tools: 涉及工具调用、外部 API、搜索功能时
- context: 需要提供背景知识、领域信息、参考文档时

## 输出格式

请以 JSON 格式返回分析结果：
{
  "roleIdentification": "角色名称（简短，5-15字）",
  "roleDescription": "角色能力描述（详细，包含专业领域、核心专长、经验层次）",
  "taskGoals": ["具体目标1", "具体目标2", "具体目标3"],
  "recommendedTemplates": ["模板 X (类型名)"],
  "suggestedTags": ["role", "task", ...]
}

示例：
{
  "roleIdentification": "资深Python后端开发工程师",
  "roleDescription": "精通Django和FastAPI框架，具有10年分布式系统设计经验，擅长高并发系统优化和微服务架构设计",
  "taskGoals": ["分析代码性能瓶颈", "提供优化方案", "重构关键模块"],
  "recommendedTemplates": ["模板 C (代码/技术任务型)"],
  "suggestedTags": ["role", "task", "thinking", "instructions", "output_format", "constraints"]
}

只返回 JSON，不要包含其他内容。`

  const userPrompt = `请深度分析以下用户描述，提取角色定位、任务目标、推荐模板和建议的 XML 标签：

<user_description>
${description}
</user_description>

请基于分析框架进行全面分析，返回 JSON 格式的分析结果。`

  try {
    const response = await provider.complete({
      model: config.modelId,
      messages: [
        { role: 'user', content: userPrompt },
      ],
      systemPrompt,
      temperature: 0.7,
      maxTokens: 1500,
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

    // 确保 roleDescription 存在，如果没有则使用 roleIdentification 作为回退
    if (!result.roleDescription) {
      result.roleDescription = result.roleIdentification
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
    professional: '专业严谨，使用行业术语，逻辑清晰',
    friendly: '友好亲切，通俗易懂，耐心细致',
    academic: '学术规范，论证严密，引经据典',
  }

  const languageDescriptions = {
    zh: '简体中文',
    en: '英文',
  }

  const systemPrompt = `你是一位资深的 Prompt 工程专家，精通 Anthropic 官方提示词设计准则。你的任务是为用户生成高质量、符合最佳实践的提示词内容。

## 核心设计原则

### 1. 肯定式指令原则（关键）
**必须使用肯定式表述，避免否定式指令：**

| ❌ 错误（否定式） | ✅ 正确（肯定式） |
|-----------------|-----------------|
| 不要编造信息 | 仅使用提供的文档信息，如不确定请明确说明 |
| 不要使用非正式语言 | 保持专业正式的语言风格 |
| 避免冗余内容 | 保持内容简洁，聚焦核心信息 |
| 不提供有害建议 | 仅提供对用户有益且符合道德的建议 |

### 2. 标签职责分离原则（关键）

| 标签 | 职责 | 正确做法 | 错误做法 |
|-----|------|---------|---------|
| thinking | 内部推理框架 | 必须标注"此思考过程为内部推理，不直接输出给用户" | 省略标注 |
| instructions | 操作指令 + 格式选择 | 包含"根据X类型选择Y格式"的逻辑 | 只写操作步骤 |
| output_format | 通用格式规范 | 只写 Markdown、表格等通用规范 | 多个模板用 --- 分隔 |

### 3. 各标签内容规范

#### <role> 角色定义
- 使用"你是一位..."开头
- 包含专业领域、能力特征、经验层次
- 可包含沟通风格描述
- 示例：\`你是一位资深的Python后端开发工程师，精通Django和FastAPI框架，具有10年分布式系统设计经验。\`

#### <task> 任务声明
- 使用"你的任务是..."开头
- 明确核心目标和期望结果
- 可列出具体子任务
- 示例：\`你的任务是帮助用户优化代码性能，具体包括：识别性能瓶颈、提供优化方案、给出重构后的代码。\`

#### <thinking> 思考框架
- **必须**在开头标注：\`此思考过程为内部推理，不直接输出给用户。\`
- 提供结构化的思考步骤
- 适用于复杂推理任务
- 示例结构：1.需求理解 → 2.方案设计 → 3.验证检查 → 4.输出组织

#### <instructions> 操作指令
- 使用编号列表，步骤清晰
- **必须包含格式选择逻辑**（如果有多种输出场景）
- 示例：
  \`\`\`
  1. 仔细阅读并理解用户输入
  2. 运用专业知识进行分析
  3. 根据问题类型选择输出格式：
     - 分析类：使用"分析过程" + "结论"结构
     - 操作类：使用分步骤说明
     - 对比类：使用表格呈现
  \`\`\`

#### <output_format> 输出格式
- **只写通用格式规范**，不要写多个具体模板
- 使用列表形式
- 示例：
  \`\`\`
  - 使用 Markdown 格式排版
  - 重要信息使用**加粗**标注
  - 代码使用代码块包裹并注明语言
  - 对比数据使用表格呈现
  \`\`\`

#### <constraints> 约束条件
- **全部使用肯定式表述**
- 包含语言、风格、行为边界
- 示例：
  \`\`\`
  - 使用${languageDescriptions[language]}回复
  - 保持${styleDescriptions[outputStyle]}的风格
  - 回答基于事实，不确定时明确说明
  - 遵循职业道德，仅提供有益建议
  \`\`\`

#### <example> 示例内容
- 使用 <user> 和 <assistant> 标签包裹
- 提供完整的输入输出示例
- 体现期望的回答风格和格式

#### <tools> 工具定义
- 列出可用工具及其用途
- 说明使用规则和场景

#### <context> 上下文信息
- 提供背景知识或参考资料
- 使用 [占位符] 标注待填充内容

## 输出要求

- 语言：${languageDescriptions[language]}
- 风格：${styleDescriptions[outputStyle]}
- 格式：JSON，键为标签名，值为标签内容

{
  "role": "角色定义内容...",
  "task": "任务声明内容...",
  ...
}

只返回 JSON，不要包含其他内容。`

  const userPrompt = `请为以下提示词生成各标签的高质量内容：

## 用户原始描述
<user_description>
${description}
</user_description>

## 分析结果
- **角色名称**：${analysis.roleIdentification}
- **角色能力**：${analysis.roleDescription}
- **核心任务**：${analysis.taskGoals.join('、')}
- **推荐模板**：${analysis.recommendedTemplates.join('、')}

## 需要生成的标签
${analysis.suggestedTags.map(tag => `- ${tag}`).join('\n')}

请严格遵循设计原则，为每个标签生成专业、完整的内容。`

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
 * 质量检查结果
 */
export interface QualityCheckResult {
  passed: boolean
  score: number // 0-100
  issues: {
    category: 'structure' | 'separation' | 'bestPractice' | 'usability' | 'scenario'
    severity: 'error' | 'warning' | 'suggestion'
    tag?: XmlTag
    message: string
    suggestion: string
  }[]
  summary: string
}

/**
 * 质量检查提示词内容
 * 基于 CLAUDE.md 质量检查清单
 */
export async function qualityCheckPrompt(
  generatedContent: Partial<Record<XmlTag, string>>,
  analysis: AnalysisResult,
  language: 'zh' | 'en',
  outputStyle: 'professional' | 'friendly' | 'academic'
): Promise<QualityCheckResult> {
  const provider = await getConfiguredAIProvider()
  const config = await getDefaultAIConfig()

  if (!provider || !config) {
    throw new Error('请先在设置页面配置 AI API')
  }

  // 构建当前提示词的完整内容供检查
  const promptContent = Object.entries(generatedContent)
    .map(([tag, content]) => `<${tag}>\n${content}\n</${tag}>`)
    .join('\n\n')

  const systemPrompt = `你是一位专业的 Prompt 质量审核专家，精通 Anthropic 官方提示词设计准则。

你的任务是根据以下质量检查清单，对生成的提示词进行全面审核：

## 质量检查清单

### 1. 结构完整性
- [ ] 包含明确的角色定位 (role 标签中应有 "你是..." 或类似表述)
- [ ] 包含清晰的任务声明 (task 标签中应明确说明任务目标)
- [ ] 使用 XML 标签正确组织内容
- [ ] 明确输出格式要求 (output_format 标签)

### 2. 标签职责分离
- [ ] <thinking> 标签标注"不直接输出给用户"或类似说明
- [ ] <output_format> 不包含多个用 "---" 分隔的格式模板
- [ ] 多场景格式选择逻辑放在 <instructions> 中
- [ ] <output_format> 只包含通用格式规范（Markdown、表格等）

### 3. Anthropic 最佳实践
- [ ] 使用肯定式指令而非否定式 (如用"仅使用..."代替"不要...")
- [ ] 复杂任务包含思维链引导
- [ ] 事实性任务包含引用/验证机制
- [ ] 长输出任务包含截断/继续机制

### 4. 可用性
- [ ] 提示词简洁清晰，无冗余指令
- [ ] 约束条件合理且可执行
- [ ] 支持用户迭代和反馈

### 5. 特定场景检查
- [ ] 代码类: 包含语言规范、注释要求、错误处理
- [ ] 文档类: 包含格式化输出、信息完整性要求
- [ ] 创意类: 平衡创造性与用户控制
- [ ] 学术类: 包含验证机制、公式格式说明

请以 JSON 格式返回检查结果：
{
  "passed": true/false,
  "score": 0-100,
  "issues": [
    {
      "category": "structure|separation|bestPractice|usability|scenario",
      "severity": "error|warning|suggestion",
      "tag": "可选，指明问题所在标签",
      "message": "问题描述",
      "suggestion": "改进建议"
    }
  ],
  "summary": "总体评价，50字以内"
}

评分标准：
- 90-100: 优秀，完全符合准则
- 70-89: 良好，有小问题需优化
- 50-69: 及格，有明显问题需修正
- 0-49: 不及格，需要重新设计

只返回 JSON，不要包含其他内容。`

  const userPrompt = `请对以下提示词进行质量检查：

## 提示词信息
- 角色名称：${analysis.roleIdentification}
- 角色能力：${analysis.roleDescription}
- 核心任务：${analysis.taskGoals.join('、')}
- 语言：${language === 'zh' ? '中文' : '英文'}
- 风格：${outputStyle}

## 提示词内容
${promptContent}

请根据质量检查清单进行全面审核，返回 JSON 格式的检查结果。`

  try {
    const response = await provider.complete({
      model: config.modelId,
      messages: [
        { role: 'user', content: userPrompt },
      ],
      systemPrompt,
      temperature: 0.3, // 低温度确保检查结果稳定
      maxTokens: 2000,
    })

    // 解析 JSON 响应
    const content = response.content.trim()
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI 响应格式错误')
    }

    const result = JSON.parse(jsonMatch[0]) as QualityCheckResult

    // 验证必要字段
    if (typeof result.passed !== 'boolean' || typeof result.score !== 'number') {
      throw new Error('AI 响应缺少必要字段')
    }

    // 确保 issues 数组存在
    result.issues = result.issues || []

    return result
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('AI 响应解析失败，请重试')
    }
    throw error
  }
}

/**
 * 根据质量检查结果润色提示词
 */
export async function polishPromptByQualityCheck(
  generatedContent: Partial<Record<XmlTag, string>>,
  qualityResult: QualityCheckResult,
  analysis: AnalysisResult,
  language: 'zh' | 'en',
  outputStyle: 'professional' | 'friendly' | 'academic'
): Promise<Partial<Record<XmlTag, string>>> {
  const provider = await getConfiguredAIProvider()
  const config = await getDefaultAIConfig()

  if (!provider || !config) {
    throw new Error('请先在设置页面配置 AI API')
  }

  // 如果检查通过且分数较高，直接返回
  if (qualityResult.passed && qualityResult.score >= 90) {
    return generatedContent
  }

  // 构建需要修复的问题列表
  const issuesList = qualityResult.issues
    .filter(issue => issue.severity !== 'suggestion') // 优先处理 error 和 warning
    .map((issue, i) => `${i + 1}. [${issue.severity}] ${issue.tag ? `<${issue.tag}>: ` : ''}${issue.message}\n   建议: ${issue.suggestion}`)
    .join('\n')

  const promptContent = Object.entries(generatedContent)
    .map(([tag, content]) => `<${tag}>\n${content}\n</${tag}>`)
    .join('\n\n')

  const styleDescriptions = {
    professional: '专业严谨的风格',
    friendly: '友好亲切的风格',
    academic: '学术规范的风格',
  }

  const systemPrompt = `你是一位专业的 Prompt 工程师，擅长优化和润色提示词内容。

你的任务是根据质量检查报告，修复提示词中发现的问题。

## 核心修复原则
1. **肯定式指令**: 将"不要..."改为"仅使用..."、"保持..."等肯定表述
2. **标签职责分离**:
   - <thinking> 必须标注"此思考过程为内部推理，不直接输出给用户"
   - <output_format> 只包含通用格式规范，不要多个模板
   - 格式选择逻辑放入 <instructions>
3. **结构完整**: 确保角色、任务、约束等核心要素完整
4. **保持风格一致**: ${styleDescriptions[outputStyle]}

请以 JSON 格式返回修复后的内容，键为标签名，值为修复后的内容：
{
  "role": "修复后的内容...",
  "task": "修复后的内容...",
  ...
}

重要：只修复有问题的标签，没有问题的标签保持原样。
只返回 JSON，不要包含其他内容。`

  const userPrompt = `请根据以下质量检查结果，修复提示词中的问题：

## 质量检查结果
- 评分: ${qualityResult.score}/100
- 总结: ${qualityResult.summary}

## 发现的问题
${issuesList || '无严重问题，仅需微调'}

## 当前提示词内容
${promptContent}

## 要求
- 语言: ${language === 'zh' ? '简体中文' : '英文'}
- 风格: ${styleDescriptions[outputStyle]}
- 角色名称: ${analysis.roleIdentification}
- 角色能力: ${analysis.roleDescription}
- 核心任务: ${analysis.taskGoals.join('、')}

请修复上述问题并返回完整的 JSON 结果。`

  try {
    const response = await provider.complete({
      model: config.modelId,
      messages: [
        { role: 'user', content: userPrompt },
      ],
      systemPrompt,
      temperature: 0.5,
      maxTokens: 4000,
    })

    // 解析 JSON 响应
    const content = response.content.trim()
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI 响应格式错误')
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>

    // 合并结果：用修复后的内容覆盖原内容
    const result: Partial<Record<XmlTag, string>> = { ...generatedContent }
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.trim()) {
        result[key as XmlTag] = value
      }
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
