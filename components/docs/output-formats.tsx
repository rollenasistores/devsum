import { Card } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { FileText, Code, Globe, FileDown } from "lucide-react"

const formats = [
  {
    name: "Markdown",
    icon: FileText,
    description: "Clean, readable format perfect for documentation and README files",
    command: "devsum report --format markdown",
    example: `# Accomplishment Report
## January 2024

### Features
- Implemented JWT authentication system
- Added user profile management
- Created admin dashboard

### Bug Fixes
- Fixed memory leak in data processing
- Resolved CORS issues in API`,
  },
  {
    name: "JSON",
    icon: Code,
    description: "Structured data format ideal for integrations and automation",
    command: "devsum report --format json",
    example: `{
  "period": "January 2024",
  "commits": 47,
  "features": [
    {
      "title": "JWT Authentication",
      "files": 5,
      "changes": "+440 -20"
    }
  ],
  "bugFixes": 12,
  "totalChanges": "+2847 -456"
}`,
  },
  {
    name: "HTML",
    icon: Globe,
    description: "Styled web page with interactive elements and charts",
    command: "devsum report --format html",
    example: `<!DOCTYPE html>
<html>
<head>
  <title>Accomplishment Report</title>
  <style>/* Beautiful styles */</style>
</head>
<body>
  <h1>Development Summary</h1>
  <div class="stats">...</div>
</body>
</html>`,
  },
  {
    name: "PDF",
    icon: FileDown,
    description: "Professional document ready for performance reviews",
    command: "devsum report --format pdf",
    example: "Generates a professionally formatted PDF document with charts, statistics, and detailed commit analysis.",
  },
]

export function OutputFormats() {
  return (
    <section id="output-formats" className="scroll-mt-20">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Output Formats</h2>
          <p className="mt-4 text-muted-foreground">
            DevSum CLI supports multiple output formats to fit your workflow and reporting needs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {formats.map((format) => (
            <Card key={format.name} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <format.icon className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-semibold">{format.name}</h3>
                </div>
                <p className="text-muted-foreground">{format.description}</p>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Command</h4>
                  <CodeBlock language="bash" code={format.command} />
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Example Output</h4>
                  <CodeBlock language={format.name === "JSON" ? "json" : "markdown"} code={format.example} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
