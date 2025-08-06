import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@auth'
import prisma from '@db/prisma.client'
import { z } from 'zod'
import { generateSummary } from '@utils/llm'

// Schema for the request body
const SummaryRequestSchema = z.object({
  sourceIds: z.array(z.number().int().positive()).min(1, 'At least one source is required'),
  title: z.string().optional(), // Optional custom title for the summary
})

/**
 * POST /api/notes/summary/[id]
 * Generate a summary note based on selected sources for a specific project.
 * 
 * Expected JSON body:
 * {
 *   "sourceIds": number[],  // Array of source IDs to summarize
 *   "title": string         // Optional custom title
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const projectId = Number(params.id)
    const body = await req.json()
    const { sourceIds, title } = SummaryRequestSchema.parse(body)

    // Verify project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id 
      },
    })

    if (!project) {
      return NextResponse.json({ 
        error: 'Project not found or unauthorized' 
      }, { status: 404 })
    }

    // Fetch the sources and verify they belong to the user
    const sources = await prisma.source.findMany({
      where: {
        id: { in: sourceIds },
        userId: session.user.id
      },
      select: {
        id: true,
        content: true,
        url: true,
      }
    })

    if (sources.length === 0) {
      return NextResponse.json({ 
        error: 'No valid sources found' 
      }, { status: 400 })
    }

    if (sources.length !== sourceIds.length) {
      return NextResponse.json({ 
        error: 'Some sources were not found or you do not have access to them' 
      }, { status: 400 })
    }

    // Generate summary using LLM
    const summaryContent = await generateSummary(sources, title)

    // Create the summary note
    const summaryNote = await prisma.note.create({
      data: {
        content: summaryContent,
        projectId: projectId,
        sources: {
          connect: sourceIds.map(id => ({ id }))
        }
      },
      include: {
        sources: {
          select: {
            id: true,
            url: true,
            content: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      note: summaryNote,
      metadata: {
        sourcesUsed: sources.length,
        totalSources: sourceIds.length,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Summary generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : 'Failed to generate summary'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
