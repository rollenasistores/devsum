import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/ui/code-block"

export function CommandReference() {
  return (
    <section id="commands" className="border-b border-border bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Command reference</h2>
          <p className="mt-4 text-lg text-muted-foreground">Complete guide to all available commands and options</p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analyze">analyze</TabsTrigger>
              <TabsTrigger value="config">config</TabsTrigger>
              <TabsTrigger value="export">export</TabsTrigger>
              <TabsTrigger value="help">help</TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="mt-6 space-y-4">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-semibold text-card-foreground">devsum analyze</h3>
                <p className="mt-2 text-sm text-muted-foreground">Analyze git commits and generate a summary report</p>
              </div>
              <CodeBlock
                code={`# Basic usage
devsum analyze

# Custom date range
devsum analyze --since="2024-01-01" --until="2024-12-31"

# Filter by author
devsum analyze --author="john@example.com"

# Specify output format
devsum analyze --format=pdf --output=report.pdf`}
                language="bash"
              />
            </TabsContent>

            <TabsContent value="config" className="mt-6 space-y-4">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-semibold text-card-foreground">devsum config</h3>
                <p className="mt-2 text-sm text-muted-foreground">Configure AI provider and default settings</p>
              </div>
              <CodeBlock
                code={`# Set AI provider
devsum config set provider claude

# Set API key
devsum config set apiKey sk-...

# View current config
devsum config list`}
                language="bash"
              />
            </TabsContent>

            <TabsContent value="export" className="mt-6 space-y-4">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-semibold text-card-foreground">devsum export</h3>
                <p className="mt-2 text-sm text-muted-foreground">Export existing analysis to different formats</p>
              </div>
              <CodeBlock
                code={`# Export to PDF
devsum export --format=pdf --input=report.json

# Export to HTML
devsum export --format=html --input=report.json`}
                language="bash"
              />
            </TabsContent>

            <TabsContent value="help" className="mt-6 space-y-4">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-semibold text-card-foreground">devsum help</h3>
                <p className="mt-2 text-sm text-muted-foreground">Display help information for any command</p>
              </div>
              <CodeBlock
                code={`# General help
devsum help

# Command-specific help
devsum help analyze`}
                language="bash"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
