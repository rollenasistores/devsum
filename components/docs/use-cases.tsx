import { Card } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { Briefcase, Users, TrendingUp, Calendar } from "lucide-react"

const useCases = [
  {
    title: "Performance Reviews",
    icon: TrendingUp,
    description: "Generate comprehensive reports of your accomplishments for annual or quarterly reviews",
    example: `devsum analyze --since 2024-01-01 --until 2024-03-31 --format pdf --output q1-review.pdf`,
    benefits: ["Quantify your impact", "Never forget achievements", "Professional formatting"],
  },
  {
    title: "Sprint Summaries",
    icon: Calendar,
    description: "Create detailed sprint reports for standup meetings and retrospectives",
    example: `devsum report --since "2 weeks ago" --group-by type --format markdown`,
    benefits: ["Track sprint progress", "Identify patterns", "Share with team"],
  },
  {
    title: "Project Updates",
    icon: Briefcase,
    description: "Keep stakeholders informed with regular project status updates",
    example: `devsum analyze --branch main --since "1 month ago" --format html --output update.html`,
    benefits: ["Clear communication", "Visual progress", "Automated generation"],
  },
  {
    title: "Team Reports",
    icon: Users,
    description: "Aggregate team contributions and analyze collaboration patterns",
    example: `devsum report --author "team-member" --since 2024-01-01 --format json`,
    benefits: ["Team visibility", "Contribution tracking", "Data-driven insights"],
  },
]

export function UseCases() {
  return (
    <section id="use-cases" className="scroll-mt-20">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Use Cases</h2>
          <p className="mt-4 text-muted-foreground">
            Discover how DevSum CLI can streamline your development workflow and reporting.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <useCase.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                    <p className="text-muted-foreground text-sm">{useCase.description}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">Example Command</h4>
                  <CodeBlock language="bash" code={useCase.example} />
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">Benefits</h4>
                  <ul className="space-y-1">
                    {useCase.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
