import { Card } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export function Configuration() {
  return (
    <section id="configuration" className="scroll-mt-20">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>
          <p className="mt-4 text-muted-foreground">Configure DevSum CLI to match your workflow and preferences.</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Configuration File</h3>
          <p className="text-muted-foreground">
            DevSum CLI looks for a <code>.devsumrc.json</code> file in your project root or home directory.
          </p>
          <CodeBlock
            language="json"
            code={`{
  "provider": "gemini",
  "model": "gemini-2.0-flash",
  "outputFormat": "markdown",
  "autoCommit": false,
  "autoPush": false,
  "branchPrefix": "feature/",
  "commitStyle": "conventional",
  "maxTokens": 2000,
  "temperature": 0.7
}`}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Configuration Options</h3>
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">provider</h4>
              <p className="text-sm text-muted-foreground mb-2">
                AI provider to use: <code>gemini</code>, <code>claude</code>, or <code>openai</code>
              </p>
              <CodeBlock language="bash" code="devsum config set provider gemini" />
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2">model</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Specific model to use (e.g., <code>gemini-2.0-flash</code>, <code>claude-3-5-sonnet</code>)
              </p>
              <CodeBlock language="bash" code="devsum config set model gemini-2.0-flash" />
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2">outputFormat</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Output format: <code>markdown</code>, <code>json</code>, <code>html</code>, or <code>pdf</code>
              </p>
              <CodeBlock language="bash" code="devsum config set outputFormat markdown" />
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2">commitStyle</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Commit message style: <code>conventional</code>, <code>semantic</code>, or <code>custom</code>
              </p>
              <CodeBlock language="bash" code="devsum config set commitStyle conventional" />
            </Card>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Environment variables take precedence over configuration file settings. Use <code>DEVSUM_PROVIDER</code>,{" "}
            <code>GEMINI_API_KEY</code>, etc.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Environment Variables</h3>
          <CodeBlock
            language="bash"
            code={`# AI Provider API Keys
export GEMINI_API_KEY="your-gemini-key"
export ANTHROPIC_API_KEY="your-claude-key"
export OPENAI_API_KEY="your-openai-key"

# Configuration overrides
export DEVSUM_PROVIDER="gemini"
export DEVSUM_MODEL="gemini-2.0-flash"
export DEVSUM_OUTPUT_FORMAT="markdown"`}
          />
        </div>
      </div>
    </section>
  )
}
