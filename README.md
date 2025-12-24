# Prompt Engineering Library

基于 [Anthropic 官方提示词库准则](https://docs.anthropic.com/en/prompt-library/library) 设计的高质量提示词模板集合。

## 项目简介

本仓库专注于 AI 提示词的设计、管理和优化，提供经过结构化设计的提示词模板，适用于 Claude、ChatGPT、Gemini 等主流大语言模型。

### 核心特色

- **标准化结构**：采用 Anthropic 推荐的 XML 标签格式（`<role>`, `<task>`, `<thinking>` 等）
- **多场景覆盖**：涵盖科研学术、编程开发、语言学习等多个领域
- **跨平台支持**：提供 Web 端（Gemini Gems、ChatGPT GPTs）转换规则
- **质量保证**：每个提示词均包含完整的示例和约束条件

## 提示词分类

### 科研学术类

| 提示词 | 功能 | 适用场景 |
|--------|------|----------|
| **科研专家** | 学术研究辅助、代码分析、模型优化 | 论文写作、实验设计 |
| **科研绘图专家** | 生成科研配图的英文提示词 | 论文插图、架构图 |
| **学术论文分析** | 综述/论文的深度解读 | 文献阅读、论文理解 |
| **Codex 学术 Prompt** | 学术级代码实现与验证 | 算法复现、代码优化 |
| **学术分析师** | 论文解读与技术解释 | 快速理解论文 |

### 编程开发类

| 提示词 | 功能 | 适用场景 |
|--------|------|----------|
| **C/C++ 程序设计专家** | 系统级编程与性能优化 | 算法实现、底层开发 |
| **程序分析师** | 代码逻辑分析与解释 | 代码审查、学习理解 |
| **前端工程师** | 代码分析、问题修复、UI 美化 | Web 开发 |
| **系统建模分析师** | UML 建模分析 | 系统设计、架构文档 |

### 通用助手类

| 提示词 | 功能 | 适用场景 |
|--------|------|----------|
| **AI 助手** | 深度推理 + 联网验证 | 通用问答 |
| **自适应专家代理** | AutoGPT 风格的任务分解 | 复杂任务规划 |

### 语言学习类

| 提示词 | 功能 | 适用场景 |
|--------|------|----------|
| **英语翻译师** | 句子翻译与语法分析 | 英语学习、翻译 |
| **英语口语教练** | 交互式口语训练 | 口语练习、纠错 |

## 提示词结构

所有提示词遵循 Anthropic 官方推荐的 XML 标签结构：

```xml
<role>
角色定义：专业背景、核心能力
</role>

<task>
任务声明：核心目标、预期成果
</task>

<thinking>
内部思考框架（不直接输出给用户）
</thinking>

<instructions>
具体操作指令
</instructions>

<output_format>
输出格式模板
</output_format>

<constraints>
约束条件和行为边界
</constraints>

<example>
输入输出示例
</example>
```

## 快速使用

### 1. 直接使用

复制 `Prompt.md` 中的提示词，粘贴到 Claude/ChatGPT 的 System Prompt 或对话开头。

### 2. Web 端使用（Gemini Gems / ChatGPT GPTs）

参考 `Webrule.md` 将 XML 格式转换为 Web 端格式：

**转换前 (XML)**:
```xml
<role>你是一位专业的学术分析师...</role>
<task>你的任务是...</task>
```

**转换后 (Web 端)**:
```
你将扮演'学术分析师'，一位专业的学术分析专家...

目的与目标：
* 为用户提供论文的深入解读
* ...

行为准则：
1) 深度阅读：
    a) 仔细阅读论文...
```

### 3. 自定义修改

根据 `CLAUDE.md` 中的设计准则，创建或修改提示词：

- 使用肯定式指令（"只使用..."）而非否定式（"不要..."）
- 复杂任务包含思维链引导 (`<thinking>`)
- 事实性任务包含验证机制（ReAct 模式）

## 设计准则

本仓库遵循的核心设计原则：

| 原则 | 说明 |
|------|------|
| **KISS** | 追求简洁直观，避免不必要的复杂性 |
| **YAGNI** | 仅实现当前所需功能 |
| **DRY** | 消除重复，提升复用性 |
| **SOLID** | 单一职责、开放封闭等面向对象原则 |

## 参考资源

- [Anthropic Prompt Library](https://docs.anthropic.com/en/prompt-library/library) - 官方提示词库
- [Anthropic Prompt Engineering Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) - 交互式教程
- [Claude 4 Best Practices](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices) - 最佳实践
- [Google Gemini Gems Guide](https://support.google.com/gemini/answer/15235603) - Gems 创建指南

## 贡献指南

欢迎提交 Issue 或 Pull Request：

1. **新增提示词**：遵循 `CLAUDE.md` 中的模板结构
2. **优化现有提示词**：使用质量检查清单验证
3. **报告问题**：描述具体场景和预期行为

## License

MIT License
