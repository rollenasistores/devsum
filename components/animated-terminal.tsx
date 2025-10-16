"use client"

import { useEffect, useState } from "react"

interface TerminalLine {
  text: string
  delay: number
  className?: string
  isLoading?: boolean
}

const terminalSequence: TerminalLine[] = [
  // ASCII Art Logo - COMMIT
  { text: "  ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗████████╗", delay: 0, className: "text-primary font-bold" },
  { text: " ██╔═══██╗██╔═══██╗████╗ ████║████╗ ████║██║╚══██╔══╝", delay: 50, className: "text-primary font-bold" },
  { text: " ██║   ██║██║   ██║██╔████╔██║██╔████╔██║██║   ██║   ", delay: 50, className: "text-primary font-bold" },
  { text: " ██║   ██║██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║   ", delay: 50, className: "text-primary font-bold" },
  { text: " ╚██████╔╝╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║   ██║   ", delay: 50, className: "text-primary font-bold" },
  { text: "  ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝   ╚═╝   ", delay: 50, className: "text-primary font-bold" },
  { text: "", delay: 100 },
  { text: "          AI-Powered Commit Message Generator", delay: 200, className: "text-center text-muted-foreground" },
  { text: "═══════════════════════════════════════════════════════", delay: 100, className: "text-border" },
  { text: "", delay: 200 },

  // Loading sequence
  { text: "⏳ Loading configuration...", delay: 400, isLoading: true },
  { text: "✅ Using AI provider: gemini (gemini-2.0-flash)", delay: 600, className: "text-accent" },
  { text: "⏳ Checking git repository...", delay: 400, isLoading: true },
  { text: "✅ Git repository verified", delay: 600, className: "text-accent" },
  { text: "⏳ Getting branch information...", delay: 400, isLoading: true },
  { text: "", delay: 300 },

  // Branch info
  { text: "═══════════════════════════════════════════════════════", delay: 100, className: "text-border" },
  { text: "🌿 Branch Information", delay: 200, className: "text-primary font-semibold" },
  { text: "", delay: 100 },
  { text: "Current Branch: main", delay: 200 },
  { text: "Last Commit: a7f3c21 Update user profile UI", delay: 200, className: "text-muted-foreground" },
  { text: "", delay: 100 },
  { text: "Status:", delay: 200 },
  { text: "   ⚠️  Has unstaged changes", delay: 200, className: "text-yellow-500" },
  { text: "═══════════════════════════════════════════════════════", delay: 100, className: "text-border" },
  { text: "", delay: 300 },

  // Changes detection
  { text: "📁 Unstaged changes detected:", delay: 300, className: "text-primary" },
  { text: "   Modified: src/auth/middleware.ts", delay: 200, className: "text-yellow-500" },
  { text: "   Modified: src/components/LoginForm.tsx", delay: 200, className: "text-yellow-500" },
  { text: "   New files: src/lib/jwt.ts", delay: 200, className: "text-accent" },
  { text: "   New files: src/hooks/useAuth.ts", delay: 200, className: "text-accent" },
  { text: "   New files: tests/auth.test.ts", delay: 200, className: "text-accent" },
  { text: "⏳ Adding all changes...", delay: 400, isLoading: true },
  { text: "✅ All changes added to staging", delay: 600, className: "text-accent" },
  { text: "⏳ Analyzing staged changes...", delay: 400, isLoading: true },
  { text: "✅ Found 5 staged files", delay: 600, className: "text-accent" },
  { text: "", delay: 300 },

  // Changes analysis
  { text: "═══════════════════════════════════════════════════════", delay: 100, className: "text-border" },
  { text: "📊 Changes Analysis", delay: 200, className: "text-primary font-semibold" },
  { text: "", delay: 100 },
  { text: "📁 Staged Files: 5", delay: 200 },
  { text: "   • src/auth/middleware.ts", delay: 150, className: "text-muted-foreground" },
  { text: "   • src/components/LoginForm.tsx", delay: 150, className: "text-muted-foreground" },
  { text: "   • src/lib/jwt.ts", delay: 150, className: "text-muted-foreground" },
  { text: "   • src/hooks/useAuth.ts", delay: 150, className: "text-muted-foreground" },
  { text: "   • tests/auth.test.ts", delay: 150, className: "text-muted-foreground" },
  { text: "📝 Modified Files: 2", delay: 200 },
  { text: "   • src/auth/middleware.ts (+45 -12)", delay: 150, className: "text-muted-foreground" },
  { text: "   • src/components/LoginForm.tsx (+28 -8)", delay: 150, className: "text-muted-foreground" },
  { text: "➕ Added Files: 3", delay: 200 },
  { text: "   • src/lib/jwt.ts (+87)", delay: 150, className: "text-muted-foreground" },
  { text: "   • src/hooks/useAuth.ts (+124)", delay: 150, className: "text-muted-foreground" },
  { text: "   • tests/auth.test.ts (+156)", delay: 150, className: "text-muted-foreground" },
  { text: "", delay: 100 },
  { text: "📈 Total Changes: +440 -20", delay: 200, className: "text-accent" },
  { text: "═══════════════════════════════════════════════════════", delay: 100, className: "text-border" },
  { text: "", delay: 400 },

  // AI Analysis
  { text: "🤖 AI Analysis in Progress...", delay: 300, className: "text-primary font-semibold" },
  { text: "   Provider: GEMINI", delay: 200, className: "text-muted-foreground" },
  { text: "   Model: gemini-2.0-flash", delay: 200, className: "text-muted-foreground" },
  { text: "   Analyzing changes and generating commit message...", delay: 300, className: "text-muted-foreground" },
  { text: "", delay: 200 },
  { text: "⏳ Analyzing code changes...", delay: 600, isLoading: true },
  { text: "⏳ Understanding context and impact...", delay: 600, isLoading: true },
  { text: "✅ AI analysis complete", delay: 800, className: "text-accent" },
  { text: "", delay: 300 },

  // Auto workflow
  { text: "🚀 Starting Auto Workflow...", delay: 300, className: "text-primary font-semibold" },
  { text: "", delay: 200 },
  { text: "⏳ 🤖 Generating branch name...", delay: 400, isLoading: true },
  { text: "✅ Generated branch: feature/jwt-authentication-system", delay: 600, className: "text-accent" },
  { text: "⏳ Creating branch: feature/jwt-authentication-system...", delay: 400, isLoading: true },
  { text: "✅ Switched to branch: feature/jwt-authentication-system", delay: 600, className: "text-accent" },
  { text: "⏳ 🤖 Generating commit message...", delay: 400, isLoading: true },
  { text: "✅ Commit message generated", delay: 600, className: "text-accent" },
  { text: "", delay: 400 },

  // Generated commit message
  { text: "═══════════════════════════════════════════════════════", delay: 100, className: "text-border" },
  { text: "💬 Generated Commit Message", delay: 200, className: "text-primary font-semibold" },
  { text: "", delay: 100 },
  { text: "📝 Message:", delay: 200 },
  { text: "┌─────────────────────────────────────────────────────┐", delay: 100, className: "text-border" },
  {
    text: "│ feat: Implement JWT-based authentication system    │",
    delay: 200,
    className: "text-accent font-semibold",
  },
  { text: "│                                                     │", delay: 50 },
  { text: "│ Add comprehensive JWT authentication with:         │", delay: 150, className: "text-muted-foreground" },
  { text: "│                                                     │", delay: 50 },
  { text: "│ - JWT token generation and validation utilities    │", delay: 150, className: "text-muted-foreground" },
  { text: "│ - Custom useAuth hook for auth state management    │", delay: 150, className: "text-muted-foreground" },
  { text: "│ - Enhanced middleware with token verification       │", delay: 150, className: "text-muted-foreground" },
  { text: "│ - Updated LoginForm with improved error handling   │", delay: 150, className: "text-muted-foreground" },
  { text: "│ - Comprehensive test suite for auth flows          │", delay: 150, className: "text-muted-foreground" },
  { text: "│                                                     │", delay: 50 },
  { text: "│ This implementation provides secure, token-based   │", delay: 150, className: "text-muted-foreground" },
  { text: "│ authentication with automatic token refresh and     │", delay: 150, className: "text-muted-foreground" },
  { text: "│ proper session management.                          │", delay: 150, className: "text-muted-foreground" },
  { text: "└─────────────────────────────────────────────────────┘", delay: 100, className: "text-border" },
  { text: "", delay: 300 },

  // Final steps
  { text: "⏳ Committing changes...", delay: 400, isLoading: true },
  { text: "✅ Changes committed successfully", delay: 600, className: "text-accent" },
  { text: "", delay: 200 },
  { text: "🎉 Commit completed!", delay: 300, className: "text-primary font-semibold" },
  { text: "   Branch: feature/jwt-authentication-system", delay: 200, className: "text-muted-foreground" },
  { text: "   Files: 5 files changed", delay: 200, className: "text-muted-foreground" },
  { text: "   Changes: +440 -20 lines", delay: 200, className: "text-muted-foreground" },
  { text: "⏳ Pushing to remote...", delay: 400, isLoading: true },
  { text: "✅ Changes pushed to origin/feature/jwt-authentication-system", delay: 600, className: "text-accent" },
  { text: "", delay: 200 },
  { text: "🚀 All done! Ready to create pull request.", delay: 300, className: "text-accent font-semibold" },
]

export function AnimatedTerminal() {
  const [displayedLines, setDisplayedLines] = useState<TerminalLine[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex >= terminalSequence.length) {
      // Reset animation after completion
      const resetTimer = setTimeout(() => {
        setDisplayedLines([])
        setCurrentIndex(0)
      }, 3000)
      return () => clearTimeout(resetTimer)
    }

    const currentLine = terminalSequence[currentIndex]
    const timer = setTimeout(() => {
      setDisplayedLines((prev) => [...prev, currentLine])
      setCurrentIndex((prev) => prev + 1)
    }, currentLine.delay)

    return () => clearTimeout(timer)
  }, [currentIndex])

  return (
    <div className="h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      <div className="space-y-1 font-mono text-xs leading-relaxed">
        {displayedLines.map((line, index) => (
          <div
            key={index}
            className={`animate-in fade-in slide-in-from-left-2 duration-200 ${line.className || "text-foreground"}`}
          >
            {line.text || "\u00A0"}
          </div>
        ))}
        {currentIndex < terminalSequence.length && <div className="inline-block h-4 w-2 animate-pulse bg-primary" />}
      </div>
    </div>
  )
}
