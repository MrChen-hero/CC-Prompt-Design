import { cn } from "@/lib/utils"
import { Settings, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title?: string
  className?: string
}

export function Header({ title = "Prompt Designer", className }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between h-14 px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur",
        className
      )}
    >
      {/* Title */}
      <h1 className="text-lg font-semibold text-white">{title}</h1>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <HelpCircle className="w-5 h-5" />
        </Button>

        {/* User Avatar */}
        <div className="flex items-center justify-center w-8 h-8 ml-2 rounded-full bg-purple-600">
          <span className="text-sm font-medium text-white">P</span>
        </div>
      </div>
    </header>
  )
}
