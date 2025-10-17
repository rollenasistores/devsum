'use client'

import { Card } from "@/components/ui/card"
import { TrendingUp, GitCommit, FileCode, Users } from "lucide-react"
import useSWR from 'swr'
import { motion } from "framer-motion"
import { scrollReveal, staggerCards, staggerCard, hoverLift, counterAnimation } from "@/lib/animations"
import { useInView } from "framer-motion"
import { useRef } from "react"

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

function AnimatedCounter({ value, isLoading }: { value: string, isLoading: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  // Extract numeric value for animation
  const numericValue = parseFloat(value.replace(/[^\d.]/g, '')) || 0
  const suffix = value.replace(/[\d.]/g, '')
  
  return (
    <div ref={ref} className="text-3xl font-bold text-card-foreground">
      {isLoading ? (
        <div className="h-8 w-16 animate-pulse bg-muted rounded" />
      ) : (
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isInView ? (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {value}
            </motion.span>
          ) : (
            value
          )}
        </motion.span>
      )}
    </div>
  )
}

function AnimatedProgressBar({ percentage, color, delay = 0 }: { percentage: number, color: string, delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  return (
    <div ref={ref} className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
      <motion.div
        className={`h-full ${color}`}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
        transition={{ duration: 1.2, delay, ease: "easeOut" }}
      />
    </div>
  )
}

export function AnalyticsPreview() {
  const { data, error, isLoading } = useSWR<AnalyticsData>('/api/analytics', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds for testing
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  })

  // Debug logging
  if (data) {
    console.log('Analytics data received:', data)
  }

  // Fallback data while loading or on error
  const stats = data?.usage ? [
    { label: "Total Commits", value: formatNumber(data.usage.commits || 0), icon: GitCommit, trend: data.trends?.commitsTrend || "+12%" },
    { label: "Active Users", value: formatNumber(data.usage.activeUsers || 0), icon: Users, trend: data.trends?.usersTrend || "+3" },
    { label: "Success Rate", value: `${data.usage.successRate || 0}%`, icon: TrendingUp, trend: "+5%" },
    { label: "Recent Activity", value: formatNumber(data.usage.recentActivity || 0), icon: FileCode, trend: "24h" },
  ] : [
    { label: "Total Commits", value: "1,247", icon: GitCommit, trend: "+12%" },
    { label: "Active Users", value: "24", icon: Users, trend: "+3" },
    { label: "Success Rate", value: "94%", icon: TrendingUp, trend: "+5%" },
    { label: "Recent Activity", value: "12", icon: FileCode, trend: "24h" },
  ]

  return (
    <section className="border-b border-border bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Usage Analytics</h2>
          <p className="mt-4 text-lg text-muted-foreground">Real-time insights into DevSum CLI usage</p>
        </motion.div>

        <motion.div 
          className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerCards}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={staggerCard}
              whileHover="hover"
            >
              <motion.div variants={hoverLift}>
                <Card className="border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <motion.div 
                      className="rounded-lg bg-primary/10 p-2 text-primary"
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: [0, -5, 5, -5, 0],
                        transition: { duration: 0.5 }
                      }}
                    >
                      <stat.icon className="h-5 w-5" />
                    </motion.div>
                    <motion.span 
                      className="text-sm font-medium text-accent"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    >
                      {stat.trend}
                    </motion.span>
                  </div>
                  <div className="mt-4">
                    <AnimatedCounter value={stat.value} isLoading={isLoading} />
                    <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mx-auto mt-12 max-w-4xl"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={hoverLift} whileHover="hover">
            <Card className="border-border bg-card p-8">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Feature Development</span>
                    <span className="font-medium text-card-foreground">65%</span>
                  </div>
                  <AnimatedProgressBar percentage={65} color="bg-primary" delay={0.3} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Bug Fixes</span>
                    <span className="font-medium text-card-foreground">25%</span>
                  </div>
                  <AnimatedProgressBar percentage={25} color="bg-accent" delay={0.5} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Documentation</span>
                    <span className="font-medium text-card-foreground">10%</span>
                  </div>
                  <AnimatedProgressBar percentage={10} color="bg-chart-3" delay={0.7} />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
