import { CodeBlock } from "@/components/ui/code-block"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function InstallationSection() {
  return (
    <section id="installation" className="border-b border-border bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Get started in seconds</h2>
          <p className="mt-4 text-lg text-muted-foreground">Install DevSum CLI with your favorite package manager</p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <Tabs defaultValue="npm" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="npm">npm</TabsTrigger>
              <TabsTrigger value="yarn">yarn</TabsTrigger>
              <TabsTrigger value="pnpm">pnpm</TabsTrigger>
            </TabsList>
            <TabsContent value="npm" className="mt-6">
              <CodeBlock code="npm install -g @rollenasistores/devsum" language="bash" />
            </TabsContent>
            <TabsContent value="yarn" className="mt-6">
              <CodeBlock code="yarn global add @rollenasistores/devsum" language="bash" />
            </TabsContent>
            <TabsContent value="pnpm" className="mt-6">
              <CodeBlock code="pnpm add -g @rollenasistores/devsum" language="bash" />
            </TabsContent>
          </Tabs>

          <Card className="mt-8 border-border bg-card p-6">
            <h3 className="font-semibold text-card-foreground">Requirements</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Node.js 18.0 or higher
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Git 2.0 or higher
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                API key for your preferred AI provider (Claude, OpenAI, or Gemini)
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  )
}
