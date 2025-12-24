# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目定位

这是一个**Prompt工程设计仓库**，专注于基于 [Anthropic官方提示词库准则](https://docs.anthropic.com/en/prompt-library/library) 设计、管理和优化AI提示词模板。

### 核心职责

作为Prompt设计助手，你的任务是：
1. **设计新提示词** - 遵循Anthropic官方模板结构创建高质量提示词
2. **优化现有提示词** - 应用最佳实践改进仓库中的提示词
3. **分类组织** - 按场景和用途合理组织提示词资源
4. **质量保证** - 确保所有提示词符合官方设计准则

---

## Anthropic 官方提示词设计准则

> 参考来源: [Anthropic Prompt Library](https://docs.anthropic.com/en/prompt-library/library) | [Prompt Engineering Guide](https://github.com/anthropics/prompt-eng-interactive-tutorial)

### 1. 标准 System Prompt 结构

```
You are an AI assistant with [专业领域/特长].
Your task is to [核心任务描述].
[具体操作指南/约束条件].
[输出格式要求].
```

**关键要素：**

| 要素 | 说明 | 示例 |
|------|------|------|
| **角色定位** | 明确AI的专业身份 | `You are an expert research assistant` |
| **任务声明** | 使用 "Your task is to..." | `Your task is to analyze the provided code` |
| **输入规范** | 使用XML标签包裹输入 | `<document>...</document>`, `<code>...</code>` |
| **输出格式** | 明确期望的输出形式 | `Use bullet points`, `Format as JSON` |
| **约束条件** | 限定行为边界 | `Only use information from the provided document` |

### 2. XML标签结构化 (Claude最佳实践)

Claude在训练数据中使用了XML标签，推荐使用以下标签组织内容：

#### 核心结构标签

| 标签 | 用途 | 说明 |
|------|------|------|
| `<role>` | 角色定义 | 定义AI的身份、专业背景和能力边界 |
| `<task>` | 任务声明 | 明确核心任务目标和期望结果 |
| `<thinking>` | 思维过程 | 引导AI展示推理过程，增强可解释性 |
| `<instructions>` | 操作指令 | 具体的执行步骤和操作指南 |
| `<constraints>` | 约束条件 | 限定行为边界和禁止事项 |
| `<output_format>` | 输出格式 | 规定响应的结构和格式要求 |

#### 内容包装标签

| 标签 | 用途 | 说明 |
|------|------|------|
| `<document>` | 参考文档 | 包裹需要分析的文档内容 |
| `<code>` | 代码片段 | 包裹需要处理的代码 |
| `<example>` | 示例内容 | 提供Few-Shot学习的输入输出示例 |
| `<context>` | 上下文信息 | 提供背景知识或相关信息 |
| `<input>` | 用户输入 | 包裹用户提供的原始输入 |
| `<output>` | 期望输出 | 在示例中展示期望的输出格式 |

#### 高级推理标签

| 标签 | 用途 | 说明 |
|------|------|------|
| `<scratchpad>` | 草稿区 | 让AI展示中间计算或推理步骤 |
| `<reasoning>` | 推理过程 | 结构化展示逻辑推导 |
| `<verification>` | 验证检查 | 对结果进行自我检验 |
| `<reflection>` | 反思总结 | 回顾并改进推理过程 |

#### 标签使用示例

```xml
<role>
你是一位资深的Python开发专家，擅长代码优化和调试。
</role>

<task>
分析用户提供的代码，识别性能瓶颈并提供优化方案。
</task>

<thinking>
在回答之前，请按以下步骤思考：
1. 首先理解代码的整体结构和目的
2. 识别潜在的性能问题
3. 提出具体的优化建议
4. 验证优化方案的正确性
</thinking>

<instructions>
1. 仔细阅读并理解提供的代码
2. 使用 <scratchpad> 标签展示你的分析过程
3. 列出发现的所有问题
4. 提供优化后的代码和解释
</instructions>

<output_format>
## 代码分析
[问题列表]

## 优化方案
[具体建议]

## 优化后代码
```python
[代码]
```
</output_format>

<constraints>
- 保持代码的原有功能不变
- 优先考虑可读性，其次是性能
- 遵循PEP 8编码规范
</constraints>
```

### 3. 肯定式指令优于否定式

```
❌ 避免: "Don't make up information"
✅ 推荐: "Only use information from the provided document. If uncertain, say 'I don't know'"

❌ 避免: "不要编造事实"
✅ 推荐: "仅使用提供的文档信息。如不确定，请明确说明'我不确定'"
```

### 4. 思维链 (Chain of Thought)

对复杂任务，引导AI逐步思考：

```
Think step by step before providing your final answer.
First, analyze the problem. Then, consider possible approaches. Finally, provide your solution.
```

### 5. System Prompt vs Human Prompt 分工

| 类型 | 用途 | 内容 |
|------|------|------|
| **System Prompt** | 高层级场景设定 | 角色定义、工具定义、全局约束 |
| **Human Prompt** | 具体任务指令 | 详细操作步骤、输入数据、特定要求 |

---

## 标准提示词模板

### 模板A: 单一任务型 (Anthropic官方风格)

```markdown
## System Prompt

<role>
You are an AI assistant with expertise in [领域].
You have deep knowledge of [具体专长] and follow industry best practices.
</role>

<task>
Your task is to [核心任务].
</task>

<instructions>
1. [步骤1]
2. [步骤2]
3. [步骤3]
</instructions>

<output_format>
[输出格式说明]
</output_format>

<constraints>
- [约束1]
- [约束2]
</constraints>

## User Prompt

<input>
[用户输入内容]
</input>

[具体问题或请求]
```

### 模板B: 多轮交互型

```markdown
## System Prompt

<role>
You are [角色名], an AI assistant specialized in [专业领域].
You communicate in a [风格描述] manner.
</role>

<task>
Your task is to help users with [任务类型] through interactive conversation.
</task>

<workflow>
1. First, gather necessary information by asking clarifying questions
2. Then, provide your analysis/solution
3. Finally, ask for feedback and iterate if needed
</workflow>

<commands>
/start - 开始新任务
/help - 显示帮助信息
/reset - 重置对话
</commands>

<output_format>
- Use clear headings and bullet points
- Provide examples when helpful
- End each response with a question or suggested next step
</output_format>
```

### 模板C: 代码/技术任务型 (含思维链)

```markdown
## System Prompt

<role>
You are an expert [编程语言/技术] developer with 10+ years of experience.
You specialize in writing clean, efficient, and maintainable code.
</role>

<task>
Your task is to [analyze/debug/optimize/create] code based on user requirements.
</task>

<thinking>
Before responding, think through these steps:
1. Understand the code structure and purpose
2. Identify issues or optimization opportunities
3. Design the solution approach
4. Verify correctness of proposed changes
</thinking>

<instructions>
1. Carefully read and understand the provided code
2. Use <scratchpad> to show your analysis process
3. Identify [issues/optimization opportunities/requirements]
4. Provide [corrected code/improvements/implementation]
5. Explain your changes with clear comments
</instructions>

<output_format>
## Analysis
<scratchpad>
[展示分析过程]
</scratchpad>

## Solution
[解决方案说明]

## Code
```[language]
[代码]
```

## Explanation
[变更解释]
</output_format>

<constraints>
- Follow [语言] best practices and conventions
- Ensure code is readable and maintainable
- Handle edge cases appropriately
</constraints>
```

### 模板D: 引用来源型 (防幻觉)

```markdown
## System Prompt

<role>
You are an expert research assistant with strong analytical skills.
You are meticulous about accuracy and always cite your sources.
</role>

<document>
[参考文档内容]
</document>

<task>
Your task is to answer questions based ONLY on the provided document.
</task>

<thinking>
Before answering:
1. Carefully read the entire document
2. Identify sections relevant to the question
3. Extract direct quotes as evidence
4. Formulate answer based solely on document content
</thinking>

<instructions>
1. Find quotes from the document most relevant to the question
2. Print them in numbered order (keep quotes relatively short)
3. If no relevant quotes exist, write "No relevant quotes found"
4. Then provide your answer based on the quotes
</instructions>

<output_format>
**Relevant Quotes:**
1. "[quote 1]" (Section X)
2. "[quote 2]" (Section Y)

**Answer:**
[基于引用的回答]

**Confidence:** [High/Medium/Low based on evidence quality]
</output_format>

<constraints>
- ONLY use information from the provided document
- If information is not in the document, explicitly state "The document does not contain information about this"
- Do not make assumptions or add external knowledge
- Always indicate confidence level
</constraints>
```

### 模板E: 深度推理型 (学术/科研)

```markdown
## System Prompt

<role>
You are a world-class researcher in [领域] with expertise in:
- [专长1]
- [专长2]
- [专长3]
</role>

<task>
Your task is to provide rigorous analysis with step-by-step reasoning.
</task>

<thinking>
Use the following reasoning framework:
1. **Problem Decomposition**: Break down the problem into components
2. **Evidence Gathering**: Identify relevant facts and data
3. **Hypothesis Formation**: Develop potential explanations
4. **Verification**: Test hypotheses against evidence
5. **Synthesis**: Integrate findings into coherent conclusion
</thinking>

<instructions>
1. Begin with <scratchpad> to outline your approach
2. Show your reasoning process in <reasoning> tags
3. Verify your conclusions in <verification> tags
4. Provide final answer with confidence assessment
</instructions>

<output_format>
<scratchpad>
[初步分析和规划]
</scratchpad>

<reasoning>
**Step 1:** [分析步骤]
**Step 2:** [分析步骤]
...
</reasoning>

<verification>
- [ ] 逻辑一致性检查
- [ ] 证据支持度检查
- [ ] 边界条件检查
</verification>

## Conclusion
[最终结论]

## Confidence & Limitations
[置信度说明和局限性]
</output_format>

<constraints>
- Show all reasoning steps explicitly
- Acknowledge uncertainty when present
- Distinguish between facts and inferences
- Use precise technical terminology
</constraints>
```

---

## 提示词分类设计指南

### 编程开发类

| 提示词名称 | 核心任务 | 关键要素 |
|------------|----------|----------|
| Code Debugger | 分析并修复代码bug | 错误识别 + 修复方案 + 解释 |
| Code Optimizer | 优化代码性能 | 性能分析 + 优化建议 + 重构代码 |
| Function Generator | 根据描述生成函数 | 需求理解 + 代码实现 + 边界处理 |
| Code Explainer | 解释代码逻辑 | 逐行/模块解析 + 流程说明 |

**设计要点：**
- 使用 `<code>` 标签包裹代码输入
- 要求输出包含注释和解释
- 强调边界情况和错误处理

### 文档处理类

| 提示词名称 | 核心任务 | 关键要素 |
|------------|----------|----------|
| Meeting Summarizer | 总结会议记录 | 要点提取 + 行动项 + 责任人 |
| Document Analyzer | 分析文档内容 | 结构化输出 + 关键信息 |
| Formula Expert | 生成公式(Excel/LaTeX) | 需求理解 + 公式生成 + 使用说明 |

**设计要点：**
- 使用 `<document>` 标签包裹文档输入
- 明确输出格式(表格/列表/JSON)
- 强调信息的完整性和准确性

### 创意写作类

| 提示词名称 | 核心任务 | 关键要素 |
|------------|----------|----------|
| Story Collaborator | 协作创作故事 | 情节发展 + 角色塑造 + 用户参与 |
| Content Polisher | 润色文字内容 | 语法修正 + 风格优化 + 保持原意 |
| Translation Expert | 翻译文本 | 语义准确 + 语境适应 + 风格保持 |

**设计要点：**
- 鼓励创造性但保持用户控制
- 提供风格/语气选项
- 支持迭代优化

### 教育学习类

| 提示词名称 | 核心任务 | 关键要素 |
|------------|----------|----------|
| Concept Explainer | 解释复杂概念 | 分层解释 + 类比 + 示例 |
| Quiz Generator | 生成测验题目 | 难度分级 + 知识覆盖 + 答案解析 |
| Learning Coach | 个性化学习指导 | 进度跟踪 + 反馈 + 资源推荐 |

**设计要点：**
- 支持不同难度级别
- 使用 "Second-grade simplifier" 技术处理复杂概念
- 包含反馈和评估机制

### 学术科研类 (本仓库特色)

| 提示词名称 | 核心任务 | 关键要素 |
|------------|----------|----------|
| Research Expert | 科研分析与规划 | ReAct模式 + CoT + 多方案 |
| Paper Analyzer | 论文深度解析 | 结构分析 + 公式解读 + 创新点 |
| Visualization Designer | 学术配图设计 | 三层级图表 + 学术规范 |

**设计要点：**
- 必须包含事实验证机制(ReAct模式)
- 使用思维链(CoT)进行逐步推理
- 公式使用LaTeX格式，标注变量含义

---

## 提示词质量检查清单

设计或修改提示词时，确保满足以下标准：

### 结构完整性
- [ ] 包含明确的角色定位 (`You are...`)
- [ ] 包含清晰的任务声明 (`Your task is to...`)
- [ ] 使用XML标签组织输入/输出/约束
- [ ] 明确输出格式要求

### Anthropic最佳实践
- [ ] 使用肯定式指令而非否定式
- [ ] 复杂任务包含思维链引导
- [ ] 事实性任务包含引用/验证机制
- [ ] 长输出任务包含截断/继续机制

### 可用性
- [ ] 提示词简洁清晰，无冗余指令
- [ ] 包含必要的示例(Few-Shot)
- [ ] 约束条件合理且可执行
- [ ] 支持用户迭代和反馈

### 特定场景
- [ ] 代码类: 包含语言规范、注释要求、错误处理
- [ ] 文档类: 包含格式化输出、信息完整性要求
- [ ] 创意类: 平衡创造性与用户控制
- [ ] 学术类: 包含ReAct验证、公式LaTeX格式

---

## 常见任务指南

### 创建新提示词

1. **确定类型** - 参考"提示词分类设计指南"选择合适类别
2. **选择模板** - 使用"标准提示词模板"中的对应模板
3. **填充内容** - 按模板结构填写角色/任务/约束/格式
4. **添加示例** - 提供1-3个输入输出示例(Few-Shot)
5. **质量检查** - 使用"质量检查清单"验证
6. **测试迭代** - 实际测试并根据效果优化

### 优化现有提示词

1. **诊断问题** - 识别输出质量问题(幻觉/格式/逻辑)
2. **对照准则** - 检查是否符合Anthropic官方准则
3. **应用模板** - 重构为标准模板结构
4. **增强机制** - 添加CoT/ReAct/XML标签等
5. **测试验证** - A/B测试优化效果

### 组织提示词文件

- **简单单任务**: 添加到 `Prompt.md` 或 `Prompt_Example/Prompt.txt`
- **复杂多轮交互**: 创建独立 `.md` 文件在 `Prompt_Example/` 下
- **实验性/探索性**: 添加到 `Prompt_Example/Experiment.txt`

---

## 编码与语言规范

### 文件编码
- 所有文件必须使用 **UTF-8编码** (无BOM)
- 严禁使用GBK/ANSI等本地编码

### 语言规范
- 默认使用**简体中文**进行交流和分析
- 技术术语可保留英文原文并附中文解释
- 绘图类Prompt输出为**英文**(适配国际化工具)
- 代码标识符、CLI命令保持原语言

### Markdown格式
- 使用标准Markdown语法
- 代码块注明语言: ` ```python `
- 公式使用LaTeX: `$inline$` 或 `$$block$$`
- 使用表格组织对比信息

---

## 参考资源

- [Anthropic Prompt Library](https://docs.anthropic.com/en/prompt-library/library) - 官方提示词库
- [Anthropic Prompt Engineering Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) - 交互式教程
- [Claude 4 Best Practices](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices) - Claude 4最佳实践
- [System Prompts Guide](https://docs.anthropic.com/claude/docs/system-prompts) - 系统提示词指南
