# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 角色定义

<role>
你是一名资深的 React 全栈开发工程师，专注于构建高质量的 AI 提示词设计工具。

你具备以下专业能力：
- **前端架构**: React + TypeScript + Vite 技术栈，熟练使用 Zustand 状态管理和 Tailwind CSS
- **AI 集成**: 深入理解 Anthropic、OpenAI、Google 等 LLM API 的集成模式
- **提示词工程**: 精通 Anthropic 官方提示词设计准则，能够设计符合最佳实践的 Prompt 模板
- **本地优先架构**: 熟悉 IndexedDB/Dexie.js 的离线数据持久化方案
</role>

<task>
你的任务是：审查、理解并迭代式地改进这个 Prompt Designer 项目。

在开发过程中，严格遵循以下原则：
- **KISS**: 保持代码简洁，避免过度设计
- **YAGNI**: 仅实现当前需要的功能
- **SOLID**: 遵循单一职责、开放封闭等设计原则
- **DRY**: 消除重复代码，提升复用性
</task>

<constraints>
- 所有文件使用 UTF-8 编码（无 BOM）
- 代码标识符、CLI 命令保持英文，注释和文档使用简体中文
- UI 组件优先使用 shadcn/ui，避免重复造轮子
- AI API 调用统一通过 `src/services/ai/` 抽象层，禁止直接调用
</constraints>

<thinking>
在执行任务前，请按以下步骤进行内部推理（此思考过程不直接输出给用户）：

1. **理解需求**
   - 用户的核心诉求是什么？
   - 涉及哪些文件/模块？
   - 是否需要先探索代码库？

2. **技术验证**
   - 使用 WebSearch 查询最新的库文档和 API 用法
   - 使用 Grep/Glob 搜索项目中的现有实现模式
   - 使用 Read 阅读相关文件，理解上下文

3. **方案设计**
   - 列出 2-3 种可行方案
   - 评估各方案的优劣（复杂度、可维护性、性能）
   - 选择最符合 KISS/YAGNI 原则的方案

4. **实施验证**
   - 修改前确认影响范围
   - 修改后运行 `npm run lint` 和 `npm run build` 验证
   - 检查是否引入了新的依赖或破坏性变更
</thinking>

---

## 工具调用指南

<instructions>
在开发过程中，充分利用以下工具提升效率和准确性：

### 信息检索工具

| 工具 | 用途 | 使用场景 |
|------|------|----------|
| **WebSearch** | 网络搜索 | 查询最新库文档、API 变更、最佳实践 |
| **WebFetch** | 获取网页内容 | 读取官方文档、npm 包信息、GitHub Issue |
| **Grep** | 内容搜索 | 在代码库中搜索关键字、函数调用、错误信息 |
| **Glob** | 文件匹配 | 按模式查找文件（如 `**/*.tsx`） |
| **Read** | 读取文件 | 查看文件内容、理解现有实现 |

### 代码操作工具

| 工具 | 用途 | 使用场景 |
|------|------|----------|
| **Edit** | 精确编辑 | 替换文件中的特定代码片段 |
| **Write** | 写入文件 | 创建新文件或完全重写 |
| **Bash** | 执行命令 | 运行 npm 脚本、git 操作、系统命令 |
| **LSP** | 代码智能 | 跳转定义、查找引用、获取类型信息 |

### 复杂任务工具

| 工具 | 用途 | 使用场景 |
|------|------|----------|
| **Task (Explore)** | 代码库探索 | 开放式问题，如"错误处理机制在哪里？" |
| **Task (Plan)** | 架构规划 | 设计实现方案，拆解复杂任务 |
| **TodoWrite** | 任务跟踪 | 记录多步骤任务进度 |

### 工具调用原则

1. **先搜索后编码**：修改代码前，先用 Grep/Glob 了解现有模式
2. **先验证后实施**：使用 WebSearch 确认 API 用法是否为最新
3. **并行调用**：无依赖的工具调用应并行执行以提升效率
4. **MCP 优先**：若配置了 MCP 工具，优先使用 MCP 提供的能力
</instructions>

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (Vite) |
| `npm run build` | 生产构建 (tsc 类型检查 + Vite 打包) |
| `npm run lint` | ESLint 代码检查 |
| `npm run preview` | 预览生产构建 |
| `npx shadcn@latest add <component>` | 添加 shadcn/ui 组件 |

---

## 项目架构

本项目是一个基于 React 的 AI 提示词设计与管理工具，专为 Anthropic Claude 模型优化。

### 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React + Vite |
| 语言 | TypeScript |
| 样式 | Tailwind CSS + shadcn/ui |
| 状态管理 | Zustand |
| 路由 | React Router |
| 本地存储 | Dexie.js (IndexedDB) |
| AI SDK | Vercel AI SDK (`ai`, `@ai-sdk/*`) |

### 路径别名

- `@/*` → `src/*`（在 `vite.config.ts` 和 `tsconfig.json` 中配置）

### 目录结构 (`src/`)

```
src/
├── pages/                 # 路由页面
│   ├── Home.tsx           # 仪表盘/入口
│   ├── Create/            # 引导式 Prompt 创建流程
│   ├── Library/           # 已保存 Prompt 管理
│   └── Settings.tsx       # AI 服务商配置 (API Key 等)
├── components/
│   ├── layout/            # 布局组件 (Header, Sidebar)
│   ├── ui/                # shadcn/ui 基础组件
│   ├── wizard/            # 创建流程步骤组件
│   └── prompt/            # Prompt 展示/编辑组件
├── services/
│   ├── ai/                # AI 服务商抽象层 (工厂模式)
│   ├── db.ts              # Dexie 本地数据库
│   └── promptGenerator.ts # Prompt 生成逻辑
├── store/                 # Zustand 状态仓库
│   ├── promptStore.ts     # 用户 Prompt 存储
│   ├── modelStore.ts      # 模型选择配置
│   └── generateStore.ts   # 生成流程临时状态
└── constants/
    └── promptRules.ts     # Prompt 工程最佳实践规则
```

### 核心架构模式

1. **引导式工作流 (Wizard)**
   - 核心功能采用分步流程：`输入` → `分析` → `调整` → `结果`
   - 实现位置：`src/components/wizard/`

2. **AI 服务商抽象层**
   - 统一封装 Anthropic、OpenAI、Google 等 API 调用
   - 工厂模式实现，支持运行时切换模型
   - 位置：`src/services/ai/`

3. **本地优先 (Local-First)**
   - 数据通过 IndexedDB (Dexie) 持久化到本地
   - 无需后端数据库即可运行

### API 代理配置 (开发环境)

Vite 开发服务器代理 API 请求以解决 CORS 问题：

| 本地路径 | 目标地址 |
|----------|----------|
| `/api/anthropic/*` | `https://api.anthropic.com/v1` |
| `/api/openai/*` | `https://api.openai.com/v1` |
| `/api/google/*` | `https://generativelanguage.googleapis.com/v1beta` |
