import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@db/prisma.client'
import { auth } from '@auth'

/**
 * GET /api/notes
 * List all notes associated with projects owned by the current user.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const notes = await prisma.note.findMany({
    where: {
      project: { userId: session.user.id },
    },
    include: {
      // Include related sources if needed
      sources: true,
      project: true,
    },
  })
  return NextResponse.json(notes)
}

/**
 * POST /api/notes
 * Create a new note. Requires a valid project (by projectId) that belongs to the current user.
 * Optionally, an array of source IDs can be provided to attach to the note.
 *
 * Expected JSON body:
 * {
 *   "projectId": number,
 *   "content": string,
 *   "sources": number[]  // optional
 * }
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { projectId, content, sources } = await req.json()
  
  // Ensure project exists and belongs to current user
  const project = await prisma.project.findFirst({
    where: { 
      id: Number(projectId),
      userId: session.user.id 
    },
  })
  
  if (!project) {
    return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 400 })
  }
  
  try {
    const newNote = await prisma.note.create({
      data: {
        content,
        project: {
          connect: { id: Number(projectId) },
        },
        // If sources provided, attach them
        ...(sources && sources.length > 0
          ? { sources: { connect: sources.map((id: number) => ({ id })) } }
          : {}),
      },
      include: {
        sources: true,
        project: true,
      },
    })
  
    return NextResponse.json(newNote)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}