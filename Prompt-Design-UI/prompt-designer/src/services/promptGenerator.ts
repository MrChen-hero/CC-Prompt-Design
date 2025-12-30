import { type GenerateSession, type XmlTag } from '@/types/generate'

/**
 * 生成 CLI 专业版提示词 (Anthropic XML 格式)
 *
 * 优先使用 customTagContent 中的用户自定义内容
 */
export function generateCliPrompt(
  description: string,
  analysis: NonNullable<GenerateSession['analysis']>,
  adjustments: GenerateSession['adjustments']
): string {
  const { enabledTags, language, outputStyle, customTagContent } = adjustments
  const { roleIdentification, roleDescription, taskGoals } = analysis

  const sections: string[] = []

  // 根据输出风格调整语气
  const styleMap = {
    professional: { tone: '专业、严谨', manner: '客观分析，逻辑清晰' },
    friendly: { tone: '友好、亲切', manner: '耐心解答，通俗易懂' },
    academic: { tone: '学术、规范', manner: '引经据典，论证严密' },
  }
  const style = styleMap[outputStyle]
  const langConstraint = language === 'zh' ? '使用简体中文回复' : 'Reply in English'

  // 辅助函数：获取标签内容（优先使用自定义内容）
  const getTagContent = (tag: XmlTag, defaultContent: string): string => {
    const custom = customTagContent[tag]
    // 类型检查：确保 custom 是字符串且非空
    if (custom !== undefined && custom !== null && typeof custom === 'string' && custom.trim() !== '') {
      return custom
    }
    return defaultContent
  }

  // 构建角色能力描述
  const roleAbilities = roleDescription && roleDescription !== roleIdentification
    ? `，${roleDescription}`
    : '，具备深厚的专业背景和丰富的实战经验'

  // <role>
  if (enabledTags.includes('role')) {
    const defaultRole = `你是一位${roleIdentification}${roleAbilities}。
你以${style.tone}的风格进行沟通，${style.manner}。`
    sections.push(`<role>\n${getTagContent('role', defaultRole)}\n</role>`)
  }

  // <task>
  if (enabledTags.includes('task')) {
    const taskList = taskGoals.map(g => `- ${g}`).join('\n')
    const defaultTask = `你的任务是帮助用户完成以下目标：
${taskList}

核心需求描述：${description}`
    sections.push(`<task>\n${getTagContent('task', defaultTask)}\n</task>`)
  }

  // <thinking>
  if (enabledTags.includes('thinking')) {
    const defaultThinking = `此思考过程为内部推理，不直接输出给用户。

在回答之前，请按以下框架思考：
1. **需求理解**：准确理解用户的核心诉求
2. **方案设计**：基于专业知识设计解决方案
3. **验证检查**：确保方案的可行性和正确性
4. **输出组织**：以清晰的结构呈现结果`
    sections.push(`<thinking>\n${getTagContent('thinking', defaultThinking)}\n</thinking>`)
  }

  // <instructions>
  if (enabledTags.includes('instructions')) {
    const defaultInstructions = `1. 仔细阅读并理解用户的输入内容
2. 运用专业知识进行分析和处理
3. 以结构化的方式组织输出内容
4. 如有不确定之处，明确说明并提供多种可能的解决方案
5. 根据问题类型选择合适的输出格式：
   - 分析类问题：使用"分析过程" + "结论"结构
   - 操作类问题：使用分步骤说明
   - 创意类问题：提供多个备选方案`
    sections.push(`<instructions>\n${getTagContent('instructions', defaultInstructions)}\n</instructions>`)
  }

  // <output_format>
  if (enabledTags.includes('output_format')) {
    const defaultOutputFormat = `- 使用 Markdown 格式进行排版
- 重要信息使用**加粗**标注
- 代码使用 \`代码块\` 包裹
- 对比信息使用表格呈现
- 步骤说明使用有序列表`
    sections.push(`<output_format>\n${getTagContent('output_format', defaultOutputFormat)}\n</output_format>`)
  }

  // <constraints>
  if (enabledTags.includes('constraints')) {
    const defaultConstraints = `- ${langConstraint}
- 保持${style.tone}的沟通风格
- 回答必须基于事实，如不确定请明确说明"我不确定"或"需要进一步验证"
- 保持内容简洁有效，聚焦核心信息
- 遵循职业道德，仅提供对用户有益的建议`
    sections.push(`<constraints>\n${getTagContent('constraints', defaultConstraints)}\n</constraints>`)
  }

  // <example>
  if (enabledTags.includes('example')) {
    const defaultExample = `<user>
[用户输入示例]
</user>

<assistant>
[助手回复示例]
</assistant>`
    sections.push(`<example>\n${getTagContent('example', defaultExample)}\n</example>`)
  }

  // <tools>
  if (enabledTags.includes('tools')) {
    const defaultTools = `可用工具：
- 搜索工具：用于查询最新信息
- 计算工具：用于数学计算
- 代码执行：用于运行代码片段

使用规则：
1. 根据任务需求选择合适的工具
2. 优先使用内置能力，必要时才调用工具
3. 明确说明工具调用的目的和预期结果`
    sections.push(`<tools>\n${getTagContent('tools', defaultTools)}\n</tools>`)
  }

  // <context>
  if (enabledTags.includes('context')) {
    const defaultContext = `背景信息：
[在此提供与任务相关的背景知识、参考资料或上下文信息]

相关文档或数据将在此处提供，请基于这些信息进行回答。`
    sections.push(`<context>\n${getTagContent('context', defaultContext)}\n</context>`)
  }

  return sections.join('\n\n')
}

/**
 * 将 CLI 格式转换为 Web 简明版
 */
export function generateWebPrompt(cliPrompt: string): string {
  const sections: string[] = []

  // 提取 <role> 内容
  const roleMatch = cliPrompt.match(/<role>([\s\S]*?)<\/role>/)
  if (roleMatch) {
    const roleContent = roleMatch[1].trim()
    // 提取角色名称
    const roleNameMatch = roleContent.match(/你是一位(.+?)，/)
    const roleName = roleNameMatch ? roleNameMatch[1] : '专业助手'
    sections.push(`你将扮演'${roleName}'，${roleContent.replace(/你是一位.+?，/, '')}`)
  }

  // 提取 <task> 内容
  const taskMatch = cliPrompt.match(/<task>([\s\S]*?)<\/task>/)
  if (taskMatch) {
    const taskContent = taskMatch[1].trim()
    // 转换为星号列表
    const formattedTask = taskContent
      .split('\n')
      .map(line => {
        line = line.trim()
        if (line.startsWith('-')) {
          return '*' + line.slice(1)
        }
        return line
      })
      .join('\n')
    sections.push(`目的与目标：\n${formattedTask}`)
  }

  // 提取 <instructions> 内容
  const instructionsMatch = cliPrompt.match(/<instructions>([\s\S]*?)<\/instructions>/)
  if (instructionsMatch) {
    const instructionsContent = instructionsMatch[1].trim()
    // 转换为编号列表
    const lines = instructionsContent.split('\n').filter(l => l.trim())
    const formatted = lines.map((line, i) => {
      line = line.trim()
      if (/^\d+\./.test(line)) {
        return line.replace(/^(\d+)\./, '$1)')
      }
      return `${i + 1}) ${line}`
    }).join('\n')
    sections.push(`行为准则：\n${formatted}`)
  }

  // 提取 <thinking> 内容（简化）
  const thinkingMatch = cliPrompt.match(/<thinking>([\s\S]*?)<\/thinking>/)
  if (thinkingMatch) {
    sections.push(`X) 内部思考框架 (不直接输出)：在回答前先进行需求理解、方案设计、验证检查`)
  }

  // 提取 <output_format> 内容
  const outputMatch = cliPrompt.match(/<output_format>([\s\S]*?)<\/output_format>/)
  if (outputMatch) {
    const outputContent = outputMatch[1].trim()
    sections.push(`输出格式要求：\n${outputContent}`)
  }

  // 提取 <constraints> 内容
  const constraintsMatch = cliPrompt.match(/<constraints>([\s\S]*?)<\/constraints>/)
  if (constraintsMatch) {
    const constraintsContent = constraintsMatch[1].trim()
    // 提取语言和风格信息
    const langMatch = constraintsContent.match(/使用(.+?)回复/)
    const styleMatch = constraintsContent.match(/保持(.+?)的沟通风格/)
    const lang = langMatch ? langMatch[1] : '简体中文'
    const style = styleMatch ? styleMatch[1] : '专业'
    sections.push(`语言与态度：\n使用${lang}回复，保持${style}的沟通风格。`)
  }

  // 提取 <context> 内容
  const contextMatch = cliPrompt.match(/<context>([\s\S]*?)<\/context>/)
  if (contextMatch) {
    const contextContent = contextMatch[1].trim()
    sections.push(`背景信息：\n${contextContent}`)
  }

  return sections.join('\n\n')
}

/**
 * 将 Web 格式转换为 CLI 格式
 */
export function webToCliPrompt(webPrompt: string): string {
  const sections: string[] = []

  // 尝试提取角色信息
  const roleMatch = webPrompt.match(/你将扮演['"'](.+?)['"']，([\s\S]*?)(?=\n\n|目的与目标|$)/)
  if (roleMatch) {
    sections.push(`<role>\n你是一位${roleMatch[1]}，${roleMatch[2].trim()}\n</role>`)
  }

  // 尝试提取任务信息
  const taskMatch = webPrompt.match(/目的与目标[：:]([\s\S]*?)(?=\n\n|行为准则|$)/)
  if (taskMatch) {
    const taskContent = taskMatch[1].trim()
      .replace(/^\*/gm, '-')
    sections.push(`<task>\n你的任务是帮助用户完成以下目标：\n${taskContent}\n</task>`)
  }

  // 尝试提取行为准则
  const instructionsMatch = webPrompt.match(/行为准则[：:]([\s\S]*?)(?=\n\n|输出格式|$)/)
  if (instructionsMatch) {
    const instructionsContent = instructionsMatch[1].trim()
      .replace(/^(\d+)\)/gm, '$1.')
    sections.push(`<instructions>\n${instructionsContent}\n</instructions>`)
  }

  // 尝试提取输出格式
  const outputMatch = webPrompt.match(/输出格式要求[：:]([\s\S]*?)(?=\n\n|语言与态度|$)/)
  if (outputMatch) {
    sections.push(`<output_format>\n${outputMatch[1].trim()}\n</output_format>`)
  }

  // 尝试提取约束
  const constraintsMatch = webPrompt.match(/语言与态度[：:]([\s\S]*?)(?=\n\n|背景信息|$)/)
  if (constraintsMatch) {
    sections.push(`<constraints>\n${constraintsMatch[1].trim()}\n</constraints>`)
  }

  // 尝试提取背景信息
  const contextMatch = webPrompt.match(/背景信息[：:]([\s\S]*?)$/)
  if (contextMatch) {
    sections.push(`<context>\n${contextMatch[1].trim()}\n</context>`)
  }

  return sections.join('\n\n')
}
