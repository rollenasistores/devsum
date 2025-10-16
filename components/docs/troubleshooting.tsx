import { Card } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const issues = [
  {
    problem: "API Key Not Found",
    solution: "Ensure your API key is set in environment variables or configuration file",
    steps: [
      "Check if environment variable is set: echo $GEMINI_API_KEY",
      "Set the API key: export GEMINI_API_KEY='your-key'",
      "Or use config: devsum config set apiKey your-key",
      "Verify: devsum config get apiKey",
    ],
  },
  {
    problem: "Git Repository Not Found",
    solution: "DevSum CLI must be run inside a git repository",
    steps: [
      "Navigate to your git repository: cd your-project",
      "Verify git is initialized: git status",
      "If not initialized: git init",
      "Try running devsum again",
    ],
  },
  {
    problem: "No Changes Detected",
    solution: "Ensure you have staged or unstaged changes in your repository",
    steps: [
      "Check git status: git status",
      "Stage changes: git add .",
      "Or use --all flag: devsum commit --all",
      "Verify changes are present",
    ],
  },
  {
    problem: "Rate Limit Exceeded",
    solution: "You've hit the API rate limit for your provider",
    steps: [
      "Wait a few minutes before retrying",
      "Check your API provider's rate limits",
      "Consider upgrading your API plan",
      "Use a different provider temporarily",
    ],
  },
]

export function Troubleshooting() {
  return (
    <section id="troubleshooting" className="scroll-mt-20">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Troubleshooting</h2>
          <p className="mt-4 text-muted-foreground">
            Common issues and their solutions to help you get back on track quickly.
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Need More Help?</AlertTitle>
          <AlertDescription>
            If you encounter an issue not listed here, please open an issue on{" "}
            <a href="https://github.com/rollenasistores/devsum/issues" className="underline">
              GitHub
            </a>{" "}
            or join our community Discord.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {issues.map((issue, index) => (
            <Card key={index} className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-destructive mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {issue.problem}
                  </h3>
                  <p className="text-muted-foreground">{issue.solution}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Solution Steps
                  </h4>
                  <ol className="space-y-2">
                    {issue.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex gap-3 text-sm">
                        <span className="font-semibold text-muted-foreground shrink-0">{stepIndex + 1}.</span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-accent/5 border-accent/20">
          <h3 className="text-lg font-semibold mb-4">Enable Debug Mode</h3>
          <p className="text-muted-foreground mb-4">
            For detailed error information, run DevSum CLI with debug logging enabled:
          </p>
          <CodeBlock language="bash" code="DEBUG=devsum:* devsum commit" />
        </Card>
      </div>
    </section>
  )
}
