import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { cn } from "@/lib/utils"

interface LayoutProps {
  className?: string
}

export function Layout({ className }: LayoutProps) {
  return (
    <div className={cn("flex h-screen bg-background", className)}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>

        {/* Status bar */}
        <footer className="flex items-center justify-between h-8 px-4 text-xs border-t border-slate-800 bg-slate-900/50 text-slate-500">
          <div className="flex items-center gap-4">
            <span>模型：Claude 3.5 Sonnet</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              API 状态：已连接
            </span>
          </div>
          <span>Prompt Designer v0.1.0</span>
        </footer>
      </div>
    </div>
  )
}
