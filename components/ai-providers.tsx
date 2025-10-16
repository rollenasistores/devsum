import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const providers = [
  {
    name: "Claude",
    model: "claude-3-5-sonnet",
    description:
      "Anthropic's most capable model. Excellent at understanding context and generating professional narratives.",
    features: ["Best quality", "Context-aware", "Professional tone"],
    recommended: true,
  },
  {
    name: "GPT-4",
    model: "gpt-4-turbo",
    description: "OpenAI's flagship model. Great balance of speed and quality with strong technical understanding.",
    features: ["Fast", "Reliable", "Technical depth"],
    recommended: false,
  },
  {
    name: "Gemini",
    model: "gemini-pro",
    description: "Google's advanced AI model. Cost-effective option with good performance for most use cases.",
    features: ["Cost-effective", "Fast", "Good quality"],
    recommended: false,
  },
]

export function AIProviders() {
  return (
    <section className="border-b border-border bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Choose your AI provider</h2>
          <p className="mt-4 text-lg text-muted-foreground">DevSum works with the leading AI models</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.name} className="relative border-border bg-card p-6">
              {provider.recommended && (
                <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground">Recommended</Badge>
              )}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-card-foreground">{provider.name}</h3>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{provider.model}</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{provider.description}</p>
              <div className="mt-6 space-y-2">
                {provider.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-card-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {feature}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
