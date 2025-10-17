'use client'

import { Card } from "@/components/ui/card"
import { TrendingUp, GitCommit, FileCode, Users } from "lucide-react"
import useSWR from 'swr'

interface AnalyticsData {
  github: {
    stars: number;
    forks: number;
    watchers: number;
    contributors: number;
    downloads: number;
  };
  usage: {
    totalCommands: number;
    commits: number;
    reports: number;
    analytics: number;
    activeUsers: number;
    successRate: number;
    platformStats: Record<string, number>;
    recentActivity: number;
  };
  trends: {
    productivity: string;
    commitsTrend: string;
    filesTrend: string;
    usersTrend: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

export function AnalyticsPreview() {
  const { data, error, isLoading } = useSWR<AnalyticsData>('/api/analytics', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: false
  })

  // Fallback data while loading or on error
  const stats = data?.usage ? [
    { label: "Total Commits", value: formatNumber(data.usage.commits || 0), icon: GitCommit, trend: data.trends?.commitsTrend || "+12%" },
    { label: "Files Analyzed", value: formatNumber(data.usage.analytics || 0), icon: FileCode, trend: data.trends?.filesTrend || "+8%" },
    { label: "Active Users", value: formatNumber(data.usage.activeUsers || 0), icon: Users, trend: data.trends?.usersTrend || "+3" },
    { label: "Success Rate", value: `${data.usage.successRate || 0}%`, icon: TrendingUp, trend: "+5%" },
    { label: "Recent Activity", value: formatNumber(data.usage.recentActivity || 0), icon: FileCode, trend: "24h" },
    { label: "Productivity", value: data.trends?.productivity || "94%", icon: TrendingUp, trend: "+5%" },
  ] : [
    { label: "Total Commits", value: "1,247", icon: GitCommit, trend: "+12%" },
    { label: "Files Analyzed", value: "3,891", icon: FileCode, trend: "+8%" },
    { label: "Active Users", value: "24", icon: Users, trend: "+3" },
    { label: "Success Rate", value: "94%", icon: TrendingUp, trend: "+5%" },
    { label: "Recent Activity", value: "12", icon: FileCode, trend: "24h" },
    { label: "Productivity", value: "94%", icon: TrendingUp, trend: "+5%" },
  ]

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
                <div className="text-3xl font-bold text-card-foreground">
                  {isLoading ? (
                    <div className="h-8 w-16 animate-pulse bg-muted rounded" />
                  ) : (
                    stat.value
                  )}
                </div>
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
