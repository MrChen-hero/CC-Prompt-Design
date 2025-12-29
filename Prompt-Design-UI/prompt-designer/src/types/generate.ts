// 生成会话类型定义
export interface GenerateSession {
  id: string
  currentStep: 1 | 2 | 3 | 4

  // Step 1: 用户输入
  userDescription: string

  // Step 2: AI 分析结果
  analysis: {
    roleIdentification: string
    taskGoals: string[]
    recommendedTemplates: string[]
    suggestedTags: XmlTag[]
  } | null

  // Step 3: 用户调整
  adjustments: {
    enabledTags: XmlTag[]
    language: 'zh' | 'en'
    outputStyle: 'professional' | 'friendly' | 'academic'
    includeExample: boolean
    // AI 生成的原始标签内容（用于对比用户是否修改）
    generatedTagContent: Partial<Record<XmlTag, string>>
    // 用户自定义的标签内容（编辑后的内容）
    customTagContent: Partial<Record<XmlTag, string>>
  }

  // Step 4: 生成结果
  result: {
    cliVersion: string
    webVersion: string
  } | null

  // 状态
  isGenerating: boolean
  error: string | null
}

export type XmlTag =
  | 'role'
  | 'task'
  | 'thinking'
  | 'instructions'
  | 'output_format'
  | 'constraints'
  | 'example'
  | 'tools'
  | 'context'

export const XML_TAG_INFO: Record<XmlTag, { label: string; description: string }> = {
  role: { label: '角色定义', description: '定义 AI 的身份、专业背景和能力' },
  task: { label: '任务声明', description: '明确核心任务目标和期望结果' },
  thinking: { label: '思考框架', description: 'AI 的内部推理过程（不直接输出）' },
  instructions: { label: '操作指令', description: '具体的执行步骤和操作指南' },
  output_format: { label: '输出格式', description: '通用格式规范（Markdown、表格等）' },
  constraints: { label: '约束条件', description: '限定行为边界和禁止事项' },
  example: { label: '示例', description: '提供 Few-Shot 学习的输入输出示例' },
  tools: { label: '工具定义', description: '定义可用的工具和使用场景' },
  context: { label: '上下文', description: '提供背景知识或相关信息' },
}

export const DEFAULT_ADJUSTMENTS: GenerateSession['adjustments'] = {
  enabledTags: ['role', 'task', 'thinking', 'instructions', 'output_format', 'constraints'],
  language: 'zh',
  outputStyle: 'professional',
  includeExample: false,
  generatedTagContent: {},
  customTagContent: {},
}

export function createNewSession(): GenerateSession {
  return {
    id: crypto.randomUUID(),
    currentStep: 1,
    userDescription: '',
    analysis: null,
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    result: null,
    isGenerating: false,
    error: null,
  }
}
