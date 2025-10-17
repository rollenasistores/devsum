'use client'

import { Card } from "@/components/ui/card"
import { Star, Download, Users, Heart } from "lucide-react"
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

const testimonials = [
  {
    quote: "DevSum has saved me hours every sprint. The AI summaries are incredibly accurate and professional.",
    author: "Sarah Chen",
    role: "Senior Engineer at TechCorp",
  },
  {
    quote: "Perfect for performance reviews. I can now showcase my work with detailed, well-formatted reports.",
    author: "Michael Rodriguez",
    role: "Full Stack Developer",
  },
  {
    quote: "The best CLI tool I've used this year. Simple, powerful, and beautifully designed.",
    author: "Emily Watson",
    role: "Engineering Manager",
  },
]

export function CommunityStats() {
  const { data, error, isLoading } = useSWR<AnalyticsData>('/api/analytics', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: false
  })

  // Dynamic stats based on real data
  const stats = data?.github ? [
    { icon: Star, label: "GitHub Stars", value: formatNumber(data.github.stars || 0) },
    { icon: Download, label: "Downloads", value: formatNumber(data.github.downloads || 0) },
    { icon: Users, label: "Active Users", value: formatNumber(data.usage?.activeUsers || 0) },
    { icon: Heart, label: "Contributors", value: formatNumber(data.github.contributors || 0) },
  ] : [
    { icon: Star, label: "GitHub Stars", value: "2.4k" },
    { icon: Download, label: "Downloads", value: "15k+" },
    { icon: Users, label: "Active Users", value: "1.2k" },
    { icon: Heart, label: "Contributors", value: "42" },
  ]

  return (
    <section className="border-b border-border bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by developers worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Join thousands of developers using DevSum</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border bg-card p-6 text-center">
              <div className="mx-auto w-fit rounded-lg bg-primary/10 p-3 text-primary">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="mt-4 text-3xl font-bold text-card-foreground">
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse bg-muted rounded mx-auto" />
                ) : (
                  stat.value
                )}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.author} className="border-border bg-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">"{testimonial.quote}"</p>
              <div className="mt-4">
                <div className="font-semibold text-card-foreground">{testimonial.author}</div>
                <div className="text-xs text-muted-foreground">{testimonial.role}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
