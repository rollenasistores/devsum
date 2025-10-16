import type { ReactNode } from "react"

interface TerminalWindowProps {
  children: ReactNode
}

export function TerminalWindow({ children }: TerminalWindowProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
      <div className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-destructive" />
        <div className="h-3 w-3 rounded-full bg-chart-4" />
        <div className="h-3 w-3 rounded-full bg-accent" />
        <span className="ml-2 text-xs text-muted-foreground">terminal</span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}
