import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@db/prisma.client'
import { auth } from '@auth'

/**
 * GET /api/notes/[id]
 * Retrieve a specific note by ID.
 * Checks that the note belongs to the current user.
 */
export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { id } = await params
  
  const note = await prisma.note.findUnique({
    where: { id: Number(id) },
    include: { sources: true },
  })
  
  if (!note || note.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(note)
}

/**
 * PUT /api/notes/[id]
 * Update a note's content and optionally its attached sources.
 * Checks that the note belongs to the current user.
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
  
  const { id } = await params
  const { content, sources } = await req.json()
  
  const note = await prisma.note.findUnique({
    where: { id: Number(id) },
  })
  
  if (!note || note.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  try {
    const updatedNote = await prisma.note.update({
      where: { id: Number(id) },
      data: {
        content,
        // If sources are provided, replace the connections.
        ...(sources
          ? { sources: { set: sources.map((id: number) => ({ id })) } }
          : {}),
      },
      include: { sources: true },
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
 * Checks that the note belongs to the current user.
 */
export async function DELETE(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { id } = await params
  
  const note = await prisma.note.findUnique({
    where: { id: Number(id) },
  })
  if (!note || note.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  try {
    await prisma.note.delete({
      where: { id: Number(id) },
    })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}