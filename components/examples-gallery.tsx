import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/ui/code-block"

export function ExamplesGallery() {
  return (
    <section className="border-b border-border bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Example outputs</h2>
          <p className="mt-4 text-lg text-muted-foreground">See what DevSum can generate for you</p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <Tabs defaultValue="markdown" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>

            <TabsContent value="markdown" className="mt-6">
              <CodeBlock
                code={`# Sprint Summary - Q1 2024

## Key Accomplishments

### Feature Development
- Implemented user authentication system with OAuth2 support
- Built real-time notification system using WebSockets
- Created responsive dashboard with data visualization

### Performance Improvements
- Optimized database queries, reducing load time by 40%
- Implemented Redis caching for frequently accessed data
- Reduced bundle size by 25% through code splitting

### Bug Fixes & Maintenance
- Fixed 12 critical bugs reported by users
- Improved error handling and logging
- Updated dependencies and resolved security vulnerabilities

## Metrics
- **Commits**: 47
- **Files Changed**: 156
- **Lines Added**: 3,421
- **Lines Removed**: 1,203`}
                language="markdown"
              />
            </TabsContent>

            <TabsContent value="json" className="mt-6">
              <CodeBlock
                code={`{
  "period": {
    "start": "2024-01-01",
    "end": "2024-03-31"
  },
  "summary": {
    "totalCommits": 47,
    "filesChanged": 156,
    "linesAdded": 3421,
    "linesRemoved": 1203
  },
  "accomplishments": [
    {
      "category": "Feature Development",
      "items": [
        "Implemented user authentication system",
        "Built real-time notification system",
        "Created responsive dashboard"
      ]
    },
    {
      "category": "Performance Improvements",
      "items": [
        "Optimized database queries (40% faster)",
        "Implemented Redis caching",
        "Reduced bundle size by 25%"
      ]
    }
  ]
}`}
                language="json"
              />
            </TabsContent>

            <TabsContent value="html" className="mt-6">
              <Card className="border-border bg-card p-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-card-foreground">Sprint Summary - Q1 2024</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-primary">Feature Development</h4>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>• Implemented user authentication system with OAuth2</li>
                        <li>• Built real-time notification system using WebSockets</li>
                        <li>• Created responsive dashboard with data visualization</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Performance Improvements</h4>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>• Optimized database queries, reducing load time by 40%</li>
                        <li>• Implemented Redis caching for frequently accessed data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
