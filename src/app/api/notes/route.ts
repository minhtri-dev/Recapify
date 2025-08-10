import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@db/prisma.client'
import { auth } from '@auth'

/**
 * GET /api/notes
 * List all notes owned by the current user.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    include: {
      sources: true,
    },
  })
  return NextResponse.json(notes)
}

/**
 * POST /api/notes
 * Create a new note.
 * Optionally, an array of source IDs can be provided to attach to the note.
 *
 * Expected JSON body:
 * {
 *   "content": string,
 *   "sources": number[]  // optional
 * }
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content, sources } = await req.json()

  try {
    const newNote = await prisma.note.create({
      data: {
        content,
        userId: session.user.id,
        // If sources provided, attach them
        ...(sources && sources.length > 0
          ? { sources: { connect: sources.map((id: number) => ({ id })) } }
          : {}),
      },
      include: {
        sources: true,
      },
    })

    return NextResponse.json(newNote)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
