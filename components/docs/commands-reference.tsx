import { Card } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { Badge } from "@/components/ui/badge"

const commands = [
  {
    name: "devsum commit",
    description: "Generate and create a commit with AI-generated message",
    flags: [
      { flag: "--auto", description: "Auto workflow: create branch, commit, and push" },
      { flag: "--no-verify", description: "Skip git hooks" },
      { flag: "--amend", description: "Amend the last commit" },
      { flag: "--push", description: "Automatically push after commit" },
    ],
    example: "devsum commit --auto",
  },
  {
    name: "devsum analyze",
    description: "Analyze git history and generate accomplishment report",
    flags: [
      { flag: "--since <date>", description: "Start date for analysis (e.g., '2024-01-01')" },
      { flag: "--until <date>", description: "End date for analysis" },
      { flag: "--author <name>", description: "Filter by author" },
      { flag: "--branch <name>", description: "Analyze specific branch" },
      { flag: "--output <file>", description: "Save report to file" },
    ],
    example: "devsum analyze --since 2024-01-01 --output report.md",
  },
  {
    name: "devsum report",
    description: "Generate formatted report from git history",
    flags: [
      { flag: "--format <type>", description: "Output format: markdown, json, html, pdf" },
      { flag: "--template <name>", description: "Use custom template" },
      { flag: "--group-by <field>", description: "Group commits by: date, author, type" },
    ],
    example: "devsum report --format pdf --group-by type",
  },
  {
    name: "devsum config",
    description: "Manage configuration settings",
    flags: [
      { flag: "set <key> <value>", description: "Set configuration value" },
      { flag: "get <key>", description: "Get configuration value" },
      { flag: "list", description: "List all configuration" },
      { flag: "reset", description: "Reset to default configuration" },
    ],
    example: "devsum config set provider gemini",
  },
  {
    name: "devsum init",
    description: "Initialize DevSum CLI in current repository",
    flags: [
      { flag: "--provider <name>", description: "Set AI provider during init" },
      { flag: "--interactive", description: "Interactive setup wizard" },
    ],
    example: "devsum init --interactive",
  },
]

export function CommandsReference() {
  return (
    <section id="commands" className="scroll-mt-20">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Commands Reference</h2>
          <p className="mt-4 text-muted-foreground">
            Complete reference for all DevSum CLI commands and their options.
          </p>
        </div>

        <div className="space-y-6">
          {commands.map((command) => (
            <Card key={command.name} className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <code className="text-lg font-semibold text-primary">{command.name}</code>
                    <Badge variant="secondary">Command</Badge>
                  </div>
                  <p className="text-muted-foreground">{command.description}</p>
                </div>

                {command.flags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Flags & Options</h4>
                    <div className="space-y-2">
                      {command.flags.map((flag) => (
                        <div key={flag.flag} className="flex gap-4 text-sm">
                          <code className="text-accent shrink-0 font-mono">{flag.flag}</code>
                          <span className="text-muted-foreground">{flag.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Example</h4>
                  <CodeBlock language="bash" code={command.example} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
