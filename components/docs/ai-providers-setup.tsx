import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AIProvidersSetup() {
  return (
    <section id="ai-providers" className="scroll-mt-20">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Providers Setup</h2>
          <p className="mt-4 text-muted-foreground">
            DevSum CLI supports multiple AI providers. Choose the one that best fits your needs.
          </p>
        </div>

        <Tabs defaultValue="gemini" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="gemini">Gemini</TabsTrigger>
            <TabsTrigger value="claude">Claude</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
          </TabsList>

          <TabsContent value="gemini" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Google Gemini</h3>
              <p className="text-muted-foreground mb-4">
                Fast, cost-effective, and powerful. Recommended for most users.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Get API Key</h4>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                      Get Gemini API Key
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. Configure DevSum</h4>
                  <CodeBlock
                    language="bash"
                    code={`export GEMINI_API_KEY="your-api-key-here"
devsum config set provider gemini
devsum config set model gemini-2.0-flash`}
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Available Models</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>
                      <code>gemini-2.0-flash</code> - Fast and efficient (recommended)
                    </li>
                    <li>
                      <code>gemini-1.5-pro</code> - More capable, slower
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="claude" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Anthropic Claude</h3>
              <p className="text-muted-foreground mb-4">
                Excellent reasoning and detailed analysis. Great for complex codebases.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Get API Key</h4>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">
                      Get Claude API Key
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. Configure DevSum</h4>
                  <CodeBlock
                    language="bash"
                    code={`export ANTHROPIC_API_KEY="your-api-key-here"
devsum config set provider claude
devsum config set model claude-3-5-sonnet`}
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Available Models</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>
                      <code>claude-3-5-sonnet</code> - Best balance (recommended)
                    </li>
                    <li>
                      <code>claude-3-opus</code> - Most capable
                    </li>
                    <li>
                      <code>claude-3-haiku</code> - Fastest and cheapest
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="openai" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">OpenAI</h3>
              <p className="text-muted-foreground mb-4">
                Industry standard with excellent performance. Widely used and reliable.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Get API Key</h4>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                      Get OpenAI API Key
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. Configure DevSum</h4>
                  <CodeBlock
                    language="bash"
                    code={`export OPENAI_API_KEY="your-api-key-here"
devsum config set provider openai
devsum config set model gpt-4-turbo`}
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Available Models</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>
                      <code>gpt-4-turbo</code> - Best performance (recommended)
                    </li>
                    <li>
                      <code>gpt-4</code> - Standard GPT-4
                    </li>
                    <li>
                      <code>gpt-3.5-turbo</code> - Faster and cheaper
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
