import { type GenerateSession } from '@/types/generate'

/**
 * 生成 CLI 专业版提示词 (Anthropic XML 格式)
 */
export function generateCliPrompt(
  description: string,
  analysis: NonNullable<GenerateSession['analysis']>,
  adjustments: GenerateSession['adjustments']
): string {
  const { enabledTags, language, outputStyle } = adjustments
  const { roleIdentification, taskGoals } = analysis

  const sections: string[] = []

  // 根据输出风格调整语气
  const styleMap = {
    professional: { tone: '专业、严谨', manner: '客观分析，逻辑清晰' },
    friendly: { tone: '友好、亲切', manner: '耐心解答，通俗易懂' },
    academic: { tone: '学术、规范', manner: '引经据典，论证严密' },
  }
  const style = styleMap[outputStyle]

  // <role>
  if (enabledTags.includes('role')) {
    sections.push(`<role>
你是一位${roleIdentification}，具备深厚的专业背景和丰富的实战经验。
你以${style.tone}的风格进行沟通，${style.manner}。
</role>`)
  }

  // <task>
  if (enabledTags.includes('task')) {
    const taskList = taskGoals.map(g => `- ${g}`).join('\n')
    sections.push(`<task>
你的任务是帮助用户完成以下目标：
${taskList}

核心需求描述：${description}
</task>`)
  }

  // <thinking>
  if (enabledTags.includes('thinking')) {
    sections.push(`<thinking>
此思考过程为内部推理，不直接输出给用户。

在回答之前，请按以下框架思考：
1. **需求理解**：准确理解用户的核心诉求
2. **方案设计**：基于专业知识设计解决方案
3. **验证检查**：确保方案的可行性和正确性
4. **输出组织**：以清晰的结构呈现结果
</thinking>`)
  }

  // <instructions>
  if (enabledTags.includes('instructions')) {
    sections.push(`<instructions>
1. 仔细阅读并理解用户的输入内容
2. 运用专业知识进行分析和处理
3. 以结构化的方式组织输出内容
4. 如有不确定之处，明确说明并提供多种可能的解决方案
5. 根据问题类型选择合适的输出格式：
   - 分析类问题：使用"分析过程" + "结论"结构
   - 操作类问题：使用分步骤说明
   - 创意类问题：提供多个备选方案
</instructions>`)
  }

  // <output_format>
  if (enabledTags.includes('output_format')) {
    sections.push(`<output_format>
- 使用 Markdown 格式进行排版
- 重要信息使用**加粗**标注
- 代码使用 \`代码块\` 包裹
- 对比信息使用表格呈现
- 步骤说明使用有序列表
</output_format>`)
  }

  // <constraints>
  if (enabledTags.includes('constraints')) {
    const langConstraint = language === 'zh' ? '使用简体中文回复' : 'Reply in English'
    sections.push(`<constraints>
- ${langConstraint}
- 保持${style.tone}的沟通风格
- 回答必须基于事实，如不确定请明确说明
- 避免冗余内容，保持简洁有效
- 遵循职业道德，不提供有害建议
</constraints>`)
  }

  // <example>
  if (enabledTags.includes('example')) {
    sections.push(`<example>
<user>
[用户输入示例]
</user>

<assistant>
[助手回复示例]
</assistant>
</example>`)
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
  const constraintsMatch = webPrompt.match(/语言与态度[：:]([\s\S]*?)$/)
  if (constraintsMatch) {
    sections.push(`<constraints>\n${constraintsMatch[1].trim()}\n</constraints>`)
  }

  return sections.join('\n\n')
}
