import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { aggregateAnalytics } from '@/lib/github-api'

export async function GET(request: NextRequest) {
  try {
    // Get usage statistics from database
    const [totalCommands, commits, reports, analytics, activeUsers] = await Promise.all([
      prisma.cliUsageStats.count().catch(() => 0),
      prisma.cliUsageStats.count({ where: { commandType: 'commit' } }).catch(() => 0),
      prisma.cliUsageStats.count({ where: { commandType: 'report' } }).catch(() => 0),
      prisma.cliUsageStats.count({ where: { commandType: 'analyze' } }).catch(() => 0),
      prisma.cliUsageStats.groupBy({
        by: ['userId'],
        where: { userId: { not: null } },
        _count: { userId: true }
      }).then((result: { _count: { userId: number } }[]) => result.length).catch(() => 0)
    ])

    // Get additional analytics data
    const [successRate, platformStats, recentActivity] = await Promise.all([
      // Success rate calculation
      prisma.cliUsageStats.groupBy({
        by: ['success'],
        _count: { success: true }
      }).then((result: { success: boolean; _count: { success: number } }[]) => {
        const total = result.reduce((sum: number, item: { success: boolean; _count: { success: number } }) => sum + item._count.success, 0)
        const successful = result.find((item: { success: boolean; _count: { success: number } }) => item.success)?._count.success || 0
        const rate = total > 0 ? Math.round((successful / total) * 100) : 0
        return rate
      }).catch((error: unknown) => {
        console.error('Error calculating success rate:', error)
        return 0
      }),
      
      // Platform statistics
      prisma.cliUsageStats.findMany({
        select: { metadata: true },
        take: 1000
      }).then((records: { metadata: any }[]) => {
        const platforms = records
          .map((record: { metadata: any }) => record.metadata?.system?.platform)
          .filter(Boolean)
          .reduce((acc: Record<string, number>, platform: string) => {
            acc[platform] = (acc[platform] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        return platforms
      }).catch(() => ({})),
      
      // Recent activity (last 24 hours)
      prisma.cliUsageStats.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }).catch(() => 0)
    ])

    const usageData = {
      totalCommands,
      commits,
      reports,
      analytics,
      activeUsers,
      successRate,
      platformStats,
      recentActivity
    }

    // Aggregate with GitHub data
    const analyticsData = await aggregateAnalytics(usageData)

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error fetching analytics:', error)

    // Return fallback data instead of error
    const fallbackData = {
      github: {
        stars: 0,
        forks: 0,
        watchers: 0,
        contributors: 0,
        downloads: 0
      },
      usage: {
        totalCommands: 0,
        commits: 0,
        reports: 0,
        analytics: 0,
        activeUsers: 0,
        successRate: 0,
        platformStats: {},
        recentActivity: 0
      },
      trends: {
        productivity: '0%',
        commitsTrend: '+0%',
        filesTrend: '+0%',
        usersTrend: '+0'
      }
    }

    return NextResponse.json(fallbackData)
  }
}
