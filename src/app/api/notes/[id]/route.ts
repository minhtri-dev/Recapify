import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@db/prisma.client'
import { auth } from '@auth'

/**
 * GET /api/notes/[id]
 * Retrieve a specific note by ID.
 * Checks that the note belongs to a project owned by the current user.
 */
export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const note = await prisma.note.findUnique({
    where: { id: Number(params.id) },
    include: { sources: true, project: true },
  })
  
  if (!note || note.project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(note)
}

/**
 * PUT /api/notes/[id]
 * Update a note’s content and optionally its attached sources.
 * Checks that the note belongs to a project owned by the current user.
 *
 * Expected JSON body:
 * {
 *   "content": string,
 *   "sources": number[]  // optional; if provided, replaces current sources
 * }
 */
export async function PUT(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { content, sources } = await req.json()
  
  // Fetch the note along with its project to verify ownership
  const note = await prisma.note.findUnique({
    where: { id: Number(params.id) },
    include: { project: true },
  })
  
  if (!note || note.project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  try {
    const updatedNote = await prisma.note.update({
      where: { id: Number(params.id) },
      data: {
        content,
        // If sources are provided, replace the connections.
        ...(sources
          ? { sources: { set: sources.map((id: number) => ({ id })) } }
          : {}),
      },
      include: { sources: true, project: true },
    })
    return NextResponse.json(updatedNote)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * DELETE /api/notes/[id]
 * Delete a specific note.
 * Checks that the note belongs to a project owned by the current user.
 */
export async function DELETE(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const note = await prisma.note.findUnique({
    where: { id: Number(params.id) },
    include: { project: true },
  })
  if (!note || note.project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  try {
    await prisma.note.delete({
      where: { id: Number(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}