import { Card } from "@/components/ui/card"
import { Terminal, Zap, Shield, Sparkles } from "lucide-react"
import { CodeBlock } from "@/components/ui/code-block"

export function GettingStarted() {
  return (
    <section id="getting-started" className="scroll-mt-20">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Getting Started</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            DevSum CLI is an AI-powered tool that transforms your git commits into professional accomplishment reports.
            Get started in minutes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <Terminal className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">CLI First</h3>
            <p className="text-sm text-muted-foreground">Works directly in your terminal</p>
          </Card>
          <Card className="p-4">
            <Zap className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Fast Setup</h3>
            <p className="text-sm text-muted-foreground">Install and configure in seconds</p>
          </Card>
          <Card className="p-4">
            <Shield className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Secure</h3>
            <p className="text-sm text-muted-foreground">Your code never leaves your machine</p>
          </Card>
          <Card className="p-4">
            <Sparkles className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">Multiple AI providers supported</p>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Quick Start</h2>
          <p className="text-muted-foreground">
            Install DevSum CLI globally and start generating professional commit messages in seconds.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Install DevSum CLI</h3>
              <CodeBlock language="bash" code="npm install -g @rollenasistores/devsum" />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2. Configure AI Provider</h3>
              <CodeBlock
                language="bash"
                code={`# Set your API key (example with Gemini)
export GEMINI_API_KEY="your-api-key-here"

# Or use the config command
devsum config set provider gemini
devsum config set apiKey your-api-key-here`}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3. Generate Your First Commit</h3>
              <CodeBlock
                language="bash"
                code={`# Navigate to your git repository
cd your-project

# Run devsum commit
devsum commit

# Or use the auto workflow
devsum commit --auto`}
              />
            </div>
          </div>
        </div>

        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Pro Tip
          </h3>
          <p className="text-muted-foreground">
            Use the <code className="px-2 py-1 rounded bg-muted">--auto</code> flag to automatically create a branch,
            generate a commit message, commit, and push in one command.
          </p>
        </Card>
      </div>
    </section>
  )
}
