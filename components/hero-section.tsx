import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Terminal, Github, ArrowRight } from "lucide-react"
import { TerminalWindow } from "@/components/ui/terminal-window"
import { AnimatedTerminal } from "@/components/animated-terminal"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 gap-2">
            <Terminal className="h-3 w-3" />
            <span className="font-mono text-xs">v1.0.0</span>
          </Badge>

          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl text-balance">
            Transform Git Commits into <span className="text-primary">Professional Reports</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
            DevSum CLI uses AI to analyze your git history and generate polished accomplishment summaries. Perfect for
            performance reviews, sprint reports, and project updates.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/docs">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent" asChild>
              <Link href="https://github.com/rollenasistores/devsum" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <TerminalWindow>
            <AnimatedTerminal />
          </TerminalWindow>
        </div>
      </div>
    </section>
  )
}
