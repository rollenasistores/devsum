import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Terminal, Github, BookOpen } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">DevSum CLI</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/docs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Documentation
          </Link>
          <Link
            href="/#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#examples"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Examples
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="https://github.com/rollenasistores/devsum" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/docs">
              <BookOpen className="h-4 w-4 mr-2" />
              Get Started
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
