import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { CheckCircle2 } from "lucide-react"

export function Installation() {
  return (
    <section id="installation" className="scroll-mt-20">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Installation</h2>
          <p className="mt-4 text-muted-foreground">Choose your preferred package manager to install DevSum CLI.</p>
        </div>

        <Tabs defaultValue="npm" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="npm">npm</TabsTrigger>
            <TabsTrigger value="yarn">Yarn</TabsTrigger>
            <TabsTrigger value="pnpm">pnpm</TabsTrigger>
          </TabsList>
          <TabsContent value="npm" className="space-y-4">
            <CodeBlock language="bash" code="npm install -g @rollenasistores/devsum" />
            <p className="text-sm text-muted-foreground">
              Install globally to use the <code>devsum</code> command from anywhere.
            </p>
          </TabsContent>
          <TabsContent value="yarn" className="space-y-4">
            <CodeBlock language="bash" code="yarn global add @rollenasistores/devsum" />
            <p className="text-sm text-muted-foreground">
              Install globally with Yarn to access the CLI from any directory.
            </p>
          </TabsContent>
          <TabsContent value="pnpm" className="space-y-4">
            <CodeBlock language="bash" code="pnpm add -g @rollenasistores/devsum" />
            <p className="text-sm text-muted-foreground">
              Use pnpm for faster installation and better disk space efficiency.
            </p>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">System Requirements</h3>
          <Card className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>Node.js 18+</strong>
                  <p className="text-sm text-muted-foreground">Required for running the CLI</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>Git 2.0+</strong>
                  <p className="text-sm text-muted-foreground">For repository analysis</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>AI Provider API Key</strong>
                  <p className="text-sm text-muted-foreground">Gemini, Claude, or OpenAI</p>
                </div>
              </li>
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Verify Installation</h3>
          <CodeBlock
            language="bash"
            code={`# Check version
devsum --version

# View help
devsum --help`}
          />
        </div>
      </div>
    </section>
  )
}
