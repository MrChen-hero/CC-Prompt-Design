import { cn } from "@/lib/utils"
import {
  Home,
  Plus,
  Library,
  RefreshCw,
  Settings,
  Sparkles
} from "lucide-react"
import { NavLink } from "react-router-dom"

interface SidebarProps {
  className?: string
}

const navItems = [
  { icon: Home, label: "首页", path: "/" },
  { icon: Plus, label: "新建", path: "/create" },
  { icon: Library, label: "仓库", path: "/library" },
  { icon: RefreshCw, label: "转换", path: "/convert" },
  { icon: Settings, label: "设置", path: "/settings" },
]

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col w-16 bg-slate-900 border-r border-slate-800",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-slate-800">
        <Sparkles className="w-8 h-8 text-purple-500" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors",
                "hover:bg-slate-800 group",
                isActive
                  ? "bg-purple-600/20 text-purple-400"
                  : "text-slate-400 hover:text-slate-200"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] mt-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-slate-800">
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-slate-800">
          <span className="text-sm font-medium text-slate-300">A</span>
        </div>
      </div>
    </aside>
  )
}
