import { Card } from "@/components/ui/card"
import { TrendingUp, GitCommit, FileCode, Users } from "lucide-react"

const stats = [
  { label: "Total Commits", value: "1,247", icon: GitCommit, trend: "+12%" },
  { label: "Files Modified", value: "3,891", icon: FileCode, trend: "+8%" },
  { label: "Contributors", value: "24", icon: Users, trend: "+3" },
  { label: "Productivity", value: "94%", icon: TrendingUp, trend: "+5%" },
]

export function AnalyticsPreview() {
  return (
    <section className="border-b border-border bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Track your progress</h2>
          <p className="mt-4 text-lg text-muted-foreground">Get insights into your development activity</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-accent">{stat.trend}</span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-card-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <Card className="border-border bg-card p-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Feature Development</span>
                  <span className="font-medium text-card-foreground">65%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-[65%] bg-primary" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bug Fixes</span>
                  <span className="font-medium text-card-foreground">25%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-[25%] bg-accent" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Documentation</span>
                  <span className="font-medium text-card-foreground">10%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-[10%] bg-chart-3" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
