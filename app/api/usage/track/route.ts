import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commandType, userId, success = true, metadata } = body

    // Validate required fields
    if (!commandType || !['commit', 'report', 'analyze'].includes(commandType)) {
      return NextResponse.json(
        { error: 'Invalid command type' },
        { status: 400 }
      )
    }

    // Extract additional analytics data
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || null
    const acceptLanguage = request.headers.get('accept-language') || null
    const timezone = request.headers.get('x-timezone') || null
    
    // Enhanced metadata with analytics data
    const enhancedMetadata = {
      ...metadata,
      analytics: {
        ip: ip,
        userAgent: userAgent,
        referer: referer,
        acceptLanguage: acceptLanguage,
        timezone: timezone,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }
    }

    // Create usage record
    const usageRecord = await prisma.cliUsageStats.create({
      data: {
        commandType,
        userId: userId || null,
        success,
        metadata: enhancedMetadata
      }
    })

    return NextResponse.json({ 
      success: true, 
      id: usageRecord.id 
    })
  } catch (error) {
    console.error('Error tracking usage:', error)
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    )
  }
}
