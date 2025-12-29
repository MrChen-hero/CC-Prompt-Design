/**
 * 提示词设计规则常量
 *
 * CLI 规则来源：CLAUDE.md (Anthropic 官方规范)
 * Web 规则来源：Webrule.md (适配 Gemini/GPTs 等 Web 端)
 */

import { type XmlTag } from '@/types/generate'

/**
 * XML 标签默认内容模板
 *
 * 这些模板用于生成 CLI 专业版提示词
 */
export const XML_TAG_TEMPLATES: Record<XmlTag, {
  label: string
  description: string
  placeholder: string
  defaultContent: string
}> = {
  role: {
    label: '角色定义',
    description: '明确 AI 的专业身份、核心能力和专业背景',
    placeholder: '你是一位[专业领域]专家，擅长[核心能力]...',
    defaultContent: `你是一位专业的AI助手，具备深厚的专业背景和丰富的实战经验。
你以专业、严谨的风格进行沟通，客观分析，逻辑清晰。`,
  },
  task: {
    label: '任务声明',
    description: '使用"你的任务是..."句式声明核心任务目标',
    placeholder: '你的任务是帮助用户完成...',
    defaultContent: `你的任务是帮助用户完成以下目标：
- 理解用户需求
- 提供专业建议
- 输出结构化内容`,
  },
  thinking: {
    label: '思考框架',
    description: 'AI 的内部推理过程（标注为不直接输出）',
    placeholder: '在回答之前，请按以下框架思考...',
    defaultContent: `此思考过程为内部推理，不直接输出给用户。

在回答之前，请按以下框架思考：
1. **需求理解**：准确理解用户的核心诉求
2. **方案设计**：基于专业知识设计解决方案
3. **验证检查**：确保方案的可行性和正确性
4. **输出组织**：以清晰的结构呈现结果`,
  },
  instructions: {
    label: '操作指令',
    description: '具体的执行步骤和操作指南',
    placeholder: '1. 第一步操作\n2. 第二步操作...',
    defaultContent: `1. 仔细阅读并理解用户的输入内容
2. 运用专业知识进行分析和处理
3. 以结构化的方式组织输出内容
4. 如有不确定之处，明确说明并提供多种可能的解决方案
5. 根据问题类型选择合适的输出格式：
   - 分析类问题：使用"分析过程" + "结论"结构
   - 操作类问题：使用分步骤说明
   - 创意类问题：提供多个备选方案`,
  },
  output_format: {
    label: '输出格式',
    description: '通用格式规范（Markdown、表格等）',
    placeholder: '- 使用 Markdown 格式\n- 代码使用代码块...',
    defaultContent: `- 使用 Markdown 格式进行排版
- 重要信息使用**加粗**标注
- 代码使用 \`代码块\` 包裹
- 对比信息使用表格呈现
- 步骤说明使用有序列表`,
  },
  constraints: {
    label: '约束条件',
    description: '限定行为边界、语言和态度要求',
    placeholder: '- 使用中文回复\n- 保持专业态度...',
    defaultContent: `- 使用简体中文回复
- 保持专业、严谨的沟通风格
- 回答必须基于事实，如不确定请明确说明
- 避免冗余内容，保持简洁有效
- 遵循职业道德，不提供有害建议`,
  },
  example: {
    label: '示例',
    description: '提供输入输出示例（Few-Shot 学习）',
    placeholder: '<user>\n用户输入示例\n</user>\n\n<assistant>\n助手回复示例\n</assistant>',
    defaultContent: `<user>
[用户输入示例]
</user>

<assistant>
[助手回复示例]
</assistant>`,
  },
  tools: {
    label: '工具定义',
    description: '定义可用的工具和使用场景',
    placeholder: '可用工具：\n- 工具1：用于...\n- 工具2：用于...',
    defaultContent: `可用工具：
- 搜索工具：用于查询最新信息
- 计算工具：用于数学计算
- 代码执行：用于运行代码片段

使用规则：
1. 根据任务需求选择合适的工具
2. 优先使用内置能力，必要时才调用工具
3. 明确说明工具调用的目的和预期结果`,
  },
  context: {
    label: '上下文',
    description: '提供背景知识或相关信息',
    placeholder: '背景信息：\n[相关上下文内容]',
    defaultContent: `背景信息：
[在此提供与任务相关的背景知识、参考资料或上下文信息]

相关文档或数据将在此处提供，请基于这些信息进行回答。`,
  },
}

/**
 * 输出风格配置
 */
export const OUTPUT_STYLES = {
  professional: {
    label: '专业严谨',
    description: '客观分析，逻辑清晰',
    tone: '专业、严谨',
    manner: '客观分析，逻辑清晰',
  },
  friendly: {
    label: '友好亲切',
    description: '耐心解答，通俗易懂',
    tone: '友好、亲切',
    manner: '耐心解答，通俗易懂',
  },
  academic: {
    label: '学术规范',
    description: '引经据典，论证严密',
    tone: '学术、规范',
    manner: '引经据典，论证严密',
  },
} as const

/**
 * 语言配置
 */
export const LANGUAGES = {
  zh: {
    label: '中文',
    constraint: '使用简体中文回复',
  },
  en: {
    label: 'English',
    constraint: 'Reply in English',
  },
} as const

/**
 * 提示词模板类型
 *
 * 基于 CLAUDE.md 的五种标准模板
 */
export const PROMPT_TEMPLATES = {
  A: {
    name: '模板 A',
    title: '单一任务型',
    description: '适用于简单、直接的单一任务场景',
    suggestedTags: ['role', 'task', 'instructions', 'output_format', 'constraints'] as XmlTag[],
    useCases: ['翻译', '格式转换', '简单问答'],
  },
  B: {
    name: '模板 B',
    title: '多轮交互型',
    description: '适用于需要对话和迭代的场景',
    suggestedTags: ['role', 'task', 'instructions', 'output_format', 'constraints'] as XmlTag[],
    useCases: ['创意写作', '头脑风暴', '教学辅导'],
  },
  C: {
    name: '模板 C',
    title: '代码/技术任务型',
    description: '适用于代码分析、调试、优化等技术任务',
    suggestedTags: ['role', 'task', 'thinking', 'instructions', 'output_format', 'constraints'] as XmlTag[],
    useCases: ['代码审查', '技术方案', '问题诊断'],
  },
  D: {
    name: '模板 D',
    title: '引用来源型',
    description: '适用于需要基于文档回答、防止幻觉的场景',
    suggestedTags: ['role', 'task', 'thinking', 'instructions', 'output_format', 'constraints'] as XmlTag[],
    useCases: ['文档分析', '论文解读', '事实核查'],
  },
  E: {
    name: '模板 E',
    title: '深度推理型',
    description: '适用于复杂问题的深度分析和推理',
    suggestedTags: ['role', 'task', 'thinking', 'instructions', 'output_format', 'constraints', 'example'] as XmlTag[],
    useCases: ['学术研究', '复杂决策', '系统设计'],
  },
} as const

/**
 * 提示词分类配置
 */
export const PROMPT_CATEGORIES = {
  coding: {
    label: '编程开发',
    icon: '💻',
    color: 'blue',
  },
  writing: {
    label: '创意写作',
    icon: '✍️',
    color: 'pink',
  },
  academic: {
    label: '学术科研',
    icon: '🎓',
    color: 'purple',
  },
  education: {
    label: '教育培训',
    icon: '📚',
    color: 'green',
  },
  business: {
    label: '商务办公',
    icon: '💼',
    color: 'orange',
  },
  translation: {
    label: '翻译',
    icon: '🌐',
    color: 'cyan',
  },
  analysis: {
    label: '数据分析',
    icon: '📊',
    color: 'yellow',
  },
  other: {
    label: '其他',
    icon: '📝',
    color: 'gray',
  },
} as const

/**
 * CLI 格式转 Web 格式的转换规则
 *
 * 来源：Webrule.md
 */
export const CLI_TO_WEB_RULES = {
  role: {
    pattern: /<role>([\s\S]*?)<\/role>/,
    transform: '角色开场句：你将扮演\'[角色名]\'...',
    webTitle: null, // 无标题，直接作为开头
  },
  task: {
    pattern: /<task>([\s\S]*?)<\/task>/,
    transform: '目的与目标：使用星号 * 列表',
    webTitle: '目的与目标：',
  },
  thinking: {
    pattern: /<thinking>([\s\S]*?)<\/thinking>/,
    transform: '简化为一行，标注 (不直接输出)',
    webTitle: null, // 合并到行为准则中
  },
  instructions: {
    pattern: /<instructions>([\s\S]*?)<\/instructions>/,
    transform: '行为准则：使用双层编号 1) a)',
    webTitle: '行为准则：',
  },
  output_format: {
    pattern: /<output_format>([\s\S]*?)<\/output_format>/,
    transform: '输出格式要求：描述性说明',
    webTitle: '输出格式要求：',
  },
  constraints: {
    pattern: /<constraints>([\s\S]*?)<\/constraints>/,
    transform: '语言与态度：合并约束 + 性格描述',
    webTitle: '语言与态度：',
  },
  example: {
    pattern: /<example>([\s\S]*?)<\/example>/,
    transform: '省略（Web 端字符限制）',
    webTitle: null, // 通常删除
  },
  tools: {
    pattern: /<tools>([\s\S]*?)<\/tools>/,
    transform: '省略或简化为工具列表',
    webTitle: null,
  },
  context: {
    pattern: /<context>([\s\S]*?)<\/context>/,
    transform: '背景信息：描述性说明',
    webTitle: '背景信息：',
  },
} as const

/**
 * Web 格式转 CLI 格式的转换规则
 */
export const WEB_TO_CLI_RULES = {
  role: {
    pattern: /你将扮演['"'](.+?)['"']，([\s\S]*?)(?=\n\n|目的与目标|$)/,
    xmlTag: 'role',
  },
  task: {
    pattern: /目的与目标[：:]([\s\S]*?)(?=\n\n|行为准则|$)/,
    xmlTag: 'task',
  },
  instructions: {
    pattern: /行为准则[：:]([\s\S]*?)(?=\n\n|输出格式|$)/,
    xmlTag: 'instructions',
  },
  output_format: {
    pattern: /输出格式要求[：:]([\s\S]*?)(?=\n\n|语言与态度|$)/,
    xmlTag: 'output_format',
  },
  constraints: {
    pattern: /语言与态度[：:]([\s\S]*?)$/,
    xmlTag: 'constraints',
  },
} as const

/**
 * Anthropic 官方提示词设计准则摘要
 *
 * 来源：CLAUDE.md
 */
export const ANTHROPIC_GUIDELINES = {
  structure: {
    title: '标准 System Prompt 结构',
    template: `You are an AI assistant with [专业领域/特长].
Your task is to [核心任务描述].
[具体操作指南/约束条件].
[输出格式要求].`,
  },
  keyElements: [
    { element: '角色定位', description: '明确AI的专业身份', example: 'You are an expert research assistant' },
    { element: '任务声明', description: '使用 "Your task is to..."', example: 'Your task is to analyze the provided code' },
    { element: '输入规范', description: '使用XML标签包裹输入', example: '<document>...</document>, <code>...</code>' },
    { element: '输出格式', description: '明确期望的输出形式', example: 'Use bullet points, Format as JSON' },
    { element: '约束条件', description: '限定行为边界', example: 'Only use information from the provided document' },
  ],
  bestPractices: [
    '使用肯定式指令而非否定式',
    '复杂任务包含思维链引导',
    '事实性任务包含引用/验证机制',
    '长输出任务包含截断/继续机制',
  ],
  tagSeparation: {
    thinking: '标签标注"不直接输出给用户"',
    instructions: '包含格式选择逻辑（多场景时）',
    output_format: '只包含通用格式规范，不包含多个模板',
  },
} as const
