# Prompt Designer 项目开发文档

> **面向零基础开发者的完整开发指南**
>
> 本文档详细记录了从项目创建到核心功能实现的每一步操作，包含代码解释和官方文档链接。

---

## 目录

1. [项目概述](#一项目概述)
2. [开发环境准备](#二开发环境准备)
3. [Phase 0: 项目创建与初始化](#三phase-0-项目创建与初始化)
4. [Phase 1: 基础架构搭建](#四phase-1-基础架构搭建)
5. [Phase 2: 核心功能实现](#五phase-2-核心功能实现)
6. [常见问题与解决方案](#六常见问题与解决方案)
7. [参考资源](#七参考资源)

---

## 一、项目概述

### 1.1 项目简介

**Prompt Designer** 是一个可视化的 AI 提示词设计工具，帮助用户：
- 通过 4 步向导生成专业的 AI 提示词
- 在 CLI（命令行）和 Web 格式之间自由转换
- 本地存储和管理所有创建的提示词

### 1.2 技术栈总览

| 技术 | 版本 | 作用 | 官方文档 |
|------|------|------|----------|
| **React** | 18.x | 前端框架 | [react.dev](https://react.dev/) |
| **TypeScript** | 5.x | 类型安全的 JavaScript | [typescriptlang.org](https://www.typescriptlang.org/) |
| **Vite** | 5.x | 构建工具 | [vitejs.dev](https://vitejs.dev/) |
| **Tailwind CSS** | 3.x | CSS 工具类框架 | [tailwindcss.com](https://tailwindcss.com/) |
| **shadcn/ui** | - | UI 组件库 | [ui.shadcn.com](https://ui.shadcn.com/) |
| **Zustand** | 4.x | 状态管理 | [zustand](https://github.com/pmndrs/zustand) |
| **Dexie.js** | 4.x | IndexedDB 封装库 | [dexie.org](https://dexie.org/) |
| **React Router** | 6.x | 路由管理 | [reactrouter.com](https://reactrouter.com/) |
| **Lucide React** | - | 图标库 | [lucide.dev](https://lucide.dev/) |

### 1.3 项目最终结构

```
prompt-designer/
├── public/                    # 静态资源
├── src/
│   ├── components/           # 组件目录
│   │   ├── ui/              # shadcn/ui 基础组件
│   │   ├── layout/          # 布局组件
│   │   └── wizard/          # 向导步骤组件
│   ├── pages/               # 页面组件
│   ├── store/               # Zustand 状态管理
│   ├── services/            # 服务层（数据库、API）
│   ├── types/               # TypeScript 类型定义
│   ├── lib/                 # 工具函数
│   ├── App.tsx              # 应用入口
│   ├── main.tsx             # 渲染入口
│   └── index.css            # 全局样式
├── components.json           # shadcn/ui 配置
├── tailwind.config.js        # Tailwind 配置
├── tsconfig.json             # TypeScript 配置
├── vite.config.ts            # Vite 配置
└── package.json              # 项目依赖
```

---

## 二、开发环境准备

### 2.1 必需软件

1. **Node.js** (v18.0.0 或更高)
   - 下载地址：[nodejs.org](https://nodejs.org/)
   - 验证安装：`node -v` 和 `npm -v`

2. **代码编辑器** (推荐 VS Code)
   - 下载地址：[code.visualstudio.com](https://code.visualstudio.com/)
   - 推荐插件：
     - ES7+ React/Redux/React-Native snippets
     - Tailwind CSS IntelliSense
     - TypeScript Importer
     - Prettier - Code formatter

3. **Git** (可选，用于版本控制)
   - 下载地址：[git-scm.com](https://git-scm.com/)

### 2.2 基础概念说明

#### 什么是 npm？
npm (Node Package Manager) 是 Node.js 的包管理器，用于安装和管理项目依赖。

```bash
# 常用命令
npm install          # 安装 package.json 中的所有依赖
npm install <包名>    # 安装指定包
npm install -D <包名> # 安装为开发依赖
npm run <脚本>        # 运行 package.json 中定义的脚本
```

#### 什么是 TypeScript？
TypeScript 是 JavaScript 的超集，添加了类型系统。例如：

```typescript
// JavaScript
function greet(name) {
  return "Hello, " + name;
}

// TypeScript（添加类型注解）
function greet(name: string): string {
  return "Hello, " + name;
}
```

---

## 三、Phase 0: 项目创建与初始化

### 3.1 Step 1: 创建 Vite + React + TypeScript 项目

#### 执行命令

```bash
# 创建项目（prompt-designer 是项目名，可自定义）
npm create vite@latest prompt-designer -- --template react-ts

# 进入项目目录
cd prompt-designer

# 安装基础依赖
npm install
```

#### 命令解释

| 命令部分 | 含义 |
|----------|------|
| `npm create vite@latest` | 使用最新版 Vite 创建项目 |
| `prompt-designer` | 项目名称（会创建同名文件夹） |
| `--` | 分隔 npm 参数和 Vite 参数 |
| `--template react-ts` | 使用 React + TypeScript 模板 |

#### 验证成功

```bash
npm run dev
```

如果看到终端输出类似 `Local: http://localhost:5173/`，说明项目创建成功。

> **官方文档**：[Vite 入门指南](https://vitejs.dev/guide/)

---

### 3.2 Step 2: 配置 Tailwind CSS

> **重要提示**：必须使用 Tailwind CSS **v3**，不要使用 v4（存在兼容性问题）

#### 执行命令

```bash
# 安装 Tailwind CSS v3（注意指定版本）
npm install -D tailwindcss@3 postcss autoprefixer

# 初始化配置文件
npx tailwindcss init -p
```

#### 命令解释

| 命令部分 | 含义 |
|----------|------|
| `-D` | 安装为开发依赖（只在开发时需要） |
| `tailwindcss@3` | 指定安装 v3 版本 |
| `postcss` | CSS 处理工具 |
| `autoprefixer` | 自动添加浏览器前缀 |
| `npx tailwindcss init -p` | 创建 `tailwind.config.js` 和 `postcss.config.js` |

#### 创建/修改配置文件

**tailwind.config.js**（完整内容）：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  // 启用暗色模式，通过添加 'dark' 类切换
  darkMode: ["class"],

  // 指定 Tailwind 扫描哪些文件来生成样式
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      // 自定义颜色变量（配合 shadcn/ui 使用）
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // 自定义圆角
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  // 引入动画插件（shadcn/ui 需要）
  plugins: [require("tailwindcss-animate")],
}
```

**配置解释**：

| 配置项 | 作用 |
|--------|------|
| `darkMode: ["class"]` | 通过在 HTML 添加 `class="dark"` 来切换暗色模式 |
| `content` | 告诉 Tailwind 扫描这些文件中的类名 |
| `colors` | 使用 CSS 变量定义颜色，方便主题切换 |
| `plugins` | 加载动画插件 |

#### 安装动画插件

```bash
npm install -D tailwindcss-animate
```

#### 修改全局样式

**src/index.css**（完整内容）：

```css
/* 引入 Tailwind 的三个核心层 */
@tailwind base;       /* 基础样式重置 */
@tailwind components; /* 组件样式 */
@tailwind utilities;  /* 工具类 */

/* 定义 CSS 变量（暗色主题） */
@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 263.4 70% 50.4%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 263.4 70% 50.4%;
    --radius: 0.5rem;
  }
}

/* 基础样式 */
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**样式解释**：

| 部分 | 作用 |
|------|------|
| `@tailwind base` | 重置浏览器默认样式 |
| `@tailwind components` | 注入组件样式 |
| `@tailwind utilities` | 注入工具类（如 `flex`, `p-4`） |
| `:root` | 定义 CSS 变量，所有子元素可访问 |
| `--background: 222.2 84% 4.9%` | HSL 颜色值（色相 饱和度 亮度） |

> **官方文档**：[Tailwind CSS 安装指南](https://tailwindcss.com/docs/installation)

---

### 3.3 Step 3: 配置 shadcn/ui

shadcn/ui 是一个**可复制粘贴**的组件库，不是传统的 npm 包。组件代码会直接放入你的项目中。

#### 创建配置文件

**components.json**（在项目根目录创建）：

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**配置解释**：

| 字段 | 含义 |
|------|------|
| `style` | 组件风格，`default` 是默认样式 |
| `rsc` | 是否使用 React Server Components（Vite 项目设为 `false`） |
| `tsx` | 是否使用 TypeScript |
| `tailwind.baseColor` | 基础颜色方案，`slate` 是蓝灰色系 |
| `aliases` | 路径别名，`@/` 指向 `src/` 目录 |

#### 配置路径别名

为了让 `@/components` 这样的导入路径生效，需要配置：

**tsconfig.app.json**（修改）：

```json
{
  "compilerOptions": {
    // ... 其他配置保持不变
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**vite.config.ts**（修改）：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 让 Vite 也认识 @/ 路径
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

#### 创建工具函数

**src/lib/utils.ts**：

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn 函数：合并 CSS 类名
 *
 * 作用：
 * 1. clsx - 条件性地组合类名
 * 2. twMerge - 智能合并 Tailwind 类（避免冲突）
 *
 * 示例：
 * cn("px-4 py-2", isActive && "bg-blue-500", "px-6")
 * 结果："py-2 bg-blue-500 px-6"（px-4 被 px-6 覆盖）
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### 安装工具依赖

```bash
npm install clsx tailwind-merge
```

> **官方文档**：[shadcn/ui 安装指南](https://ui.shadcn.com/docs/installation/vite)

---

### 3.4 Step 4: 安装项目依赖

#### 执行命令

```bash
# 状态管理
npm install zustand

# 路由
npm install react-router-dom

# 本地数据库
npm install dexie

# 图标库
npm install lucide-react

# AI SDK（可选，后续集成 AI 功能时使用）
npm install ai @ai-sdk/anthropic

# 开发依赖
npm install -D @types/node
```

#### 依赖说明

| 依赖包 | 作用 | 官方文档 |
|--------|------|----------|
| `zustand` | 轻量级状态管理库 | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) |
| `react-router-dom` | React 路由管理 | [reactrouter.com](https://reactrouter.com/) |
| `dexie` | IndexedDB 的封装，简化本地数据库操作 | [dexie.org](https://dexie.org/) |
| `lucide-react` | 精美的开源图标库 | [lucide.dev](https://lucide.dev/) |
| `ai` | Vercel AI SDK，处理 AI 流式响应 | [sdk.vercel.ai](https://sdk.vercel.ai/) |
| `@types/node` | Node.js 的 TypeScript 类型定义 | - |

---

### 3.5 Step 5: 创建项目目录结构

```bash
# 在 src 目录下创建子目录
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/wizard
mkdir -p src/pages/Create
mkdir -p src/pages/Library
mkdir -p src/store
mkdir -p src/services
mkdir -p src/types
mkdir -p src/lib
```

#### 目录职责说明

| 目录 | 职责 | 示例文件 |
|------|------|----------|
| `components/ui` | 基础 UI 组件（按钮、卡片等） | `button.tsx`, `card.tsx` |
| `components/layout` | 布局组件（侧边栏、顶栏） | `Layout.tsx`, `Sidebar.tsx` |
| `components/wizard` | 向导步骤组件 | `Step1Input.tsx` |
| `pages` | 页面组件 | `Home.tsx`, `Library/index.tsx` |
| `store` | Zustand 状态管理 | `modelStore.ts`, `promptStore.ts` |
| `services` | 服务层（数据库、API） | `db.ts`, `promptGenerator.ts` |
| `types` | TypeScript 类型定义 | `generate.ts` |
| `lib` | 工具函数 | `utils.ts` |

---

## 四、Phase 1: 基础架构搭建

### 4.1 UI 基础组件

#### 4.1.1 Button 组件

**src/components/ui/button.tsx**：

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * cva (class-variance-authority)
 * 用于创建带有变体（variants）的组件样式
 *
 * 基础样式：所有按钮都有的样式
 * variants：不同变体（如 default, outline）的独特样式
 * defaultVariants：默认使用的变体
 */
const buttonVariants = cva(
  // 基础样式（所有按钮共享）
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // 不同外观变体
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // 不同尺寸变体
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    // 默认变体
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// 定义组件 Props 类型
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * Button 组件
 *
 * 使用示例：
 * <Button>默认按钮</Button>
 * <Button variant="outline">边框按钮</Button>
 * <Button variant="ghost" size="sm">小号幽灵按钮</Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**安装依赖**：

```bash
npm install class-variance-authority
```

**关键概念**：

| 概念 | 说明 |
|------|------|
| `React.forwardRef` | 允许组件接收 ref 并转发给子元素 |
| `cva` | 创建带变体的样式函数 |
| `VariantProps` | 从 cva 配置中提取类型 |
| `cn()` | 合并并去重 CSS 类名 |

#### 4.1.2 Card 组件

**src/components/ui/card.tsx**：

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Card 组件族
 *
 * Card 是一个"容器组件"，通常包含：
 * - CardHeader: 头部区域（标题、描述）
 * - CardContent: 主要内容区域
 * - CardFooter: 底部区域（操作按钮）
 */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

**使用示例**：

```tsx
<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>卡片描述文字</CardDescription>
  </CardHeader>
  <CardContent>
    <p>这里是卡片的主要内容</p>
  </CardContent>
</Card>
```

#### 4.1.3 Input 组件

**src/components/ui/input.tsx**：

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input 输入框组件
 *
 * 继承所有原生 input 属性（如 type, placeholder, onChange 等）
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // 基础样式
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
          // 占位符样式
          "placeholder:text-muted-foreground",
          // 文件输入特殊样式
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // 焦点样式
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          // 禁用样式
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

#### 4.1.4 Badge 组件

**src/components/ui/badge.tsx**：

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge 徽章组件
 *
 * 用于显示标签、状态、分类等小型信息
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

---

### 4.2 布局组件

#### 4.2.1 Layout 主布局

**src/components/layout/Layout.tsx**：

```typescript
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

/**
 * Layout 主布局组件
 *
 * 结构：
 * ┌─────────────────────────────────────┐
 * │          Header (顶栏)              │
 * ├─────────┬───────────────────────────┤
 * │ Sidebar │                           │
 * │ (侧边栏) │      Main (主内容)        │
 * │         │                           │
 * └─────────┴───────────────────────────┘
 *
 * @param children - 页面内容（通过路由传入）
 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* 左侧导航栏 */}
      <Sidebar />

      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <Header />

        {/* 主内容区 */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

        {/* 底部状态栏 */}
        <footer className="h-8 bg-slate-900 border-t border-slate-800 flex items-center px-4 text-xs text-slate-500">
          <span>模型：Claude 3.5 Sonnet</span>
          <span className="mx-2">|</span>
          <span className="text-green-500">● 已连接</span>
        </footer>
      </div>
    </div>
  )
}
```

**Tailwind 类名解释**：

| 类名 | 作用 |
|------|------|
| `min-h-screen` | 最小高度为屏幕高度 |
| `bg-slate-950` | 深灰色背景 |
| `flex` | 启用 Flexbox 布局 |
| `flex-1` | 占据剩余空间 |
| `flex-col` | 垂直方向排列 |
| `p-6` | 内边距 24px |
| `overflow-auto` | 内容溢出时显示滚动条 |

#### 4.2.2 Sidebar 侧边栏

**src/components/layout/Sidebar.tsx**：

```typescript
import { Link, useLocation } from "react-router-dom"
import { Home, Sparkles, Library, RefreshCw, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 导航菜单项配置
 */
const navItems = [
  { icon: Home, label: "首页", path: "/" },
  { icon: Sparkles, label: "新建", path: "/create" },
  { icon: Library, label: "仓库", path: "/library" },
  { icon: RefreshCw, label: "转换", path: "/convert" },
  { icon: Settings, label: "设置", path: "/settings" },
]

export function Sidebar() {
  // useLocation 钩子：获取当前 URL 路径
  const location = useLocation()

  return (
    <aside className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4">
      {/* Logo */}
      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
        <span className="text-white font-bold">P</span>
      </div>

      {/* 导航菜单 */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          // 判断当前项是否为激活状态
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                // 基础样式
                "w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs transition-colors",
                // 条件样式：激活 vs 未激活
                isActive
                  ? "bg-purple-600/20 text-purple-400"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

**关键概念**：

| 概念 | 说明 |
|------|------|
| `useLocation` | React Router 钩子，获取当前 URL 信息 |
| `Link` | React Router 组件，用于页面导航（不刷新页面） |
| `cn()` | 条件性地组合 CSS 类名 |
| `Lucide Icons` | 通过 `<IconName />` 方式使用图标 |

#### 4.2.3 Header 顶栏

**src/components/layout/Header.tsx**：

```typescript
import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      {/* 左侧标题 */}
      <h1 className="text-lg font-semibold text-white">
        Prompt Designer
      </h1>

      {/* 右侧操作区 */}
      <div className="flex items-center gap-4">
        {/* 通知按钮 */}
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5 text-slate-400" />
        </Button>

        {/* 用户头像 */}
        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  )
}
```

---

### 4.3 路由配置

**src/App.tsx**：

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Home } from "@/pages/Home"
import { Create } from "@/pages/Create"
import { Library } from "@/pages/Library"
import { Convert } from "@/pages/Convert"
import { Settings } from "@/pages/Settings"

/**
 * App 组件：应用入口
 *
 * 路由结构：
 * / - 首页
 * /create - 创建提示词
 * /library - 提示词仓库
 * /convert - 格式转换
 * /settings - 设置
 */
function App() {
  return (
    // BrowserRouter: 使用 HTML5 History API 管理路由
    <BrowserRouter>
      {/* Layout 包裹所有页面，提供统一布局 */}
      <Layout>
        {/* Routes: 路由容器 */}
        <Routes>
          {/* Route: 定义路径与组件的映射 */}
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/library" element={<Library />} />
          <Route path="/convert" element={<Convert />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
```

**路由概念**：

| 组件 | 作用 |
|------|------|
| `BrowserRouter` | 路由容器，使用浏览器 History API |
| `Routes` | 路由配置容器 |
| `Route` | 单个路由规则，`path` 是 URL，`element` 是要渲染的组件 |
| `Link` | 导航链接，点击后改变 URL（不刷新页面） |
| `useNavigate` | 钩子，用于编程式导航 |

> **官方文档**：[React Router](https://reactrouter.com/en/main/start/tutorial)

---

### 4.4 状态管理 (Zustand)

Zustand 是一个轻量级的状态管理库，比 Redux 简单得多。

#### 4.4.1 模型配置 Store

**src/store/modelStore.ts**：

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 模型配置类型定义
 */
interface ModelConfig {
  id: string
  provider: 'anthropic' | 'openai' | 'google' | 'deepseek' | 'custom'
  apiKey: string
  modelId: string
  baseUrl?: string
  temperature: number
  maxTokens: number
  isDefault: boolean
}

/**
 * Store 类型定义
 */
interface ModelStore {
  // 状态
  models: ModelConfig[]
  activeModel: ModelConfig | null

  // 操作方法
  setActiveModel: (model: ModelConfig) => void
  addModel: (model: ModelConfig) => void
  updateModel: (id: string, updates: Partial<ModelConfig>) => void
  removeModel: (id: string) => void
}

/**
 * 创建 Store
 *
 * create<T>() - 创建一个 store
 * persist() - 中间件，将状态持久化到 localStorage
 */
export const useModelStore = create<ModelStore>()(
  persist(
    // set 函数用于更新状态
    (set) => ({
      // 初始状态
      models: [],
      activeModel: null,

      // 设置当前活动模型
      setActiveModel: (model) => set({ activeModel: model }),

      // 添加模型（展开原数组，添加新模型）
      addModel: (model) => set((state) => ({
        models: [...state.models, model]
      })),

      // 更新模型（遍历数组，找到匹配 id 的模型并更新）
      updateModel: (id, updates) => set((state) => ({
        models: state.models.map(m =>
          m.id === id ? { ...m, ...updates } : m
        )
      })),

      // 删除模型（过滤掉指定 id 的模型）
      removeModel: (id) => set((state) => ({
        models: state.models.filter(m => m.id !== id)
      })),
    }),
    // persist 配置
    { name: 'model-storage' }  // localStorage 的 key
  )
)
```

**使用方法**：

```tsx
import { useModelStore } from '@/store/modelStore'

function MyComponent() {
  // 获取状态和方法
  const { models, activeModel, addModel } = useModelStore()

  // 使用状态
  console.log(models)

  // 调用方法
  addModel({ id: '1', provider: 'anthropic', ... })
}
```

**Zustand 核心概念**：

| 概念 | 说明 |
|------|------|
| `create` | 创建 store 的函数 |
| `set` | 更新状态的函数 |
| `state` | 当前状态 |
| `persist` | 中间件，将状态保存到 localStorage |

> **官方文档**：[Zustand](https://github.com/pmndrs/zustand)

#### 4.4.2 提示词 Store

**src/store/promptStore.ts**：

```typescript
import { create } from 'zustand'

/**
 * 提示词分类类型
 */
export type PromptCategory =
  | 'coding'      // 编程开发
  | 'writing'     // 创意写作
  | 'academic'    // 学术科研
  | 'education'   // 教育学习
  | 'business'    // 商务办公
  | 'translation' // 翻译
  | 'analysis'    // 数据分析
  | 'other'       // 其他

/**
 * 存储的提示词类型
 */
export interface StoredPrompt {
  id: string
  name: string
  description: string
  category: PromptCategory
  tags: string[]
  cliVersion: string        // CLI 格式版本
  webVersion: string        // Web 格式版本
  createdAt: Date
  updatedAt: Date
  usageCount: number
  isFavorite: boolean
}

interface PromptStore {
  // 状态
  prompts: StoredPrompt[]
  searchQuery: string
  filterCategory: PromptCategory | 'all'
  sortBy: 'recent' | 'usage' | 'name'

  // 操作方法
  setPrompts: (prompts: StoredPrompt[]) => void
  addPrompt: (prompt: StoredPrompt) => void
  updatePrompt: (id: string, updates: Partial<StoredPrompt>) => void
  deletePrompt: (id: string) => void
  toggleFavorite: (id: string) => void
  setSearchQuery: (query: string) => void
  setFilterCategory: (category: PromptCategory | 'all') => void
  setSortBy: (sortBy: 'recent' | 'usage' | 'name') => void
}

export const usePromptStore = create<PromptStore>((set) => ({
  prompts: [],
  searchQuery: '',
  filterCategory: 'all',
  sortBy: 'recent',

  setPrompts: (prompts) => set({ prompts }),

  addPrompt: (prompt) => set((state) => ({
    prompts: [prompt, ...state.prompts]  // 新添加的放在最前面
  })),

  updatePrompt: (id, updates) => set((state) => ({
    prompts: state.prompts.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    )
  })),

  deletePrompt: (id) => set((state) => ({
    prompts: state.prompts.filter(p => p.id !== id)
  })),

  toggleFavorite: (id) => set((state) => ({
    prompts: state.prompts.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    )
  })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setSortBy: (sortBy) => set({ sortBy }),
}))

/**
 * 自定义 Hook：获取过滤后的提示词列表
 *
 * 这是一个"派生状态"（computed state），根据当前筛选条件计算
 */
export function useFilteredPrompts() {
  const { prompts, searchQuery, filterCategory, sortBy } = usePromptStore()

  // 1. 过滤
  let filtered = prompts.filter((p) => {
    // 分类过滤
    if (filterCategory !== 'all' && p.category !== filterCategory) {
      return false
    }
    // 搜索过滤（在名称、描述、标签中搜索）
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    return true
  })

  // 2. 排序
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'usage':
        return b.usageCount - a.usageCount
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return filtered
}
```

---

### 4.5 数据库服务 (Dexie)

Dexie 是 IndexedDB 的封装库，让浏览器本地数据库操作变得像使用 SQL 一样简单。

**src/services/db.ts**：

```typescript
import Dexie, { type Table } from 'dexie'

/**
 * 数据库表类型定义
 */
export interface DBPrompt {
  id?: number           // 自增主键
  name: string
  description: string
  category: string
  tags: string[]
  cliVersion: string
  webVersion: string
  createdAt: Date
  updatedAt: Date
  usageCount: number
  isFavorite: boolean
}

export interface DBModelConfig {
  id?: number
  provider: string
  apiKeyEncrypted: string
  modelId: string
  baseUrl?: string
  temperature: number
  maxTokens: number
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DBSession {
  id?: number
  userDescription: string
  aiAnalysis?: string
  generatedCliPrompt?: string
  generatedWebPrompt?: string
  status: 'draft' | 'analyzing' | 'adjusting' | 'completed'
  createdAt: Date
  updatedAt: Date
}

/**
 * 数据库类定义
 *
 * 继承 Dexie，定义数据库结构
 */
export class PromptDesignerDB extends Dexie {
  // 声明表（Table<类型, 主键类型>）
  prompts!: Table<DBPrompt>
  models!: Table<DBModelConfig>
  sessions!: Table<DBSession>

  constructor() {
    super('PromptDesigner')  // 数据库名称

    // 定义表结构（版本 1）
    // 语法：'主键, 索引1, 索引2, *数组索引'
    this.version(1).stores({
      prompts: '++id, name, category, *tags, createdAt, updatedAt, isFavorite',
      models: '++id, provider, isDefault, createdAt',
      sessions: '++id, status, createdAt, updatedAt',
    })
  }
}

// 创建数据库实例
export const db = new PromptDesignerDB()

/**
 * 提示词表操作辅助函数
 */
export const promptsDB = {
  // 获取所有提示词（按更新时间倒序）
  async getAll(): Promise<DBPrompt[]> {
    return db.prompts.orderBy('updatedAt').reverse().toArray()
  },

  // 根据 ID 获取单个
  async getById(id: number): Promise<DBPrompt | undefined> {
    return db.prompts.get(id)
  },

  // 创建新提示词
  async create(prompt: Omit<DBPrompt, 'id'>): Promise<number> {
    return db.prompts.add({
      ...prompt,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  },

  // 更新提示词
  async update(id: number, updates: Partial<DBPrompt>): Promise<number> {
    return db.prompts.update(id, {
      ...updates,
      updatedAt: new Date(),
    })
  },

  // 删除提示词
  async delete(id: number): Promise<void> {
    return db.prompts.delete(id)
  },

  // 搜索提示词
  async search(query: string): Promise<DBPrompt[]> {
    const lowerQuery = query.toLowerCase()
    return db.prompts
      .filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      )
      .toArray()
  },

  // 按分类获取
  async getByCategory(category: string): Promise<DBPrompt[]> {
    return db.prompts.where('category').equals(category).toArray()
  },

  // 获取收藏
  async getFavorites(): Promise<DBPrompt[]> {
    return db.prompts.where('isFavorite').equals(1).toArray()
  },

  // 增加使用次数
  async incrementUsage(id: number): Promise<void> {
    const prompt = await db.prompts.get(id)
    if (prompt) {
      await db.prompts.update(id, {
        usageCount: prompt.usageCount + 1,
        updatedAt: new Date(),
      })
    }
  },
}

// 类似地定义 modelsDB 和 sessionsDB...
```

**Dexie 核心概念**：

| 概念 | 说明 |
|------|------|
| `++id` | 自增主键 |
| `*tags` | 数组索引（可以按数组元素查询） |
| `Table<T>` | 类型化的表 |
| `where().equals()` | 条件查询 |
| `orderBy().reverse()` | 排序（倒序） |
| `toArray()` | 将结果转为数组 |

> **官方文档**：[Dexie.js](https://dexie.org/docs/Tutorial/Getting-started)

---

## 五、Phase 2: 核心功能实现

### 5.1 类型定义

**src/types/generate.ts**：

```typescript
/**
 * XML 标签类型
 *
 * 这些是 Anthropic 官方提示词规范中的标签
 */
export type XmlTag =
  | 'role'          // 角色定义
  | 'task'          // 任务声明
  | 'thinking'      // 思考框架
  | 'instructions'  // 操作指令
  | 'output_format' // 输出格式
  | 'constraints'   // 约束条件
  | 'example'       // 示例

/**
 * XML 标签信息映射
 *
 * 为每个标签提供中文标签和描述
 */
export const XML_TAG_INFO: Record<XmlTag, { label: string; description: string }> = {
  role: { label: '角色定义', description: '定义 AI 的身份和专业背景' },
  task: { label: '任务声明', description: '明确核心任务目标' },
  thinking: { label: '思考框架', description: 'AI 的内部推理过程（不输出）' },
  instructions: { label: '操作指令', description: '具体执行步骤' },
  output_format: { label: '输出格式', description: '通用格式规范' },
  constraints: { label: '约束条件', description: '限定行为边界' },
  example: { label: '示例', description: '提供输入输出示例' },
}

/**
 * 生成会话类型
 *
 * 记录整个 4 步向导的状态
 */
export interface GenerateSession {
  id: string
  currentStep: 1 | 2 | 3 | 4  // 当前步骤

  // Step 1: 用户描述
  userDescription: string

  // Step 2: AI 分析结果
  analysis: {
    roleIdentification: string      // 角色识别
    taskGoals: string[]             // 任务目标列表
    recommendedTemplates: string[]  // 推荐模板
    suggestedTags: XmlTag[]         // 建议的 XML 标签
  } | null

  // Step 3: 用户调整
  adjustments: {
    enabledTags: XmlTag[]           // 启用的标签
    language: 'zh' | 'en'           // 语言
    outputStyle: 'professional' | 'friendly' | 'academic'  // 风格
    includeExample: boolean         // 是否包含示例
  }

  // Step 4: 生成结果
  result: {
    cliVersion: string              // CLI 格式
    webVersion: string              // Web 格式
  } | null

  // 状态
  isGenerating: boolean
  error: string | null
}

/**
 * 默认调整选项
 */
export const DEFAULT_ADJUSTMENTS: GenerateSession['adjustments'] = {
  enabledTags: ['role', 'task', 'instructions', 'output_format', 'constraints'],
  language: 'zh',
  outputStyle: 'professional',
  includeExample: false,
}

/**
 * 创建新会话
 */
export function createNewSession(): GenerateSession {
  return {
    id: crypto.randomUUID(),  // 生成唯一 ID
    currentStep: 1,
    userDescription: '',
    analysis: null,
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    result: null,
    isGenerating: false,
    error: null,
  }
}
```

---

### 5.2 生成向导 Store

**src/store/generateStore.ts**：

```typescript
import { create } from 'zustand'
import {
  type GenerateSession,
  type XmlTag,
  createNewSession,
} from '@/types/generate'

/**
 * 生成向导 Store 类型
 */
interface GenerateStore {
  session: GenerateSession

  // 步骤导航
  setStep: (step: 1 | 2 | 3 | 4) => void
  nextStep: () => void
  prevStep: () => void

  // Step 1: 描述输入
  setDescription: (description: string) => void

  // Step 2: AI 分析
  setAnalysis: (analysis: GenerateSession['analysis']) => void

  // Step 3: 参数调整
  toggleTag: (tag: XmlTag) => void
  setLanguage: (language: 'zh' | 'en') => void
  setOutputStyle: (style: 'professional' | 'friendly' | 'academic') => void
  setIncludeExample: (include: boolean) => void

  // Step 4: 结果
  setResult: (result: GenerateSession['result']) => void

  // 状态控制
  setGenerating: (isGenerating: boolean) => void
  setError: (error: string | null) => void

  // 重置
  resetSession: () => void
}

export const useGenerateStore = create<GenerateStore>((set) => ({
  session: createNewSession(),

  // 设置步骤
  setStep: (step) =>
    set((state) => ({
      session: { ...state.session, currentStep: step },
    })),

  // 下一步（最大为 4）
  nextStep: () =>
    set((state) => ({
      session: {
        ...state.session,
        currentStep: Math.min(4, state.session.currentStep + 1) as 1 | 2 | 3 | 4,
      },
    })),

  // 上一步（最小为 1）
  prevStep: () =>
    set((state) => ({
      session: {
        ...state.session,
        currentStep: Math.max(1, state.session.currentStep - 1) as 1 | 2 | 3 | 4,
      },
    })),

  // 设置用户描述
  setDescription: (description) =>
    set((state) => ({
      session: { ...state.session, userDescription: description },
    })),

  // 设置 AI 分析结果
  setAnalysis: (analysis) =>
    set((state) => ({
      session: {
        ...state.session,
        analysis,
        // 同时更新启用的标签为 AI 建议的标签
        adjustments: analysis
          ? {
              ...state.session.adjustments,
              enabledTags: analysis.suggestedTags,
            }
          : state.session.adjustments,
      },
    })),

  // 切换标签启用状态
  toggleTag: (tag) =>
    set((state) => {
      const currentTags = state.session.adjustments.enabledTags
      // 如果已存在则移除，否则添加
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag]
      return {
        session: {
          ...state.session,
          adjustments: { ...state.session.adjustments, enabledTags: newTags },
        },
      }
    }),

  setLanguage: (language) =>
    set((state) => ({
      session: {
        ...state.session,
        adjustments: { ...state.session.adjustments, language },
      },
    })),

  setOutputStyle: (outputStyle) =>
    set((state) => ({
      session: {
        ...state.session,
        adjustments: { ...state.session.adjustments, outputStyle },
      },
    })),

  setIncludeExample: (includeExample) =>
    set((state) => ({
      session: {
        ...state.session,
        adjustments: { ...state.session.adjustments, includeExample },
      },
    })),

  setResult: (result) =>
    set((state) => ({
      session: { ...state.session, result },
    })),

  setGenerating: (isGenerating) =>
    set((state) => ({
      session: { ...state.session, isGenerating },
    })),

  setError: (error) =>
    set((state) => ({
      session: { ...state.session, error },
    })),

  resetSession: () =>
    set({
      session: createNewSession(),
    }),
}))
```

---

### 5.3 向导步骤组件

#### 5.3.1 Step 1: 输入描述

**src/components/wizard/Step1Input.tsx**：

```typescript
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useGenerateStore } from "@/store/generateStore"

/**
 * 示例描述列表
 */
const EXAMPLE_DESCRIPTIONS = [
  "我需要一个能够分析学术论文、提供代码优化建议、并帮助撰写研究报告的科研助手",
  "创建一个专业的前端开发助手，熟悉 React、Vue、TypeScript",
  "设计一个创意写作助手，能够帮助我构思故事情节和角色",
]

export function Step1Input() {
  // 从 store 获取状态和方法
  const { session, setDescription, nextStep } = useGenerateStore()
  const [localDescription, setLocalDescription] = useState(session.userDescription)

  // 处理继续按钮点击
  const handleContinue = () => {
    if (localDescription.trim()) {
      setDescription(localDescription)  // 保存到 store
      nextStep()                        // 进入下一步
    }
  }

  // 使用示例
  const handleUseExample = (example: string) => {
    setLocalDescription(example)
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-xl font-bold text-white mb-2">
          Step 1: 描述你想要的 AI 角色
        </h2>
        <p className="text-slate-400">
          详细描述你需要的 AI 助手，包括专业领域、核心任务、特殊要求等
        </p>
      </div>

      {/* 输入框 */}
      <textarea
        className="w-full h-40 p-4 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        placeholder="例如：我需要一个能够分析学术论文、提供代码优化建议..."
        value={localDescription}
        onChange={(e) => setLocalDescription(e.target.value)}
      />

      {/* 示例卡片 */}
      <div className="space-y-2">
        <p className="text-sm text-slate-400">或者使用示例：</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_DESCRIPTIONS.map((example, i) => (
            <button
              key={i}
              className="text-left p-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:border-purple-500 transition-colors"
              onClick={() => handleUseExample(example)}
            >
              {example.slice(0, 50)}...
            </button>
          ))}
        </div>
      </div>

      {/* 继续按钮 */}
      <div className="flex justify-end">
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleContinue}
          disabled={!localDescription.trim()}
        >
          开始分析 →
        </Button>
      </div>
    </div>
  )
}
```

#### 5.3.2 Step 2: AI 分析

**src/components/wizard/Step2Analysis.tsx**：

```typescript
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGenerateStore } from "@/store/generateStore"
import { type XmlTag, XML_TAG_INFO } from "@/types/generate"
import { Loader2 } from "lucide-react"

/**
 * 模拟 AI 分析函数
 *
 * 在真实场景中，这里会调用 AI API
 * 目前使用简单的关键词匹配来模拟
 */
function analyzeDescription(description: string): Promise<{
  roleIdentification: string
  taskGoals: string[]
  recommendedTemplates: string[]
  suggestedTags: XmlTag[]
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerDesc = description.toLowerCase()

      let role = "通用助手"
      const goals: string[] = []
      const templates: string[] = []
      let tags: XmlTag[] = ['role', 'task', 'instructions', 'output_format', 'constraints']

      // 根据关键词分析
      if (lowerDesc.includes("科研") || lowerDesc.includes("论文") || lowerDesc.includes("学术")) {
        role = "科研专家助手"
        goals.push("论文分析与解读", "研究方法指导", "学术写作辅助")
        templates.push("模板 E (深度推理型)")
        tags = ['role', 'task', 'thinking', 'instructions', 'output_format', 'constraints']
      }

      if (lowerDesc.includes("代码") || lowerDesc.includes("编程") || lowerDesc.includes("开发")) {
        role = role === "通用助手" ? "代码专家" : role + " + 代码专家"
        goals.push("代码审查与优化", "技术方案设计", "问题诊断与调试")
        templates.push("模板 C (代码/技术任务型)")
        if (!tags.includes('thinking')) tags.push('thinking')
      }

      // ... 更多分析逻辑

      if (goals.length === 0) {
        goals.push("理解用户需求", "提供专业建议", "输出结构化内容")
        templates.push("模板 A (单一任务型)")
      }

      resolve({
        roleIdentification: role,
        taskGoals: goals,
        recommendedTemplates: templates,
        suggestedTags: tags,
      })
    }, 1500) // 模拟 1.5 秒延迟
  })
}

export function Step2Analysis() {
  const { session, setAnalysis, nextStep, prevStep, setGenerating } = useGenerateStore()
  const { userDescription, analysis } = session
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // 组件挂载时自动开始分析
  useEffect(() => {
    if (!analysis && !isAnalyzing) {
      setIsAnalyzing(true)
      setGenerating(true)

      analyzeDescription(userDescription)
        .then((result) => {
          setAnalysis(result)
        })
        .finally(() => {
          setIsAnalyzing(false)
          setGenerating(false)
        })
    }
  }, [userDescription, analysis, isAnalyzing, setAnalysis, setGenerating])

  // 加载状态
  if (isAnalyzing || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-slate-400">AI 正在分析您的描述...</p>
        <p className="text-sm text-slate-500">识别角色定位、任务目标、推荐模板</p>
      </div>
    )
  }

  // 分析完成，显示结果
  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-purple-400 text-lg">🤖</span>
          <span className="text-white font-medium">AI 分析结果</span>
        </div>

        <p className="text-slate-300 mb-4">
          基于您的描述，我建议采用以下设计方案：
        </p>

        <div className="space-y-3">
          {/* 角色定位 */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800 rounded-lg">
            <span className="text-slate-400 mr-2">📋 角色定位：</span>
            <span className="text-white font-medium">{analysis.roleIdentification}</span>
          </div>

          {/* 核心任务 */}
          <div className="p-3 bg-slate-800 rounded-lg">
            <span className="text-slate-400">🎯 核心任务：</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {analysis.taskGoals.map((goal, i) => (
                <Badge key={i} variant="outline" className="border-slate-600">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          {/* 推荐模板 */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800 rounded-lg">
            <span className="text-slate-400 mr-2">🛠️ 推荐模板：</span>
            {analysis.recommendedTemplates.map((template, i) => (
              <Badge key={i} className="bg-purple-600/30 text-purple-300 border-purple-500/30">
                {template}
              </Badge>
            ))}
          </div>

          {/* 建议 XML 标签 */}
          <div className="p-3 bg-slate-800 rounded-lg">
            <span className="text-slate-400">📌 建议包含的 XML 标签：</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {analysis.suggestedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-green-500/50 text-green-400"
                >
                  {`<${tag}>`}
                  <span className="ml-1 text-slate-500 text-xs">
                    {XML_TAG_INFO[tag].label}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          ← 返回修改
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAnalysis(null)}  // 清空分析，触发重新分析
          >
            重新分析
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={nextStep}>
            接受并继续 →
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**关键概念**：

| 概念 | 说明 |
|------|------|
| `useEffect` | 副作用钩子，组件挂载/更新时执行 |
| `useState` | 本地状态钩子 |
| 条件渲染 | 根据 `isAnalyzing` 状态显示不同 UI |
| `Badge` | 徽章组件，显示标签/状态 |

#### 5.3.3 Step 3: 参数调整

**src/components/wizard/Step3Adjust.tsx**：

```typescript
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGenerateStore } from "@/store/generateStore"
import { type XmlTag, XML_TAG_INFO } from "@/types/generate"
import { Check } from "lucide-react"

// 所有可用的 XML 标签
const ALL_TAGS: XmlTag[] = [
  'role', 'task', 'thinking', 'instructions',
  'output_format', 'constraints', 'example'
]

export function Step3Adjust() {
  const {
    session,
    toggleTag,
    setLanguage,
    setOutputStyle,
    nextStep,
    prevStep,
  } = useGenerateStore()

  const { adjustments } = session

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">
          Step 3: 调整生成方案
        </h2>
        <p className="text-slate-400">
          根据需要调整 XML 标签、语言和输出风格
        </p>
      </div>

      {/* XML 标签选择 */}
      <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
        <h3 className="text-white font-medium mb-3">XML 标签选择</h3>
        <div className="grid grid-cols-2 gap-2">
          {ALL_TAGS.map((tag) => {
            const isEnabled = adjustments.enabledTags.includes(tag)
            const info = XML_TAG_INFO[tag]

            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                  isEnabled
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                {/* 选中指示器 */}
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center ${
                    isEnabled
                      ? "bg-purple-500 border-purple-500"
                      : "border-slate-600"
                  }`}
                >
                  {isEnabled && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* 标签信息 */}
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {`<${tag}>`}
                    </Badge>
                    <span className="text-sm text-white">{info.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{info.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 语言选择 */}
      <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
        <h3 className="text-white font-medium mb-3">语言</h3>
        <div className="flex gap-2">
          {[
            { value: 'zh' as const, label: '中文' },
            { value: 'en' as const, label: 'English' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setLanguage(option.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                adjustments.language === option.value
                  ? "border-purple-500 bg-purple-500/10 text-white"
                  : "border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 输出风格 */}
      <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
        <h3 className="text-white font-medium mb-3">输出风格</h3>
        <div className="flex gap-2">
          {[
            { value: 'professional' as const, label: '专业严谨' },
            { value: 'friendly' as const, label: '友好亲切' },
            { value: 'academic' as const, label: '学术规范' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setOutputStyle(option.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                adjustments.outputStyle === option.value
                  ? "border-purple-500 bg-purple-500/10 text-white"
                  : "border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          ← 返回
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={nextStep}>
          生成提示词 →
        </Button>
      </div>
    </div>
  )
}
```

#### 5.3.4 Step 4: 结果展示

**src/components/wizard/Step4Result.tsx**：

```typescript
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useGenerateStore } from "@/store/generateStore"
import { usePromptStore } from "@/store/promptStore"
import { promptsDB } from "@/services/db"
import { generateCliPrompt, generateWebPrompt } from "@/services/promptGenerator"
import { Loader2, Copy, Download, Check, RefreshCw, Save } from "lucide-react"

export function Step4Result() {
  const { session, setResult, prevStep, resetSession, setGenerating } = useGenerateStore()
  const { addPrompt } = usePromptStore()
  const { userDescription, analysis, adjustments, result, isGenerating } = session

  const [activeTab, setActiveTab] = useState<'cli' | 'web'>('cli')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [promptName, setPromptName] = useState('')

  // 组件挂载时自动生成提示词
  useEffect(() => {
    if (!result && analysis && !isGenerating) {
      setGenerating(true)

      // 模拟生成延迟
      setTimeout(() => {
        const cliVersion = generateCliPrompt(userDescription, analysis, adjustments)
        const webVersion = generateWebPrompt(cliVersion)

        setResult({ cliVersion, webVersion })
        setGenerating(false)
      }, 1000)
    }
  }, [result, analysis, adjustments, userDescription, isGenerating, setResult, setGenerating])

  // 复制到剪贴板
  const handleCopy = async () => {
    if (!result) return
    const content = activeTab === 'cli' ? result.cliVersion : result.webVersion
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 下载文件
  const handleDownload = () => {
    if (!result) return
    const content = activeTab === 'cli' ? result.cliVersion : result.webVersion
    const filename = `prompt-${activeTab}-${Date.now()}.md`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // 保存到仓库
  const handleSave = async () => {
    if (!result || !promptName.trim()) return

    try {
      // 保存到 IndexedDB
      const id = await promptsDB.create({
        name: promptName,
        description: userDescription.slice(0, 100),
        category: 'other',
        tags: [],
        cliVersion: result.cliVersion,
        webVersion: result.webVersion,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        isFavorite: false,
      })

      // 同步到 Zustand store
      addPrompt({
        id: String(id),
        name: promptName,
        description: userDescription.slice(0, 100),
        category: 'other',
        tags: [],
        cliVersion: result.cliVersion,
        webVersion: result.webVersion,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        isFavorite: false,
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save prompt:', error)
    }
  }

  // 加载状态
  if (isGenerating || !result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-slate-400">正在生成提示词...</p>
      </div>
    )
  }

  // 显示结果
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">
          Step 4: 生成完成
        </h2>
        <p className="text-slate-400">
          提示词已生成，可以复制、下载或保存到仓库
        </p>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'cli'
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-white"
          }`}
          onClick={() => setActiveTab('cli')}
        >
          CLI 专业版 (XML)
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'web'
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-white"
          }`}
          onClick={() => setActiveTab('web')}
        >
          Web 简明版
        </button>
      </div>

      {/* 内容展示 */}
      <div className="relative">
        <pre className="p-4 bg-slate-900 rounded-lg border border-slate-700 text-sm text-slate-300 overflow-auto max-h-96 whitespace-pre-wrap">
          {activeTab === 'cli' ? result.cliVersion : result.webVersion}
        </pre>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleCopy}>
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
        <Button variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          下载
        </Button>
      </div>

      {/* 保存到仓库 */}
      <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
        <h3 className="text-white font-medium mb-3">保存到仓库</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入提示词名称..."
            className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500"
            value={promptName}
            onChange={(e) => setPromptName(e.target.value)}
          />
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleSave}
            disabled={!promptName.trim() || saved}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                已保存
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                保存
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          ← 返回调整
        </Button>
        <Button variant="outline" onClick={resetSession}>
          <RefreshCw className="w-4 h-4 mr-2" />
          新建提示词
        </Button>
      </div>
    </div>
  )
}
```

---

### 5.4 提示词生成服务

**src/services/promptGenerator.ts**：

```typescript
import { type GenerateSession } from '@/types/generate'

/**
 * 生成 CLI 专业版提示词 (Anthropic XML 格式)
 *
 * @param description - 用户描述
 * @param analysis - AI 分析结果
 * @param adjustments - 用户调整参数
 * @returns CLI 格式的提示词字符串
 */
export function generateCliPrompt(
  description: string,
  analysis: NonNullable<GenerateSession['analysis']>,
  adjustments: GenerateSession['adjustments']
): string {
  const { enabledTags, language, outputStyle } = adjustments
  const { roleIdentification, taskGoals } = analysis

  const sections: string[] = []

  // 风格映射
  const styleMap = {
    professional: { tone: '专业、严谨', manner: '客观分析，逻辑清晰' },
    friendly: { tone: '友好、亲切', manner: '耐心解答，通俗易懂' },
    academic: { tone: '学术、规范', manner: '引经据典，论证严密' },
  }
  const style = styleMap[outputStyle]

  // 根据启用的标签生成对应内容

  // <role> 角色定义
  if (enabledTags.includes('role')) {
    sections.push(`<role>
你是一位${roleIdentification}，具备深厚的专业背景和丰富的实战经验。
你以${style.tone}的风格进行沟通，${style.manner}。
</role>`)
  }

  // <task> 任务声明
  if (enabledTags.includes('task')) {
    const taskList = taskGoals.map(g => `- ${g}`).join('\n')
    sections.push(`<task>
你的任务是帮助用户完成以下目标：
${taskList}

核心需求描述：${description}
</task>`)
  }

  // <thinking> 思考框架
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

  // <instructions> 操作指令
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

  // <output_format> 输出格式
  if (enabledTags.includes('output_format')) {
    sections.push(`<output_format>
- 使用 Markdown 格式进行排版
- 重要信息使用**加粗**标注
- 代码使用 \`代码块\` 包裹
- 对比信息使用表格呈现
- 步骤说明使用有序列表
</output_format>`)
  }

  // <constraints> 约束条件
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

  // <example> 示例
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
 *
 * 转换规则：
 * - <role> → "你将扮演'角色名'，..."
 * - <task> → "目的与目标：" + 星号列表
 * - <instructions> → "行为准则：" + 编号列表
 * - <thinking> → 简化为一行
 * - 移除 XML 标签，使用自然语言
 */
export function generateWebPrompt(cliPrompt: string): string {
  const sections: string[] = []

  // 提取 <role> 内容
  const roleMatch = cliPrompt.match(/<role>([\s\S]*?)<\/role>/)
  if (roleMatch) {
    const roleContent = roleMatch[1].trim()
    const roleNameMatch = roleContent.match(/你是一位(.+?)，/)
    const roleName = roleNameMatch ? roleNameMatch[1] : '专业助手'
    sections.push(`你将扮演'${roleName}'，${roleContent.replace(/你是一位.+?，/, '')}`)
  }

  // 提取 <task> 内容
  const taskMatch = cliPrompt.match(/<task>([\s\S]*?)<\/task>/)
  if (taskMatch) {
    const taskContent = taskMatch[1].trim()
    const formattedTask = taskContent
      .split('\n')
      .map(line => {
        line = line.trim()
        if (line.startsWith('-')) {
          return '*' + line.slice(1)  // 将 - 转换为 *
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
    const lines = instructionsContent.split('\n').filter(l => l.trim())
    const formatted = lines.map((line, i) => {
      line = line.trim()
      if (/^\d+\./.test(line)) {
        return line.replace(/^(\d+)\./, '$1)')  // 1. → 1)
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
    const langMatch = constraintsContent.match(/使用(.+?)回复/)
    const styleMatch = constraintsContent.match(/保持(.+?)的沟通风格/)
    const lang = langMatch ? langMatch[1] : '简体中文'
    const style = styleMatch ? styleMatch[1] : '专业'
    sections.push(`语言与态度：\n使用${lang}回复，保持${style}的沟通风格。`)
  }

  return sections.join('\n\n')
}

/**
 * 将 Web 格式转换为 CLI 格式（反向转换）
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
      .replace(/^\*/gm, '-')  // * → -
    sections.push(`<task>\n你的任务是帮助用户完成以下目标：\n${taskContent}\n</task>`)
  }

  // 尝试提取行为准则
  const instructionsMatch = webPrompt.match(/行为准则[：:]([\s\S]*?)(?=\n\n|输出格式|$)/)
  if (instructionsMatch) {
    const instructionsContent = instructionsMatch[1].trim()
      .replace(/^(\d+)\)/gm, '$1.')  // 1) → 1.
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
```

---

### 5.5 组件导出

**src/components/wizard/index.ts**：

```typescript
/**
 * 统一导出向导组件
 *
 * 这样可以通过一行 import 导入所有组件：
 * import { Step1Input, Step2Analysis, ... } from '@/components/wizard'
 */
export { Step1Input } from './Step1Input'
export { Step2Analysis } from './Step2Analysis'
export { Step3Adjust } from './Step3Adjust'
export { Step4Result } from './Step4Result'
```

---

### 5.6 创建页面（整合向导）

**src/pages/Create/index.tsx**：

```typescript
import { useGenerateStore } from "@/store/generateStore"
import { Step1Input, Step2Analysis, Step3Adjust, Step4Result } from "@/components/wizard"

/**
 * 创建提示词页面
 *
 * 根据当前步骤显示对应的向导组件
 */
export function Create() {
  const { session } = useGenerateStore()
  const currentStep = session.currentStep

  return (
    <div className="max-w-3xl mx-auto">
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            {/* 步骤圆圈 */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep
                  ? "bg-purple-600 text-white"
                  : step < currentStep
                  ? "bg-purple-600/30 text-purple-300"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              {step}
            </div>
            {/* 连接线 */}
            {step < 4 && (
              <div
                className={`w-16 h-0.5 ${
                  step < currentStep ? "bg-purple-600/30" : "bg-slate-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* 根据步骤渲染对应组件 */}
      {currentStep === 1 && <Step1Input />}
      {currentStep === 2 && <Step2Analysis />}
      {currentStep === 3 && <Step3Adjust />}
      {currentStep === 4 && <Step4Result />}
    </div>
  )
}
```

---

## 六、常见问题与解决方案

### 6.1 Tailwind CSS v4 vs v3 问题

**问题**：安装 Tailwind CSS 后无法初始化配置文件

**原因**：Tailwind CSS v4 改变了 CLI 结构，`npx tailwindcss init` 命令不可用

**解决方案**：

```bash
# 删除已安装的包
rm -rf node_modules package-lock.json

# 明确安装 v3 版本
npm install -D tailwindcss@3 postcss autoprefixer

# 初始化配置
npx tailwindcss init -p
```

### 6.2 路径别名不生效

**问题**：`@/components/...` 导入报错

**解决方案**：确保同时配置了 `tsconfig.json` 和 `vite.config.ts`：

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```typescript
// vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### 6.3 类型错误

**问题**：TypeScript 报错 `Cannot find module '@/...'`

**解决方案**：重启 VS Code 或 TypeScript 服务

```
Ctrl+Shift+P → TypeScript: Restart TS Server
```

---

## 七、参考资源

### 官方文档

| 技术 | 文档地址 |
|------|----------|
| React | [react.dev](https://react.dev/) |
| TypeScript | [typescriptlang.org](https://www.typescriptlang.org/) |
| Vite | [vitejs.dev](https://vitejs.dev/) |
| Tailwind CSS | [tailwindcss.com](https://tailwindcss.com/) |
| shadcn/ui | [ui.shadcn.com](https://ui.shadcn.com/) |
| React Router | [reactrouter.com](https://reactrouter.com/) |
| Zustand | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) |
| Dexie.js | [dexie.org](https://dexie.org/) |
| Lucide Icons | [lucide.dev](https://lucide.dev/) |
| Vercel AI SDK | [sdk.vercel.ai](https://sdk.vercel.ai/) |

### 学习资源

- [React 官方教程](https://react.dev/learn)
- [Tailwind CSS 入门](https://tailwindcss.com/docs/utility-first)
- [TypeScript 手册](https://www.typescriptlang.org/docs/handbook/)

---

## 附录：完整文件清单

| 文件路径 | 作用 |
|----------|------|
| `package.json` | 项目依赖配置 |
| `vite.config.ts` | Vite 构建配置 |
| `tailwind.config.js` | Tailwind CSS 配置 |
| `tsconfig.json` | TypeScript 配置 |
| `components.json` | shadcn/ui 配置 |
| `src/index.css` | 全局样式 |
| `src/main.tsx` | 渲染入口 |
| `src/App.tsx` | 应用入口 + 路由 |
| `src/lib/utils.ts` | 工具函数 |
| `src/types/generate.ts` | 类型定义 |
| `src/store/modelStore.ts` | 模型状态管理 |
| `src/store/promptStore.ts` | 提示词状态管理 |
| `src/store/generateStore.ts` | 向导状态管理 |
| `src/services/db.ts` | 数据库服务 |
| `src/services/promptGenerator.ts` | 提示词生成服务 |
| `src/components/ui/*.tsx` | UI 基础组件 |
| `src/components/layout/*.tsx` | 布局组件 |
| `src/components/wizard/*.tsx` | 向导组件 |
| `src/pages/*.tsx` | 页面组件 |

---

*文档版本：1.0.0*
*最后更新：2025-01-29*
