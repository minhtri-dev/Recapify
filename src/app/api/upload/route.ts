import { NextRequest, NextResponse } from 'next/server'
import { ScraperTool } from '@agent/tools/scraper.tool'
import { auth } from '@auth'
import prisma from '@db/prisma.client'
import { z } from 'zod'

// Schema for validation
const UploadRequestSchema = z.object({
  urls: z.array(z.string().url()).min(1, 'At least one URL is required')
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { urls } = UploadRequestSchema.parse(body)

    const scraper = new ScraperTool()
    const results = []
    const errors = []

    // Process each URL
    for (const url of urls) {
      try {
        const sourceData = await scraper.scrapeToSource(url)
        
        const savedSource = await prisma.source.create({
          data: { ...sourceData, userId: session.user.id }
        })
        
        results.push(savedSource)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        errors.push({ url, error: message })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: urls.length,
        successful: results.length,
        failed: errors.length
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}